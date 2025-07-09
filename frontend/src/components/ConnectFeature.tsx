import React, { useState, useEffect } from 'react';
import { Users, X, MessageCircle, MapPin, Calendar, Heart, Eye, EyeOff } from 'lucide-react';

interface HealthReport {
  id: string;
  nickname?: string;
  country: string;
  pin_code: string;
  symptoms: string[];
  illness_type: string;
  severity: string;
  latitude?: number;
  longitude?: number;
  phone_number?: string;
  created_at: string;
}

interface ConnectFeatureProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const ConnectFeature: React.FC<ConnectFeatureProps> = ({ isEnabled, onToggle }) => {
  const [randomReport, setRandomReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const fetchRandomReport = async () => {
    setLoading(true);
    try {
      // Fetch from backend API
      const response = await fetch('/api/reports');
      const reports = await response.json();
      
      if (reports && reports.length > 0) {
        // Get a random report (excluding the current user's reports if we had user auth)
        const randomIndex = Math.floor(Math.random() * reports.length);
        setRandomReport(reports[randomIndex]);
      }
    } catch (error) {
      console.error('Error fetching random report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEnabled) {
      fetchRandomReport();
    }
  }, [isEnabled]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIllnessIcon = (illnessType: string) => {
    const illnessLower = illnessType.toLowerCase();
    if (illnessLower.includes('fever')) return '🌡️';
    if (illnessLower.includes('cough') || illnessLower.includes('cold')) return '🤧';
    if (illnessLower.includes('headache')) return '🤕';
    if (illnessLower.includes('stomach') || illnessLower.includes('nausea')) return '🤢';
    if (illnessLower.includes('fatigue') || illnessLower.includes('tired')) return '😴';
    if (illnessLower === 'flu') return '🤧';
    if (illnessLower === 'covid') return '🦠';
    if (illnessLower === 'dengue') return '🦟';
    if (illnessLower === 'malaria') return '🦟';
    if (illnessLower === 'typhoid') return '🤢';
    return '🤒';
  };

  if (!isEnabled) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => onToggle(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 group"
        >
          <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Connect with Someone</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Connect</h3>
          </div>
          <button
            onClick={() => onToggle(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : randomReport ? (
            <div className="space-y-4">
              {/* Random User Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {randomReport.country.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {randomReport.nickname || `Someone in ${randomReport.country}`}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Reported {formatDate(randomReport.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl">
                    {getIllnessIcon(randomReport.illness_type)}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Illness:</span> {randomReport.illness_type}
                  </p>
                  {randomReport.symptoms && randomReport.symptoms.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium">Symptoms:</span> {randomReport.symptoms.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </span>
                </button>
                <button
                  onClick={fetchRandomReport}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Next Person</span>
                </button>
              </div>

              {/* Additional Details */}
              {showDetails && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>Location: {randomReport.country} ({randomReport.pin_code})</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Reported: {formatDate(randomReport.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Heart className="w-4 h-4" />
                    <span>Health concern shared</span>
                  </div>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                This is anonymous data. No personal information is shared.
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No reports available</p>
              <button
                onClick={fetchRandomReport}
                className="mt-3 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectFeature; 