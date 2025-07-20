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