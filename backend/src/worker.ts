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
    // Use comprehensive global locations from the existing script
    const globalLocations = [
      // North America
      { country: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060 },
      { country: 'United States', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { country: 'United States', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { country: 'United States', city: 'Houston', lat: 29.7604, lng: -95.3698 },
      { country: 'United States', city: 'Miami', lat: 25.7617, lng: -80.1918 },
      { country: 'Canada', city: 'Toronto', lat: 43.6532, lng: -79.3832 },
      { country: 'Canada', city: 'Vancouver', lat: 49.2827, lng: -123.1207 },
      { country: 'Mexico', city: 'Mexico City', lat: 19.4326, lng: -99.1332 },
      
      // Europe
      { country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
      { country: 'United Kingdom', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
      { country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
      { country: 'France', city: 'Marseille', lat: 43.2965, lng: 5.3698 },
      { country: 'Germany', city: 'Berlin', lat: 52.5200, lng: 13.4050 },
      { country: 'Germany', city: 'Munich', lat: 48.1351, lng: 11.5820 },
      { country: 'Spain', city: 'Madrid', lat: 40.4168, lng: -3.7038 },
      { country: 'Spain', city: 'Barcelona', lat: 41.3851, lng: 2.1734 },
      { country: 'Italy', city: 'Rome', lat: 41.9028, lng: 12.4964 },
      { country: 'Italy', city: 'Milan', lat: 45.4642, lng: 9.1900 },
      { country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
      { country: 'Sweden', city: 'Stockholm', lat: 59.3293, lng: 18.0686 },
      { country: 'Norway', city: 'Oslo', lat: 59.9139, lng: 10.7522 },
      { country: 'Denmark', city: 'Copenhagen', lat: 55.6761, lng: 12.5683 },
      { country: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6176 },
      { country: 'Russia', city: 'Saint Petersburg', lat: 59.9311, lng: 30.3609 },
      
      // Asia
      { country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { country: 'Japan', city: 'Osaka', lat: 34.6937, lng: 135.5023 },
      { country: 'South Korea', city: 'Seoul', lat: 37.5665, lng: 126.9780 },
      { country: 'South Korea', city: 'Busan', lat: 35.1796, lng: 129.0756 },
      { country: 'China', city: 'Beijing', lat: 39.9042, lng: 116.4074 },
      { country: 'China', city: 'Shanghai', lat: 31.2304, lng: 121.4737 },
      { country: 'China', city: 'Guangzhou', lat: 23.1291, lng: 113.2644 },
      { country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { country: 'India', city: 'New Delhi', lat: 28.6139, lng: 77.2090 },
      { country: 'India', city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
      { country: 'India', city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
      { country: 'India', city: 'Chennai', lat: 13.0827, lng: 80.2707 },
      { country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
      { country: 'Thailand', city: 'Bangkok', lat: 13.7563, lng: 100.5018 },
      { country: 'Vietnam', city: 'Hanoi', lat: 21.0285, lng: 105.8542 },
      { country: 'Vietnam', city: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297 },
      { country: 'Malaysia', city: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
      { country: 'Indonesia', city: 'Jakarta', lat: -6.2088, lng: 106.8456 },
      { country: 'Philippines', city: 'Manila', lat: 14.5995, lng: 120.9842 },
      
      // Australia & Oceania
      { country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { country: 'Australia', city: 'Melbourne', lat: -37.8136, lng: 144.9631 },
      { country: 'Australia', city: 'Brisbane', lat: -27.4698, lng: 153.0251 },
      { country: 'New Zealand', city: 'Auckland', lat: -36.8485, lng: 174.7633 },
      { country: 'New Zealand', city: 'Wellington', lat: -41.2866, lng: 174.7756 },
      
      // South America
      { country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
      { country: 'Brazil', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
      { country: 'Brazil', city: 'Salvador', lat: -12.9714, lng: -38.5011 },
      { country: 'Argentina', city: 'Buenos Aires', lat: -34.6118, lng: -58.3960 },
      { country: 'Chile', city: 'Santiago', lat: -33.4489, lng: -70.6693 },
      { country: 'Colombia', city: 'Bogotá', lat: 4.7110, lng: -74.0721 },
      { country: 'Peru', city: 'Lima', lat: -12.0464, lng: -77.0428 },
      
      // Africa
      { country: 'South Africa', city: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
      { country: 'South Africa', city: 'Cape Town', lat: -33.9249, lng: 18.4241 },
      { country: 'Nigeria', city: 'Lagos', lat: 6.5244, lng: 3.3792 },
      { country: 'Nigeria', city: 'Kano', lat: 11.9914, lng: 8.5317 },
      { country: 'Kenya', city: 'Nairobi', lat: -1.2921, lng: 36.8219 },
      { country: 'Egypt', city: 'Cairo', lat: 30.0444, lng: 31.2357 },
      { country: 'Morocco', city: 'Casablanca', lat: 33.5731, lng: -7.5898 },
      { country: 'Ghana', city: 'Accra', lat: 5.5600, lng: -0.2057 },
      { country: 'Ethiopia', city: 'Addis Ababa', lat: 9.0320, lng: 38.7486 },
      
      // Middle East
      { country: 'United Arab Emirates', city: 'Dubai', lat: 25.2048, lng: 55.2708 },
      { country: 'United Arab Emirates', city: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
      { country: 'Turkey', city: 'Istanbul', lat: 41.0082, lng: 28.9784 },
      { country: 'Turkey', city: 'Ankara', lat: 39.9334, lng: 32.8597 },
      { country: 'Iran', city: 'Tehran', lat: 35.6892, lng: 51.3890 },
      { country: 'Saudi Arabia', city: 'Riyadh', lat: 24.7136, lng: 46.6753 },
      { country: 'Israel', city: 'Tel Aviv', lat: 32.0853, lng: 34.7818 },
      { country: 'Lebanon', city: 'Beirut', lat: 33.8935, lng: 35.5016 },
      { country: 'Jordan', city: 'Amman', lat: 31.9454, lng: 35.9284 },
      { country: 'Iraq', city: 'Baghdad', lat: 33.3152, lng: 44.3661 }
    ];

    // Disease patterns from the existing script
    const diseasePatterns = {
      flu: {
        symptoms: ['Fever', 'Cough', 'Sore throat', 'Body aches', 'Fatigue', 'Headache'],
        severity: ['mild', 'moderate', 'severe'],
        global: true
      },
      covid: {
        symptoms: ['Fever', 'Cough', 'Fatigue', 'Loss of taste/smell', 'Shortness of breath', 'Body aches'],
        severity: ['mild', 'moderate', 'severe'],
        global: true
      },
      dengue: {
        symptoms: ['High fever', 'Severe headache', 'Joint pain', 'Muscle pain', 'Rash', 'Nausea'],
        severity: ['mild', 'moderate', 'severe'],
        tropical: true
      },
      malaria: {
        symptoms: ['Cyclic fever', 'Chills', 'Sweating', 'Headache', 'Nausea', 'Fatigue'],
        severity: ['mild', 'moderate', 'severe'],
        tropical: true
      },
      typhoid: {
        symptoms: ['High fever', 'Headache', 'Abdominal pain', 'Diarrhea', 'Loss of appetite'],
        severity: ['mild', 'moderate', 'severe'],
        developing: true
      },
      chikungunya: {
        symptoms: ['High fever', 'Joint pain', 'Muscle pain', 'Headache', 'Rash', 'Fatigue'],
        severity: ['mild', 'moderate'],
        tropical: true
      }
    };

    const globalNicknames = [
      'HealthWatcher', 'WellnessSeeker', 'CommunityCare', 'HealthGuard', 'WellnessBuddy',
      'HealthTracker', 'CommunityHealth', 'WellnessGuide', 'HealthMonitor', 'WellnessPartner',
      'HealthHelper', 'CommunityWell', 'WellnessFriend', 'HealthSupporter', 'WellnessAdvocate'
    ];

    // Generate comprehensive reports
    const reports = [];
    
    for (let i = 1; i <= 50; i++) {
      const locationIndex = Math.floor(Math.random() * globalLocations.length);
      const location = globalLocations[locationIndex];
      const diseaseTypes = Object.keys(diseasePatterns);
      const diseaseType = diseaseTypes[Math.floor(Math.random() * diseaseTypes.length)];
      const pattern = diseasePatterns[diseaseType];
      
      // Check if disease should occur in this location
      let shouldInclude = true;
      if (pattern.tropical) {
        const absLat = Math.abs(location.lat);
        shouldInclude = absLat < 30; // Tropical regions
      } else if (pattern.developing) {
        const developingCountries = ['India', 'Brazil', 'China', 'Indonesia', 'Philippines', 'Thailand', 'Vietnam', 'Malaysia', 'Nigeria', 'Kenya', 'Ghana', 'Egypt', 'Morocco', 'Peru', 'Colombia'];
        shouldInclude = developingCountries.includes(location.country);
      }
      
      if (!shouldInclude) continue;
      
      // Generate realistic symptoms
      const numSymptoms = Math.floor(Math.random() * 3) + 2; // 2-4 symptoms
      const userSymptoms = pattern.symptoms.slice(0, numSymptoms);
      
      // Add location variation
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;

      const report = {
        id: i,
        user_id: `user_${Math.floor(Math.random() * 10000)}`,
        nickname: globalNicknames[Math.floor(Math.random() * globalNicknames.length)],
        symptoms: userSymptoms,
        illness_type: diseaseType,
        severity: pattern.severity[Math.floor(Math.random() * pattern.severity.length)],
        latitude: location.lat + latOffset,
        longitude: location.lng + lngOffset,
        country: location.country,
        city: location.city,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      reports.push(report);
    }

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
      { metric: 'total_reports', value: 2847 },
      { metric: 'total_users', value: 1893 },
      { metric: 'reports_in_last_24h', value: 156 },
      { metric: 'active_countries', value: 47 },
      { metric: 'most_reported_illness', value: 'COVID-19' },
      { metric: 'top_illnesses', value: [
        { type: 'COVID-19', count: 423 },
        { type: 'Influenza', count: 298 },
        { type: 'Upper respiratory infection', count: 267 },
        { type: 'Migraine', count: 189 },
        { type: 'Gastroenteritis', count: 156 },
        { type: 'Seasonal allergies', count: 134 },
        { type: 'Strep throat', count: 98 },
        { type: 'Pneumonia', count: 67 },
        { type: 'Asthma', count: 45 },
        { type: 'Dengue fever', count: 34 }
      ]},
      { metric: 'severity_distribution', value: [
        { severity: 'mild', count: 1247 },
        { severity: 'moderate', count: 1134 },
        { severity: 'severe', count: 466 }
      ]},
      { metric: 'geographic_spread', value: [
        { country: 'United States', count: 456 },
        { country: 'India', count: 389 },
        { country: 'United Kingdom', count: 234 },
        { country: 'Germany', count: 198 },
        { country: 'France', count: 167 },
        { country: 'Canada', count: 145 },
        { country: 'Australia', count: 123 },
        { country: 'Brazil', count: 98 },
        { country: 'Japan', count: 87 },
        { country: 'South Korea', count: 76 }
      ]},
      { metric: 'symptom_frequency', value: [
        { symptom: 'fever', count: 892 },
        { symptom: 'cough', count: 756 },
        { symptom: 'fatigue', count: 634 },
        { symptom: 'headache', count: 567 },
        { symptom: 'sore throat', count: 445 },
        { symptom: 'nausea', count: 334 },
        { symptom: 'body aches', count: 298 },
        { symptom: 'runny nose', count: 267 },
        { symptom: 'shortness of breath', count: 189 },
        { symptom: 'diarrhea', count: 156 }
      ]},
      { metric: 'trends', value: [
        { period: 'last_7_days', change: '+12.5%' },
        { period: 'last_30_days', change: '+8.3%' },
        { period: 'last_90_days', change: '+5.7%' }
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
      // Measles cases by country
      { Id: 1, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'IND', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '12500' },
      { Id: 2, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'USA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '1200' },
      { Id: 3, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'CHN', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '8900' },
      { Id: 4, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'NGA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '15600' },
      { Id: 5, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'PAK', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '9800' },
      { Id: 6, IndicatorCode: 'MDG_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'IDN', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '6700' },
      
      // COVID-19 cases
      { Id: 7, IndicatorCode: 'COVID_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'USA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '4500000' },
      { Id: 8, IndicatorCode: 'COVID_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'IND', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '3800000' },
      { Id: 9, IndicatorCode: 'COVID_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'BRA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '2100000' },
      { Id: 10, IndicatorCode: 'COVID_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'GBR', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '1800000' },
      
      // Influenza cases
      { Id: 11, IndicatorCode: 'FLU_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'USA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '890000' },
      { Id: 12, IndicatorCode: 'FLU_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'CHN', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '670000' },
      { Id: 13, IndicatorCode: 'FLU_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'DEU', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '450000' },
      { Id: 14, IndicatorCode: 'FLU_0000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'FRA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '380000' },
      
      // Dengue fever cases
      { Id: 15, IndicatorCode: 'DENGUE_000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'BRA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '890000' },
      { Id: 16, IndicatorCode: 'DENGUE_000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'IND', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '670000' },
      { Id: 17, IndicatorCode: 'DENGUE_000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'IDN', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '450000' },
      { Id: 18, IndicatorCode: 'DENGUE_000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'THA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '380000' },
      
      // Malaria cases
      { Id: 19, IndicatorCode: 'MALARIA_00000001', SpatialDimType: 'COUNTRY', SpatialDim: 'NGA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '6700000' },
      { Id: 20, IndicatorCode: 'MALARIA_00000001', SpatialDimType: 'COUNTRY', SpatialDim: 'COD', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '4500000' },
      { Id: 21, IndicatorCode: 'MALARIA_00000001', SpatialDimType: 'COUNTRY', SpatialDim: 'TZA', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '3800000' },
      { Id: 22, IndicatorCode: 'MALARIA_00000001', SpatialDimType: 'COUNTRY', SpatialDim: 'MOZ', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '2900000' },
      
      // Tuberculosis cases
      { Id: 23, IndicatorCode: 'TB_000000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'IND', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '2100000' },
      { Id: 24, IndicatorCode: 'TB_000000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'CHN', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '890000' },
      { Id: 25, IndicatorCode: 'TB_000000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'IDN', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '670000' },
      { Id: 26, IndicatorCode: 'TB_000000000001', SpatialDimType: 'COUNTRY', SpatialDim: 'PHL', TimeDimType: 'YEAR', TimeDim: 2023, Dim1Type: 'SEX', Dim1: 'BTSX', Value: '450000' }
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
    // Generate comprehensive demo data with realistic global locations
    const demoReports = [];
    
    // Major cities with realistic coordinates
    const locations = [
      // North America
      { city: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060 },
      { city: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437 },
      { city: 'Chicago', country: 'United States', lat: 41.8781, lng: -87.6298 },
      { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
      { city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207 },
      { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
      
      // Europe
      { city: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
      { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
      { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
      { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
      { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
      { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
      { city: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686 },
      { city: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6176 },
      
      // Asia
      { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
      { city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780 },
      { city: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074 },
      { city: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737 },
      { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
      { city: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
      { city: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946 },
      { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
      { city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
      { city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
      { city: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842 },
      { city: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lng: 106.6297 },
      
      // Australia & Oceania
      { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
      { city: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631 },
      { city: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633 },
      
      // South America
      { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333 },
      { city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729 },
      { city: 'Buenos Aires', country: 'Argentina', lat: -34.6118, lng: -58.3960 },
      { city: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428 },
      { city: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721 },
      { city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693 },
      
      // Africa
      { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
      { city: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
      { city: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219 },
      { city: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473 },
      { city: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241 },
      { city: 'Casablanca', country: 'Morocco', lat: 33.5731, lng: -7.5898 },
      { city: 'Addis Ababa', country: 'Ethiopia', lat: 9.0320, lng: 38.7488 },
      { city: 'Kinshasa', country: 'DR Congo', lat: -4.4419, lng: 15.2663 },
      
      // Middle East
      { city: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708 },
      { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
      { city: 'Tehran', country: 'Iran', lat: 35.6892, lng: 51.3890 },
      { city: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753 },
      { city: 'Baghdad', country: 'Iraq', lat: 33.3152, lng: 44.3661 },
      { city: 'Amman', country: 'Jordan', lat: 31.9454, lng: 35.9284 }
    ];
    
    const illnessTypes = [
      'COVID-19', 'Influenza', 'Upper respiratory infection', 'Migraine', 
      'Gastroenteritis', 'Seasonal allergies', 'Strep throat', 'Pneumonia', 
      'Asthma', 'Dengue fever', 'Malaria', 'Tuberculosis', 'Mononucleosis',
      'Appendicitis', 'Laryngitis', 'Vertigo', 'Bronchitis', 'Sinusitis',
      'Conjunctivitis', 'Urinary tract infection'
    ];
    
    const symptoms = [
      'fever', 'cough', 'fatigue', 'headache', 'sore throat', 'nausea', 
      'body aches', 'runny nose', 'congestion', 'shortness of breath', 
      'diarrhea', 'vomiting', 'abdominal pain', 'chest pain', 'dizziness',
      'sensitivity to light', 'hoarse voice', 'difficulty swallowing',
      'swollen lymph nodes', 'rash', 'joint pain', 'chills', 'sweating',
      'loss of appetite', 'itchy eyes', 'sneezing', 'wheezing', 'chest tightness'
    ];

    // Generate 200 reports with realistic distribution
    for (let i = 1; i <= 200; i++) {
      const locationIndex = Math.floor(Math.random() * locations.length);
      const location = locations[locationIndex];
      const illnessIndex = Math.floor(Math.random() * illnessTypes.length);
      const numSymptoms = Math.floor(Math.random() * 4) + 1;
      const userSymptoms: string[] = [];
      
      // Generate realistic symptoms based on illness type
      const illnessType = illnessTypes[illnessIndex];
      let baseSymptoms: string[] = [];
      
      // Map illness types to common symptoms
      switch (illnessType) {
        case 'COVID-19':
          baseSymptoms = ['fever', 'cough', 'fatigue', 'body aches', 'loss of taste'];
          break;
        case 'Influenza':
          baseSymptoms = ['fever', 'headache', 'muscle pain', 'fatigue'];
          break;
        case 'Upper respiratory infection':
          baseSymptoms = ['cough', 'congestion', 'sore throat', 'runny nose'];
          break;
        case 'Migraine':
          baseSymptoms = ['headache', 'nausea', 'sensitivity to light'];
          break;
        case 'Gastroenteritis':
          baseSymptoms = ['nausea', 'vomiting', 'diarrhea', 'abdominal pain'];
          break;
        case 'Seasonal allergies':
          baseSymptoms = ['runny nose', 'sneezing', 'itchy eyes', 'congestion'];
          break;
        case 'Strep throat':
          baseSymptoms = ['sore throat', 'fever', 'difficulty swallowing'];
          break;
        case 'Pneumonia':
          baseSymptoms = ['fever', 'cough', 'shortness of breath', 'chest pain'];
          break;
        case 'Asthma':
          baseSymptoms = ['cough', 'wheezing', 'chest tightness'];
          break;
        case 'Dengue fever':
          baseSymptoms = ['fever', 'rash', 'joint pain'];
          break;
        case 'Malaria':
          baseSymptoms = ['fever', 'chills', 'sweating'];
          break;
        default:
          baseSymptoms = symptoms.slice(0, 3);
      }
      
      // Add base symptoms and some random additional ones
      userSymptoms.push(...baseSymptoms.slice(0, Math.min(numSymptoms, baseSymptoms.length)));
      
      // Add random symptoms if needed
      while (userSymptoms.length < numSymptoms) {
        const randomSymptom = symptoms[Math.floor(Math.random() * symptoms.length)];
        if (!userSymptoms.includes(randomSymptom)) {
          userSymptoms.push(randomSymptom);
        }
      }

      // Add some location variation (small random offset)
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;

      const report = {
        id: i,
        user_id: `user_${Math.floor(Math.random() * 10000)}`,
        symptoms: userSymptoms,
        illness_type: illnessType,
        severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)],
        latitude: location.lat + latOffset,
        longitude: location.lng + lngOffset,
        country: location.country,
        city: location.city,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      demoReports.push(report);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Demo data generated successfully',
        count: demoReports.length,
        reports: demoReports.slice(0, 20) // Return first 20 for preview
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