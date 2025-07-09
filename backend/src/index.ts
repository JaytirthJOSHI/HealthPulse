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
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://d85d7436.pulseappfront.pages.dev",
      "https://*.pulseappfront.pages.dev"
    ],
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
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://d85d7436.pulseappfront.pages.dev",
    "https://*.pulseappfront.pages.dev"
  ]
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

    // Get unique countries
    const { data: countryData, error: countryError } = await supabase
      .from('symptom_reports')
      .select('country')
      .not('country', 'is', null);

    if (countryError) {
      console.error('Error fetching country data:', countryError);
      res.status(500).json({ error: 'Failed to fetch health aggregates' });
      return;
    }

    const uniqueCountries = new Set((countryData || []).map((report: any) => report.country)).size;

    // Get most reported illness
    const mostReportedIllness = topIllnesses.length > 0 ? topIllnesses[0].type : 'None';

    const aggregates = [
      { metric: 'total_reports', value: totalReports || 0 },
      { metric: 'total_users', value: totalReports || 0 }, // Using total reports as user count for now
      { metric: 'reports_in_last_24h', value: reports24h || 0 },
      { metric: 'active_countries', value: uniqueCountries },
      { metric: 'most_reported_illness', value: mostReportedIllness },
      { metric: 'top_illnesses', value: topIllnesses }
    ];

    res.json(aggregates);
  } catch (error) {
    console.error('Error in /api/health-aggregates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add missing endpoints
app.get('/api/who-data', async (req: Request, res: Response): Promise<void> => {
  try {
    // Mock WHO data for measles cases
    const whoData = [
      { Id: 1, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'IND', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '12500' },
      { Id: 2, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'USA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '1200' },
      { Id: 3, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'CHN', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '8900' },
      { Id: 4, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'NGA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '15600' },
      { Id: 5, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'PAK', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '9800' },
      { Id: 6, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'IDN', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '6700' }
    ];
    
    res.json(whoData);
  } catch (error) {
    console.error('Error in /api/who-data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health-tips', async (req: Request, res: Response): Promise<void> => {
  try {
    // Mock health tips data
    const healthTips = [
      {
        id: 1,
        title: 'Stay Hydrated',
        content: 'Drink at least 8 glasses of water daily to maintain good health.',
        category: 'general',
        symptoms: ['dehydration', 'fatigue'],
        severity: 'low'
      },
      {
        id: 2,
        title: 'Respiratory Health',
        content: 'If you have cough and fever, rest well and monitor your symptoms.',
        category: 'respiratory',
        symptoms: ['cough', 'fever'],
        severity: 'medium'
      },
      {
        id: 3,
        title: 'Emergency Alert',
        content: 'Chest pain and shortness of breath require immediate medical attention.',
        category: 'emergency',
        symptoms: ['chest pain', 'shortness of breath'],
        severity: 'high'
      }
    ];
    
    res.json(healthTips);
  } catch (error) {
    console.error('Error in /api/health-tips:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/diseases', async (req: Request, res: Response): Promise<void> => {
  try {
    // Mock diseases data
    const diseases = [
      { id: 1, name: 'Common Cold', symptoms: ['runny nose', 'sore throat', 'cough'], severity: 'low' },
      { id: 2, name: 'Influenza', symptoms: ['fever', 'body aches', 'fatigue'], severity: 'medium' },
      { id: 3, name: 'COVID-19', symptoms: ['fever', 'cough', 'loss of taste'], severity: 'high' },
      { id: 4, name: 'Dengue', symptoms: ['high fever', 'headache', 'joint pain'], severity: 'high' }
    ];
    
    res.json(diseases);
  } catch (error) {
    console.error('Error in /api/diseases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/regions', async (req: Request, res: Response): Promise<void> => {
  try {
    // Mock regions data
    const regions = [
      { id: 1, name: 'North America', countries: ['USA', 'Canada', 'Mexico'] },
      { id: 2, name: 'South Asia', countries: ['India', 'Pakistan', 'Bangladesh'] },
      { id: 3, name: 'Europe', countries: ['UK', 'Germany', 'France'] },
      { id: 4, name: 'Africa', countries: ['Nigeria', 'South Africa', 'Kenya'] }
    ];
    
    res.json(regions);
  } catch (error) {
    console.error('Error in /api/regions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/reports', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nickname, country, pinCode, symptoms, illnessType, severity, latitude, longitude } = req.body;

    // Validate required fields
    if (!nickname || !country || !symptoms) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Store in Supabase
    const { data, error } = await supabase
      .from('symptom_reports')
      .insert([{
        nickname,
        country,
        pin_code: pinCode,
        symptoms,
        illness_type: illnessType,
        severity,
        latitude,
        longitude,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error storing report:', error);
      res.status(500).json({ error: 'Failed to store report' });
      return;
    }

    res.json({ 
      success: true, 
      data: {
        ...data,
        id: data.id,
        pinCode: data.pin_code,
        illnessType: data.illness_type,
        createdAt: data.created_at,
      }
    });

  } catch (error) {
    console.error('Error in POST /api/reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.io connection handling
io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Store waiting users for pairing
  const waitingUsers = new Map<string, { socketId: string, timestamp: number }>();
  const activeConnections = new Map<string, { user1: string, user2: string, messages: any[] }>();

  // Handle connection requests
  socket.on('request_connection', () => {
    console.log(`User ${socket.id} requesting connection`);
    
    // Check if there's a waiting user
    const waitingUser = Array.from(waitingUsers.entries()).find(([userId, data]) => {
      // Remove expired waiting users (older than 30 seconds)
      if (Date.now() - data.timestamp > 30000) {
        waitingUsers.delete(userId);
        return false;
      }
      return userId !== socket.id;
    });

    if (waitingUser) {
      // Pair with waiting user
      const [waitingUserId, waitingData] = waitingUser;
      waitingUsers.delete(waitingUserId);
      
      // Create connection
      const connectionId = `conn_${Date.now()}`;
      activeConnections.set(connectionId, {
        user1: waitingUserId,
        user2: socket.id,
        messages: []
      });

      // Notify both users
      io.to(waitingUserId).emit('connection_made', { 
        connectionId, 
        partnerId: socket.id,
        message: 'You have been connected with another user!'
      });
      
      io.to(socket.id).emit('connection_made', { 
        connectionId, 
        partnerId: waitingUserId,
        message: 'You have been connected with another user!'
      });

      console.log(`Paired users ${waitingUserId} and ${socket.id}`);
    } else {
      // Add to waiting list
      waitingUsers.set(socket.id, { socketId: socket.id, timestamp: Date.now() });
      socket.emit('waiting_for_connection', { message: 'Waiting for another user to connect...' });
      console.log(`User ${socket.id} added to waiting list`);
    }
  });

  // Handle messages between connected users
  socket.on('send_message', (data: { connectionId: string, message: string }) => {
    const connection = activeConnections.get(data.connectionId);
    if (!connection) {
      socket.emit('error', { message: 'Connection not found' });
      return;
    }

    // Determine the partner
    const partnerId = connection.user1 === socket.id ? connection.user2 : connection.user1;
    
    // Add message to connection history
    const messageData = {
      id: Date.now().toString(),
      senderId: socket.id,
      message: data.message,
      timestamp: new Date().toISOString()
    };
    connection.messages.push(messageData);

    // Send message to partner
    io.to(partnerId).emit('new_message', {
      connectionId: data.connectionId,
      message: messageData
    });

    // Confirm message sent to sender
    socket.emit('message_sent', {
      connectionId: data.connectionId,
      message: messageData
    });
  });

  // Handle disconnection from chat
  socket.on('disconnect_from_chat', (data: { connectionId: string }) => {
    const connection = activeConnections.get(data.connectionId);
    if (connection) {
      const partnerId = connection.user1 === socket.id ? connection.user2 : connection.user1;
      
      // Notify partner
      io.to(partnerId).emit('partner_disconnected', {
        connectionId: data.connectionId,
        message: 'Your chat partner has disconnected'
      });
      
      // Remove connection
      activeConnections.delete(data.connectionId);
    }
  });

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