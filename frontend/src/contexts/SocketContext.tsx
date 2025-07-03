import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketMessage, SymptomReport } from '../types';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (message: SocketMessage) => void;
  reports: SymptomReport[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [reports, setReports] = useState<SymptomReport[]>([]);

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('new_report', (data: SymptomReport) => {
      console.log('New report received:', data);
      setReports(prev => [data, ...prev]);
    });

    newSocket.on('update_map', (data: any) => {
      console.log('Map update received:', data);
      // Handle map updates
    });

    newSocket.on('health_tip', (data: any) => {
      console.log('Health tip received:', data);
      // Handle health tips
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (message: SocketMessage) => {
    if (socket && connected) {
      socket.emit(message.type, message.data);
    }
  };

  const value: SocketContextType = {
    socket,
    connected,
    sendMessage,
    reports,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 