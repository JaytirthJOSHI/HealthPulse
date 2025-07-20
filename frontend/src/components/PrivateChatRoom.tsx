import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Send, 
  X, 
  Copy,
  Check,
  Share2,
  UserPlus,
  LogOut,
  AlertCircle
} from 'lucide-react';

interface PrivateMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  messageType: 'text' | 'image' | 'file';
  timestamp: string;
}

interface ChatRoom {
  id: string;
  inviteCode: string;
  creatorId: string;
  creatorName: string;
  participantId?: string;
  participantName?: string;
  messages: PrivateMessage[];
  createdAt: number;
  isActive: boolean;
  expiresAt: number;
}

interface PrivateChatRoomProps {
  isVisible: boolean;
  onClose: () => void;
}

const PrivateChatRoom: React.FC<PrivateChatRoomProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'chat'>('create');
  const [inviteCode, setInviteCode] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  const [userNickname] = useState(`User_${Math.random().toString(36).substr(2, 5)}`);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isComponentMountedRef = useRef(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentRoom?.messages]);

  const createRoom = async () => {
    try {
      setIsCreating(true);
      setConnectionError(null);
      
      const response = await fetch('https://healthpulse-api.healthsathi.workers.dev/api/private-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userNickname
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentRoom(data.room);
        setActiveTab('chat');
        setInviteCode(data.room.inviteCode);
        setConnectionStatus('connected');
        startPolling(data.room.id);
      } else {
        setConnectionError(data.message || 'Failed to create room');
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      setConnectionError('Failed to create room - please try again');
      setConnectionStatus('error');
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!inviteCode.trim()) {
      setConnectionError('Please enter an invite code');
      return;
    }

    try {
      setIsJoining(true);
      setConnectionError(null);
      
      const response = await fetch('https://healthpulse-api.healthsathi.workers.dev/api/private-rooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode: inviteCode.trim().toUpperCase(),
          userId,
          userNickname
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentRoom(data.room);
        setActiveTab('chat');
        setConnectionStatus('connected');
        startPolling(data.room.id);
      } else {
        setConnectionError(data.message || 'Failed to join room');
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      setConnectionError('Failed to join room - please check the invite code');
      setConnectionStatus('error');
    } finally {
      setIsJoining(false);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !currentRoom) return;

    try {
      const response = await fetch(`https://healthpulse-api.healthsathi.workers.dev/api/private-rooms/${currentRoom.id}/messages`, {
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
        // Message will be picked up by polling
      } else {
        setConnectionError('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setConnectionError('Failed to send message');
    }
  };

  const startPolling = (roomId: string) => {
    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll for new messages every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      if (!isComponentMountedRef.current) return;

      try {
        const response = await fetch(`https://healthpulse-api.healthsathi.workers.dev/api/private-rooms/${roomId}/messages`);
        const data = await response.json();
        
        if (data.success && currentRoom) {
          setCurrentRoom(prev => prev ? {
            ...prev,
            messages: data.messages
          } : null);
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 2000);
  };

  const leaveRoom = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setCurrentRoom(null);
    setActiveTab('create');
    setConnectionStatus('disconnected');
    setConnectionError(null);
    setInviteCode('');
  };

  const copyInviteCode = async () => {
    if (currentRoom?.inviteCode) {
      try {
        await navigator.clipboard.writeText(currentRoom.inviteCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (error) {
        console.error('Failed to copy invite code:', error);
      }
    }
  };

  const shareInviteCode = async () => {
    if (currentRoom?.inviteCode) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Join my private chat room',
            text: `Join my private chat room using invite code: ${currentRoom.inviteCode}`,
            url: window.location.href
          });
        } else {
          await copyInviteCode();
        }
      } catch (error) {
        console.error('Failed to share invite code:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeUntilExpiry = () => {
    if (!currentRoom) return '';
    const now = Date.now();
    const timeLeft = currentRoom.expiresAt - now;
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <MessageCircle size={24} />
            <h2 className="text-xl font-bold">Private Chat Room</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Connection Status */}
        {connectionStatus !== 'connected' && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-yellow-600" />
              <span className="text-yellow-800">
                {connectionStatus === 'connecting' && 'Connecting...'}
                {connectionStatus === 'error' && `Connection error: ${connectionError}`}
                {connectionStatus === 'disconnected' && 'Disconnected'}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!currentRoom && (
            <div className="h-full flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'create'
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Plus size={20} className="inline mr-2" />
                  Create Room
                </button>
                <button
                  onClick={() => setActiveTab('join')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'join'
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <UserPlus size={20} className="inline mr-2" />
                  Join Room
                </button>
              </div>

              {/* Create Room Tab */}
              {activeTab === 'create' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                    <MessageCircle size={48} className="text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Create Private Chat Room
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md">
                    Create a private chat room and share the invite code with someone to start chatting one-on-one.
                  </p>
                  <button
                    onClick={createRoom}
                    disabled={isCreating}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreating ? 'Creating...' : 'Create Room'}
                  </button>
                </div>
              )}

              {/* Join Room Tab */}
              {activeTab === 'join' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                    <UserPlus size={48} className="text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Join Private Chat Room
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Enter the invite code to join an existing private chat room.
                  </p>
                  <div className="w-full max-w-sm">
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter invite code"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={joinRoom}
                      disabled={isJoining || !inviteCode.trim()}
                      className="w-full mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isJoining ? 'Joining...' : 'Join Room'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat Room */}
          {currentRoom && (
            <div className="h-full flex flex-col">
              {/* Room Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <MessageCircle size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Private Chat</h3>
                    <p className="text-sm text-gray-500">
                      {currentRoom.participantId ? 'Connected' : 'Waiting for participant'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyInviteCode}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    <span>{currentRoom.inviteCode}</span>
                  </button>
                  <button
                    onClick={shareInviteCode}
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={leaveRoom}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
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
                  currentRoom.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === userId
                            ? 'bg-purple-600 text-white'
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
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{getTimeUntilExpiry()}</span>
                  <span>Room expires in 24 hours</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <AlertCircle size={14} />
            <span>
              Privacy & Anonymity: Reports are anonymous and only location data at PIN code level is collected, not exact addresses.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateChatRoom; 