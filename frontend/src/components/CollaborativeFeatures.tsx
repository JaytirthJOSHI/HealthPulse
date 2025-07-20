import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, 
  MessageCircle, 
  Trophy, 
  Heart, 
  AlertTriangle, 
  Send, 
  X, 
  Target,
  Award,
  Shield,
  Lightbulb,
  Phone
} from 'lucide-react';

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

interface CollaborativeFeaturesProps {
  isVisible: boolean;
  onClose: () => void;
}

const CollaborativeFeatures: React.FC<CollaborativeFeaturesProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'challenges' | 'mentorship' | 'emergency'>('groups');
  const [healthGroups, setHealthGroups] = useState<HealthGroup[]>([]);
  const [healthChallenges, setHealthChallenges] = useState<HealthChallenge[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<HealthGroup | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [userNickname, setUserNickname] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef(true);

  const handleWebSocketMessage = useCallback((data: any) => {
    try {
      switch (data.type) {
        case 'collaborative_joined':
          console.log('Joined collaborative features');
          break;
        case 'health_groups_loaded':
          setHealthGroups(data.groups || []);
          break;
        case 'health_challenges_loaded':
          setHealthChallenges(data.challenges || []);
          break;
        case 'group_joined':
          setSelectedGroup(data.group);
          // setLastMessageCheck(new Date().toISOString()); // Removed as per edit hint
          break;
        case 'group_message_sent':
          if (selectedGroup && data.groupId === selectedGroup.id) {
            setSelectedGroup(prev => prev ? {
              ...prev,
              messages: [...prev.messages, data.message]
            } : null);
          }
          break;
        case 'challenge_joined':
          // setSelectedChallenge(data.challenge); // Removed as per edit hint
          break;
        case 'challenge_progress_updated':
          setHealthChallenges(prev => prev.map(challenge => 
            challenge.id === data.challengeId 
              ? { ...challenge, progress: { ...challenge.progress, [data.userId]: data.progress } }
              : challenge
          ));
          break;
        case 'emergency_alert_sent':
          // Handle emergency alert
          console.log('Emergency alert sent:', data);
          break;
        case 'error':
          console.error('WebSocket server error:', data.message);
          // setConnectionError(data.message || 'Server error occurred'); // Removed as per edit hint
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      // setConnectionError('Failed to handle server message'); // Removed as per edit hint
    }
  }, [selectedGroup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const connectWebSocket = () => {
      try {
        // setIsConnecting(true); // Removed as per edit hint
        // setConnectionError(null); // Removed as per edit hint
        
        // Close existing connection if any
        if (websocket) {
          websocket.close();
        }

        const ws = new WebSocket('wss://healthpulse-api.healthsathi.workers.dev/ws');
        setWebsocket(ws);

        ws.onopen = () => {
          if (!isComponentMountedRef.current) return;
          console.log('WebSocket connected for collaborative features');
          // setIsConnecting(false); // Removed as per edit hint
          // setConnectionError(null); // Removed as per edit hint
          const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
          const newNickname = `HealthUser_${Math.random().toString(36).substr(2, 5)}`;
          setUserId(newUserId);
          setUserNickname(newNickname);

          // Join collaborative features
          ws.send(JSON.stringify({
            type: 'join_collaborative',
            userId: newUserId,
            userNickname: newNickname
          }));
        };

        ws.onmessage = (event) => {
          if (!isComponentMountedRef.current) return;
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            // setConnectionError('Failed to process server message'); // Removed as per edit hint
          }
        };

        ws.onerror = (error) => {
          if (!isComponentMountedRef.current) return;
          console.error('WebSocket error:', error);
          // setConnectionError('Connection error occurred'); // Removed as per edit hint
          // setIsConnecting(false); // Removed as per edit hint
        };

        ws.onclose = (event) => {
          if (!isComponentMountedRef.current) return;
          console.log('WebSocket disconnected');
          // setIsConnecting(false); // Removed as per edit hint
          
          // Attempt to reconnect if not a normal closure and component is visible
          if (event.code !== 1000 && isComponentMountedRef.current && isVisible) {
            // setConnectionError('Connection lost, reconnecting...'); // Removed as per edit hint
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isComponentMountedRef.current && isVisible) {
                connectWebSocket();
              }
            }, 3000);
          }
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        // setConnectionError('Failed to establish connection'); // Removed as per edit hint
        // setIsConnecting(false); // Removed as per edit hint
        
        // Retry after delay
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isComponentMountedRef.current && isVisible) {
            connectWebSocket();
          }
        }, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (websocket) {
        websocket.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isVisible, handleWebSocketMessage, websocket]);

  // Start polling for messages when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      const interval = setInterval(() => {
        pollGroupMessages(selectedGroup.id);
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [selectedGroup]);

  const sendEmergencyAlert = (symptoms: string[], severity: 'low' | 'medium' | 'high' | 'critical', description: string) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'emergency_alert',
        userId,
        location: 'Your Location',
        symptoms,
        severity,
        description
      }));
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedGroup?.messages]);

  const pollGroupMessages = async (groupId: string) => {
    try {
      const response = await fetch(`https://healthpulse-api.healthsathi.workers.dev/api/collaborative/groups/${groupId}/messages`);
      const data = await response.json();
      if (data.success) {
        setSelectedGroup(prev => prev ? {
          ...prev,
          messages: data.messages
        } : null);
      }
    } catch (error) {
      console.error('Error polling group messages:', error);
    }
  };

  const sendGroupMessage = () => {
    if (messageInput.trim() && selectedGroup && websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'send_group_message',
        groupId: selectedGroup.id,
        userId,
        userNickname,
        message: messageInput.trim(),
        messageType: 'text'
      }));
      setMessageInput('');
    }
  };

  const joinChallenge = (challengeId: string) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'join_challenge',
        challengeId,
        userId,
        userNickname
      }));
    }
  };

  const getGroupIcon = (category: string) => {
    switch (category) {
      case 'disease': return <Heart className="w-5 h-5 text-red-500" />;
      case 'wellness': return <Shield className="w-5 h-5 text-green-500" />;
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'general': return <Users className="w-5 h-5 text-blue-500" />;
      default: return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getChallengeIcon = (category: string) => {
    switch (category) {
      case 'fitness': return <Target className="w-5 h-5 text-blue-500" />;
      case 'nutrition': return <Award className="w-5 h-5 text-green-500" />;
      case 'mental_health': return <Lightbulb className="w-5 h-5 text-purple-500" />;
      case 'prevention': return <Shield className="w-5 h-5 text-indigo-500" />;
      default: return <Trophy className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Users size={24} />
            <h2 className="text-xl font-bold">HealthPulse Community</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'groups', label: 'Support Groups', icon: <Users size={20} /> },
            { id: 'challenges', label: 'Health Challenges', icon: <Trophy size={20} /> },
            { id: 'mentorship', label: 'Mentorship', icon: <Heart size={20} /> },
            { id: 'emergency', label: 'Emergency Support', icon: <AlertTriangle size={20} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'groups' && (
            <div className="h-full flex">
              {/* Groups List */}
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Health Support Groups</h3>
                  {healthGroups.map(group => (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={`p-4 border rounded-lg mb-3 cursor-pointer transition-colors ${
                        selectedGroup?.id === group.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        {getGroupIcon(group.category)}
                        <h4 className="font-medium">{group.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{group.members.length} members</span>
                        <span>{group.messages.length} messages</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Chat */}
              <div className="flex-1 flex flex-col">
                {selectedGroup ? (
                  <>
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold">{selectedGroup.name}</h3>
                      <p className="text-sm text-gray-600">{selectedGroup.description}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {selectedGroup.messages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              message.senderId === userId
                                ? 'bg-blue-500 text-white'
                                : message.senderId === 'system'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="font-medium text-xs mb-1">{message.senderName}</div>
                            {message.message}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendGroupMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={sendGroupMessage}
                          disabled={!messageInput.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Users size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Select a group to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="h-full p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-6">Health Challenges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {healthChallenges.map(challenge => (
                  <div key={challenge.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      {getChallengeIcon(challenge.category)}
                      <h4 className="font-semibold">{challenge.title}</h4>
                    </div>
                    <p className="text-gray-600 mb-4">{challenge.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{challenge.participants.length} participants</span>
                      <span>{Math.ceil((challenge.endDate - Date.now()) / (1000 * 60 * 60 * 24))} days left</span>
                    </div>
                    <button
                      onClick={() => joinChallenge(challenge.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Join Challenge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mentorship' && (
            <div className="h-full p-6">
              <h3 className="text-lg font-semibold mb-6">Health Mentorship</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Find a Mentor</h4>
                  <p className="text-gray-600 mb-4">Connect with experienced health mentors for guidance and support.</p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Browse Mentors
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Become a Mentor</h4>
                  <p className="text-gray-600 mb-4">Share your health knowledge and help others on their wellness journey.</p>
                  <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Apply as Mentor
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="h-full p-6">
              <h3 className="text-lg font-semibold mb-6">Emergency Support Network</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h4 className="font-semibold text-red-700">Emergency Alert</h4>
                  </div>
                  <p className="text-gray-700 mb-4">Send an emergency alert to the support network for immediate assistance.</p>
                  <button 
                    onClick={() => sendEmergencyAlert(['Chest pain', 'Shortness of breath'], 'critical', 'Emergency situation')}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Send Emergency Alert
                  </button>
                </div>
                <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Phone className="w-6 h-6 text-orange-500" />
                    <h4 className="font-semibold text-orange-700">Emergency Contact</h4>
                  </div>
                  <p className="text-gray-700 mb-4">Direct line to emergency services and health professionals.</p>
                  <div className="text-sm">
                    <p><strong>Emergency:</strong> +1 7703620543</p>
                    <p><strong>HealthPulse AI:</strong> Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborativeFeatures; 