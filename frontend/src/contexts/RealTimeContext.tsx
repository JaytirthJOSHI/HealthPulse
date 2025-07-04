import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseClient } from './SupabaseContext';
import { RealTimeMessage, SymptomReport } from '../types';

interface RealTimeContextType {
  connected: boolean;
  sendMessage: (message: RealTimeMessage) => void;
  reports: SymptomReport[];
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

interface RealTimeProviderProps {
  children: React.ReactNode;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [reports, setReports] = useState<SymptomReport[]>([]);

  // Use the shared Supabase client instance
  const supabase = supabaseClient;

  useEffect(() => {
    let channel: any;
    let reconnectTimeout: NodeJS.Timeout;

    const setupSubscription = () => {
      // Subscribe to real-time changes on symptom_reports table
      channel = supabase
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
          
          // If connection is closed, attempt to reconnect after a delay
          if (status === 'CLOSED') {
            console.log('Connection closed, attempting to reconnect...');
            reconnectTimeout = setTimeout(() => {
              setupSubscription();
            }, 3000); // Wait 3 seconds before reconnecting
          }
        });
    };

    setupSubscription();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []); // Remove supabase from dependencies since it's now stable

  const sendMessage = async (message: RealTimeMessage) => {
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

  const value: RealTimeContextType = {
    connected,
    sendMessage,
    reports,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
}; 