import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SymptomReport, HealthTip } from '../types';

interface SupabaseContextType {
  supabase: SupabaseClient | null;
  reports: SymptomReport[];
  healthTips: HealthTip[];
  loading: boolean;
  error: string | null;
  addReport: (report: Omit<SymptomReport, 'id' | 'createdAt'>) => Promise<void>;
  getReportsByLocation: (country: string, pinCode: string) => Promise<SymptomReport[]>;
  getHealthTip: (symptoms: string[]) => Promise<HealthTip | null>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase credentials not configured');
      setLoading(false);
      return;
    }

    const client = createClient(supabaseUrl, supabaseAnonKey);
    setSupabase(client);

    // Load initial data
    loadInitialData(client);
  }, []);

  const loadInitialData = async (client: SupabaseClient) => {
    try {
      // Load recent reports
      const { data: reportsData, error: reportsError } = await client
        .from('symptom_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (reportsError) throw reportsError;

      // Load health tips
      const { data: tipsData, error: tipsError } = await client
        .from('health_tips')
        .select('*');

      if (tipsError) throw tipsError;

      setReports(reportsData || []);
      setHealthTips(tipsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addReport = async (report: Omit<SymptomReport, 'id' | 'createdAt'>) => {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('symptom_reports')
        .insert([{
          nickname: report.nickname,
          country: report.country,
          pin_code: report.pinCode,
          symptoms: report.symptoms,
          illness_type: report.illnessType,
          severity: report.severity,
          latitude: report.latitude,
          longitude: report.longitude,
        }])
        .select()
        .single();

      if (error) throw error;

      const newReport: SymptomReport = {
        ...data,
        id: data.id,
        pinCode: data.pin_code,
        illnessType: data.illness_type,
        createdAt: data.created_at,
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

  const getHealthTip = async (symptoms: string[]): Promise<HealthTip | null> => {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      // Simple logic to find relevant health tip based on symptoms
      const { data, error } = await supabase
        .from('health_tips')
        .select('*')
        .limit(1);

      if (error) throw error;

      return data?.[0] || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get health tip');
      return null;
    }
  };

  const value: SupabaseContextType = {
    supabase,
    reports,
    healthTips,
    loading,
    error,
    addReport,
    getReportsByLocation,
    getHealthTip,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}; 