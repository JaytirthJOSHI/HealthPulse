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

// Remove all WebSocket code and show a message instead
export default function ConnectFeature() {
  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-2">Connect Feature</h2>
      <p className="text-gray-500">Live connection is currently unavailable. Please use the Private Chat Room or Community features for real-time chat.</p>
    </div>
  );
} 