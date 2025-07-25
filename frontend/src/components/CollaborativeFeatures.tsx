import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
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
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  const [userNickname] = useState(`HealthUser_${Math.random().toString(36).substr(2, 5)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isComponentMountedRef = useRef(true);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);

  // Initialize Pusher
  useEffect(() => {
    if (!isVisible) return;

    const pusher = new Pusher('cee5f705d767a20f69f7', {
      cluster: 'us2',
      forceTLS: true
    });

    pusherRef.current = pusher;

    // Subscribe to collaborative features channel
    const channel = pusher.subscribe('collaborative-features');
    channelRef.current = channel;

    // Handle group updates
    channel.bind('groups-updated', (data: any) => {
      if (isComponentMountedRef.current) {
        setHealthGroups(data.groups || []);
      }
    });

    // Handle challenge updates
    channel.bind('challenges-updated', (data: any) => {
      if (isComponentMountedRef.current) {
        setHealthChallenges(data.challenges || []);
      }
    });

    // Handle new group messages
    channel.bind('group-message', (data: any) => {
      if (isComponentMountedRef.current && selectedGroup && data.groupId === selectedGroup.id) {
        setSelectedGroup(prev => prev ? {
          ...prev,
          messages: [...prev.messages, data.message]
        } : null);
      }
    });

    // Handle connection events
    pusher.connection.bind('connected', () => {
      if (isComponentMountedRef.current) {
        console.log('Connected to collaborative features');
      }
    });

    pusher.connection.bind('error', (error: any) => {
      if (isComponentMountedRef.current) {
        console.error('Pusher connection error:', error);
      }
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [isVisible, selectedGroup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedGroup?.messages]);

  // Load health groups and challenges when component becomes visible
  useEffect(() => {
    if (!isVisible) return;

    const loadData = async () => {
      try {
        // Load health groups
        const groupsResponse = await fetch('https://healthpulse-api.healthsathi.workers.dev/api/collaborative/groups');
        const groupsData = await groupsResponse.json();
        if (groupsData.success) {
          setHealthGroups(groupsData.groups || []);
        }

        // Load health challenges
        const challengesResponse = await fetch('https://healthpulse-api.healthsathi.workers.dev/api/collaborative/challenges');
        const challengesData = await challengesResponse.json();
        if (challengesData.success) {
          setHealthChallenges(challengesData.challenges || []);
        }
      } catch (error) {
        console.error('Error loading collaborative data:', error);
      }
    };

    loadData();
  }, [isVisible]);

  const joinGroup = async (groupId: string) => {
    try {
      const response = await fetch('https://healthpulse-api.healthsathi.workers.dev/api/collaborative/groups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          userId,
          userNickname
        })
      });

      const data = await response.json();
      if (data.success) {
        setSelectedGroup(data.group);
        
        // Subscribe to group-specific channel
        if (pusherRef.current && data.group) {
          const groupChannel = pusherRef.current.subscribe(`group-${data.group.id}`);
          
          // Handle new group messages
          groupChannel.bind('new-message', (data: any) => {
            if (isComponentMountedRef.current && selectedGroup) {
              setSelectedGroup(prev => prev ? {
                ...prev,
                messages: [...prev.messages, data.message]
              } : null);
            }
          });

          channelRef.current = groupChannel;
        }
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const sendGroupMessage = async () => {
    if (!messageInput.trim() || !selectedGroup) return;

    try {
      const response = await fetch(`https://healthpulse-api.healthsathi.workers.dev/api/collaborative/groups/${selectedGroup.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userNickname,
          message: messageInput.trim(),
          messageType: 'text'
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessageInput('');
        // Message will be received via Pusher event
      }
    } catch (error) {
      console.error('Error sending group message:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch('https://healthpulse-api.healthsathi.workers.dev/api/collaborative/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId,
          userId,
          userNickname
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update challenges list
        setHealthChallenges(prev => prev.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, participants: [...challenge.participants, userId] }
            : challenge
        ));
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const sendEmergencyAlert = async (symptoms: string[], severity: 'low' | 'medium' | 'high' | 'critical', description: string) => {
    try {
      const response = await fetch('https://healthpulse-api.healthsathi.workers.dev/api/collaborative/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userNickname,
          symptoms,
          severity,
          description
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('Emergency alert sent successfully');
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
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
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                      onClick={() => joinGroup(group.id)}
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