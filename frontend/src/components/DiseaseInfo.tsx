import React, { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useToast } from '../contexts/ToastContext';
import { AlertTriangle, MapPin, Shield, Thermometer, TrendingUp, AlertCircle } from 'lucide-react';
import { DiseaseRisk, HealthAggregate } from '../types';
import { Helmet } from 'react-helmet-async';

const DiseaseInfo: React.FC = () => {
  const { diseases, getDiseaseRisk, getHealthAggregates } = useSupabase();
  const { showError, showInfo } = useToast();
  const [selectedPinCode, setSelectedPinCode] = useState('400001'); // Default to Mumbai
  const [diseaseRisks, setDiseaseRisks] = useState<DiseaseRisk[]>([]);
  const [healthAggregates, setHealthAggregates] = useState<HealthAggregate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      const risks = await getDiseaseRisk(selectedPinCode);
      setDiseaseRisks(risks || []);
      if (risks && risks.length > 0) {
        showInfo(`Loaded ${risks.length} disease risks for ${selectedPinCode}`);
      }
    } catch (error) {
      console.error('Failed to load disease risk:', error);
      setError('Failed to load disease risk data. Please try again.');
      showError('Failed to load disease risk data', 'Please check your connection and try again');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthAggregates = async () => {
    try {
      const aggregates = await getHealthAggregates();
      setHealthAggregates(aggregates || []);
    } catch (error) {
      console.error('Failed to load health aggregates:', error);
      showError('Failed to load health statistics', 'Some data may not be available');
    }
  };

  useEffect(() => {
    loadDiseaseRisk();
    loadHealthAggregates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPinCode]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPrevalenceColor = (prevalence: string) => {
    switch (prevalence?.toLowerCase()) {
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

  // Add MedicalCondition structured data for all diseases
  const allMedicalConditionJsonLd = (diseases || []).map((disease) => ({
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    "name": disease.name,
    "description": disease.scientificName || disease.name,
    "alternateName": disease.scientificName,
    "cause": disease.transmissionMethod?.join(', '),
    "possibleTreatment": disease.treatmentOptions?.join(', '),
    "signOrSymptom": disease.commonSymptoms?.join(', '),
    "preventionIndication": disease.preventionMethods?.join(', '),
    "typicalTest": disease.incubationPeriod,
    "associatedAnatomy": disease.category,
    "epidemiology": disease.seasonalPattern,
    "mainEntityOfPage": "https://healthsathi.org/pulse/diseases"
  }));

  // Fallback data for when API fails
  const fallbackDiseaseRisks: DiseaseRisk[] = [
    {
      diseaseName: 'Dengue Fever',
      severityLevel: 'high',
      prevalenceLevel: 'high',
      seasonalPeak: ['monsoon', 'post_monsoon'],
      riskFactors: ['Standing water', 'High population density', 'Poor drainage']
    },
    {
      diseaseName: 'COVID-19',
      severityLevel: 'medium',
      prevalenceLevel: 'medium',
      seasonalPeak: ['winter'],
      riskFactors: ['Crowded places', 'Poor ventilation', 'Close contact']
    }
  ];

  const fallbackHealthAggregates: HealthAggregate[] = [
    {
      country: 'India',
      pinCode: '400001',
      totalReports: 150,
      severeCases: 12,
      moderateCases: 45,
      mildCases: 93,
      dengueCases: 25,
      covidCases: 45,
      fluCases: 30,
      malariaCases: 15,
      typhoidCases: 20,
      avgLatitude: 19.076,
      avgLongitude: 72.8777,
      lastReport: new Date().toISOString()
    }
  ];

  const displayDiseaseRisks = error ? fallbackDiseaseRisks : (diseaseRisks || []);
  const displayHealthAggregates = healthAggregates || fallbackHealthAggregates;

  return (
    <>
      <Helmet>
        <title>Disease Information - HealthSathi's Pulse</title>
        <meta name="description" content="Explore disease information, symptoms, and health trends with HealthSathi's Pulse. Stay informed and help your community." />
        {allMedicalConditionJsonLd.map((jsonLd, idx) => (
          <script key={idx} type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        ))}
      </Helmet>
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disease Information & Regional Health</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Comprehensive disease database and regional health insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              Current Season: {currentSeason}
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Location Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
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
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-medium text-sm">{location.city}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{location.state}</div>
              <div className="text-xs font-mono text-gray-400 dark:text-gray-500">{location.code}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Disease Risk Assessment */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Disease Risk Assessment
          {error && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">(Showing sample data)</span>}
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayDiseaseRisks.map((risk, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{risk.diseaseName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(risk.severityLevel)}`}>
                    {risk.severityLevel}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Prevalence:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrevalenceColor(risk.prevalenceLevel)}`}>
                      {risk.prevalenceLevel}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Seasonal Peak:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(risk.seasonalPeak || []).map((season, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            season === currentSeason
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {season}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Risk Factors:</span>
                    <div className="mt-1">
                      {(risk.riskFactors || []).map((factor, idx) => (
                        <div key={idx} className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></span>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
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
              <div key={disease.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{disease.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(disease.severityLevel)}`}>
                    {disease.severityLevel}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Category:</span>
                    <span className="ml-2 font-medium capitalize">{disease.category?.replace('_', ' ') || 'Unknown'}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Transmission:</span>
                    <div className="mt-1">
                      {(disease.transmissionMethod || []).map((method, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs mr-1 mb-1">
                          {method?.replace('_', ' ') || method}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Common Symptoms:</span>
                    <div className="mt-1">
                      {(disease.commonSymptoms || []).slice(0, 3).map((symptom, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs mr-1 mb-1">
                          {symptom}
                        </span>
                      ))}
                      {(disease.commonSymptoms || []).length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">+{(disease.commonSymptoms || []).length - 3} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Prevention:</span>
                    <div className="mt-1">
                      {(disease.preventionMethods || []).slice(0, 2).map((method, idx) => (
                        <div key={idx} className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <span className="w-1 h-1 bg-green-400 dark:bg-green-500 rounded-full mr-2"></span>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Regional Health Statistics
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayHealthAggregates.slice(0, 6).map((aggregate, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{aggregate.pinCode}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{aggregate.country}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Reports:</span>
                  <span className="font-medium">{aggregate.totalReports}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Severe Cases:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{aggregate.severeCases}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Dengue Cases:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">{aggregate.dengueCases}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">COVID Cases:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{aggregate.covidCases}</span>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Last report: {new Date(aggregate.lastReport).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default DiseaseInfo;