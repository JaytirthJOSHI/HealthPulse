/// <reference types="@cloudflare/workers-types" />
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  MESSAGES_KV: KVNamespace;
}

// One-to-one chat room system
interface PrivateChatRoom {
  id: string;
  inviteCode: string;
  creatorId: string;
  creatorName: string;
  participantId?: string;
  participantName?: string;
  messages: PrivateMessage[];
  createdAt: number;
  isActive: boolean;
  expiresAt: number; // 24 hours from creation
}

interface PrivateMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  messageType: 'text' | 'image' | 'file';
  timestamp: string;
}

// In-memory storage for private chat rooms
let privateChatRooms = new Map<string, PrivateChatRoom>();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Helper function to generate invite codes
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to create a private chat room
function createPrivateChatRoom(creatorId: string, creatorName: string): PrivateChatRoom {
  const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const inviteCode = generateInviteCode();
  const now = Date.now();
  const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours from now

  const room: PrivateChatRoom = {
    id: roomId,
    inviteCode,
    creatorId,
    creatorName,
    messages: [
      {
        id: 'welcome',
        senderId: 'system',
        senderName: 'System',
        message: `Welcome to your private chat room! Share the invite code "${inviteCode}" with someone to start chatting.`,
        messageType: 'text',
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: now,
    isActive: true,
    expiresAt
  };

  privateChatRooms.set(roomId, room);
  console.log(`Created private chat room ${roomId} with invite code ${inviteCode}`);
  return room;
}

// Helper function to find room by invite code
function findRoomByInviteCode(inviteCode: string): PrivateChatRoom | null {
  for (const room of privateChatRooms.values()) {
    if (room.inviteCode === inviteCode && room.isActive && Date.now() < room.expiresAt) {
      return room;
    }
  }
  return null;
}

// Helper function to clean up expired rooms
function cleanupExpiredRooms() {
  const now = Date.now();
  for (const [roomId, room] of privateChatRooms.entries()) {
    if (now > room.expiresAt) {
      privateChatRooms.delete(roomId);
      console.log(`Cleaned up expired room ${roomId}`);
    }
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      
      console.log('Request path:', path);
      console.log('Request method:', request.method);

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });
      }

      // Health check endpoint
      if (path === '/health' && request.method === 'GET') {
        return new Response(
          JSON.stringify({
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'HealthPulse Backend (Cloudflare Workers)',
            environment: 'production'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Private Chat Room endpoints
      if (path === '/api/private-rooms' && request.method === 'POST') {
        return await handleCreatePrivateRoomAPI(request);
      }

      if (path === '/api/private-rooms/join' && request.method === 'POST') {
        return await handleJoinPrivateRoomAPI(request);
      }

      if (path === '/api/private-rooms' && request.method === 'GET') {
        return await handleGetPrivateRooms(request);
      }

      if (path.startsWith('/api/private-rooms/') && path.endsWith('/messages') && request.method === 'GET') {
        return await handleGetPrivateRoomMessages(request);
      }

      if (path.startsWith('/api/private-rooms/') && path.endsWith('/messages') && request.method === 'POST') {
        return await handleSendPrivateMessageAPI(request);
      }

      // Health monitoring API endpoints
      if (path === '/api/reports' && request.method === 'GET') {
        return await handleGetReportsAPI();
      }

      if (path === '/api/health-aggregates' && request.method === 'GET') {
        return await handleGetHealthAggregatesAPI();
      }

      if (path === '/api/who-data' && request.method === 'GET') {
        return await handleGetWHODataAPI();
      }

      if (path === '/api/health-tips' && request.method === 'GET') {
        return await handleGetHealthTipsAPI();
      }

      if (path === '/api/phone-ai/call' && request.method === 'POST') {
        return await handlePhoneAICallAPI(request);
      }

      if (path === '/api/phone-ai/analyze' && request.method === 'POST') {
        return await handlePhoneAIAnalyzeAPI(request);
      }

      if (path === '/api/predictive-analytics' && request.method === 'GET') {
        return await handlePredictiveAnalyticsAPI();
      }

      if (path === '/api/notifications' && request.method === 'POST') {
        return await handleNotificationsAPI(request);
      }

      if (path === '/api/demo-data' && request.method === 'POST') {
        return await handleDemoDataAPI();
      }

      // 404 for unknown routes
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
};

// Private Chat Room API handlers
async function handleCreatePrivateRoomAPI(request: Request): Promise<Response> {
  try {
    const { userId, userNickname } = await request.json() as any;
    
    // Clean up expired rooms first
    cleanupExpiredRooms();
    
    // Create new private chat room
    const room = createPrivateChatRoom(userId, userNickname);
    
    return new Response(
      JSON.stringify({
        success: true,
        room: room,
        roomId: room.id,
        inviteCode: room.inviteCode
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleCreatePrivateRoomAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleJoinPrivateRoomAPI(request: Request): Promise<Response> {
  try {
    const { inviteCode, userId, userNickname } = await request.json() as any;
    
    // Clean up expired rooms first
    cleanupExpiredRooms();
    
    // Find room by invite code
    const room = findRoomByInviteCode(inviteCode);
    
    if (!room) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invite code' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // Check if room is full (max 2 participants)
    if (room.participantId && room.participantId !== userId) {
      return new Response(
        JSON.stringify({ error: 'This chat room is already full' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // Check if user is already in the room
    if (room.creatorId === userId || room.participantId === userId) {
      return new Response(
        JSON.stringify({ error: 'You are already in this chat room' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // Join the room
    room.participantId = userId;
    room.participantName = userNickname;
    
    // Add welcome message
    room.messages.push({
      id: `join_${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      message: `${userNickname} joined the chat`,
      messageType: 'text',
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        room: room,
        roomId: room.id,
        inviteCode: room.inviteCode
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleJoinPrivateRoomAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleGetPrivateRooms(request: Request): Promise<Response> {
  try {
    const rooms = Array.from(privateChatRooms.values()).filter(room => room.isActive);
    
    return new Response(
      JSON.stringify({
        success: true,
        rooms: rooms
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetPrivateRooms:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleGetPrivateRoomMessages(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const roomId = pathParts[pathParts.length - 2]; // Get roomId from /api/private-rooms/{roomId}/messages
    
    const room = privateChatRooms.get(roomId);
    if (!room) {
      return new Response(
        JSON.stringify({ error: 'Room not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        roomId: room.id,
        messages: room.messages,
        totalMembers: room.creatorId ? 2 : 1,
        lastUpdated: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetPrivateRoomMessages:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleSendPrivateMessageAPI(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const roomId = pathParts[pathParts.length - 2]; // Get roomId from /api/private-rooms/{roomId}/messages
    
    const { userId, userNickname, message, messageType = 'text' } = await request.json() as any;
    
    const room = privateChatRooms.get(roomId);
    if (!room) {
      return new Response(
        JSON.stringify({ error: 'Room not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Check if user is in the room
    if (room.creatorId !== userId && room.participantId !== userId) {
      return new Response(
        JSON.stringify({ error: 'You are not a member of this room' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Create new message
    const newMessage: PrivateMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: userId,
      senderName: userNickname,
      message: message.trim(),
      messageType,
      timestamp: new Date().toISOString()
    };

    // Add message to room
    room.messages.push(newMessage);

    return new Response(
      JSON.stringify({
        success: true,
        message: newMessage
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleSendPrivateMessageAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

// Health monitoring API handlers
async function handleGetReportsAPI(): Promise<Response> {
  try {
    // Mock data for reports
    const reports = [
      {
        id: 1,
        user_id: 'user_123',
        symptoms: ['fever', 'cough', 'fatigue'],
        illness_type: 'Upper respiratory infection',
        severity: 'moderate',
        latitude: 40.7128,
        longitude: -74.0060,
        country: 'United States',
        city: 'New York',
        created_at: '2025-07-07T10:30:00.000Z'
      },
      {
        id: 2,
        user_id: 'user_456',
        symptoms: ['headache', 'nausea'],
        illness_type: 'Migraine',
        severity: 'mild',
        latitude: 51.5074,
        longitude: -0.1278,
        country: 'United Kingdom',
        city: 'London',
        created_at: '2025-07-07T09:15:00.000Z'
      },
      {
        id: 3,
        user_id: 'user_789',
        symptoms: ['sore throat', 'fever'],
        illness_type: 'Strep throat',
        severity: 'moderate',
        latitude: 48.8566,
        longitude: 2.3522,
        country: 'France',
        city: 'Paris',
        created_at: '2025-07-07T08:45:00.000Z'
      }
    ];

    return new Response(
      JSON.stringify(reports),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetReportsAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleGetHealthAggregatesAPI(): Promise<Response> {
  try {
    const aggregates = [
      { metric: 'total_reports', value: 1250 },
      { metric: 'total_users', value: 890 },
      { metric: 'reports_in_last_24h', value: 45 },
      { metric: 'active_countries', value: 23 },
      { metric: 'most_reported_illness', value: 'Upper respiratory infection' },
      { metric: 'top_illnesses', value: [
        { type: 'Upper respiratory infection', count: 156 },
        { type: 'Migraine', count: 89 },
        { type: 'Strep throat', count: 67 },
        { type: 'Gastroenteritis', count: 45 },
        { type: 'Seasonal allergies', count: 34 }
      ]}
    ];

    return new Response(
      JSON.stringify(aggregates),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetHealthAggregatesAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleGetWHODataAPI(): Promise<Response> {
  try {
    const whoData = [
      { Id: 1, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'IND', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '12500' },
      { Id: 2, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'USA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '1200' },
      { Id: 3, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'CHN', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '8900' },
      { Id: 4, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'NGA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '15600' },
      { Id: 5, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'PAK', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '9800' },
      { Id: 6, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'IDN', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '6700' }
    ];

    return new Response(
      JSON.stringify(whoData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetWHODataAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleGetHealthTipsAPI(): Promise<Response> {
  try {
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
        severity: 'moderate'
      },
      {
        id: 3,
        title: 'Headache Management',
        content: 'Stay in a quiet, dark room and avoid screens if you have a migraine.',
        category: 'neurological',
        symptoms: ['headache', 'migraine'],
        severity: 'moderate'
      }
    ];

    return new Response(
      JSON.stringify(healthTips),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetHealthTipsAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handlePhoneAICallAPI(request: Request): Promise<Response> {
  try {
    const { phoneNumber, symptoms } = await request.json() as any;
    
    // Mock AI analysis
    const analysis = {
      phoneNumber,
      symptoms,
      analysis: {
        riskLevel: 'low',
        recommendations: ['Rest well', 'Stay hydrated', 'Monitor symptoms'],
        followUp: {
          scheduled: true,
          nextCall: '2025-07-08T10:30:00.000Z'
        }
      },
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(analysis),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handlePhoneAICallAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handlePhoneAIAnalyzeAPI(request: Request): Promise<Response> {
  try {
    const { symptoms, voiceData } = await request.json() as any;
    
    // Mock AI analysis
    const analysis = {
      symptoms,
      analysis: {
        possibleConditions: ['Upper respiratory infection'],
        confidence: 0.85,
        recommendations: ['Rest', 'Stay hydrated', 'Monitor fever'],
        severity: 'moderate'
      },
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(analysis),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handlePhoneAIAnalyzeAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handlePredictiveAnalyticsAPI(): Promise<Response> {
  try {
    const analytics = {
      predictions: {
        nextPeak: 'February 2026',
        expectedCases: 18000,
        confidence: 0.82
      },
      trends: {
        currentTrend: 'increasing',
        rateOfChange: 0.15
      },
      insights: [
        'Respiratory infections expected to increase by 25%',
        'Seasonal allergies peak in March',
        'Vaccination rates improving'
      ],
      modelInfo: {
        version: '1.2.0',
        lastUpdated: '2025-07-07T10:30:00.000Z',
        accuracy: 0.89
      }
    };

    return new Response(
      JSON.stringify(analytics),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handlePredictiveAnalyticsAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleNotificationsAPI(request: Request): Promise<Response> {
  try {
    const { userId, message, type } = await request.json() as any;
    
    const notification = {
      notificationId: 'notif-12345',
      userId,
      message,
      type,
      status: 'sent',
      deliveryTime: '2025-07-07T10:30:00.000Z'
    };

    return new Response(
      JSON.stringify(notification),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleNotificationsAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleDemoDataAPI(): Promise<Response> {
  try {
    // Generate comprehensive demo data
    const demoReports = [];
    const countries = ['United States', 'United Kingdom', 'France', 'Germany', 'Canada', 'Australia', 'India', 'Brazil', 'Japan', 'South Korea'];
    const cities = ['New York', 'London', 'Paris', 'Berlin', 'Toronto', 'Sydney', 'Mumbai', 'São Paulo', 'Tokyo', 'Seoul'];
    const illnessTypes = ['Upper respiratory infection', 'Migraine', 'Strep throat', 'Gastroenteritis', 'Seasonal allergies', 'COVID-19', 'Influenza', 'Pneumonia'];
    const symptoms = ['fever', 'cough', 'fatigue', 'headache', 'sore throat', 'nausea', 'body aches', 'runny nose', 'congestion', 'loss of appetite'];

    for (let i = 1; i <= 100; i++) {
      const countryIndex = Math.floor(Math.random() * countries.length);
      const cityIndex = Math.floor(Math.random() * cities.length);
      const illnessIndex = Math.floor(Math.random() * illnessTypes.length);
      const numSymptoms = Math.floor(Math.random() * 4) + 1;
      const userSymptoms: string[] = [];
      
      for (let j = 0; j < numSymptoms; j++) {
        const symptomIndex = Math.floor(Math.random() * symptoms.length);
        if (!userSymptoms.includes(symptoms[symptomIndex])) {
          userSymptoms.push(symptoms[symptomIndex]);
        }
      }

      const report = {
        id: i,
        user_id: `user_${Math.floor(Math.random() * 1000)}`,
        symptoms: userSymptoms,
        illness_type: illnessTypes[illnessIndex],
        severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)],
        latitude: (Math.random() * 180) - 90,
        longitude: (Math.random() * 360) - 180,
        country: countries[countryIndex],
        city: cities[cityIndex],
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      demoReports.push(report);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Demo data generated successfully',
        count: demoReports.length,
        reports: demoReports.slice(0, 10) // Return first 10 for preview
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleDemoDataAPI:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}