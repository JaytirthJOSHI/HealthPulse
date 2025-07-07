import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, BarChart3, Calendar, Brain, Activity } from 'lucide-react';

interface PredictiveAnalyticsProps {
  className?: string;
}

interface AnalyticsData {
  outbreak?: any;
  trends?: any;
  seasonal?: any;
  risk?: any;
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('outbreak');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData>({});
  const [error, setError] = useState('');
  const [location, setLocation] = useState('India');
  const [timeframe, setTimeframe] = useState('30');

  const tabs = [
    { id: 'outbreak', label: 'Outbreak Prediction', icon: AlertTriangle },
    { id: 'trends', label: 'Health Trends', icon: TrendingUp },
    { id: 'seasonal', label: 'Seasonal Patterns', icon: Calendar },
    { id: 'risk', label: 'Risk Assessment', icon: Brain }
  ];

  useEffect(() => {
    loadAnalytics();
  }, [activeTab, location, timeframe]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError('');

    try {
      let response;
      let endpoint = '';

      switch (activeTab) {
        case 'outbreak':
          endpoint = `/api/analytics/outbreak-prediction?location=${location}&timeframe=${timeframe}`;
          break;
        case 'trends':
          endpoint = `/api/analytics/health-trends?period=${timeframe}`;
          break;
        case 'seasonal':
          endpoint = `/api/analytics/seasonal-patterns?location=${location}`;
          break;
        case 'risk':
          // Risk assessment requires user input, so we'll load a default assessment
          endpoint = `/api/analytics/risk-assessment`;
          break;
      }

      if (endpoint) {
        response = await fetch(`https://healthpulse-api.healthsathi.workers.dev${endpoint}`, {
          method: activeTab === 'risk' ? 'POST' : 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: activeTab === 'risk' ? JSON.stringify({
            location: location,
            symptoms: [],
            medicalHistory: [],
            age: '30',
            gender: 'unknown'
          }) : undefined,
        });

        if (response.ok) {
          const result = await response.json();
          setData(prev => ({ ...prev, [activeTab]: result }));
        } else {
          throw new Error('Failed to load analytics data');
        }
      }
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
      console.error('Analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderOutbreakPrediction = () => {
    const outbreakData = data.outbreak;
    if (!outbreakData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${getRiskColor(outbreakData.prediction?.risk)}`}>
            <h3 className="font-semibold mb-2">Outbreak Risk</h3>
            <p className="text-2xl font-bold">{outbreakData.prediction?.risk || 'Unknown'}</p>
          </div>
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <h3 className="font-semibold mb-2">Confidence</h3>
            <p className={`text-2xl font-bold ${getConfidenceColor(outbreakData.confidence || 0)}`}>
              {((outbreakData.confidence || 0) * 100).toFixed(0)}%
            </p>
          </div>
          <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
            <h3 className="font-semibold mb-2">Timeline</h3>
            <p className="text-lg font-semibold">{outbreakData.prediction?.timeline || 'Unknown'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Key Indicators
            </h3>
            <ul className="space-y-2">
              {outbreakData.prediction?.indicators?.map((indicator: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm">{indicator}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {outbreakData.prediction?.recommendations?.map((rec: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Data Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Reports:</span>
              <p className="font-semibold">{outbreakData.data?.totalReports || 0}</p>
            </div>
            <div>
              <span className="text-gray-600">Timeframe:</span>
              <p className="font-semibold">{outbreakData.data?.timeframe || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <p className="font-semibold">{outbreakData.data?.location || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <p className="font-semibold">{new Date(outbreakData.lastUpdated).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHealthTrends = () => {
    const trendsData = data.trends;
    if (!trendsData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <h3 className="font-semibold mb-2">Total Reports</h3>
            <p className="text-2xl font-bold">{trendsData.trends?.totalReports || 0}</p>
          </div>
          <div className="p-4 rounded-lg border border-green-200 bg-green-50">
            <h3 className="font-semibold mb-2">Daily Average</h3>
            <p className="text-2xl font-bold">{(trendsData.trends?.averageDaily || 0).toFixed(1)}</p>
          </div>
          <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
            <h3 className="font-semibold mb-2">Period</h3>
            <p className="text-lg font-semibold">{trendsData.trends?.period || 'Unknown'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Trend Analysis
            </h3>
            <p className="text-sm text-gray-600 mb-3">{trendsData.insights?.summary}</p>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Key Patterns:</h4>
              <ul className="space-y-1">
                {trendsData.insights?.patterns?.map((pattern: string, index: number) => (
                  <li key={index} className="text-sm flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Top Illnesses
            </h3>
            <div className="space-y-2">
              {trendsData.trends?.topIllnesses?.map((illness: [string, number], index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{illness[0]}</span>
                  <span className="text-sm text-gray-600">{illness[1]} cases</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Predictions & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Future Predictions:</h4>
              <p className="text-sm text-gray-600">{trendsData.insights?.predictions}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
              <ul className="space-y-1">
                {trendsData.insights?.recommendations?.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSeasonalPatterns = () => {
    const seasonalData = data.seasonal;
    if (!seasonalData) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-500" />
            Seasonal Analysis
          </h3>
          <p className="text-sm text-gray-600 mb-4">{seasonalData.insights?.summary}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm mb-2">Peak Periods:</h4>
              <ul className="space-y-1">
                {seasonalData.insights?.peakPeriods?.map((period: string, index: number) => (
                  <li key={index} className="text-sm flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {period}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Risk Factors:</h4>
              <ul className="space-y-1">
                {seasonalData.insights?.riskFactors?.map((factor: string, index: number) => (
                  <li key={index} className="text-sm flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">Preventive Measures</h3>
            <ul className="space-y-2">
              {seasonalData.insights?.preventiveMeasures?.map((measure: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm">{measure}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">Preparation</h3>
            <p className="text-sm text-gray-600">{seasonalData.insights?.preparation}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Seasonal Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {seasonalData.seasonalPatterns?.map((season: any) => (
              <div key={season.season} className="text-center">
                <h4 className="font-medium text-sm">{season.season}</h4>
                <p className="text-lg font-bold">{season.total}</p>
                <p className="text-xs text-gray-600">total cases</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRiskAssessment = () => {
    const riskData = data.risk;
    if (!riskData) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-3 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-indigo-500" />
            Personal Risk Assessment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className={`p-3 rounded-lg border ${getRiskColor(riskData.riskAssessment?.riskLevel)} mb-4`}>
                <h4 className="font-medium mb-1">Overall Risk Level</h4>
                <p className="text-xl font-bold">{riskData.riskAssessment?.riskLevel || 'Unknown'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Risk Factors:</h4>
                <ul className="space-y-1">
                  {riskData.riskAssessment?.riskFactors?.map((factor: string, index: number) => (
                    <li key={index} className="text-sm flex items-start">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
              <ul className="space-y-2">
                {riskData.riskAssessment?.recommendations?.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">Monitoring Suggestions</h3>
            <ul className="space-y-2">
              {riskData.riskAssessment?.monitoring?.map((item: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">Emergency Indicators</h3>
            <ul className="space-y-2">
              {riskData.riskAssessment?.emergencyIndicators?.map((indicator: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm">{indicator}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'outbreak':
        return renderOutbreakPrediction();
      case 'trends':
        return renderHealthTrends();
      case 'seasonal':
        return renderSeasonalPatterns();
      case 'risk':
        return renderRiskAssessment();
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Brain className="w-4 h-4" />
            <span>Powered by AI</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">
          Advanced health analytics using AI to predict outbreaks, analyze trends, and assess risks.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="India">India</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Analyzing health data...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">{error}</div>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default PredictiveAnalytics;