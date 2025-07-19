import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseClient } from './SupabaseContext';
import { SymptomReport } from '../types';

interface RealTimeContextType {
  connected: boolean;
  reports: SymptomReport[];
  connectionError: string | null;
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
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Use the shared Supabase client instance
  const supabase = supabaseClient;

  useEffect(() => {
    let channel: any;
    let reconnectTimeout: NodeJS.Timeout;
    let isComponentMounted = true;

    const setupSubscription = async () => {
      try {
        // Clear any previous errors
        setConnectionError(null);
        
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
              try {
                if (!isComponentMounted) return;
                
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
              } catch (error) {
                console.error('Error processing new report:', error);
              }
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
              try {
                if (!isComponentMounted) return;
                console.log('Report updated:', payload.new);
                // Handle report updates if needed
              } catch (error) {
                console.error('Error processing report update:', error);
              }
            }
          )
          .subscribe((status) => {
            try {
              if (!isComponentMounted) return;
              
              console.log('Subscription status:', status);
              setConnected(status === 'SUBSCRIBED');
              
              // Clear error on successful connection
              if (status === 'SUBSCRIBED') {
                setConnectionError(null);
              }
              
              // If connection is closed, attempt to reconnect after a delay
              if (status === 'CLOSED' && isComponentMounted) {
                console.log('Connection closed, attempting to reconnect...');
                setConnectionError('Connection lost, reconnecting...');
                reconnectTimeout = setTimeout(() => {
                  if (isComponentMounted) {
                    setupSubscription();
                  }
                }, 3000); // Wait 3 seconds before reconnecting
              }
              
              // Handle channel errors
              if (status === 'CHANNEL_ERROR') {
                console.error('Channel error occurred');
                setConnectionError('Connection error occurred');
                setConnected(false);
              }
              
              // Handle timeout errors
              if (status === 'TIMED_OUT') {
                console.error('Connection timed out');
                setConnectionError('Connection timed out');
                setConnected(false);
              }
            } catch (error) {
              console.error('Error in subscription status handler:', error);
              setConnectionError('Subscription error occurred');
              setConnected(false);
            }
          });
      } catch (error) {
        console.error('Error setting up subscription:', error);
        setConnectionError('Failed to establish connection');
        setConnected(false);
        
        // Retry after delay if component is still mounted
        if (isComponentMounted) {
          reconnectTimeout = setTimeout(() => {
            if (isComponentMounted) {
              setupSubscription();
            }
          }, 5000);
        }
      }
    };

    setupSubscription();

    return () => {
      isComponentMounted = false;
      
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
      }
    };
  }, [supabase]);

  const value: RealTimeContextType = {
    connected,
    reports,
    connectionError,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};