import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'HealthPulse Backend'
  });
});

// REST API endpoints
app.get('/api/reports', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: reports, error } = await supabase
      .from('symptom_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
      return;
    }

    res.json(reports || []);
  } catch (error) {
    console.error('Error in /api/reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health-aggregates', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get total reports
    const { count: totalReports, error: totalError } = await supabase
      .from('symptom_reports')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error fetching total reports:', totalError);
      res.status(500).json({ error: 'Failed to fetch health aggregates' });
      return;
    }

    // Get reports in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: reports24h, error: recentError } = await supabase
      .from('symptom_reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo);

    if (recentError) {
      console.error('Error fetching recent reports:', recentError);
      res.status(500).json({ error: 'Failed to fetch health aggregates' });
      return;
    }

    // Get illness type distribution
    const { data: illnessData, error: illnessError } = await supabase
      .from('symptom_reports')
      .select('illness_type')
      .not('illness_type', 'is', null);

    if (illnessError) {
      console.error('Error fetching illness data:', illnessError);
      res.status(500).json({ error: 'Failed to fetch health aggregates' });
      return;
    }

    // Count illness types
    const illnessCounts = (illnessData || []).reduce((acc: any, report: any) => {
      const type = report.illness_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Get top illness types
    const topIllnesses = Object.entries(illnessCounts)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    const aggregates = [
      { metric: 'total_reports', value: totalReports || 0 },
      { metric: 'reports_in_last_24h', value: reports24h || 0 },
      { metric: 'top_illnesses', value: topIllnesses }
    ];

    res.json(aggregates);
  } catch (error) {
    console.error('Error in /api/health-aggregates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.io connection handling
io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle new symptom reports
  socket.on('new_report', async (data: any) => {
    try {
      console.log('New report received:', data);

      // Store in Supabase
      const { error } = await supabase
        .from('symptom_reports')
        .insert([{
          nickname: data.nickname,
          country: data.country,
          pin_code: data.pinCode,
          symptoms: data.symptoms,
          illness_type: data.illnessType,
          severity: data.severity,
          latitude: data.latitude,
          longitude: data.longitude,
        }]);

      if (error) {
        console.error('Error storing report:', error);
        socket.emit('error', { message: 'Failed to store report' });
        return;
      }

      // Broadcast to all connected clients
      socket.broadcast.emit('new_report', {
        ...data,
        id: Date.now().toString(), // Temporary ID
        createdAt: new Date().toISOString(),
      });

      // Send confirmation to sender
      socket.emit('report_success', { message: 'Report submitted successfully' });

    } catch (error) {
      console.error('Error processing report:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Handle map data requests
  socket.on('get_map_data', async (data: any) => {
    try {
      const { data: reports, error } = await supabase
        .from('symptom_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching map data:', error);
        socket.emit('error', { message: 'Failed to fetch map data' });
        return;
      }

      socket.emit('map_data', reports);

    } catch (error) {
      console.error('Error processing map data request:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Handle health tip requests
  socket.on('get_health_tip', async (data: { symptoms: string[] }) => {
    try {
      const { symptoms } = data;
      
      // Simple health tip logic based on symptoms
      let tip = {
        title: 'General Health Advice',
        content: 'Stay hydrated, get plenty of rest, and monitor your symptoms. If they worsen, consult a healthcare professional.',
        category: 'general',
        severity: 'low'
      };

      if (symptoms.includes('Fever') && symptoms.includes('Cough')) {
        tip = {
          title: 'Respiratory Symptoms Detected',
          content: 'You may have a respiratory infection. Rest, stay hydrated, and consider consulting a doctor if symptoms persist for more than 3 days.',
          category: 'respiratory',
          severity: 'medium'
        };
      } else if (symptoms.includes('Shortness of breath') || symptoms.includes('Chest pain')) {
        tip = {
          title: 'Serious Symptoms Alert',
          content: 'These symptoms require immediate medical attention. Please contact a healthcare provider or visit an emergency room.',
          category: 'emergency',
          severity: 'high'
        };
      }

      socket.emit('health_tip', tip);

    } catch (error) {
      console.error('Error processing health tip request:', error);
      socket.emit('error', { message: 'Failed to get health tip' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 HealthPulse Backend server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for connections`);
  console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
});