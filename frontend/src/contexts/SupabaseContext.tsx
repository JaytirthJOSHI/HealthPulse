import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SymptomReport, HealthTip, Disease, Region, DiseaseRisk, HealthAggregate } from '../types';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.pulse.health-sathi.org'
  : 'http://localhost:3001';

interface SupabaseContextType {
  supabase: SupabaseClient;
  apiBaseUrl: string;
  isConnected: boolean;
  reports: SymptomReport[];
  healthTips: HealthTip[];
  diseases: Disease[];
  regions: Region[];
  loading: boolean;
  error: string | null;
  addReport: (report: Omit<SymptomReport, 'id' | 'createdAt'>) => Promise<void>;
  getReportsByLocation: (country: string, pinCode: string) => Promise<SymptomReport[]>;
  getHealthTip: (symptoms: string[], pinCode?: string) => Promise<HealthTip | null>;
  getDiseaseRisk: (pinCode: string) => Promise<DiseaseRisk[]>;
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
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL!,
    process.env.REACT_APP_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('health_tips').select('count').limit(1);
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
        // Load recent reports
        const { data: reportsData, error: reportsError } = await supabase
          .from('symptom_reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (reportsError) throw reportsError;

        // Load health tips
        const { data: tipsData, error: tipsError } = await supabase
          .from('health_tips')
          .select('*');

        if (tipsError) throw tipsError;

        // Load diseases
        const { data: diseasesData, error: diseasesError } = await supabase
          .from('diseases')
          .select('*');

        if (diseasesError) throw diseasesError;

        // Load regions
        const { data: regionsData, error: regionsError } = await supabase
          .from('regions')
          .select('*');

        if (regionsError) throw regionsError;

        setReports(reportsData || []);
        setHealthTips(tipsData || []);
        setDiseases(diseasesData || []);
        setRegions(regionsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [supabase]);

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

  const getDiseaseRisk = async (pinCode: string): Promise<DiseaseRisk[]> => {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .rpc('get_disease_risk_for_location', {
          location_pin_code: pinCode
        });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get disease risk');
      return [];
    }
  };

  const getHealthAggregates = async (): Promise<HealthAggregate[]> => {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('health_aggregates')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get health aggregates');
      return [];
    }
  };

  const value: SupabaseContextType = {
    supabase,
    apiBaseUrl: API_BASE_URL,
    isConnected,
    reports,
    healthTips,
    diseases,
    regions,
    loading,
    error,
    addReport,
    getReportsByLocation,
    getHealthTip,
    getDiseaseRisk,
    getHealthAggregates,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};