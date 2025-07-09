import React, { useState, useEffect, useRef } from 'react';
import { Users, X, MessageCircle, Send, Phone, PhoneOff } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
}

interface ConnectionState {
  isConnected: boolean;
  connectionId?: string;
  partnerId?: string;
  isWaiting: boolean;
  messages: Message[];
}

const ConnectFeature: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isWaiting: false,
    messages: []
  });
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to Socket.io server
    const socketInstance = (window as any).io('https://healthpulse-backend-production.up.railway.app');
    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on('waiting_for_connection', (data: any) => {
      setConnectionState(prev => ({
        ...prev,
        isWaiting: true,
        isConnected: false
      }));
    });

    socketInstance.on('connection_made', (data: any) => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        isWaiting: false,
        connectionId: data.connectionId,
        partnerId: data.partnerId
      }));
    });

    socketInstance.on('new_message', (data: any) => {
      setConnectionState(prev => ({
        ...prev,
        messages: [...prev.messages, data.message]
      }));
    });

    socketInstance.on('partner_disconnected', (data: any) => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isWaiting: false,
        connectionId: undefined,
        partnerId: undefined
      }));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [connectionState.messages]);

  const handleConnect = () => {
    if (socket) {
      socket.emit('request_connection');
    }
  };

  const handleDisconnect = () => {
    if (socket && connectionState.connectionId) {
      socket.emit('disconnect_from_chat', { connectionId: connectionState.connectionId });
    }
    setConnectionState(prev => ({
      ...prev,
      isConnected: false,
      isWaiting: false,
      connectionId: undefined,
      partnerId: undefined,
      messages: []
    }));
  };

  const sendMessage = () => {
    if (messageInput.trim() && socket && connectionState.connectionId) {
      socket.emit('send_message', {
        connectionId: connectionState.connectionId,
        message: messageInput.trim()
      });
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
          title="Connect with others"
        >
          <Users size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageCircle size={20} />
          <span className="font-semibold">Connect with Others</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {!connectionState.isConnected && !connectionState.isWaiting && (
          <div className="text-center">
            <div className="mb-4">
              <Users size={48} className="mx-auto text-blue-500 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800">Connect with Others</h3>
              <p className="text-sm text-gray-600 mt-1">
                Find someone to chat with about health experiences
              </p>
            </div>
            <button
              onClick={handleConnect}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors w-full"
            >
              <Phone size={16} className="inline mr-2" />
              Start Connecting
            </button>
          </div>
        )}

        {connectionState.isWaiting && (
          <div className="text-center">
            <div className="animate-pulse">
              <Users size={48} className="mx-auto text-blue-500 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800">Looking for someone...</h3>
              <p className="text-sm text-gray-600 mt-1">
                Please wait while we find you a chat partner
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors mt-4 w-full"
            >
              Cancel
            </button>
          </div>
        )}

        {connectionState.isConnected && (
          <div className="h-80 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Connected</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-red-600 hover:text-red-700 transition-colors"
                title="Disconnect"
              >
                <PhoneOff size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-3 space-y-2">
              {connectionState.messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  <MessageCircle size={24} className="mx-auto mb-2 text-gray-400" />
                  <p>Start the conversation!</p>
                </div>
              ) : (
                connectionState.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === socket?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.senderId === socket?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.message}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectFeature; 