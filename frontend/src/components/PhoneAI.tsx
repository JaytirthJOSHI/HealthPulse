import React, { useState } from 'react';

interface PhoneAIProps {
  className?: string;
}

const PhoneAI: React.FC<PhoneAIProps> = ({ className = '' }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://healthpulse-api.healthsathi.workers.dev/api/phone-ai/health-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          symptoms: symptoms.split(',').map(s => s.trim()),
          urgency: 'normal'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to get AI consultation');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergency = async () => {
    if (!phoneNumber || !symptoms) {
      setError('Please provide phone number and symptoms for emergency alert');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://healthpulse-api.healthsathi.workers.dev/api/phone-ai/emergency-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          symptoms: symptoms.split(',').map(s => s.trim()),
          severity: 'high',
          location: 'Current location',
          description: 'Emergency health consultation needed'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to send emergency alert');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Health Diagnosis</h2>
        <p className="text-gray-600 mb-4">
          Connect with our AI diagnosis system for instant health consultation
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>AI Phone System:</strong> +1 7703620543
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
            Symptoms (comma-separated)
          </label>
          <textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., fever, headache, cough"
            rows={3}
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Get AI Consultation'}
          </button>
          
          <button
            type="button"
            onClick={handleEmergency}
            disabled={isLoading}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Emergency Alert
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">AI Diagnosis Result</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Diagnosis:</strong> {result.diagnosis}</p>
            <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
            <p><strong>Severity:</strong> {result.severity}</p>
            <div>
              <strong>Recommendations:</strong>
              <ul className="list-disc list-inside mt-1 ml-2">
                {result.recommendations?.map((rec: string, index: number) => (
                  <li key={index} className="text-green-700">{rec}</li>
                ))}
              </ul>
            </div>
            {result.followUpRequired && (
              <p className="text-orange-600 font-medium">
                ⚠️ Follow-up consultation recommended
              </p>
            )}
            <div className="mt-3 p-2 bg-blue-100 rounded">
              <p className="text-blue-800 text-xs">
                <strong>AI System Contact:</strong> +1 7703620543
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">How it works:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Enter your phone number and symptoms</li>
          <li>Our AI system analyzes your symptoms</li>
          <li>Get instant diagnosis and recommendations</li>
          <li>For emergencies, immediate alert is sent to AI system</li>
          <li>Follow up with the AI phone system if needed</li>
        </ol>
      </div>
    </div>
  );
};

export default PhoneAI; 