export interface SymptomReport {
  id: string;
  nickname?: string;
  country: string;
  pinCode: string;
  symptoms: string[];
  illnessType: 'flu' | 'dengue' | 'covid' | 'unknown' | 'other';
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
  type: 'new_report' | 'update_map' | 'health_tip';
  data: any;
} 