import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Trophy, 
  Heart, 
  Send, 
  X, 
  Target,
  Award,
  Shield,
  Lightbulb
} from 'lucide-react';

interface HealthCommunityProps {
  isVisible: boolean;
  onClose: () => void;
}

const WS_URL = window.location.hostname === 'localhost' ? 'ws://localhost:8787' : 'wss://healthpulse-api.healthsathi.workers.dev/chat';

const HealthCommunity: React.FC<HealthCommunityProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'challenges'>('groups');
  const [messageInput, setMessageInput] = useState('');
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  const [userNickname] = useState(`HealthUser_${Math.random().toString(36).substr(2, 5)}`);
  const [healthGroups, setHealthGroups] = useState<any[]>([]);
  const [healthChallenges, setHealthChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedGroupRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef(true);

  // Update the ref when selectedGroup changes
  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
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

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsResponse, challengesResponse] = await Promise.all([
          fetch('https://healthpulse-api.healthsathi.workers.dev/api/collaborative/groups'),
          fetch('https://healthpulse-api.healthsathi.workers.dev/api/collaborative/challenges')
        ]);
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          setHealthGroups(groupsData.groups || []);
        }
        if (challengesResponse.ok) {
          const challengesData = await challengesResponse.json();
          setHealthChallenges(challengesData.challenges || []);
        }
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (isVisible) {
      fetchData();
    }
  }, [isVisible]);

  // WebSocket connection management - keep connection open while modal is visible
  useEffect(() => {
    if (!isVisible) {
      // Clean up when modal is closed
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setConnectionStatus('disconnected');
      setConnectionError(null);
      return;
    }

    const connectWebSocket = () => {
      if (!isComponentMountedRef.current || !isVisible) return;

      try {
        setConnectionStatus('connecting');
        setConnectionError(null);
        
        // Close existing connection if any
        if (wsRef.current) {
          wsRef.current.close();
        }

        wsRef.current = new WebSocket(WS_URL);
        
        wsRef.current.onopen = () => {
          if (!isComponentMountedRef.current) return;
          console.log('WebSocket connected for HealthCommunity, state:', wsRef.current?.readyState);
          setConnectionStatus('connected');
          setConnectionError(null);
        };
        
        wsRef.current.onclose = (event) => {
          if (!isComponentMountedRef.current) return;
          console.log('WebSocket disconnected:', event.code, event.reason);
          
          // Clear the ref
          wsRef.current = null;
          setConnectionStatus('disconnected');
          
          // Attempt to reconnect if the component is still mounted and modal is visible
          if (isComponentMountedRef.current && isVisible && event.code !== 1000) {
            setConnectionError('Connection lost, reconnecting...');
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isComponentMountedRef.current && isVisible) {
                console.log('Attempting to reconnect WebSocket...');
                connectWebSocket();
              }
            }, 3000);
          }
        };
        
        wsRef.current.onerror = (error) => {
          if (!isComponentMountedRef.current) return;
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
          setConnectionError('Connection error occurred');
        };
        
        wsRef.current.onmessage = (event) => {
          if (!isComponentMountedRef.current) return;
          
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            if (data.type === 'group_joined' && data.group) {
              // Set messages when joining a group
              console.log('Setting group messages:', data.group.messages);
              setGroupMessages(data.group.messages || []);
            }
            
            if (data.type === 'new_group_message') {
              console.log('New group message received:', data.message, 'from sender:', data.message.senderId, 'my userId:', userId);
              // Add all messages from other users immediately
              if (data.message.senderId !== userId) {
                console.log('Adding message from other user to chat');
                setGroupMessages(prev => {
                  const newMessages = [...prev, data.message];
                  console.log('Updated messages with new message. Total messages:', newMessages.length);
                  return newMessages;
                });
              } else {
                console.log('Ignoring message from self to prevent duplicates');
              }
            }
            
            if (data.type === 'group_message_sent') {
              // Message was successfully sent to server
              console.log('Message sent successfully to server');
            }
            
            if (data.type === 'new_group_member') {
              // Optionally show a notification when someone joins
              console.log(`${data.userNickname} joined the group`);
            }

            if (data.type === 'error') {
              console.error('Server error:', data.message);
              setConnectionError(data.message || 'Server error occurred');
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
            setConnectionError('Failed to process server message');
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setConnectionStatus('error');
        setConnectionError('Failed to establish connection');
        
        // Retry after delay
        if (isComponentMountedRef.current && isVisible) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isComponentMountedRef.current && isVisible) {
              connectWebSocket();
            }
          }, 5000);
        }
      }
    };

    // Only connect if modal is visible and no existing connection
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      connectWebSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]); // Removed selectedGroup dependency to prevent frequent reconnections

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages]);

  // Debug messages state
  useEffect(() => {
    console.log('groupMessages changed:', groupMessages);
  }, [groupMessages]);

  // Join group via WebSocket
  const joinGroup = (group: any) => {
    console.log('Joining group:', group.name, 'with ID:', group.id);
    setSelectedGroup(group);
    setGroupMessages([]); // Clear messages when switching groups
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending join_group message for:', group.name);
      wsRef.current.send(JSON.stringify({
        type: 'join_group',
        groupId: group.id,
        userId,
        userNickname
      }));
    } else {
      console.log('WebSocket not ready, state:', wsRef.current?.readyState);
      // Try to reconnect if needed
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        console.log('Attempting to reconnect WebSocket...');
        setLoading(true);
        setTimeout(() => setLoading(false), 100);
      }
    }
  };

  // Send message via WebSocket
  const sendMessage = () => {
    if (messageInput.trim() && selectedGroup && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending message to group:', selectedGroup.name, 'groupId:', selectedGroup.id);
      
      // Create the message object
      const messageObj = {
        id: Date.now().toString(),
        senderId: userId,
        senderName: userNickname,
        message: messageInput.trim(),
        messageType: 'text',
        timestamp: new Date().toISOString()
      };
      
      console.log('Adding message locally for immediate display:', messageObj);
      
      // Add message locally immediately for sender
      setGroupMessages(prev => {
        const newMessages = [...prev, messageObj];
        console.log('Sender sees message immediately. Total messages:', newMessages.length);
        return newMessages;
      });
      
      // Send to server for broadcasting to other users
      const messageToSend = {
        type: 'send_group_message',
        groupId: selectedGroup.id,
        userId,
        userNickname,
        message: messageInput.trim(),
        messageType: 'text'
      };
      console.log('Sending to server:', messageToSend);
      wsRef.current.send(JSON.stringify(messageToSend));
      setMessageInput('');
    } else {
      console.log('Cannot send message:', {
        hasInput: !!messageInput.trim(),
        hasGroup: !!selectedGroup,
        hasWebSocket: !!wsRef.current,
        readyState: wsRef.current?.readyState
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getGroupIcon = (category: string) => {
    switch (category) {
      case 'disease': return <Heart className="w-5 h-5 text-red-500" />;
      case 'wellness': return <Shield className="w-5 h-5 text-green-500" />;
      default: return <Users className="w-5 h-5 text-blue-500" />;
    }
  };

  const getChallengeIcon = (category: string) => {
    switch (category) {
      case 'fitness': return <Target className="w-5 h-5 text-blue-500" />;
      case 'nutrition': return <Award className="w-5 h-5 text-green-500" />;
      case 'mental_health': return <Lightbulb className="w-5 h-5 text-purple-500" />;
      default: return <Trophy className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col relative border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Heart size={24} />
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
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          {[
            { id: 'groups', label: 'Support Groups', icon: <Users size={20} /> },
            { id: 'challenges', label: 'Health Challenges', icon: <Trophy size={20} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
          {activeTab === 'groups' && (
            <div className="h-full flex bg-white dark:bg-gray-900">
              {/* Groups List */}
              <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Health Support Groups</h3>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading groups...</p>
                    </div>
                  ) : healthGroups.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No groups available</p>
                    </div>
                  ) : (
                    healthGroups.map(group => (
                      <div
                        key={group.id}
                        onClick={() => joinGroup(group)}
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
                          <span>{group.members?.length || 0} members</span>
                          <span>{group.messages?.length || 0} messages</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Group Chat */}
              <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
                {selectedGroup ? (
                  <>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedGroup.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedGroup.description}</p>
                      {/* Connection Status */}
                      <div className="mt-2 flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          connectionStatus === 'connected' ? 'bg-green-500' : 
                          connectionStatus === 'connecting' ? 'bg-yellow-500' : 
                          connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {connectionStatus === 'connected' ? 'Connected' : 
                           connectionStatus === 'connecting' ? 'Connecting...' : 
                           connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                        </span>
                        {connectionError && (
                          <span className="text-xs text-red-500">({connectionError})</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-gray-900">
                      {groupMessages.map(message => (
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
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={sendMessage}
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
            <div className="h-full p-6 overflow-y-auto bg-white dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Health Challenges</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading challenges...</p>
                </div>
              ) : healthChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No challenges available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {healthChallenges.map(challenge => (
                    <div key={challenge.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-4">
                        {getChallengeIcon(challenge.category)}
                        <h4 className="font-semibold">{challenge.title}</h4>
                      </div>
                      <p className="text-gray-600 mb-4">{challenge.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{challenge.participants?.length || 0} participants</span>
                        <span>{Math.max(0, Math.ceil((challenge.endDate - Date.now()) / (1000 * 60 * 60 * 24)))} days left</span>
                      </div>
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                        Join Challenge
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthCommunity;