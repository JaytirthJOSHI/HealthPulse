import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { Helmet } from 'react-helmet-async';
import { useSupabase } from '../contexts/SupabaseContext';
import { MapDataPoint, SymptomReport } from '../types';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const HelmetWrapper = Helmet as any;

const HealthMap: React.FC = () => {
  const { reports } = useSupabase();
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [timeFilter] = useState<number>(7);

  // Convert reports to map data points with time filtering
  useEffect(() => {
    console.log('HealthMap: Received reports:', reports.length);
    console.log('HealthMap: Sample report:', reports[0]);
    
    const filteredReports = reports.filter(report => {
        if (!report.latitude || !report.longitude) {
          console.log('HealthMap: Filtering out report without lat/lng:', report);
          return false; // Ensure lat/lng exist
        }
        // For demo data, show all reports regardless of date
        if (report.createdAt && report.createdAt.includes('1969')) {
          console.log('HealthMap: Including demo data report:', report);
          return true;
        }
        // For real data, apply time filter
        const reportDate = new Date(report.createdAt);
        const timeDiff = new Date().getTime() - reportDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        console.log('HealthMap: Report date check:', report.createdAt, 'days diff:', daysDiff);
        return daysDiff <= timeFilter;
    });

    console.log('HealthMap: Filtered reports:', filteredReports.length);

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
    console.log('Map data points sample:', dataPoints[0]);
    setMapData(dataPoints);
  }, [reports, timeFilter]);

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

  return (
    <>
      <HelmetWrapper>
        <title>Health Map - Real-time Disease Outbreak Tracking | HealthSathi's Pulse</title>
        <meta name="description" content="Interactive health map showing real-time disease outbreaks and symptom reports worldwide. Track health trends and community health data with HealthSathi's Pulse." />
        <meta name="keywords" content="health map, disease tracking, outbreak map, real-time health data, community health monitoring, HealthSathi's Pulse" />
      </HelmetWrapper>
      
      <div className="h-full w-full relative z-0">
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
    </>
  );
};

export default HealthMap;