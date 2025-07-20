import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Users, UserPlus } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import Ably from 'ably';

interface PrivateMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  messageType: 'text' | 'system';
  timestamp: string;
}

interface PrivateRoom {
  id: string;
  name: string;
  messages: PrivateMessage[];
  participants: string[];
  createdAt: string;
  expiresAt: string;
}

interface OnlineUser {
  id: string;
  nickname: string;
  lastSeen: number;
}

const PrivateChatRoom: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<PrivateRoom | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'waiting'>('disconnected');
  const [showConnectionOptions, setShowConnectionOptions] = useState(false);
  const [showNameInput, setShowNameInput] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<OnlineUser[]>([]);
  const [ably, setAbly] = useState<Ably.Realtime | null>(null);
  const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Initialize Ably
  useEffect(() => {
    const ablyInstance = new Ably.Realtime({
      key: 'eXpD5g.u8GGJg:mOfIOlkmY10FTYDcZkcnvmJrmVQDRWKwq2i7kVVfyNY',
      clientId: userId
    });

    setAbly(ablyInstance);

    return () => {
      ablyInstance.close();
    };
  }, [userId]);

  // Generate random user ID on component mount
  useEffect(() => {
    const randomId = `user_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(randomId);
  }, []);

  // Listen for custom event to open the chat
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
    };

    window.addEventListener('openPrivateChat', handleOpenChat);
    return () => {
      window.removeEventListener('openPrivateChat', handleOpenChat);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentRoom?.messages]);

  // Debug messages
  useEffect(() => {
    if (currentRoom) {
      console.log('Current room messages:', currentRoom.messages);
    }
  }, [currentRoom]);

  // Subscribe to presence and user updates
  useEffect(() => {
    if (!ably || !userNickname.trim()) return;

    const presenceChannel = ably.channels.get('user-presence');
    
    // Subscribe to presence updates
    presenceChannel.presence.subscribe('enter', (member) => {
      console.log('User joined:', member);
      updateAvailableUsers();
    });

    presenceChannel.presence.subscribe('leave', (member) => {
      console.log('User left:', member);
      updateAvailableUsers();
    });

    // Enter presence
    presenceChannel.presence.enter({ nickname: userNickname });

    // Update available users every 5 seconds
    const interval = setInterval(updateAvailableUsers, 5000);

    return () => {
      presenceChannel.presence.leave();
      clearInterval(interval);
    };
  }, [ably, userNickname]);

  const updateAvailableUsers = async () => {
    if (!ably) return;

    try {
      const presenceChannel = ably.channels.get('user-presence');
      const members = await presenceChannel.presence.get();
      
      const users = members
        .filter(member => member.clientId !== userId)
        .map(member => ({
          id: member.clientId,
          nickname: member.data.nickname,
          lastSeen: Date.now()
        }));
      
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error updating available users:', error);
    }
  };

  const handleNameSubmit = () => {
    if (userNickname.trim()) {
      setShowNameInput(false);
      showToast('success', `Welcome, ${userNickname}!`);
    }
  };

  const joinRandomRoom = async () => {
    if (!ably) return;

    const roomId = 'global-chat';
    const roomName = 'Global Chat Room';
    
    const newRoom: PrivateRoom = {
      id: roomId,
      name: roomName,
      messages: [
        {
          id: 'welcome',
          senderId: 'system',
          senderName: 'System',
          message: `Welcome to the global chat room! You are ${userNickname}.`,
          messageType: 'system',
          timestamp: new Date().toISOString()
        }
      ],
      participants: [userId],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    setCurrentRoom(newRoom);
    setConnectionStatus('connected');

    // Subscribe to room channel
    const roomChannel = ably.channels.get(`room:${roomId}`);
    setChannel(roomChannel);

    // Subscribe to messages
    roomChannel.subscribe('message', (message) => {
      const newMessage: PrivateMessage = {
        id: message.id || `msg_${Date.now()}`,
        senderId: message.clientId || 'unknown',
        senderName: message.data.senderName,
        message: message.data.message,
        messageType: 'text',
        timestamp: message.timestamp ? message.timestamp.toString() : new Date().toISOString()
      };

      setCurrentRoom(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage]
      } : null);
    });

    showToast('success', 'Joined global chat room!');
  };

  const connectWithUser = async (targetUserId: string, targetNickname: string) => {
    if (!ably) return;

    // Create a consistent channel name for both users
    const sortedIds = [userId, targetUserId].sort();
    const roomId = `private_${sortedIds[0]}_${sortedIds[1]}`;
    const roomName = 'Private Chat';
    
    const newRoom: PrivateRoom = {
      id: roomId,
      name: roomName,
      messages: [
        {
          id: 'welcome',
          senderId: 'system',
          senderName: 'System',
          message: `You are now connected with ${targetNickname}! Start chatting.`,
          messageType: 'system',
          timestamp: new Date().toISOString()
        }
      ],
      participants: [userId, targetUserId],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    setCurrentRoom(newRoom);
    setConnectionStatus('connected');
    setShowConnectionOptions(false);

    // Subscribe to room channel
    const roomChannel = ably.channels.get(`room:${roomId}`);
    setChannel(roomChannel);

    // Subscribe to messages
    roomChannel.subscribe('message', (message) => {
      console.log('Received message:', message);
      const newMessage: PrivateMessage = {
        id: message.id || `msg_${Date.now()}`,
        senderId: message.clientId || 'unknown',
        senderName: message.data.senderName,
        message: message.data.message,
        messageType: 'text',
        timestamp: message.timestamp ? message.timestamp.toString() : new Date().toISOString()
      };

      setCurrentRoom(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage]
      } : null);
    });

    showToast('success', `Connected with ${targetNickname}!`);
  };

  const startPrivateConnection = () => {
    setShowConnectionOptions(true);
  };

  const sendMessage = async () => {
    console.log('sendMessage called', { messageInput, currentRoom, channel });
    
    if (!messageInput.trim() || !currentRoom || !channel) {
      console.log('sendMessage blocked:', { 
        hasMessage: !!messageInput.trim(), 
        hasRoom: !!currentRoom, 
        hasChannel: !!channel 
      });
      return;
    }

    const messageText = messageInput.trim();
    console.log('Sending message:', messageText);
    
    try {
      // Publish message to Ably channel
      await channel.publish('message', {
        senderName: userNickname,
        message: messageText
      });

      // Clear input
      setMessageInput('');
      console.log('Message sent successfully via Ably');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('error', 'Failed to send message');
    }
  };

  const leaveRoom = () => {
    if (channel) {
      channel.unsubscribe();
      setChannel(null);
    }
    
    setCurrentRoom(null);
    setConnectionStatus('disconnected');
    setMessageInput('');
    setShowConnectionOptions(false);
    showToast('info', 'Left the chat room');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatTimeRemaining = () => {
    if (!currentRoom) return '';
    const now = new Date();
    const expiresAt = new Date(currentRoom.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
      >
        <MessageCircle size={20} />
        <span>Private Chat</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-semibold">Private Chat Room</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col">
              {showNameInput ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md mx-auto">
                    <MessageCircle size={64} className="mx-auto mb-4 text-purple-600" />
                    <h3 className="text-xl font-semibold mb-2">Choose Your Name</h3>
                    <p className="text-gray-600 mb-6">Enter a name to start chatting</p>
                    
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={userNickname}
                        onChange={(e) => setUserNickname(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                        placeholder="Enter your name..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        autoFocus
                      />
                      <button
                        onClick={handleNameSubmit}
                        disabled={!userNickname.trim()}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              ) : !currentRoom ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle size={64} className="mx-auto mb-4 text-purple-600" />
                    <h3 className="text-xl font-semibold mb-2">Connect with Someone</h3>
                    <p className="text-gray-600 mb-6">Start a private conversation with another user</p>
                    
                    {!showConnectionOptions ? (
                      <div className="space-y-3">
                        <button
                          onClick={startPrivateConnection}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <UserPlus size={20} />
                          <span>Send Message to Someone</span>
                        </button>
                        
                        <div className="text-sm text-gray-500">or</div>
                        
                        <button
                          onClick={joinRandomRoom}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                          Join Global Chat Room
                        </button>
                      </div>
                    ) : (
                      <div className="w-full max-w-md mx-auto">
                        {/* Available Users */}
                        <h4 className="font-semibold mb-3 text-gray-700">Available Users</h4>
                        {availableUsers.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No other users online</p>
                        ) : (
                          <div className="space-y-2">
                            {availableUsers.map(user => (
                              <div key={user.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <span className="text-sm text-gray-700">{user.nickname}</span>
                                <button
                                  onClick={() => connectWithUser(user.id, user.nickname)}
                                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                                >
                                  Connect
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            setShowConnectionOptions(false);
                          }}
                          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                        >
                          Back
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Room Info */}
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          connectionStatus === 'connected' ? 'bg-green-500' : 
                          connectionStatus === 'waiting' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium">{currentRoom.name}</span>
                        <span className="text-sm text-gray-500">({connectionStatus})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-500">{currentRoom.participants.length} participants</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentRoom.messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      currentRoom.messages.map((message, index) => {
                        return (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === userId
                                  ? 'bg-purple-600 text-white'
                                  : message.senderId === 'system'
                                  ? 'bg-gray-200 text-gray-700'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs opacity-75">{message.senderName}</span>
                                <span className="text-xs opacity-75">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm">{message.message}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-gray-50 border-t flex justify-between items-center text-sm text-gray-600">
                    <span>{formatTimeRemaining()}</span>
                    <button
                      onClick={leaveRoom}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      Leave Room
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrivateChatRoom; 