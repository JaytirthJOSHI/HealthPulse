import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useSupabase } from '../contexts/SupabaseContext';
import { useSocket } from '../contexts/SocketContext';
import { MapDataPoint, SymptomReport } from '../types';
import { Activity, Users, AlertTriangle } from 'lucide-react';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const HealthMap: React.FC = () => {
  const { reports, loading } = useSupabase();
  const { connected } = useSocket();
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [locationReports, setLocationReports] = useState<SymptomReport[]>([]);

  // Convert reports to map data points
  useEffect(() => {
    const dataPoints = new Map<string, MapDataPoint>();

    reports.forEach((report) => {
      if (report.latitude && report.longitude) {
        const key = `${report.latitude},${report.longitude}`;
        
        if (dataPoints.has(key)) {
          const existing = dataPoints.get(key)!;
          existing.reports.push(report);
          existing.intensity = Math.min(existing.intensity + 1, 10);
        } else {
          dataPoints.set(key, {
            lat: report.latitude,
            lng: report.longitude,
            intensity: 1,
            reports: [report],
          });
        }
      }
    });

    setMapData(Array.from(dataPoints.values()));
  }, [reports]);

  const getColorByIntensity = (intensity: number) => {
    if (intensity <= 2) return '#10b981'; // Green
    if (intensity <= 5) return '#f59e0b'; // Yellow
    if (intensity <= 8) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getRadiusByIntensity = (intensity: number) => {
    return Math.max(8, Math.min(30, intensity * 3));
  };

  const handleMarkerClick = (dataPoint: MapDataPoint) => {
    setSelectedLocation(`${dataPoint.lat}, ${dataPoint.lng}`);
    setLocationReports(dataPoint.reports);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Heatmap</h1>
            <p className="text-gray-600 mt-1">
              Real-time health trends in your area
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Low</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">High</span>
            </div>
          </div>
        </div>
        
        {/* Connection status */}
        <div className="mt-4 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {connected ? 'Live updates enabled' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-96 w-full">
          <MapContainer
            center={[20.5937, 78.9629]} // India center
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {mapData.map((dataPoint, index) => (
              <CircleMarker
                key={index}
                center={[dataPoint.lat, dataPoint.lng]}
                radius={getRadiusByIntensity(dataPoint.intensity)}
                fillColor={getColorByIntensity(dataPoint.intensity)}
                color={getColorByIntensity(dataPoint.intensity)}
                weight={2}
                opacity={0.8}
                fillOpacity={0.6}
                eventHandlers={{
                  click: () => handleMarkerClick(dataPoint),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Health Reports: {dataPoint.reports.length}
                    </h3>
                    <div className="space-y-1">
                      {dataPoint.reports.slice(0, 3).map((report, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          {report.nickname || 'Anonymous'} - {report.illnessType}
                        </div>
                      ))}
                      {dataPoint.reports.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{dataPoint.reports.length - 3} more reports
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Selected Location Details */}
      {selectedLocation && locationReports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reports for {selectedLocation}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locationReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {report.nickname || 'Anonymous'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.severity === 'mild' ? 'bg-green-100 text-green-800' :
                    report.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Illness:</span> {report.illnessType}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Symptoms:</span> {report.symptoms.join(', ')}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Areas</p>
              <p className="text-2xl font-bold text-gray-900">{mapData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk Areas</p>
              <p className="text-2xl font-bold text-gray-900">
                {mapData.filter(d => d.intensity > 5).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMap; 