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
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [userId, setUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const wsUrl = window.location.hostname === 'localhost' ? 'ws://localhost:8787' : 'wss://healthpulse-api.healthsathi.workers.dev/chat';
    const ws = new WebSocket(wsUrl);
    setWebsocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connected for ConnectFeature');
      // Generate a unique user ID
      const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
      setUserId(newUserId);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data.type);
        
        switch (data.type) {
          case 'waiting_for_connection':
            setConnectionState(prev => ({
              ...prev,
              isWaiting: true,
              isConnected: false
            }));
            break;
            
          case 'connection_made':
            setConnectionState(prev => ({
              ...prev,
              isConnected: true,
              isWaiting: false,
              connectionId: data.connectionId,
              partnerId: data.partnerId
            }));
            break;
            
          case 'new_message':
            setConnectionState(prev => ({
              ...prev,
              messages: [...prev.messages, data.message]
            }));
            break;
            
          case 'message_sent':
            // Message was successfully sent to server - no need to add locally
            // The server will broadcast it back as 'new_message'
            break;
            
          case 'partner_disconnected':
            setConnectionState(prev => ({
              ...prev,
              isConnected: false,
              isWaiting: false,
              connectionId: undefined,
              partnerId: undefined
            }));
            break;
            
          case 'error':
            console.error('WebSocket error:', data.message);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isWaiting: false,
        connectionId: undefined,
        partnerId: undefined
      }));
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [connectionState.messages]);

  const handleConnect = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'request_connection',
        userId: userId
      }));
    }
  };

  const handleDisconnect = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN && connectionState.connectionId) {
      websocket.send(JSON.stringify({
        type: 'disconnect_from_chat',
        connectionId: connectionState.connectionId,
        userId: userId
      }));
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
    if (messageInput.trim() && websocket && websocket.readyState === WebSocket.OPEN && connectionState.connectionId) {
      websocket.send(JSON.stringify({
        type: 'send_message',
        connectionId: connectionState.connectionId,
        userId: userId,
        message: messageInput.trim()
      }));
      setMessageInput('');
      // Don't add message locally - wait for server confirmation
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
              disabled={!websocket || websocket.readyState !== WebSocket.OPEN}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors w-full"
            >
              <Phone size={16} className="inline mr-2" />
              {websocket && websocket.readyState === WebSocket.OPEN ? 'Start Connecting' : 'Connecting...'}
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
                    className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.senderId === userId
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