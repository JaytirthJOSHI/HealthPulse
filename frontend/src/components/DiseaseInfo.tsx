import React, { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { AlertTriangle, MapPin, Shield, Thermometer, TrendingUp } from 'lucide-react';
import { DiseaseRisk, HealthAggregate } from '../types';

const DiseaseInfo: React.FC = () => {
  const { diseases, getDiseaseRisk, getHealthAggregates } = useSupabase();
  const [selectedPinCode, setSelectedPinCode] = useState('400001'); // Default to Mumbai
  const [diseaseRisks, setDiseaseRisks] = useState<DiseaseRisk[]>([]);
  const [healthAggregates, setHealthAggregates] = useState<HealthAggregate[]>([]);
  const [loading, setLoading] = useState(false);

  const pinCodes = [
    { code: '400001', city: 'Mumbai', state: 'Maharashtra' },
    { code: '110001', city: 'New Delhi', state: 'Delhi' },
    { code: '700001', city: 'Kolkata', state: 'West Bengal' },
    { code: '600001', city: 'Chennai', state: 'Tamil Nadu' },
    { code: '560001', city: 'Bangalore', state: 'Karnataka' },
    { code: '695001', city: 'Thiruvananthapuram', state: 'Kerala' },
    { code: '380001', city: 'Ahmedabad', state: 'Gujarat' },
    { code: '302001', city: 'Jaipur', state: 'Rajasthan' },
    { code: '226001', city: 'Lucknow', state: 'Uttar Pradesh' },
    { code: '800001', city: 'Patna', state: 'Bihar' },
  ];

  const loadDiseaseRisk = async () => {
    setLoading(true);
    try {
      const risks = await getDiseaseRisk(selectedPinCode);
      setDiseaseRisks(risks);
    } catch (error) {
      console.error('Failed to load disease risk:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHealthAggregates = async () => {
    try {
      const aggregates = await getHealthAggregates();
      setHealthAggregates(aggregates);
    } catch (error) {
      console.error('Failed to load health aggregates:', error);
    }
  };

  useEffect(() => {
    loadDiseaseRisk();
    loadHealthAggregates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPinCode]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPrevalenceColor = (prevalence: string) => {
    switch (prevalence) {
      case 'endemic': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 9) return 'monsoon';
    if (month >= 12 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'summer';
    return 'post_monsoon';
  };

  const currentSeason = getCurrentSeason();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Disease Information & Regional Health</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive disease database and regional health insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 capitalize">
              Current Season: {currentSeason}
            </span>
          </div>
        </div>
      </div>

      {/* Location Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Select Location
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {pinCodes.map((location) => (
            <button
              key={location.code}
              onClick={() => setSelectedPinCode(location.code)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedPinCode === location.code
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{location.city}</div>
              <div className="text-xs text-gray-500">{location.state}</div>
              <div className="text-xs font-mono text-gray-400">{location.code}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Disease Risk Assessment */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Disease Risk Assessment
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(diseaseRisks || []).map((risk, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{risk.diseaseName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(risk.severityLevel)}`}>
                    {risk.severityLevel}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Prevalence:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrevalenceColor(risk.prevalenceLevel)}`}>
                      {risk.prevalenceLevel}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Seasonal Peak:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(risk.seasonalPeak || []).map((season, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            season === currentSeason
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {season}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Risk Factors:</span>
                    <div className="mt-1">
                      {(risk.riskFactors || []).map((factor, idx) => (
                        <div key={idx} className="text-xs text-gray-500 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disease Database */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Disease Database
        </h2>
        
        {!diseases ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(diseases || []).slice(0, 9).map((disease) => (
              <div key={disease.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{disease.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(disease.severityLevel)}`}>
                    {disease.severityLevel}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium capitalize">{disease.category.replace('_', ' ')}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Transmission:</span>
                    <div className="mt-1">
                      {(disease.transmissionMethod || []).map((method, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 bg-gray-100 rounded text-xs mr-1 mb-1">
                          {method.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Common Symptoms:</span>
                    <div className="mt-1">
                      {(disease.commonSymptoms || []).slice(0, 3).map((symptom, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-1 mb-1">
                          {symptom}
                        </span>
                      ))}
                      {(disease.commonSymptoms || []).length > 3 && (
                        <span className="text-xs text-gray-500">+{(disease.commonSymptoms || []).length - 3} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Prevention:</span>
                    <div className="mt-1">
                      {(disease.preventionMethods || []).slice(0, 2).map((method, idx) => (
                        <div key={idx} className="text-xs text-gray-500 flex items-center">
                          <span className="w-1 h-1 bg-green-400 rounded-full mr-2"></span>
                          {method}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health Aggregates */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Regional Health Statistics
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(healthAggregates || []).slice(0, 6).map((aggregate, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
                             <div className="flex items-center justify-between mb-3">
                 <h3 className="font-semibold text-gray-900">{aggregate.pinCode}</h3>
                 <span className="text-sm text-gray-500">{aggregate.country}</span>
               </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reports:</span>
                  <span className="font-medium">{aggregate.totalReports}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Severe Cases:</span>
                  <span className="font-medium text-red-600">{aggregate.severeCases}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Dengue Cases:</span>
                  <span className="font-medium text-orange-600">{aggregate.dengueCases}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">COVID Cases:</span>
                  <span className="font-medium text-blue-600">{aggregate.covidCases}</span>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  Last report: {new Date(aggregate.lastReport).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiseaseInfo;