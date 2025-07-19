interface Env {
  FRONTEND_URL: string;
}

// Cloudflare Workers types
declare global {
  interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
  }
  
  // WebSocket types for Cloudflare Workers
  interface WebSocketPair {
    0: WebSocket;
    1: WebSocket;
  }
  
  interface WebSocket {
    accept(): void;
    addEventListener(type: string, listener: (event: any) => void): void;
    send(data: string | ArrayBuffer): void;
    close(code?: number, reason?: string): void;
  }
  
  interface ResponseInit {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    webSocket?: WebSocket;
  }
  
  // WebSocket constructor
  var WebSocketPair: {
    new(): [WebSocket, WebSocket];
  };
}

// WebSocket connection management
interface ChatConnection {
  user1: string;
  user2: string;
  messages: ChatMessage[];
  createdAt: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
}

interface WaitingUser {
  socketId: string;
  timestamp: number;
}

// Enhanced collaborative features
interface HealthGroup {
  id: string;
  name: string;
  description: string;
  category: 'disease' | 'wellness' | 'emergency' | 'local' | 'general';
  diseaseType?: string;
  location?: string;
  members: string[];
  messages: GroupMessage[];
  createdAt: number;
  isActive: boolean;
}

interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  messageType: 'text' | 'health_tip' | 'experience' | 'emergency' | 'support';
  timestamp: string;
  reactions?: string[];
}

interface HealthChallenge {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'mental_health' | 'prevention' | 'recovery';
  participants: string[];
  progress: Record<string, number>;
  startDate: number;
  endDate: number;
  isActive: boolean;
}

interface HealthMentor {
  id: string;
  mentorId: string;
  menteeId: string;
  specialty: string;
  status: 'active' | 'completed' | 'pending';
  startDate: number;
  messages: MentorMessage[];
}

interface MentorMessage {
  id: string;
  senderId: string;
  message: string;
  messageType: 'advice' | 'question' | 'encouragement' | 'resource';
  timestamp: string;
}

interface EmergencyAlert {
  id: string;
  userId: string;
  location: string;
  symptoms: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'escalated';
  responders: string[];
  createdAt: number;
  resolvedAt?: number;
}

// In-memory storage for collaborative features
let healthGroups = new Map<string, HealthGroup>();
let healthChallenges = new Map<string, HealthChallenge>();
let healthMentors = new Map<string, HealthMentor>();
let emergencyAlerts = new Map<string, EmergencyAlert>();
let userProfiles = new Map<string, {
  id: string;
  nickname: string;
  location: string;
  specialties: string[];
  experience: 'beginner' | 'intermediate' | 'expert';
  joinDate: number;
}>();

// Initialize default health groups
function initializeHealthGroups() {
  const defaultGroups = [
    {
      id: 'flu-support',
      name: 'Flu Recovery Support',
      description: 'Support group for people dealing with flu symptoms and recovery',
      category: 'disease' as const,
      diseaseType: 'flu',
      members: [],
      messages: [
        {
          id: 'demo-1',
          senderId: 'system',
          senderName: 'Dr. Sarah',
          message: 'Welcome to the Flu Recovery Support group! Feel free to share your experiences and ask questions.',
          messageType: 'text' as const,
          timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
          id: 'demo-2',
          senderId: 'user-demo-1',
          senderName: 'Alex',
          message: 'Thanks for creating this space. I\'m recovering from the flu and it\'s been helpful to have support.',
          messageType: 'text' as const,
          timestamp: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
        },
        {
          id: 'demo-3',
          senderId: 'user-demo-2',
          senderName: 'Maria',
          message: 'I found that staying hydrated and getting plenty of rest really helped me. Hope everyone feels better soon!',
          messageType: 'text' as const,
          timestamp: new Date(Date.now() - 900000).toISOString() // 15 minutes ago
        }
      ],
      createdAt: Date.now(),
      isActive: true
    },
    {
      id: 'covid-support',
      name: 'COVID-19 Support Network',
      description: 'Community support for COVID-19 patients and caregivers',
      category: 'disease' as const,
      diseaseType: 'covid',
      members: [],
      messages: [
        {
          id: 'covid-demo-1',
          senderId: 'nurse-jane',
          senderName: 'Nurse Jane',
          message: 'Remember to monitor your symptoms and stay in touch with your healthcare provider. We\'re here to support each other.',
          messageType: 'text' as const,
          timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
        },
        {
          id: 'covid-demo-2',
          senderId: 'user-john',
          senderName: 'John',
          message: 'Day 5 of recovery - feeling much better today. Thanks everyone for the encouragement!',
          messageType: 'text' as const,
          timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        }
      ],
      createdAt: Date.now(),
      isActive: true
    },
    {
      id: 'mental-wellness',
      name: 'Mental Wellness Circle',
      description: 'Support for mental health and emotional well-being',
      category: 'wellness' as const,
      members: [],
      messages: [
        {
          id: 'wellness-demo-1',
          senderId: 'therapist-lisa',
          senderName: 'Lisa (Therapist)',
          message: 'Welcome to our safe space for mental wellness. Remember, taking care of your mental health is just as important as physical health.',
          messageType: 'text' as const,
          timestamp: new Date(Date.now() - 5400000).toISOString() // 1.5 hours ago
        },
        {
          id: 'wellness-demo-2',
          senderId: 'user-emma',
          senderName: 'Emma',
          message: 'I\'ve been practicing the breathing exercises we discussed. They really help with my anxiety. Thanks for the support!',
          messageType: 'text' as const,
          timestamp: new Date(Date.now() - 2700000).toISOString() // 45 minutes ago
        }
      ],
      createdAt: Date.now(),
      isActive: true
    },
    {
      id: 'emergency-support',
      name: 'Emergency Response Network',
      description: 'Real-time emergency coordination and support',
      category: 'emergency' as const,
      members: [],
      messages: [
        {
          id: 'emergency-demo-1',
          senderId: 'paramedic-mike',
          senderName: 'Mike (Paramedic)',
          message: 'This channel is for emergency coordination. For immediate medical emergencies, always call 911 first, then share updates here.',
          messageType: 'emergency' as const,
          timestamp: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
        }
      ],
      createdAt: Date.now(),
      isActive: true
    },
    {
      id: 'prevention-tips',
      name: 'Health Prevention Tips',
      description: 'Share and discover preventive health measures',
      category: 'general' as const,
      members: [],
      messages: [
        {
          id: 'prevention-demo-1',
          senderId: 'dr-health',
          senderName: 'Dr. Health',
          message: 'Tip of the day: Regular hand washing for 20 seconds with soap can prevent many common illnesses. Stay healthy everyone!',
          messageType: 'health_tip' as const,
          timestamp: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
        },
        {
          id: 'prevention-demo-2',
          senderId: 'user-sarah',
          senderName: 'Sarah',
          message: 'I\'ve been drinking more water and eating more fruits since joining this group. Thanks for all the great tips!',
          messageType: 'text' as const,
          timestamp: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
        }
      ],
      createdAt: Date.now(),
      isActive: true
    }
  ];

  defaultGroups.forEach(group => {
    healthGroups.set(group.id, group);
  });
}

