import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { Helmet } from 'react-helmet-async';

import { SymptomReport as SymptomReportType, HealthTip } from '../types';
import { Activity, MapPin, User, AlertTriangle, CheckCircle, Heart, Loader2, Check, X } from 'lucide-react';

// Country data with postal code formats
const countries = [
  { code: 'IN', name: 'India', postalFormat: 'PIN Code (6 digits)', example: '400001' },
  { code: 'US', name: 'United States', postalFormat: 'ZIP Code (5 digits)', example: '10001' },
  { code: 'CA', name: 'Canada', postalFormat: 'Postal Code (A1A 1A1)', example: 'M5V 3A8' },
  { code: 'GB', name: 'United Kingdom', postalFormat: 'Postcode (AA1A 1AA)', example: 'SW1A 1AA' },
  { code: 'AU', name: 'Australia', postalFormat: 'Postcode (4 digits)', example: '2000' },
  { code: 'DE', name: 'Germany', postalFormat: 'Postal Code (5 digits)', example: '10115' },
  { code: 'FR', name: 'France', postalFormat: 'Postal Code (5 digits)', example: '75001' },
  { code: 'JP', name: 'Japan', postalFormat: 'Postal Code (3-5 digits)', example: '100-0001' },
  { code: 'BR', name: 'Brazil', postalFormat: 'CEP (8 digits)', example: '20040-007' },
  { code: 'MX', name: 'Mexico', postalFormat: 'Postal Code (5 digits)', example: '06000' },
  { code: 'IT', name: 'Italy', postalFormat: 'CAP (5 digits)', example: '00100' },
  { code: 'ES', name: 'Spain', postalFormat: 'Postal Code (5 digits)', example: '28001' },
  { code: 'NL', name: 'Netherlands', postalFormat: 'Postal Code (4 digits + 2 letters)', example: '1000 AA' },
  { code: 'SE', name: 'Sweden', postalFormat: 'Postal Code (5 digits)', example: '111 20' },
  { code: 'NO', name: 'Norway', postalFormat: 'Postal Code (4 digits)', example: '0001' },
];

const HelmetWrapper = Helmet as any;

