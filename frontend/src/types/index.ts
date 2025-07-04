export interface SymptomReport {
  id: string;
  nickname?: string;
  country: string;
  pinCode: string;
  symptoms: string[];
  illnessType: 'flu' | 'dengue' | 'covid' | 'malaria' | 'typhoid' | 'chikungunya' | 'unknown' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  createdAt: string;
  latitude?: number;
  longitude?: number;
}

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  symptoms?: string[];
  targetDiseases?: string[];
  seasonalRelevance?: string[];
}

export interface Disease {
  id: string;
  name: string;
  scientificName?: string;
  category: string;
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  transmissionMethod: string[];
  commonSymptoms: string[];
  incubationPeriod: string;
  treatmentOptions: string[];
  preventionMethods: string[];
  seasonalPattern: string;
  endemicRegions: string[];
}

export interface Region {
  id: string;
  country: string;
  stateProvince?: string;
  city?: string;
  pinCode: string;
  latitude?: number;
  longitude?: number;
  climateZone: string;
  populationDensity: string;
}

export interface DiseaseRisk {
  diseaseName: string;
  severityLevel: string;
  prevalenceLevel: string;
  seasonalPeak: string[];
  riskFactors: string[];
}

export interface MapDataPoint {
  lat: number;
  lng: number;
  intensity: number;
  reports: SymptomReport[];
}

export interface LocationData {
  country: string;
  pinCode: string;
  latitude?: number;
  longitude?: number;
}

export interface SocketMessage {
  type: 'new_report' | 'update_map' | 'health_tip' | 'disease_alert';
  data: any;
}

export interface HealthAggregate {
  country: string;
  pinCode: string;
  totalReports: number;
  severeCases: number;
  moderateCases: number;
  mildCases: number;
  covidCases: number;
  fluCases: number;
  dengueCases: number;
  malariaCases: number;
  typhoidCases: number;
  avgLatitude: number;
  avgLongitude: number;
  lastReport: string;
} 