// Initialize default health challenges
function initializeHealthChallenges() {
  const defaultChallenges = [
    {
      id: 'hydration-challenge',
      title: '30-Day Hydration Challenge',
      description: 'Stay hydrated for 30 days and track your water intake',
      category: 'nutrition' as const,
      participants: [],
      progress: {},
      startDate: Date.now(),
      endDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: 'walking-challenge',
      title: '10K Steps Daily Challenge',
      description: 'Walk 10,000 steps every day for better health',
      category: 'fitness' as const,
      participants: [],
      progress: {},
      startDate: Date.now(),
      endDate: Date.now() + (21 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: 'stress-reduction',
      title: 'Stress Reduction Challenge',
      description: 'Practice stress-reduction techniques daily',
      category: 'mental_health' as const,
      participants: [],
      progress: {},
      startDate: Date.now(),
      endDate: Date.now() + (14 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ];

  defaultChallenges.forEach(challenge => {
    healthChallenges.set(challenge.id, challenge);
  });
}

// Initialize collaborative features
initializeHealthGroups();
initializeHealthChallenges();

// In-memory storage for chat (in production, you'd use KV or D1)
let waitingUsers = new Map<string, WaitingUser>();
let activeConnections = new Map<string, ChatConnection>();
let connectedWebSockets = new Map<string, WebSocket>();
// Map user IDs to sets of socket IDs (supports multiple tabs per user)
let userToSocketsMap = new Map<string, Set<string>>();
// Map socket IDs back to user IDs for cleanup
let socketToUserMap = new Map<string, string>();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// In-memory storage (in production, you'd use KV or D1)
let symptomReports: any[] = [];
let aiConsultations: any[] = [];
let phoneNotifications: any[] = [];

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      // Only handle WebSocket upgrades for specific endpoints
      if (path === '/' || path === '/chat' || path === '/ws') {
        return await handleWebSocketUpgrade(request, env, ctx);
      } else {
        return new Response('WebSocket endpoint not found', { status: 404 });
      }
    }

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
          environment: 'production',
            phoneAISystem: '+1 7703620543'
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

    // REST API endpoints
    if (path === '/api/reports' && request.method === 'POST') {
        return await handleCreateReport(request);
    }

    if (path === '/api/reports' && request.method === 'GET') {
        return await handleGetReports();
      }

      if (path === '/api/health-aggregates' && request.method === 'GET') {
        return await handleGetHealthAggregates();
      }

      // Add missing endpoints
      if (path === '/api/who-data' && request.method === 'GET') {
        return await handleGetWHOData();
      }

      if (path === '/api/health-tips' && request.method === 'GET') {
        return await handleGetHealthTips();
    }

    if (path === '/api/diseases' && request.method === 'GET') {
        return await handleGetDiseases();
    }

    if (path === '/api/regions' && request.method === 'GET') {
        return await handleGetRegions();
      }

      // Phone AI Integration endpoints
      if (path === '/api/phone-ai/voice-report' && request.method === 'POST') {
        return await handleVoiceSymptomReport(request);
      }

      if (path === '/api/phone-ai/health-consultation' && request.method === 'POST') {
        return await handlePhoneAIConsultation(request);
      }

      if (path === '/api/phone-ai/send-notification' && request.method === 'POST') {
        return await handleSendPhoneNotification(request);
      }

      if (path === '/api/phone-ai/emergency-alert' && request.method === 'POST') {
        return await handleEmergencySupport(request);
      }

      if (path === '/api/phone-ai/health-status' && request.method === 'GET') {
        return await handleGetPhoneHealthStatus(request);
      }

      // Predictive Analytics endpoints
      if (path === '/api/analytics/outbreak-prediction' && request.method === 'GET') {
        return await handleOutbreakPrediction(request);
      }

      if (path === '/api/analytics/health-trends' && request.method === 'GET') {
        return await handleHealthTrends(request);
      }

      if (path === '/api/analytics/risk-assessment' && request.method === 'POST') {
        return await handleRiskAssessment(request);
      }

      if (path === '/api/analytics/seasonal-patterns' && request.method === 'GET') {
        return await handleSeasonalPatterns(request);
    }

      // Collaborative Features endpoints
      if (path === '/api/collaborative/groups' && request.method === 'GET') {
        return await handleGetHealthGroups(request);
      }

      if (path === '/api/collaborative/groups' && request.method === 'POST') {
        return await handleCreateHealthGroup(request);
      }

      if (path === '/api/collaborative/groups' && request.method === 'PUT') {
        return await handleJoinHealthGroup(request);
      }

      // New polling endpoints for real-time updates
      if (path.startsWith('/api/collaborative/groups/') && path.endsWith('/messages') && request.method === 'GET') {
        return await handleGetGroupMessages(request);
      }

      if (path.startsWith('/api/collaborative/groups/') && path.endsWith('/poll') && request.method === 'GET') {
        return await handlePollGroupUpdates(request);
      }

      if (path === '/api/collaborative/challenges' && request.method === 'GET') {
        return await handleGetHealthChallenges(request);
      }

      if (path === '/api/collaborative/challenges' && request.method === 'POST') {
        return await handleJoinHealthChallenge(request);
      }

      if (path === '/api/collaborative/mentors' && request.method === 'GET') {
        return await handleGetMentors(request);
      }

      if (path === '/api/collaborative/mentors' && request.method === 'POST') {
        return await handleRequestMentorshipAPI(request);
      }

      if (path === '/api/collaborative/emergency' && request.method === 'POST') {
        return await handleEmergencySupport(request);
      }

      if (path === '/api/collaborative/emergency' && request.method === 'GET') {
        return await handleGetEmergencyAlerts(request);
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

// WebSocket handling functions
async function handleWebSocketUpgrade(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair) as [WebSocket, WebSocket];

    // Accept the WebSocket connection
    server.accept();

    // Store the WebSocket connection with a unique ID
    const socketId = generateSocketId();
    connectedWebSockets.set(socketId, server);

    // Handle WebSocket messages
    server.addEventListener('message', (event: any) => {
      try {
        const data = JSON.parse(event.data as string);
        console.log('WebSocket message received:', data.type);
        handleWebSocketMessage(server, data, socketId);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        sendWebSocketMessage(server, { type: 'error', message: 'Invalid message format' });
      }
    });

    // Handle WebSocket close
    server.addEventListener('close', () => {
      console.log('WebSocket connection closed for socket:', socketId);
      handleWebSocketClose(server);
    });

    // Handle WebSocket error
    server.addEventListener('error', (error: any) => {
      console.error('WebSocket error for socket:', socketId, error);
      handleWebSocketClose(server);
    });

    console.log('WebSocket connection established for socket:', socketId);

    return new Response(null, {
      status: 101,
      webSocket: client,
    } as any);
  } catch (error) {
    console.error('Error in handleWebSocketUpgrade:', error);
    return new Response('WebSocket upgrade failed', { status: 500 });
  }
}

function handleWebSocketMessage(websocket: WebSocket, data: any, socketId: string) {
  console.log(`Processing message type: ${data.type} for socket: ${socketId}`);
  
  switch (data.type) {
    case 'request_connection':
      handleRequestConnection(websocket, socketId);
      break;
    case 'send_message':
      handleSendMessage(websocket, data, socketId);
      break;
    case 'disconnect_from_chat':
      handleDisconnectFromChat(websocket, data, socketId);
      break;
    case 'join_group':
      handleJoinGroup(websocket, data, socketId);
      break;
    case 'send_group_message':
      handleSendGroupMessage(websocket, data, socketId);
      break;
    case 'join_challenge':
      handleJoinChallenge(websocket, data, socketId);
      break;
    case 'update_challenge_progress':
      handleUpdateChallengeProgress(websocket, data, socketId);
      break;
    case 'request_mentorship':
      handleRequestMentorship(websocket, data, socketId);
      break;
    case 'send_mentor_message':
      handleSendMentorMessage(websocket, data, socketId);
      break;
    case 'emergency_alert':
      handleEmergencyAlert(websocket, data, socketId);
      break;
    default:
      console.log(`Unknown message type: ${data.type}`);
      sendWebSocketMessage(websocket, { type: 'error', message: 'Unknown message type' });
  }
}

function handleRequestConnection(websocket: WebSocket, socketId: string) {
  console.log(`User ${socketId} requesting connection`);
  
  // Store the WebSocket connection (already stored in handleWebSocketUpgrade)
  // connectedWebSockets.set(socketId, websocket);
  
  // Clean up expired waiting users (older than 30 seconds)
  const now = Date.now();
  for (const [userId, userData] of waitingUsers.entries()) {
    if (now - userData.timestamp > 30000) {
      waitingUsers.delete(userId);
    }
  }
  
  // Check if there's a waiting user
  const waitingUser = Array.from(waitingUsers.entries()).find(([userId]) => userId !== socketId);
  
  if (waitingUser) {
    // Pair with waiting user
    const [waitingUserId] = waitingUser;
    waitingUsers.delete(waitingUserId);
    
    // Create connection
    const connectionId = `conn_${Date.now()}`;
    activeConnections.set(connectionId, {
      user1: waitingUserId,
      user2: socketId,
      messages: [],
      createdAt: now
    });

    // Notify both users
    const waitingWebSocket = connectedWebSockets.get(waitingUserId);
    if (waitingWebSocket) {
      sendWebSocketMessage(waitingWebSocket, {
        type: 'connection_made',
        connectionId,
        partnerId: socketId,
        message: 'You have been connected with another user!'
      });
    }
    
    sendWebSocketMessage(websocket, {
      type: 'connection_made',
      connectionId,
      partnerId: waitingUserId,
      message: 'You have been connected with another user!'
    });

    console.log(`Paired users ${waitingUserId} and ${socketId}`);
  } else {
    // Add to waiting list
    waitingUsers.set(socketId, { socketId, timestamp: now });
    sendWebSocketMessage(websocket, {
      type: 'waiting_for_connection',
      message: 'Waiting for another user to connect...'
    });
    console.log(`User ${socketId} added to waiting list`);
  }
}

function handleSendMessage(websocket: WebSocket, data: any, socketId: string) {
  const connection = activeConnections.get(data.connectionId);
  if (!connection) {
    sendWebSocketMessage(websocket, { type: 'error', message: 'Connection not found' });
    return;
  }

  // Add message to connection history
  const messageData: ChatMessage = {
    id: Date.now().toString(),
    senderId: socketId,
    message: data.message,
    timestamp: new Date().toISOString()
  };
  connection.messages.push(messageData);

  // Only send confirmation to sender - partner will see message when they poll/reconnect
  sendWebSocketMessage(websocket, {
    type: 'message_sent',
    connectionId: data.connectionId,
    messageId: messageData.id,
    message: messageData
  });
}

function handleDisconnectFromChat(websocket: WebSocket, data: any, socketId: string) {
  const connection = activeConnections.get(data.connectionId);
  if (connection) {
    // Remove connection - partner will be notified when they try to interact
    activeConnections.delete(data.connectionId);
    
    // Send confirmation to current user
    sendWebSocketMessage(websocket, {
      type: 'chat_disconnected',
      connectionId: data.connectionId,
      message: 'You have disconnected from the chat'
    });
  }
}

function handleWebSocketClose(websocket: WebSocket) {
  // Find and remove the socket from connectedWebSockets
  for (const [socketId, ws] of connectedWebSockets.entries()) {
    if (ws === websocket) {
      connectedWebSockets.delete(socketId);
      
      // Remove from user to socket mapping
      const userId = socketToUserMap.get(socketId);
      if (userId) {
        const userSockets = userToSocketsMap.get(userId);
        if (userSockets) {
          userSockets.delete(socketId);
          if (userSockets.size === 0) {
            userToSocketsMap.delete(userId);
          }
        }
        socketToUserMap.delete(socketId);
        console.log(`Removed user ${userId} mapping for socket ${socketId}`);
      }
      
      // Remove from waiting users
      waitingUsers.delete(socketId);
      
      // Handle disconnection from active connections - just clean up, don't notify
      for (const [connectionId, connection] of activeConnections.entries()) {
        if (connection.user1 === socketId || connection.user2 === socketId) {
          // Mark connection as having a disconnected user but don't remove it
          // The remaining user will be notified when they try to interact
          console.log(`User ${socketId} disconnected from connection ${connectionId}`);
          break;
        }
      }
      
      console.log(`Client disconnected: ${socketId}`);
      break;
    }
  }
}

function sendWebSocketMessage(websocket: WebSocket, data: any) {
  try {
    const message = JSON.stringify(data);
    websocket.send(message);
    console.log(`WebSocket message sent: ${data.type}`);
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
  }
}

// Collaborative WebSocket handlers
function handleJoinGroup(websocket: WebSocket, data: any, socketId: string) {
  const { groupId, userId, userNickname } = data;
  console.log(`User ${socketId} (${userNickname}) joining group ${groupId}`);
  
  const group = healthGroups.get(groupId);
  
  if (!group) {
    console.log(`Group ${groupId} not found`);
    sendWebSocketMessage(websocket, { type: 'error', message: 'Group not found' });
    return;
  }

  // Map userId to socketId for current session (supports multiple tabs)
  if (!userToSocketsMap.has(userId)) {
    userToSocketsMap.set(userId, new Set());
  }
  userToSocketsMap.get(userId)!.add(socketId);
  socketToUserMap.set(socketId, userId);
  console.log(`Mapped user ${userId} to socket ${socketId}`);

  const isNewMember = !group.members.includes(userId);
  if (isNewMember) {
    group.members.push(userId);
    console.log(`User ${userNickname} added to group ${group.name}`);
  }

  // Send group info to user (including recent messages)
  sendWebSocketMessage(websocket, {
    type: 'group_joined',
    groupId,
    group: {
      ...group,
      messages: group.messages.slice(-20) // Send last 20 messages
    }
  });

  // Broadcast to existing members that a new user joined (only if it's actually a new member)
  if (isNewMember) {
    let broadcastCount = 0;
    group.members.forEach(memberId => {
      if (memberId !== userId) { // Don't send to the new member
        const memberSocketIds = userToSocketsMap.get(memberId);
        if (memberSocketIds) {
          memberSocketIds.forEach(memberSocketId => {
            const memberWebSocket = connectedWebSockets.get(memberSocketId);
            if (memberWebSocket) {
              try {
                sendWebSocketMessage(memberWebSocket, {
                  type: 'new_group_member',
                  groupId,
                  userId,
                  userNickname,
                  message: `${userNickname} joined the group`
                });
                broadcastCount++;
              } catch (error) {
                console.error(`Error broadcasting member join to ${memberId}:`, error);
              }
            }
          });
        }
      }
    });
    console.log(`User ${userNickname} successfully joined group ${group.name}, notified ${broadcastCount} existing members`);
  } else {
    console.log(`User ${userNickname} rejoined group ${group.name}`);
  }
}

function handleSendGroupMessage(websocket: WebSocket, data: any, socketId: string) {
  const { groupId, userId, userNickname, message, messageType } = data;
  console.log(`User ${socketId} (${userNickname}) sending message to group ${groupId}: ${message}`);
  
  const group = healthGroups.get(groupId);
  
  if (!group) {
    sendWebSocketMessage(websocket, { type: 'error', message: 'Group not found' });
    return;
  }

  if (!group.members.includes(userId)) {
    sendWebSocketMessage(websocket, { type: 'error', message: 'You are not a member of this group' });
    return;
  }

  // Add message to group
  const groupMessage = {
    id: generateId(),
    senderId: userId,
    senderName: userNickname,
    message,
    messageType: messageType || 'text',
    timestamp: new Date().toISOString()
  };
  group.messages.push(groupMessage);

  // Keep only the last 50 messages to prevent memory overflow
  if (group.messages.length > 50) {
    group.messages = group.messages.slice(-50);
  }

  console.log(`Message added to group ${group.name}, stored for ${group.members.length} members (${group.messages.length} total messages)`);

  // Send confirmation to the sender
  sendWebSocketMessage(websocket, {
    type: 'group_message_sent',
    groupId,
    messageId: groupMessage.id,
    message: groupMessage
  });
  
  // Broadcast message to all other group members who are currently connected
  let broadcastCount = 0;
  group.members.forEach(memberId => {
    if (memberId !== userId) { // Don't send to sender again
      const memberSocketIds = userToSocketsMap.get(memberId);
      if (memberSocketIds) {
        memberSocketIds.forEach(memberSocketId => {
          const memberWebSocket = connectedWebSockets.get(memberSocketId);
          if (memberWebSocket) {
            try {
              sendWebSocketMessage(memberWebSocket, {
                type: 'new_group_message',
                groupId,
                message: groupMessage
              });
              broadcastCount++;
            } catch (error) {
              console.error(`Error broadcasting to member ${memberId}:`, error);
            }
          }
        });
      }
    }
  });
  
  console.log(`Message confirmation sent to sender ${userNickname}, broadcasted to ${broadcastCount} other members`);
}

function handleJoinChallenge(websocket: WebSocket, data: any, socketId: string) {
  const { challengeId, userId, userNickname } = data;
  const challenge = healthChallenges.get(challengeId);
  
  if (!challenge) {
    sendWebSocketMessage(websocket, { type: 'error', message: 'Challenge not found' });
    return;
  }

  if (!challenge.participants.includes(userId)) {
    challenge.participants.push(userId);
    challenge.progress[userId] = 0;
  }

  sendWebSocketMessage(websocket, {
    type: 'challenge_joined',
    challengeId,
    challenge: challenge
  });
}

function handleUpdateChallengeProgress(websocket: WebSocket, data: any, socketId: string) {
  const { challengeId, userId, progress } = data;
  const challenge = healthChallenges.get(challengeId);
  
  if (!challenge) {
    sendWebSocketMessage(websocket, { type: 'error', message: 'Challenge not found' });
    return;
  }

  challenge.progress[userId] = progress;

  // Notify all participants
  challenge.participants.forEach(participantId => {
    const participantWebSocket = connectedWebSockets.get(participantId);
    if (participantWebSocket) {
      sendWebSocketMessage(participantWebSocket, {
        type: 'challenge_progress_updated',
        challengeId,
        userId,
        progress
      });
    }
  });
}

function handleRequestMentorship(websocket: WebSocket, data: any, socketId: string) {
  const { menteeId, menteeNickname, specialty, mentorId } = data;
  
  const mentorship: HealthMentor = {
    id: generateId(),
    mentorId: mentorId || 'available_mentor',
    menteeId,
    specialty,
    status: 'pending',
    startDate: Date.now(),
    messages: []
  };

  healthMentors.set(mentorship.id, mentorship);

  sendWebSocketMessage(websocket, {
    type: 'mentorship_requested',
    mentorshipId: mentorship.id,
    mentorship: mentorship
  });
}

function handleSendMentorMessage(websocket: WebSocket, data: any, socketId: string) {
  const { mentorshipId, senderId, senderName, message, messageType } = data;
  const mentorship = healthMentors.get(mentorshipId);
  
  if (!mentorship) {
    sendWebSocketMessage(websocket, { type: 'error', message: 'Mentorship not found' });
    return;
  }

  const mentorMessage: MentorMessage = {
    id: generateId(),
    senderId,
    message,
    messageType: messageType || 'advice',
    timestamp: new Date().toISOString()
  };
  mentorship.messages.push(mentorMessage);

  // Send to both mentor and mentee
  const mentorWebSocket = connectedWebSockets.get(mentorship.mentorId);
  const menteeWebSocket = connectedWebSockets.get(mentorship.menteeId);

  if (mentorWebSocket) {
    sendWebSocketMessage(mentorWebSocket, {
      type: 'new_mentor_message',
      mentorshipId,
      message: mentorMessage
    });
  }

  if (menteeWebSocket) {
    sendWebSocketMessage(menteeWebSocket, {
      type: 'new_mentor_message',
      mentorshipId,
      message: mentorMessage
    });
  }
}

function handleEmergencyAlert(websocket: WebSocket, data: any, socketId: string) {
  const { userId, location, symptoms, severity, description } = data;
  
  const alert: EmergencyAlert = {
    id: generateId(),
    userId,
    location,
    symptoms,
    severity: severity as 'low' | 'medium' | 'high' | 'critical',
    status: 'active',
    responders: [],
    createdAt: Date.now()
  };

  emergencyAlerts.set(alert.id, alert);

  // Notify emergency support group
  const emergencyGroup = healthGroups.get('emergency-support');
  if (emergencyGroup) {
    const alertMessage: GroupMessage = {
      id: generateId(),
      senderId: 'system',
      senderName: 'Emergency Alert',
      message: `EMERGENCY: ${severity} case in ${location}. Symptoms: ${symptoms.join(', ')}. Description: ${description}`,
      messageType: 'emergency',
      timestamp: new Date().toISOString()
    };
    emergencyGroup.messages.push(alertMessage);

    // Notify all emergency group members
    emergencyGroup.members.forEach(memberId => {
      const memberWebSocket = connectedWebSockets.get(memberId);
      if (memberWebSocket) {
        sendWebSocketMessage(memberWebSocket, {
          type: 'emergency_alert',
          alert: alert,
          groupMessage: alertMessage
        });
      }
    });
  }

  sendWebSocketMessage(websocket, {
    type: 'emergency_alert_sent',
    alertId: alert.id,
    message: 'Emergency alert sent to support network'
  });
}

function generateSocketId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Handler functions
async function handleCreateReport(request: Request): Promise<Response> {
  try {
    const report = await request.json() as any;
    
    const newReport = {
      id: generateId(),
        nickname: report.nickname,
        country: report.country,
        pin_code: report.pinCode,
        symptoms: report.symptoms,
        illness_type: report.illnessType,
        severity: report.severity,
        latitude: report.latitude,
        longitude: report.longitude,
      phone_number: report.phoneNumber,
      created_at: new Date().toISOString()
    };

    symptomReports.push(newReport);

    return new Response(
      JSON.stringify({ success: true, data: newReport }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleCreateReport:', error);
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

async function handleGetReports(): Promise<Response> {
  try {
    return new Response(
      JSON.stringify(symptomReports),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetReports:', error);
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

async function handleGetHealthAggregates(): Promise<Response> {
  try {
    const totalReports = symptomReports.length;
    
    // Get reports in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const reports24h = symptomReports.filter(r => {
      const reportDate = new Date(r.created_at);
      return reportDate > twentyFourHoursAgo;
    }).length;

    // Get unique countries
    const uniqueCountries = new Set(symptomReports.map((report: any) => report.country)).size;

    // Get illness type distribution
    const illnessCounts = symptomReports.reduce((acc: any, report: any) => {
      const type = report.illness_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Get top illness types
    const topIllnesses = Object.entries(illnessCounts)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    // Get most reported illness
    const mostReportedIllness = topIllnesses.length > 0 ? topIllnesses[0].type : 'None';

    const aggregates = [
      { metric: 'total_reports', value: totalReports },
      { metric: 'total_users', value: totalReports }, // Using total reports as user count for now
      { metric: 'reports_in_last_24h', value: reports24h },
      { metric: 'active_countries', value: uniqueCountries },
      { metric: 'most_reported_illness', value: mostReportedIllness },
      { metric: 'top_illnesses', value: topIllnesses }
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
    console.error('Error in handleGetHealthAggregates:', error);
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

// Phone AI Integration Handlers
async function handleVoiceSymptomReport(request: Request): Promise<Response> {
  try {
    const { phoneNumber, symptoms, audioUrl, location } = await request.json() as any;
    
    const consultation = {
      id: generateId(),
      phone_number: phoneNumber,
      symptoms: symptoms,
      audio_url: audioUrl,
      location: location,
      consultation_type: 'voice_report',
      status: 'pending_diagnosis',
      created_at: new Date().toISOString()
    };

    aiConsultations.push(consultation);

    // Send to external AI diagnosis phone system (+1 7703620543)
    const aiDiagnosisRequest = {
      consultationId: consultation.id,
      phoneNumber: phoneNumber,
      symptoms: symptoms,
      audioUrl: audioUrl,
      location: location,
      timestamp: new Date().toISOString()
    };

    // Simulate sending to external AI system
    const aiResponse = await simulateExternalAIDiagnosis(aiDiagnosisRequest);

    // Update consultation with AI diagnosis
    const consultationIndex = aiConsultations.findIndex(c => c.id === consultation.id);
    if (consultationIndex !== -1) {
      aiConsultations[consultationIndex] = {
        ...aiConsultations[consultationIndex],
        diagnosis: aiResponse.diagnosis,
        confidence_score: aiResponse.confidence,
        recommendations: aiResponse.recommendations,
        status: 'completed',
        ai_response: aiResponse,
        updated_at: new Date().toISOString()
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        consultationId: consultation.id,
        diagnosis: aiResponse.diagnosis,
        confidence: aiResponse.confidence,
        recommendations: aiResponse.recommendations,
        phoneNumber: '+1 7703620543',
        message: 'Voice report processed and sent to external AI diagnosis system'
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
    console.error('Error in handleVoiceSymptomReport:', error);
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

async function handlePhoneAIConsultation(request: Request): Promise<Response> {
  try {
    const { phoneNumber, symptoms, medicalHistory, urgency } = await request.json() as any;
    
    const consultation = {
      id: generateId(),
      phone_number: phoneNumber,
      symptoms: symptoms,
      medical_history: medicalHistory,
      urgency_level: urgency || 'normal',
      consultation_type: 'ai_diagnosis',
      status: 'in_progress',
      created_at: new Date().toISOString()
    };

    aiConsultations.push(consultation);

    // Simulate external AI diagnosis process
    const aiDiagnosis = await simulateExternalAIDiagnosis({
      consultationId: consultation.id,
      symptoms: symptoms,
      medicalHistory: medicalHistory,
      urgency: urgency
    });

    // Update consultation with results
    const consultationIndex = aiConsultations.findIndex(c => c.id === consultation.id);
    if (consultationIndex !== -1) {
      aiConsultations[consultationIndex] = {
        ...aiConsultations[consultationIndex],
        diagnosis: aiDiagnosis.diagnosis,
        confidence_score: aiDiagnosis.confidence,
        recommendations: aiDiagnosis.recommendations,
        severity_assessment: aiDiagnosis.severity,
        status: 'completed',
        ai_response: aiDiagnosis,
        updated_at: new Date().toISOString()
      };
    }

    // Send notification to external AI phone system if urgent
    if (urgency === 'urgent' || aiDiagnosis.severity === 'high') {
      await sendUrgentNotification(phoneNumber, aiDiagnosis);
    }

    return new Response(
      JSON.stringify({
        success: true,
        consultationId: consultation.id,
        diagnosis: aiDiagnosis.diagnosis,
        confidence: aiDiagnosis.confidence,
        severity: aiDiagnosis.severity,
        recommendations: aiDiagnosis.recommendations,
        phoneAIContact: '+1 7703620543',
        followUpRequired: aiDiagnosis.followUpRequired,
        message: 'AI consultation completed successfully'
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
    console.error('Error in handlePhoneAIConsultation:', error);
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

async function handleSendPhoneNotification(request: Request): Promise<Response> {
  try {
    const { phoneNumber, message, type, consultationId } = await request.json() as any;
    
    const notification = {
      id: generateId(),
      phone_number: phoneNumber,
      message: message,
      notification_type: type,
      consultation_id: consultationId,
      status: 'sent',
      created_at: new Date().toISOString()
    };

    phoneNotifications.push(notification);

    // Simulate sending to external AI phone system
    const notificationSent = await simulatePhoneNotification(phoneNumber, message, type);

    return new Response(
      JSON.stringify({
        success: true,
        notificationId: notification.id,
        sent: notificationSent,
        phoneAISystem: '+1 7703620543',
        message: 'Notification sent to external AI phone system'
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
    console.error('Error in handleSendPhoneNotification:', error);
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



async function handleGetPhoneHealthStatus(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const phoneNumber = url.searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Get recent consultations for this phone number
    const consultations = aiConsultations
      .filter(c => c.phone_number === phoneNumber)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Get recent symptom reports for this phone number
    const reports = symptomReports
      .filter(r => r.phone_number === phoneNumber)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    // Calculate health score
    const healthScore = calculateHealthScore(reports);
    const recommendations = getHealthRecommendations(healthScore);

    // Get active emergency alerts
    const activeAlerts = Array.from(emergencyAlerts.values()).filter(a => 
      a.userId === phoneNumber && a.status === 'active'
    );

    return new Response(
      JSON.stringify({
        phoneNumber: phoneNumber,
        healthScore: healthScore,
        recommendations: recommendations,
        recentConsultations: consultations.length,
        recentReports: reports.length,
        activeAlerts: activeAlerts.length,
        lastConsultation: consultations[0]?.created_at,
        aiPhoneSystem: '+1 7703620543',
        status: 'active',
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
    console.error('Error in handleGetPhoneHealthStatus:', error);
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

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function calculateHealthScore(reports: any[]): number {
  if (reports.length === 0) return 100;
  
  let score = 100;
  
  reports.forEach((report: any) => {
    switch (report.severity) {
      case 'severe':
        score -= 20;
        break;
      case 'moderate':
        score -= 10;
        break;
      case 'mild':
        score -= 5;
        break;
    }
    
    if (reports.length > 5) score -= 10;
  });
  
  return Math.max(0, score);
}

function getHealthRecommendations(healthScore: number): string[] {
  const recommendations = [];
  
  if (healthScore < 50) {
    recommendations.push('Consider consulting a healthcare professional');
    recommendations.push('Focus on rest and recovery');
  } else if (healthScore < 70) {
    recommendations.push('Monitor your symptoms closely');
    recommendations.push('Maintain good hygiene practices');
  } else {
    recommendations.push('Continue with your current health routine');
    recommendations.push('Stay hydrated and get adequate sleep');
  }
  
  return recommendations;
}

async function simulateExternalAIDiagnosis(request: any): Promise<any> {
  // Simulate external AI diagnosis process
  const commonDiagnoses = [
    { condition: 'Common Cold', confidence: 0.85, severity: 'low' },
    { condition: 'Seasonal Allergies', confidence: 0.78, severity: 'low' },
    { condition: 'Mild Dehydration', confidence: 0.72, severity: 'low' },
    { condition: 'Stress-related Symptoms', confidence: 0.68, severity: 'low' },
    { condition: 'Flu-like Symptoms', confidence: 0.82, severity: 'moderate' },
    { condition: 'Respiratory Infection', confidence: 0.75, severity: 'moderate' }
  ];

  const randomDiagnosis = commonDiagnoses[Math.floor(Math.random() * commonDiagnoses.length)];
  
  return {
    diagnosis: randomDiagnosis.condition,
    confidence: randomDiagnosis.confidence,
    severity: randomDiagnosis.severity,
    recommendations: [
      'Rest and stay hydrated',
      'Monitor symptoms closely',
      'Consider over-the-counter medications if appropriate',
      'Contact healthcare provider if symptoms worsen'
    ],
    followUpRequired: randomDiagnosis.severity === 'moderate',
    externalAISystem: '+1 7703620543',
    timestamp: new Date().toISOString()
  };
}

async function simulatePhoneNotification(phoneNumber: string, message: string, type: string): Promise<boolean> {
  // Simulate sending notification to external AI phone system
  console.log(`Sending ${type} notification to ${phoneNumber}: ${message}`);
  console.log(`External AI Phone System: +1 7703620543`);
  return true;
}

async function sendUrgentNotification(phoneNumber: string, diagnosis: any): Promise<boolean> {
  const urgentMessage = `URGENT: ${diagnosis.diagnosis} detected. Confidence: ${diagnosis.confidence}. Severity: ${diagnosis.severity}. Call external AI system: +1 7703620543`;
  return await simulatePhoneNotification(phoneNumber, urgentMessage, 'urgent');
}

async function sendEmergencyNotification(phoneNumber: string, message: string, severity: string): Promise<boolean> {
  const emergencyMessage = `CRITICAL: ${message}. External AI System: +1 7703620543`;
  return await simulatePhoneNotification(phoneNumber, emergencyMessage, 'emergency');
}

// Predictive Analytics Handlers
async function handleOutbreakPrediction(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const location = url.searchParams.get('location') || 'general';
    const timeframe = url.searchParams.get('timeframe') || '30';

    // Analyze recent symptom reports for patterns
    const recentReports = symptomReports.filter(r => {
      const reportDate = new Date(r.created_at);
      const daysAgo = new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000);
      return reportDate > daysAgo;
    });

    // Group by illness type and location
    const illnessCounts = recentReports.reduce((acc: any, report: any) => {
      const illness = report.illness_type || 'unknown';
      if (!acc[illness]) {
        acc[illness] = { count: 0, locations: new Set(), severity: { mild: 0, moderate: 0, severe: 0 } };
      }
      acc[illness].count++;
      acc[illness].locations.add(report.country);
      acc[illness].severity[report.severity]++;
      return acc;
    }, {});

    // Prepare data for AI analysis
    const analysisData = {
      timeframe: `${timeframe} days`,
      location: location,
      totalReports: recentReports.length,
      illnessBreakdown: Object.entries(illnessCounts).map(([illness, data]: [string, any]) => ({
        illness,
        count: data.count,
        locations: Array.from(data.locations),
        severity: data.severity
      })),
      recentTrends: recentReports.slice(-10).map(r => ({
        date: r.created_at,
        illness: r.illness_type,
        severity: r.severity,
        location: r.country
      }))
    };

    // Use Hack Club AI for prediction
    const prediction = await getAIPrediction(analysisData, 'outbreak');

    return new Response(
      JSON.stringify({
        prediction: prediction,
        data: analysisData,
        confidence: prediction.confidence || 0.75,
        recommendations: prediction.recommendations || [],
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
    console.error('Error in handleOutbreakPrediction:', error);
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

async function handleHealthTrends(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '7';

    // Get reports for the specified period
    const periodReports = symptomReports.filter(r => {
      const reportDate = new Date(r.created_at);
      const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);
      return reportDate > daysAgo;
    });

    // Analyze trends
    const dailyTrends = periodReports.reduce((acc: any, report: any) => {
      const date = new Date(report.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, illnesses: {}, severity: { mild: 0, moderate: 0, severe: 0 } };
      }
      acc[date].total++;
      acc[date].illnesses[report.illness_type] = (acc[date].illnesses[report.illness_type] || 0) + 1;
      acc[date].severity[report.severity]++;
      return acc;
    }, {});

    // Calculate trend indicators
    const trendData = {
      period: `${period} days`,
      totalReports: periodReports.length,
      averageDaily: periodReports.length / parseInt(period),
      dailyBreakdown: Object.entries(dailyTrends).map(([date, data]: [string, any]) => ({
        date,
        total: data.total,
        illnesses: data.illnesses,
        severity: data.severity
      })),
      topIllnesses: Object.entries(
        periodReports.reduce((acc: any, r: any) => {
          acc[r.illness_type] = (acc[r.illness_type] || 0) + 1;
          return acc;
        }, {})
      ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5)
    };

    // Get AI insights
    const insights = await getAIPrediction(trendData, 'trends');

    return new Response(
      JSON.stringify({
        trends: trendData,
        insights: insights,
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
    console.error('Error in handleHealthTrends:', error);
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

async function handleRiskAssessment(request: Request): Promise<Response> {
  try {
    const { location, symptoms, medicalHistory, age, gender } = await request.json() as any;

    // Get local health data
    const localReports = symptomReports.filter(r => 
      r.country === location || r.pin_code === location
    ).slice(-50);

    // Prepare risk assessment data
    const assessmentData = {
      userProfile: {
        age: age || 'unknown',
        gender: gender || 'unknown',
        location: location,
        symptoms: symptoms || [],
        medicalHistory: medicalHistory || []
      },
      localHealthData: {
        totalReports: localReports.length,
        recentIllnesses: localReports.slice(-10).map(r => r.illness_type),
        severityDistribution: localReports.reduce((acc: any, r: any) => {
          acc[r.severity] = (acc[r.severity] || 0) + 1;
          return acc;
        })
      },
      globalContext: {
        totalReports: symptomReports.length,
        topIllnesses: Object.entries(
          symptomReports.reduce((acc: any, r: any) => {
            acc[r.illness_type] = (acc[r.illness_type] || 0) + 1;
            return acc;
          }, {})
        ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5)
      }
    };

    // Get AI risk assessment
    const riskAssessment = await getAIPrediction(assessmentData, 'risk');

    return new Response(
      JSON.stringify({
        riskAssessment: riskAssessment,
        data: assessmentData,
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
    console.error('Error in handleRiskAssessment:', error);
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

async function handleSeasonalPatterns(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const location = url.searchParams.get('location') || 'all';

    // Analyze seasonal patterns
    const seasonalData = symptomReports.reduce((acc: any, report: any) => {
      const date = new Date(report.created_at);
      const month = date.getMonth();
      const season = getSeason(month);
      
      if (!acc[season]) {
        acc[season] = { total: 0, illnesses: {}, locations: new Set() };
      }
      
      acc[season].total++;
      acc[season].illnesses[report.illness_type] = (acc[season].illnesses[report.illness_type] || 0) + 1;
      acc[season].locations.add(report.country);
      
      return acc;
    }, {});

    // Convert to array format
    const seasonalAnalysis = Object.entries(seasonalData).map(([season, data]: [string, any]) => ({
      season,
      total: data.total,
      illnesses: data.illnesses,
      locations: Array.from(data.locations)
    }));

    // Get AI seasonal insights
    const insights = await getAIPrediction(seasonalAnalysis, 'seasonal');

    return new Response(
      JSON.stringify({
        seasonalPatterns: seasonalAnalysis,
        insights: insights,
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
    console.error('Error in handleSeasonalPatterns:', error);
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

// Helper functions for Predictive Analytics
async function getAIPrediction(data: any, type: string): Promise<any> {
  try {
    const prompt = generateAIPrompt(data, type);
    
    const response = await fetch('https://ai.hackclub.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a health analytics expert specializing in predictive modeling and outbreak detection. Provide clear, actionable insights based on health data patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const result = await response.json() as any;
    const aiResponse = result.choices?.[0]?.message?.content || '';

    // Parse AI response and return structured data
    return parseAIResponse(aiResponse, type);
  } catch (error) {
    console.error('Error calling AI service:', error);
    // Return fallback response
    return getFallbackResponse(type);
  }
}

function generateAIPrompt(data: any, type: string): string {
  switch (type) {
    case 'outbreak':
      return `Analyze this health data for potential outbreak patterns:

Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Outbreak risk assessment (low/medium/high)
2. Confidence level (0-1)
3. Key indicators of concern
4. Recommended preventive measures
5. Timeline prediction for potential outbreak

Format your response as JSON with keys: risk, confidence, indicators, recommendations, timeline`;

    case 'trends':
      return `Analyze these health trends:

Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Trend analysis summary
2. Key patterns identified
3. Anomalies or concerning trends
4. Recommendations for monitoring
5. Future trend predictions

Format your response as JSON with keys: summary, patterns, anomalies, recommendations, predictions`;

    case 'risk':
      return `Assess health risk for this individual:

Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Overall risk level (low/medium/high)
2. Specific risk factors
3. Preventive recommendations
4. Monitoring suggestions
5. Emergency indicators to watch for

Format your response as JSON with keys: riskLevel, riskFactors, recommendations, monitoring, emergencyIndicators`;

    case 'seasonal':
      return `Analyze seasonal health patterns:

Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Seasonal pattern summary
2. Peak illness periods
3. Seasonal risk factors
4. Preventive measures by season
5. Preparation recommendations

Format your response as JSON with keys: summary, peakPeriods, riskFactors, preventiveMeasures, preparation`;

    default:
      return `Analyze this health data: ${JSON.stringify(data, null, 2)}`;
  }
}

function parseAIResponse(response: string, type: string): any {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback parsing
    return {
      summary: response,
      confidence: 0.7,
      recommendations: ['Monitor health trends closely', 'Maintain good hygiene practices']
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return getFallbackResponse(type);
  }
}

function getFallbackResponse(type: string): any {
  const fallbacks = {
    outbreak: {
      risk: 'medium',
      confidence: 0.6,
      indicators: ['Increased symptom reports', 'Multiple locations affected'],
      recommendations: ['Monitor trends closely', 'Maintain hygiene protocols'],
      timeline: '2-4 weeks'
    },
    trends: {
      summary: 'Health trends are being monitored',
      patterns: ['Seasonal variations', 'Location-based clusters'],
      anomalies: 'None detected',
      recommendations: ['Continue monitoring', 'Report unusual patterns'],
      predictions: 'Stable trend expected'
    },
    risk: {
      riskLevel: 'low',
      riskFactors: ['General population risk'],
      recommendations: ['Maintain good health practices'],
      monitoring: ['Watch for symptom changes'],
      emergencyIndicators: ['Severe symptoms', 'Rapid deterioration']
    },
    seasonal: {
      summary: 'Seasonal patterns analyzed',
      peakPeriods: ['Winter respiratory', 'Summer heat-related'],
      riskFactors: ['Weather changes', 'Seasonal activities'],
      preventiveMeasures: ['Seasonal vaccinations', 'Weather-appropriate clothing'],
      preparation: ['Plan for seasonal health needs']
    }
  };
  
  return fallbacks[type as keyof typeof fallbacks] || fallbacks.trends;
}

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
}

// Missing endpoint handlers
async function handleGetWHOData(): Promise<Response> {
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
    console.error('Error in handleGetWHOData:', error);
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

async function handleGetHealthTips(): Promise<Response> {
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
    console.error('Error in handleGetHealthTips:', error);
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

async function handleGetDiseases(): Promise<Response> {
  try {
    // Mock diseases data
    const diseases = [
      { id: 1, name: 'Common Cold', symptoms: ['runny nose', 'sore throat', 'cough'], severity: 'low' },
      { id: 2, name: 'Influenza', symptoms: ['fever', 'body aches', 'fatigue'], severity: 'medium' },
      { id: 3, name: 'COVID-19', symptoms: ['fever', 'cough', 'loss of taste'], severity: 'high' },
      { id: 4, name: 'Dengue', symptoms: ['high fever', 'headache', 'joint pain'], severity: 'high' }
    ];
    
    return new Response(
      JSON.stringify(diseases),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetDiseases:', error);
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

async function handleGetRegions(): Promise<Response> {
  try {
    // Mock regions data
    const regions = [
      { id: 1, name: 'North America', countries: ['USA', 'Canada', 'Mexico'] },
      { id: 2, name: 'South Asia', countries: ['India', 'Pakistan', 'Bangladesh'] },
      { id: 3, name: 'Europe', countries: ['UK', 'Germany', 'France'] },
      { id: 4, name: 'Africa', countries: ['Nigeria', 'South Africa', 'Kenya'] }
    ];
    
    return new Response(
      JSON.stringify(regions),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetRegions:', error);
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

// Collaborative Features Handlers
async function handleGetHealthGroups(request: Request): Promise<Response> {
  try {
    const groups = Array.from(healthGroups.values()).filter(group => group.isActive);
    
    return new Response(
      JSON.stringify({
        success: true,
        groups: groups
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
    console.error('Error in handleGetHealthGroups:', error);
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

async function handleCreateHealthGroup(request: Request): Promise<Response> {
  try {
    const { name, description, category, diseaseType, location } = await request.json() as any;
    
    const group: HealthGroup = {
      id: generateId(),
      name,
      description,
      category,
      diseaseType,
      location,
      members: [],
      messages: [],
      createdAt: Date.now(),
      isActive: true
    };

    healthGroups.set(group.id, group);

    return new Response(
      JSON.stringify({
        success: true,
        group: group
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleCreateHealthGroup:', error);
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

async function handleJoinHealthGroup(request: Request): Promise<Response> {
  try {
    const { groupId, userId, userNickname } = await request.json() as any;
    
    const group = healthGroups.get(groupId);
    if (!group) {
      return new Response(
        JSON.stringify({ error: 'Group not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully joined group',
        group: group
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
    console.error('Error in handleJoinHealthGroup:', error);
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

async function handleGetHealthChallenges(request: Request): Promise<Response> {
  try {
    const challenges = Array.from(healthChallenges.values()).filter(challenge => challenge.isActive);
    
    return new Response(
      JSON.stringify({
        success: true,
        challenges: challenges
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
    console.error('Error in handleGetHealthChallenges:', error);
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

async function handleJoinHealthChallenge(request: Request): Promise<Response> {
  try {
    const { challengeId, userId, userNickname } = await request.json() as any;
    
    const challenge = healthChallenges.get(challengeId);
    if (!challenge) {
      return new Response(
        JSON.stringify({ error: 'Challenge not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    if (!challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
      challenge.progress[userId] = 0;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully joined challenge',
        challenge: challenge
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
    console.error('Error in handleJoinHealthChallenge:', error);
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

async function handleGetMentors(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const specialty = url.searchParams.get('specialty');
    
    let mentors = Array.from(healthMentors.values());
    if (specialty) {
      mentors = mentors.filter(mentor => mentor.specialty === specialty);
    }

    return new Response(
      JSON.stringify({
        success: true,
        mentors: mentors
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
    console.error('Error in handleGetMentors:', error);
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



async function handleRequestMentorshipAPI(request: Request): Promise<Response> {
  try {
    const { menteeId, menteeNickname, specialty, mentorId } = await request.json() as any;
    
    const mentorship: HealthMentor = {
      id: generateId(),
      mentorId: mentorId || 'available_mentor',
      menteeId,
      specialty,
      status: 'pending',
      startDate: Date.now(),
      messages: []
    };

    healthMentors.set(mentorship.id, mentorship);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mentorship request sent',
        mentorship: mentorship
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleRequestMentorshipAPI:', error);
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

async function handleEmergencySupport(request: Request): Promise<Response> {
  try {
    const { userId, location, symptoms, severity, description } = await request.json() as any;
    
    const alert: EmergencyAlert = {
      id: generateId(),
      userId,
      location,
      symptoms,
      severity: severity as 'low' | 'medium' | 'high' | 'critical',
      status: 'active',
      responders: [],
      createdAt: Date.now()
    };

    emergencyAlerts.set(alert.id, alert);

    // Notify emergency support group
    const emergencyGroup = healthGroups.get('emergency-support');
    if (emergencyGroup) {
      const alertMessage: GroupMessage = {
        id: generateId(),
        senderId: 'system',
        senderName: 'Emergency Alert',
        message: `EMERGENCY: ${severity} case in ${location}. Symptoms: ${symptoms.join(', ')}. Description: ${description}`,
        messageType: 'emergency',
        timestamp: new Date().toISOString()
      };
      emergencyGroup.messages.push(alertMessage);
    }

    return new Response(
      JSON.stringify({
        success: true,
        alertId: alert.id,
        message: 'Emergency alert sent to support network'
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
    console.error('Error in handleEmergencySupport:', error);
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

async function handleGetEmergencyAlerts(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';
    
    const alerts = Array.from(emergencyAlerts.values()).filter(alert => alert.status === status);

    return new Response(
      JSON.stringify({
        success: true,
        alerts: alerts
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
    console.error('Error in handleGetEmergencyAlerts:', error);
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

// DEMO DATA GENERATION FOR DEVELOPMENT
function generateDemoReports() {
  // Global locations with coordinates for comprehensive demo
  const globalLocations = [
    // North America
    { country: 'US', pinCode: '10001', city: 'New York', latitude: 40.7128, longitude: -74.0060 },
    { country: 'US', pinCode: '90001', city: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
    { country: 'US', pinCode: '60601', city: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
    { country: 'US', pinCode: '77001', city: 'Houston', latitude: 29.7604, longitude: -95.3698 },
    { country: 'US', pinCode: '33101', city: 'Miami', latitude: 25.7617, longitude: -80.1918 },
    { country: 'Canada', pinCode: 'M5V', city: 'Toronto', latitude: 43.6532, longitude: -79.3832 },
    { country: 'Canada', pinCode: 'V6C', city: 'Vancouver', latitude: 49.2827, longitude: -123.1207 },
    
    // Europe
    { country: 'UK', pinCode: 'SW1A', city: 'London', latitude: 51.5074, longitude: -0.1278 },
    { country: 'Germany', pinCode: '10115', city: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
    { country: 'France', pinCode: '75001', city: 'Paris', latitude: 48.8566, longitude: 2.3522 },
    { country: 'Spain', pinCode: '28001', city: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
    { country: 'Italy', pinCode: '00100', city: 'Rome', latitude: 41.9028, longitude: 12.4964 },
    
    // Asia
    { country: 'Japan', pinCode: '100-0001', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
    { country: 'South Korea', pinCode: '100-011', city: 'Seoul', latitude: 37.5665, longitude: 126.9780 },
    { country: 'China', pinCode: '100000', city: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
    { country: 'India', pinCode: '400001', city: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
    { country: 'India', pinCode: '110001', city: 'New Delhi', latitude: 28.6139, longitude: 77.2090 },
    { country: 'Singapore', pinCode: '018956', city: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
    
    // Australia & Oceania
    { country: 'Australia', pinCode: '2000', city: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
    { country: 'Australia', pinCode: '3000', city: 'Melbourne', latitude: -37.8136, longitude: 144.9631 },
    
    // South America
    { country: 'Brazil', pinCode: '20000-000', city: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729 },
    { country: 'Brazil', pinCode: '01310-100', city: 'Sao Paulo', latitude: -23.5505, longitude: -46.6333 },
    { country: 'Argentina', pinCode: '1000', city: 'Buenos Aires', latitude: -34.6118, longitude: -58.3960 },
    
    // Africa
    { country: 'South Africa', pinCode: '2000', city: 'Johannesburg', latitude: -26.2041, longitude: 28.0473 },
    { country: 'Nigeria', pinCode: '100001', city: 'Lagos', latitude: 6.5244, longitude: 3.3792 },
    { country: 'Kenya', pinCode: '00100', city: 'Nairobi', latitude: -1.2921, longitude: 36.8219 },
    { country: 'Egypt', pinCode: '11511', city: 'Cairo', latitude: 30.0444, longitude: 31.2357 }
  ];

  // Comprehensive disease patterns for global demo
  const globalDiseasePatterns: Record<string, {
    baseRate: number;
    seasonalMultiplier: number;
    symptoms: string[];
    severity: string[];
    global?: boolean;
    tropical?: boolean;
    developing?: boolean;
  }> = {
    flu: {
      baseRate: 0.4,
      seasonalMultiplier: 1.8,
      symptoms: ['Fever', 'Cough', 'Sore throat', 'Body aches', 'Fatigue', 'Headache'],
      severity: ['mild', 'moderate', 'severe'],
      global: true
    },
    covid: {
      baseRate: 0.25,
      seasonalMultiplier: 1.2,
      symptoms: ['Fever', 'Cough', 'Fatigue', 'Loss of taste', 'Shortness of breath', 'Body aches'],
      severity: ['mild', 'moderate', 'severe'],
      global: true
    },
    dengue: {
      baseRate: 0.3,
      seasonalMultiplier: 2.5,
      symptoms: ['High fever', 'Severe headache', 'Joint pain', 'Muscle pain', 'Rash', 'Nausea'],
      severity: ['mild', 'moderate', 'severe'],
      tropical: true
    },
    malaria: {
      baseRate: 0.2,
      seasonalMultiplier: 3.0,
      symptoms: ['Cyclic fever', 'Chills', 'Sweating', 'Headache', 'Nausea', 'Fatigue'],
      severity: ['mild', 'moderate', 'severe'],
      tropical: true
    },
    typhoid: {
      baseRate: 0.15,
      seasonalMultiplier: 2.0,
      symptoms: ['High fever', 'Headache', 'Abdominal pain', 'Diarrhea', 'Loss of appetite'],
      severity: ['mild', 'moderate', 'severe'],
      developing: true
    },
    unknown: {
      baseRate: 0.08,
      seasonalMultiplier: 1.0,
      symptoms: ['Fever', 'Fatigue', 'Headache', 'Body aches', 'Nausea'],
      severity: ['mild', 'moderate'],
      global: true
    }
  };

  // Global nicknames for anonymous reporting
  const globalNicknames = [
    'HealthWatcher', 'WellnessSeeker', 'CommunityCare', 'HealthGuard', 'WellnessBuddy',
    'HealthTracker', 'CommunityHealth', 'WellnessGuide', 'HealthMonitor', 'WellnessPartner',
    'HealthHelper', 'CommunityWell', 'WellnessFriend', 'HealthSupporter', 'WellnessAdvocate',
    'GlobalHealth', 'WorldWellness', 'HealthObserver', 'WellnessTracker', 'CommunityMonitor'
  ];

  function randomFrom(arr: any[]) { return arr[Math.floor(Math.random() * arr.length)]; }
  
  function getRandomDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursAgo);
    date.setMinutes(date.getMinutes() - minutesAgo);
    
    return date.toISOString();
  }

  function shouldDiseaseOccur(diseaseType: string, location: any) {
    const pattern = globalDiseasePatterns[diseaseType as keyof typeof globalDiseasePatterns];
    
    if (pattern.global) return true;
    
    if (pattern.tropical) {
      const absLat = Math.abs(location.latitude);
      return absLat < 30; // Tropical regions
    }
    
    if (pattern.developing) {
      const developingCountries = ['India', 'Brazil', 'China', 'Indonesia', 'Philippines', 'Thailand', 'Vietnam', 'Malaysia', 'Nigeria', 'Kenya', 'Ghana', 'Egypt', 'Morocco', 'Peru', 'Colombia'];
      return developingCountries.includes(location.country);
    }
    
    return false;
  }

  const reports = [];
  const now = new Date();
  
  // Generate data for each location and disease pattern
  for (const location of globalLocations) {
    for (const [diseaseType, pattern] of Object.entries(globalDiseasePatterns)) {
      // Check if this disease should occur in this location
      if (!shouldDiseaseOccur(diseaseType, location)) continue;
      
      // Calculate base number of reports for this location-disease combination
      const baseReports = Math.floor(pattern.baseRate * 40); // Reduced for worker performance
      
      // Generate reports for the last 30 days
      for (let day = 0; day < 30; day++) {
        // Add some randomness and seasonal variation
        const seasonalFactor = 1 + (pattern.seasonalMultiplier - 1) * Math.sin((day / 30) * Math.PI);
        const decayedReports = Math.floor(baseReports * seasonalFactor * (0.3 + Math.random() * 0.7));
        
        for (let i = 0; i < decayedReports; i++) {
          const report: any = {
            id: `demo-${reports.length + 1}`,
            nickname: randomFrom(globalNicknames),
            country: location.country,
            pin_code: location.pinCode,
            symptoms: pattern.symptoms.slice(0, 2 + Math.floor(Math.random() * 4)), // 2-5 symptoms
            illness_type: diseaseType,
            severity: randomFrom(pattern.severity),
            latitude: location.latitude + (Math.random() - 0.5) * 0.02, // Add some variation
            longitude: location.longitude + (Math.random() - 0.5) * 0.02,
            created_at: getRandomDate()
          };
          
          reports.push(report);
        }
      }
    }
  }
  
  return reports;
}

// Populate demo data on startup (for development/demo)
if (symptomReports.length === 0) {
  symptomReports = generateDemoReports();
}

// Polling endpoints for real-time updates without WebSocket cross-context issues
async function handleGetGroupMessages(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const groupId = pathParts[pathParts.length - 2]; // Get groupId from /api/collaborative/groups/{groupId}/messages
    const since = url.searchParams.get('since'); // ISO timestamp to get messages after this time
    
    const group = healthGroups.get(groupId);
    if (!group) {
      return new Response(
        JSON.stringify({ error: 'Group not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    let messages = group.messages;
    
    // Filter messages if 'since' parameter is provided
    if (since) {
      const sinceDate = new Date(since);
      messages = messages.filter(msg => new Date(msg.timestamp) > sinceDate);
    }

    return new Response(
      JSON.stringify({
        success: true,
        groupId: groupId,
        messages: messages,
        totalMembers: group.members.length,
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
    console.error('Error in handleGetGroupMessages:', error);
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

async function handlePollGroupUpdates(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const groupId = pathParts[pathParts.length - 2]; // Get groupId from /api/collaborative/groups/{groupId}/poll
    
    const group = healthGroups.get(groupId);
    if (!group) {
      return new Response(
        JSON.stringify({ error: 'Group not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Return group info with recent messages
    return new Response(
      JSON.stringify({
        success: true,
        group: {
          ...group,
          messages: group.messages.slice(-10) // Last 10 messages
        },
        hasNewMessages: group.messages.length > 0,
        lastMessageTime: group.messages.length > 0 ? group.messages[group.messages.length - 1].timestamp : null,
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
    console.error('Error in handlePollGroupUpdates:', error);
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