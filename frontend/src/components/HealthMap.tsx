import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { Helmet } from 'react-helmet-async';
import { useSupabase } from '../contexts/SupabaseContext';
import { useRealTime } from '../contexts/RealTimeContext';
import { MapDataPoint, SymptomReport } from '../types';
import { Activity, Users, AlertTriangle, TrendingUp, MapPin, Globe } from 'lucide-react';
import WHOStats from './WHOStats';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const HelmetWrapper = Helmet as any;

const HealthMap: React.FC = () => {
  const { reports, loading, getHealthAggregates } = useSupabase();
  const { connected } = useRealTime();
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [aggregates, setAggregates] = useState<any[]>([]);
  const [locationReports, setLocationReports] = useState<SymptomReport[]>([]);
  const [timeFilter] = useState<number>(7);

  // Convert reports to map data points with time filtering
  useEffect(() => {
    const filteredReports = reports.filter(report => {
        if (!report.latitude || !report.longitude) return false; // Ensure lat/lng exist
        // For demo data, show all reports regardless of date
        if (report.createdAt && report.createdAt.includes('1969')) {
          return true;
        }
        // For real data, apply time filter
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
    console.log('Map data points:', dataPoints.length, 'from', reports.length, 'reports');
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
    return Math.max(8, Math.min(25, intensity * 20));
  };

  const handleMarkerClick = (dataPoint: MapDataPoint) => {
    setLocationReports(dataPoint.reports);
  };

  return (
    <>
      <HelmetWrapper>
        <title>Health Map - Real-time Disease Outbreak Tracking | HealthSathi's Pulse</title>
        <meta name="description" content="Interactive health map showing real-time disease outbreaks and symptom reports worldwide. Track health trends and community health data with HealthSathi's Pulse." />
        <meta name="keywords" content="health map, disease tracking, outbreak map, real-time health data, community health monitoring, HealthSathi's Pulse" />
      </HelmetWrapper>
      
      <section className="space-y-6" aria-label="Global Health Map">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
            <Globe className="w-8 h-8 mr-3 text-primary-600" aria-hidden="true" />
            Global Health Map
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real-time visualization of health reports and disease outbreaks across the globe. 
            Click on markers to view detailed reports for each area.
        </p>
        </header>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <Activity className="w-4 h-4 mr-2 animate-spin" />
              Loading health data...
            </div>
          </div>
        )}

        {/* Real-time connection status - disabled for API-based data */}
        {false && !connected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                Real-time updates are currently offline. Data will refresh every minute.
            </span>
        </div>
      </div>
        )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Map Container */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden" aria-label="Map Container">
          <div className="h-96 w-full">
            <MapContainer
              center={[20, 0]} // World view
              zoom={2}
              minZoom={1}
              maxZoom={18}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
                aria-label="Health Map"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> & OpenStreetMap contributors'
              />
              <MarkerClusterGroup>
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
                    aria-label={`Health reports: ${dataPoint.reports.length} reports in this area`}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                      <span className="font-semibold text-xs text-gray-900">{dataPoint.reports.length} reports</span>
                    </Tooltip>
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Health Reports: {dataPoint.reports.length}
                        </h3>
                        <div className="text-sm text-gray-600">
                          Illness: {dataPoint.reports[0]?.illnessType || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Lat: {dataPoint.lat.toFixed(3)}, Lng: {dataPoint.lng.toFixed(3)}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </div>
        </div>

        {/* Reports Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-96 overflow-y-auto" aria-label="Reports Panel">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
              <MapPin className="w-5 h-5 mr-2 text-primary-600" aria-hidden="true" />
            {locationReports.length > 0 ? `Reports for this Area` : 'Select an Area'}
          </h2>
          {locationReports.length > 0 ? (
            <div className="space-y-3">
              {locationReports.map((report, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Illness: {report.illnessType}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {report.country ? `Country: ${report.country}` : ''}
                    {report.createdAt ? ` | Date: ${new Date(report.createdAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Click on a circle on the map to see reports for that area.</p>
          )}
        </div>
      </div>
      
      {aggregates.length > 0 && (
          <section className="mt-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Global Health Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
              <Users className="mx-auto h-8 w-8 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{aggregates.find(a => a.metric === 'total_reports')?.value || 0}</p>
              <p className="text-gray-500">Total Reports</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
              <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
              <p className="text-2xl font-bold">{aggregates.find(a => a.metric === 'active_countries')?.value || 0}</p>
              <p className="text-gray-500">Active Countries</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
              <Activity className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{aggregates.find(a => a.metric === 'most_reported_illness')?.value || 'N/A'}</p>
              <p className="text-gray-500">Top Illness</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
              <TrendingUp className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-2xl font-bold">{aggregates.find(a => a.metric === 'reports_in_last_24h')?.value || 0}</p>
              <p className="text-gray-500">Reports (24h)</p>
          </div>
        </div>
          </section>
      )}
      <WHOStats />
        {/* Community/Users Section - Responsive Enhancements */}
        <section className="mt-8">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6 md:gap-8">
            {/* Animated User Count */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-center mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center md:justify-start">
                <Users className="w-7 h-7 text-indigo-600 mr-2 animate-bounce" aria-hidden="true" />
                <span>Our Community</span>
              </h2>
              <div className="text-4xl font-extrabold text-primary-700 flex items-center justify-center md:justify-start">
                <span id="user-count" className="transition-all duration-700">{aggregates.find(a => a.metric === 'total_users')?.value || 1247}</span>
                <span className="ml-2 text-lg font-medium text-gray-500">users</span>
              </div>
              <p className="text-gray-600 mt-2 max-w-md mx-auto md:mx-0">Join thousands of people who are helping track and improve community health in real time!</p>
            </div>
            {/* Avatars Grid - Responsive */}
            <div className="flex-1 flex flex-wrap justify-center md:justify-end gap-2 md:gap-3 max-w-xs md:max-w-none mx-auto md:mx-0">
              {[...Array(12)].map((_, i) => (
                <img
                  key={i}
                  src={`https://api.dicebear.com/7.x/thumbs/svg?seed=user${i+1}`}
                  alt="Community member avatar"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-200 bg-gray-100"
                  loading="lazy"
                />
              ))}
            </div>
    </div>
        </section>
      </section>
    </>
  );
};

export default HealthMap;