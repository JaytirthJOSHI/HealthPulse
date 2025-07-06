import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useSupabase } from '../contexts/SupabaseContext';
import { useRealTime } from '../contexts/RealTimeContext';
import { MapDataPoint, SymptomReport } from '../types';
import { Activity, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import WHOStats from './WHOStats';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const HealthMap: React.FC = () => {
  const { reports, loading, getHealthAggregates } = useSupabase();
  const { connected } = useRealTime();
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [aggregates, setAggregates] = useState<any[]>([]);
  const [locationReports, setLocationReports] = useState<SymptomReport[]>([]);
  const [timeFilter] = useState<number>(7); // Days to show

  // Convert reports to map data points with time filtering
  useEffect(() => {
    const filteredReports = reports.filter(report => {
        if (!report.latitude || !report.longitude) return false; // Ensure lat/lng exist
        const reportDate = new Date(report.createdAt);
        const timeDiff = new Date().getTime() - reportDate.getTime();
        return timeDiff / (1000 * 3600 * 24) <= timeFilter;
    });

    const groupedByLocation: { [key: string]: SymptomReport[] } = filteredReports.reduce((acc, report) => {
        const key = `${report.latitude!.toFixed(3)},${report.longitude!.toFixed(3)}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(report);
        return acc;
    }, {} as { [key: string]: SymptomReport[] });

    const dataPoints: MapDataPoint[] = Object.values(groupedByLocation).map(group => {
        const reportCount = group.length;
        // Simple intensity logic (can be improved)
        const intensity = Math.min(reportCount / 10, 1.0);
        return {
            lat: group[0].latitude!,
            lng: group[0].longitude!,
            intensity: intensity,
            reports: group
        };
    });
    setMapData(dataPoints);
  }, [reports, timeFilter]);

  // Fetch aggregate data
  useEffect(() => {
    const fetchAggregates = async () => {
        const data = await getHealthAggregates();
        setAggregates(data);
    };
    fetchAggregates();

    const interval = setInterval(fetchAggregates, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [getHealthAggregates]);

  const getColorByIntensity = (intensity: number) => {
    if (intensity > 0.8) return '#b91c1c'; // red-800
    if (intensity > 0.6) return '#ef4444'; // red-500
    if (intensity > 0.4) return '#f97316'; // orange-500
    if (intensity > 0.2) return '#facc15'; // yellow-400
    return '#a3e635'; // lime-400
  };

  const getRadiusByIntensity = (intensity: number) => {
    return 5 + intensity * 20;
  };

  const handleMarkerClick = (dataPoint: MapDataPoint) => {
    setLocationReports(dataPoint.reports);
  };

  if (loading) {
    return <div className="text-center p-8">Loading map data...</div>;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Real-time Health Map</h1>
        <p className="text-gray-600">
          Visualizing community-reported symptoms. Darker areas indicate a higher concentration of reports.
        </p>
        <div className="mt-2 text-sm text-gray-500">
            Connection Status:
            <span className={`ml-2 font-semibold ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {connected ? 'Connected' : 'Disconnected'}
            </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-96 w-full">
            <MapContainer
              center={[39.8283, -98.5795]} // USA center
              zoom={4}
              minZoom={1}
              maxZoom={18}
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

        {/* Reports Panel */}
        <div className="bg-white rounded-lg shadow-sm p-4 h-96 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">
            {locationReports.length > 0 ? `Reports for this Area` : 'Select an Area'}
          </h2>
          {locationReports.length > 0 ? (
            <div className="space-y-3">
              {locationReports.map((report) => (
                <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-800">{report.illnessType}</p>
                  <p className="text-sm text-gray-600">Symptoms: {report.symptoms.join(', ')}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Reported by {report.nickname || 'Anonymous'} on {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Click on a circle on the map to see individual reports.</p>
          )}
        </div>
      </div>
      
      {aggregates.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
              <Users className="mx-auto h-8 w-8 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{aggregates.find(a => a.metric === 'total_reports')?.value || 0}</p>
              <p className="text-gray-500">Total Reports</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
              <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
              <p className="text-2xl font-bold">{aggregates.find(a => a.metric === 'active_pin_codes')?.value || 0}</p>
              <p className="text-gray-500">Active Areas</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
              <Activity className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{aggregates.find(a => a.metric === 'most_reported_symptom')?.value || 'N/A'}</p>
              <p className="text-gray-500">Top Symptom</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
              <TrendingUp className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-2xl font-bold">{aggregates.find(a => a.metric === 'reports_in_last_24h')?.value || 0}</p>
              <p className="text-gray-500">Reports (24h)</p>
          </div>
        </div>
      )}
      <WHOStats />
    </div>
  );
};

export default HealthMap;