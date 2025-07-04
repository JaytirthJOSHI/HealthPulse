import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SocketMessage, SymptomReport } from '../types';

interface SocketContextType {
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
  const [connected, setConnected] = useState(false);
  const [reports, setReports] = useState<SymptomReport[]>([]);

  // Initialize Supabase client for real-time
  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL!,
    process.env.REACT_APP_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Subscribe to real-time changes on symptom_reports table
    const channel = supabase
      .channel('symptom_reports_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'symptom_reports',
        },
        (payload) => {
          console.log('New report received:', payload.new);
          const newReport: SymptomReport = {
            id: payload.new.id,
            nickname: payload.new.nickname,
            country: payload.new.country,
            pinCode: payload.new.pin_code,
            symptoms: payload.new.symptoms,
            illnessType: payload.new.illness_type,
            severity: payload.new.severity,
            latitude: payload.new.latitude,
            longitude: payload.new.longitude,
            createdAt: payload.new.created_at,
          };
          setReports(prev => [newReport, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'symptom_reports',
        },
        (payload) => {
          console.log('Report updated:', payload.new);
          // Handle report updates if needed
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const sendMessage = async (message: SocketMessage) => {
    if (!connected) {
      console.warn('Not connected to real-time service');
      return;
    }

    try {
      switch (message.type) {
        case 'new_report':
          // Reports are handled via REST API, not real-time
          console.log('New report should be sent via REST API');
          break;
        case 'update_map':
          // You can implement map updates via Supabase real-time if needed
          console.log('Map update:', message.data);
          break;
        case 'health_tip':
          // Health tips can be handled via REST API
          console.log('Health tip request:', message.data);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const value: SocketContextType = {
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