const SymptomReport: React.FC = () => {
  const navigate = useNavigate();
  const { addReport, getHealthTip } = useSupabase();
  
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
  
  // Location validation states
  const [validatingLocation, setValidatingLocation] = useState(false);
  const [locationValid, setLocationValid] = useState<boolean | null>(null);
  const [locationDetails, setLocationDetails] = useState<{
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);

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

      if (locationValid !== true) {
        throw new Error('Please enter a valid postal code for your selected country');
      }

      if (formData.symptoms.length === 0) {
        throw new Error('Please select at least one symptom');
      }

      // Get coordinates from validated location
      const coordinates = locationDetails ? {
        latitude: locationDetails.latitude,
        longitude: locationDetails.longitude
      } : null;

      // Only send minimal fields to backend
      const minimalReport = {
        illnessType: formData.illnessType,
        country: formData.country,
        pinCode: formData.pinCode,
        symptoms: formData.symptoms,
        severity: formData.severity,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
      };

      await addReport(minimalReport);

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

  // Get selected country details
  const selectedCountry = countries.find(c => c.code === formData.country);

  // Validate postal code using geocoding API
  const validatePostalCode = async (postalCode: string, countryCode: string) => {
    if (!postalCode || !countryCode) return null;

    setValidatingLocation(true);
    setLocationValid(null);
    setLocationDetails(null);

    try {
      // Try Nominatim (OpenStreetMap) API first
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(postalCode)}&country=${countryCode}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HealthPulse/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const address = result.address || {};
        
        // Extract city name from various possible fields
        const city = address.city || 
                    address.town || 
                    address.village || 
                    address.municipality ||
                    address.county ||
                    address.state_district ||
                    address.suburb ||
                    address.neighbourhood;

        setLocationValid(true);
        setLocationDetails({
          city: city,
          state: address.state,
          country: address.country,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        });
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        };
      } else {
        // Try alternative search without country restriction
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(postalCode)}&format=json&limit=1&addressdetails=1`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'HealthPulse/1.0'
            }
          }
        );

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData && fallbackData.length > 0) {
            const result = fallbackData[0];
            const address = result.address || {};
            
            // Check if the result matches the selected country
            if (address.country_code?.toUpperCase() === countryCode) {
              const city = address.city || 
                          address.town || 
                          address.village || 
                          address.municipality ||
                          address.county ||
                          address.state_district ||
                          address.suburb ||
                          address.neighbourhood;

              setLocationValid(true);
              setLocationDetails({
                city: city,
                state: address.state,
                country: address.country,
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon)
              });
              return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon)
              };
            }
          }
        }
        
        setLocationValid(false);
        setLocationDetails(null);
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Don't mark as invalid if it's a network/API error, just show as not validated
      if (error instanceof Error && error.message.includes('unavailable')) {
        setLocationValid(null);
      } else {
        setLocationValid(false);
      }
      setLocationDetails(null);
      return null;
    } finally {
      setValidatingLocation(false);
    }
  };

  // Handle postal code input with validation
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const postalCode = e.target.value;
    setFormData(prev => ({ ...prev, pinCode: postalCode }));
    
    // Reset validation states when input changes
    setLocationValid(null);
    setLocationDetails(null);
  };

  // Debounced validation effect
  useEffect(() => {
    if (formData.pinCode && formData.country) {
      const timeoutId = setTimeout(() => {
        validatePostalCode(formData.pinCode, formData.country);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData.pinCode, formData.country]);

  // Handle country change
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setFormData(prev => ({ ...prev, country: countryCode, pinCode: '' }));
    setLocationValid(null);
    setLocationDetails(null);
  };

  if (success) {
    return (
      <>
        <HelmetWrapper>
          <title>Report Symptoms - HealthSathi's Pulse</title>
          <meta name="description" content="Report your health symptoms anonymously to help track and monitor community health trends in real-time with HealthSathi's Pulse." />
        </HelmetWrapper>
        <section className="max-w-2xl mx-auto" aria-label="Report Success">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
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
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors mt-4"
            >
              View Health Map
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <HelmetWrapper>
        <title>Report Symptoms - HealthSathi's Pulse</title>
        <meta name="description" content="Report your health symptoms anonymously to help track and monitor community health trends in real-time with HealthSathi's Pulse." />
      </HelmetWrapper>
      <section className="max-w-2xl mx-auto" aria-label="Symptom Report Form">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-red-600" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Report Symptoms
            </h1>
            <p className="text-gray-600">
              Help your community by anonymously reporting your symptoms
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" role="alert" aria-live="polite">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" aria-hidden="true" />
                <span className="text-red-800" id="form-error">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6" aria-describedby="form-error">
            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Country
                    <span className="ml-1 text-xs text-gray-400" title="Select your country for location validation.">
                      (required)
                    </span>
                  </label>
                  <select
                    id="country-select"
                    value={formData.country}
                    onChange={handleCountryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.country && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      {selectedCountry?.postalFormat || 'Postal Code'}
                      <span className="ml-1 text-xs text-gray-400" title="Enter a valid postal code for your country.">
                        (required)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="postal-code-input"
                        type="text"
                        value={formData.pinCode}
                        onChange={handlePostalCodeChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-10 ${
                          locationValid === true ? 'border-green-500' :
                          locationValid === false ? 'border-red-500' :
                          'border-gray-300'
                        }`}
                        placeholder={selectedCountry?.example || 'e.g., 400001'}
                        required
                        autoComplete="postal-code"
                        aria-describedby="postal-help"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {validatingLocation && (
                          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" aria-hidden="true" />
                        )}
                        {locationValid === true && (
                          <Check className="w-5 h-5 text-green-500" aria-hidden="true" />
                        )}
                        {locationValid === false && (
                          <X className="w-5 h-5 text-red-500" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                    
                    {/* Location validation feedback */}
                    {locationValid === true && locationDetails && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-sm text-green-800 mb-1">
                          <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                          <span className="font-medium">Location Verified ✓</span>
                        </div>
                        <div className="text-sm text-green-700">
                          <div className="font-medium">
                            {locationDetails.city && `${locationDetails.city}`}
                            {locationDetails.state && `, ${locationDetails.state}`}
                            {locationDetails.country && `, ${locationDetails.country}`}
                          </div>
                          {locationDetails.latitude && locationDetails.longitude && (
                            <div className="text-xs text-green-600 mt-1">
                              Coordinates: {locationDetails.latitude.toFixed(4)}, {locationDetails.longitude.toFixed(4)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {locationValid === false && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-sm text-red-800 mb-1">
                          <X className="w-4 h-4 mr-1" aria-hidden="true" />
                          <span className="font-medium">Invalid postal code</span>
                        </div>
                        <div className="text-sm text-red-700">
                          <p>Please check the format for {selectedCountry?.name}: {selectedCountry?.postalFormat}</p>
                          <p className="text-xs mt-1">Example: {selectedCountry?.example}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedCountry && (
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-gray-500" id="postal-help">
                          Format: {selectedCountry.postalFormat}
                        </p>
                        <p className="text-xs text-blue-600">
                          💡 City and location details will be automatically loaded when you enter a valid postal code
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Optional Nickname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Nickname (Optional)
              </label>
              <input
                id="nickname-input"
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
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center shadow-md disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Submit Report
                </>
              )}
            </button>
          </form>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <Heart className="w-5 h-5 text-gray-400 mr-2 mt-0.5" aria-hidden="true" />
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
      </section>
    </>
  );
};

export default SymptomReport;