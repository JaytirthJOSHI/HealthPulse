import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SymptomReport, HealthTip, HealthAggregate } from '../types';

// Create a single shared Supabase client instance
export const supabaseClient = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://healthpulse-api.healthsathi.workers.dev'
  : 'http://localhost:8787';

interface SupabaseContextType {
  supabase: SupabaseClient;
  apiBaseUrl: string;
  isConnected: boolean;
  reports: SymptomReport[];
  healthTips: HealthTip[];
  loading: boolean;
  error: string | null;
  addReport: (report: Omit<SymptomReport, 'id' | 'createdAt'>) => Promise<void>;
  getReportsByLocation: (country: string, pinCode: string) => Promise<SymptomReport[]>;
  getHealthTip: (symptoms: string[], pinCode?: string) => Promise<HealthTip | null>;
  getHealthAggregates: () => Promise<HealthAggregate[]>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = supabaseClient;

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('health_tips').select('count').limit(1);
        setIsConnected(!error);
      } catch (error) {
        console.error('Supabase connection error:', error);
        setIsConnected(false);
      }
    };

    checkConnection();
  }, [supabase]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Try to load recent reports from API, but don't fail if unavailable
        try {
          const reportsResponse = await fetch(`${API_BASE_URL}/api/reports`);
          if (reportsResponse.ok) {
            const reportsData = await reportsResponse.json();
            console.log('SupabaseContext: Raw API data:', reportsData.length, 'reports');
            console.log('SupabaseContext: Sample raw report:', reportsData[0]);
            
            const transformedReports = (reportsData || []).map((report: any) => ({
              id: report.id,
              nickname: report.nickname,
              country: report.country,
              pinCode: report.pinCode || report.pin_code || '00000',
              symptoms: report.symptoms,
              illnessType: report.illnessType || report.illness_type,
              severity: report.severity,
              createdAt: report.createdAt || report.created_at,
              latitude: report.latitude,
              longitude: report.longitude,
            }));
            console.log('SupabaseContext: Transformed reports:', transformedReports.length, 'reports loaded');
            console.log('SupabaseContext: Sample transformed report:', transformedReports[0]);
            setReports(transformedReports);
          } else {
            console.warn('Reports API not available, using empty array');
            setReports([]);
          }
        } catch (err) {
          console.warn('Failed to fetch reports:', err);
          setReports([]);
        }

        // Try to load health tips from API, but don't fail if unavailable
        try {
          const tipsResponse = await fetch(`${API_BASE_URL}/api/health-tips`);
          if (tipsResponse.ok) {
            const tipsData = await tipsResponse.json();
            setHealthTips(tipsData || []);
          } else {
            console.warn('Health tips API not available, using empty array');
            setHealthTips([]);
          }
        } catch (err) {
          console.warn('Failed to fetch health tips:', err);
          setHealthTips([]);
        }
      } catch (err) {
        console.error('Error in loadInitialData:', err);
        setError('Some data could not be loaded, but the app will continue to work');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const addReport = async (report: Omit<SymptomReport, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const newReport: SymptomReport = {
        ...result.data,
        id: result.data.id,
        pinCode: result.data.pin_code,
        illnessType: result.data.illness_type,
        createdAt: result.data.created_at,
      };

      setReports(prev => [newReport, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add report');
      throw err;
    }
  };

  const getReportsByLocation = async (country: string, pinCode: string): Promise<SymptomReport[]> => {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('symptom_reports')
        .select('*')
        .eq('country', country)
        .eq('pin_code', pinCode)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(report => ({
        ...report,
        id: report.id,
        pinCode: report.pin_code,
        illnessType: report.illness_type,
        createdAt: report.created_at,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get reports');
      return [];
    }
  };

  const getHealthTip = async (symptoms: string[], pinCode?: string): Promise<HealthTip | null> => {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      let query = supabase
        .from('health_tips')
        .select('*')
        .overlaps('symptoms', symptoms);

      if (pinCode) {
        // Use the enhanced function that considers location
        const { data, error } = await supabase
          .rpc('get_health_tip_by_symptoms_and_location', {
            symptom_list: symptoms,
            location_pin_code: pinCode
          });

        if (error) throw error;
        return data?.[0] || null;
      }

      const { data, error } = await query.limit(1);
      if (error) throw error;

      return data?.[0] || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get health tip');
      return null;
    }
  };

  const getHealthAggregates = async (): Promise<HealthAggregate[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health-aggregates`);
      if (!response.ok) throw new Error('Failed to fetch health aggregates');
      const data = await response.json();
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get health aggregates');
      console.error('Error fetching health aggregates:', err);
      return [];
    }
  };

  const value: SupabaseContextType = {
    supabase,
    apiBaseUrl: API_BASE_URL,
    isConnected,
    reports,
    healthTips,
    loading,
    error,
    addReport,
    getReportsByLocation,
    getHealthTip,
    getHealthAggregates,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};