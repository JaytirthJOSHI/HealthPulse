import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { useSocket } from '../contexts/SocketContext';
import { SymptomReport as SymptomReportType, HealthTip } from '../types';
import { Activity, MapPin, User, AlertTriangle, CheckCircle, Heart } from 'lucide-react';

const SymptomReport: React.FC = () => {
  const navigate = useNavigate();
  const { addReport, getHealthTip } = useSupabase();
  const { sendMessage } = useSocket();
  
  const [formData, setFormData] = useState({
    nickname: '',
    country: '',
    pinCode: '',
    symptoms: [] as string[],
    illnessType: 'unknown' as const,
    severity: 'mild' as const,
  });
  
  const [healthTip, setHealthTip] = useState<HealthTip | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableSymptoms = [
    'Fever', 'Cough', 'Sore throat', 'Headache', 'Fatigue',
    'Body aches', 'Runny nose', 'Nausea', 'Diarrhea', 'Loss of taste/smell',
    'Shortness of breath', 'Chest pain', 'Dizziness', 'Chills', 'Sweating'
  ];

  const illnessTypes = [
    { value: 'flu', label: 'Flu/Common Cold' },
    { value: 'dengue', label: 'Dengue' },
    { value: 'covid', label: 'COVID-19' },
    { value: 'malaria', label: 'Malaria' },
    { value: 'typhoid', label: 'Typhoid' },
    { value: 'chikungunya', label: 'Chikungunya' },
    { value: 'other', label: 'Other' },
    { value: 'unknown', label: 'Unknown' },
  ];

  const severityLevels = [
    { value: 'mild', label: 'Mild', color: 'text-green-600' },
    { value: 'moderate', label: 'Moderate', color: 'text-yellow-600' },
    { value: 'severe', label: 'Severe', color: 'text-red-600' },
  ];

  const handleSymptomToggle = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.country || !formData.pinCode) {
        throw new Error('Please fill in your location details');
      }

      if (formData.symptoms.length === 0) {
        throw new Error('Please select at least one symptom');
      }

      // Get coordinates from PIN code (simplified - in real app, use geocoding service)
      const coordinates = await getCoordinatesFromPinCode(formData.pinCode);

      const report: Omit<SymptomReportType, 'id' | 'createdAt'> = {
        nickname: formData.nickname || undefined,
        country: formData.country,
        pinCode: formData.pinCode,
        symptoms: formData.symptoms,
        illnessType: formData.illnessType,
        severity: formData.severity,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
      };

      await addReport(report);

      // Send real-time update
      sendMessage({
        type: 'new_report',
        data: report
      });

      // Get health tip
      const tip = await getHealthTip(formData.symptoms);
      setHealthTip(tip);

      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          nickname: '',
          country: '',
          pinCode: '',
          symptoms: [],
          illnessType: 'unknown',
          severity: 'mild',
        });
        setHealthTip(null);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  // Simplified geocoding - in real app, use a proper geocoding service
  const getCoordinatesFromPinCode = async (pinCode: string) => {
    // This is a mock implementation
    // In a real app, you would use a geocoding service like Google Maps API
    const mockCoordinates = {
      '400001': { latitude: 19.0760, longitude: 72.8777 }, // Mumbai
      '110001': { latitude: 28.6139, longitude: 77.2090 }, // Delhi
      '700001': { latitude: 22.5726, longitude: 88.3639 }, // Kolkata
      '600001': { latitude: 13.0827, longitude: 80.2707 }, // Chennai
    };

    return mockCoordinates[pinCode as keyof typeof mockCoordinates] || null;
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Report Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for contributing to community health monitoring.
          </p>
          
          {healthTip && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Health Tip from Dr. Fatafat
              </h3>
              <p className="text-blue-800">{healthTip.content}</p>
            </div>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            View Health Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Report Symptoms
          </h1>
          <p className="text-gray-600">
            Help your community by anonymously reporting your symptoms
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., India"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 400001"
                  required
                />
              </div>
            </div>
          </div>

          {/* Optional Nickname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Nickname (Optional)
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Choose a nickname or leave anonymous"
            />
          </div>

          {/* Symptoms Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Your Symptoms
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSymptoms.map((symptom) => (
                <label key={symptom} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.symptoms.includes(symptom)}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Illness Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of Illness (if known)
            </label>
            <select
              value={formData.illnessType}
              onChange={(e) => setFormData(prev => ({ ...prev, illnessType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {illnessTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {severityLevels.map((level) => (
                <label key={level.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="severity"
                    value={level.value}
                    checked={formData.severity === level.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className={`text-sm font-medium ${level.color}`}>
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Report'
            )}
          </button>
        </form>

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <Heart className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Privacy & Anonymity
              </h4>
              <p className="text-sm text-gray-600">
                Your report is completely anonymous. We only collect location data at the PIN code level, 
                not your exact address. Your nickname is optional and can be anything you choose.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomReport;