import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageCircle, 
  Plus, 
  Send, 
  X, 
  Copy,
  Check,
  Share2,
  UserPlus,
  LogOut,
  Clock,
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
  const [currentRoom, setCurrentRoom] = useState<PrivateChatRoom | null>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isComponentMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  // Connect to WebSocket when component becomes visible
  useEffect(() => {
    if (!isVisible) return;

    const connectWebSocket = () => {
      if (!isComponentMountedRef.current) return;

      try {
        setConnectionStatus('connecting');
        setConnectionError(null);
        
        // Close existing connection if any
        if (websocket) {
          websocket.close();
        }

        // Connect to WebSocket server
        const ws = new WebSocket('wss://healthpulse-api.healthsathi.workers.dev/chat');
        setWebsocket(ws);

        ws.onopen = () => {
          if (!isComponentMountedRef.current) return;
          console.log('WebSocket connected for private chat room');
          setConnectionStatus('connected');
          setConnectionError(null);
        };

        ws.onmessage = (event) => {
          if (!isComponentMountedRef.current) return;
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            setConnectionError('Failed to process server message');
          }
        };

        ws.onerror = (error) => {
          if (!isComponentMountedRef.current) return;
          console.error('WebSocket error:', error);
          setConnectionError('Connection error occurred');
          setConnectionStatus('error');
        };

        ws.onclose = () => {
          if (!isComponentMountedRef.current) return;
          console.log('WebSocket disconnected');
          setConnectionStatus('disconnected');
        };

      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        setConnectionError('Failed to connect');
        setConnectionStatus('error');
      }
    };

    connectWebSocket();
  }, [isVisible]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentRoom?.messages]);

  const handleWebSocketMessage = (data: any) => {
    try {
      switch (data.type) {
        case 'private_room_created':
          setCurrentRoom(data.room);
          setActiveTab('chat');
          break;
        case 'private_room_joined':
          setCurrentRoom(data.room);
          setActiveTab('chat');
          break;
        case 'private_message_sent':
          // Message was sent successfully
          break;
        case 'new_private_message':
          if (currentRoom && data.roomId === currentRoom.id) {
            setCurrentRoom(prev => prev ? {
              ...prev,
              messages: [...prev.messages, data.message]
            } : null);
          }
          break;
        case 'private_room_participant_joined':
          if (currentRoom && data.roomId === currentRoom.id) {
            setCurrentRoom(prev => prev ? {
              ...prev,
              participantId: data.participantId,
              participantName: data.participantName,
              messages: data.room.messages
            } : null);
          }
          break;
        case 'private_room_participant_left':
          if (currentRoom && data.roomId === currentRoom.id) {
            setCurrentRoom(prev => prev ? {
              ...prev,
              participantId: undefined,
              participantName: undefined,
              messages: data.room.messages
            } : null);
          }
          break;
        case 'error':
          console.error('WebSocket server error:', data.message);
          setConnectionError(data.message || 'Server error occurred');
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      setConnectionError('Failed to handle server message');
    }
  };

  const createRoom = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      setIsCreating(true);
      websocket.send(JSON.stringify({
        type: 'create_private_room',
        userId,
        userNickname
      }));
    }
  };

  const joinRoom = () => {
    if (!inviteCode.trim()) {
      setConnectionError('Please enter an invite code');
      return;
    }

    if (websocket && websocket.readyState === WebSocket.OPEN) {
      setIsJoining(true);
      websocket.send(JSON.stringify({
        type: 'join_private_room',
        inviteCode: inviteCode.trim().toUpperCase(),
        userId,
        userNickname
      }));
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() && currentRoom && websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'send_private_message',
        roomId: currentRoom.id,
        userId,
        userNickname,
        message: messageInput.trim(),
        messageType: 'text'
      }));
      setMessageInput('');
    }
  };

  const leaveRoom = () => {
    if (currentRoom && websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'leave_private_room',
        roomId: currentRoom.id,
        userId
      }));
    }
    setCurrentRoom(null);
    setActiveTab('create');
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
        await navigator.share({
          title: 'Join my private chat room',
          text: `Join my private chat room using invite code: ${currentRoom.inviteCode}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Failed to share invite code:', error);
        // Fallback to copy
        copyInviteCode();
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
    return `${hours}h ${minutes}m left`;
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

               {/* Create Room */}
               {activeTab === 'create' && (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <MessageCircle size={64} className="mx-auto mb-6 text-purple-500" />
                    <h3 className="text-2xl font-bold mb-4">Create Private Chat Room</h3>
                    <p className="text-gray-600 mb-8">
                      Create a private chat room and share the invite code with someone to start chatting one-on-one.
                    </p>
                    <button
                      onClick={createRoom}
                      disabled={isCreating || connectionStatus !== 'connected'}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center mx-auto"
                    >
                      {isCreating ? 'Creating...' : 'Create Room'}
                    </button>
                  </div>
                </div>
               )}

              {/* Join Room */}
              {activeTab === 'join' && (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center max-w-md w-full">
                    <UserPlus size={64} className="mx-auto mb-6 text-purple-500" />
                    <h3 className="text-2xl font-bold mb-4">Join Private Chat Room</h3>
                    <p className="text-gray-600 mb-6">
                      Enter the invite code to join a private chat room.
                    </p>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        placeholder="Enter invite code (e.g., ABC123)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-lg font-mono"
                        maxLength={6}
                      />
                      <button
                        onClick={joinRoom}
                        disabled={!inviteCode.trim() || isJoining || connectionStatus !== 'connected'}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                      >
                        {isJoining ? 'Joining...' : 'Join Room'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat Room */}
          {currentRoom && (
            <div className="h-full flex flex-col">
              {/* Room Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Private Chat Room</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Code: {currentRoom.inviteCode}</span>
                      <span>•</span>
                      <span>{getTimeUntilExpiry()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyInviteCode}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                      title="Copy invite code"
                    >
                      {copiedCode ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={shareInviteCode}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                      title="Share invite code"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={leaveRoom}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      title="Leave room"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentRoom.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === 'system'
                          ? 'bg-gray-100 text-gray-600 text-center mx-auto'
                          : message.senderId === userId
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {message.senderId !== 'system' && (
                        <div className="text-xs opacity-75 mb-1">
                          {message.senderName}
                        </div>
                      )}
                      <div className="text-sm">{message.message}</div>
                      <div className="text-xs opacity-75 mt-1 flex items-center justify-end">
                        <Clock size={12} className="mr-1" />
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
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
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={!currentRoom.participantId && currentRoom.creatorId !== userId}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || (!currentRoom.participantId && currentRoom.creatorId !== userId)}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
                {!currentRoom.participantId && currentRoom.creatorId !== userId && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Waiting for someone to join with invite code: {currentRoom.inviteCode}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateChatRoom; 