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

// Remove all WebSocket code and show a message instead
export default function HealthCommunity() {
  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-2">Health Community</h2>
      <p className="text-gray-500">Live community chat is currently unavailable. Please use the Private Chat Room for real-time chat.</p>
    </div>
  );
}