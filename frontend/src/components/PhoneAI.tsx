import React, { useState, useEffect } from 'react';

interface PhoneAIProps {
  className?: string;
}

const PhoneAI: React.FC<PhoneAIProps> = ({ className = '' }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const AI_PHONE_NUMBER = '+1 (770) 362-0543';

  useEffect(() => {
    // Check if user is on mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
    };
    
    checkMobile();
  }, []);

  const handleCall = () => {
    if (isMobile) {
      // Direct call on mobile
      window.location.href = `tel:${AI_PHONE_NUMBER}`;
    } else {
      // Show QR code on desktop
      setShowQR(true);
    }
  };

  const generateQRCode = () => {
    const phoneNumber = AI_PHONE_NUMBER.replace(/\s/g, '');
    const qrData = `tel:${phoneNumber}`;
    
    // Using a simple QR code service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

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
        
        {/* Development Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-800 font-medium">Currently in Development</span>
          </div>
          <p className="text-sm text-yellow-700">
            Our AI phone system is being enhanced. You can directly call our AI diagnosis line for immediate assistance.
          </p>
        </div>

        {/* Direct Call Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Direct AI Consultation</h3>
          <p className="text-blue-800 mb-3">
            <strong>AI Phone System:</strong> {AI_PHONE_NUMBER}
          </p>
          
          {!showQR ? (
            <button
              onClick={handleCall}
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
            >
              {isMobile ? (
                <>
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call AI System Now
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  Show QR Code to Call
                </>
              )}
            </button>
          ) : (
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-3">
                <img 
                  src={generateQRCode()} 
                  alt="QR Code to call AI system" 
                  className="w-32 h-32"
                />
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Scan this QR code with your phone to call the AI system
              </p>
              <button
                onClick={() => setShowQR(false)}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Hide QR Code
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Development Form Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Development Testing</h3>
          <p className="text-sm text-gray-600 mb-3">
            This form is for development testing. In production, users will directly call the AI system.
          </p>
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
              {isLoading ? 'Processing...' : 'Test AI Consultation'}
            </button>
            
            <button
              type="button"
              onClick={handleEmergency}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Test Emergency Alert
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
            <h3 className="text-lg font-semibold text-green-800 mb-2">Test Result</h3>
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
                  <strong>AI System Contact:</strong> {AI_PHONE_NUMBER}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">How it works:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Call our AI diagnosis system at {AI_PHONE_NUMBER}</li>
          <li>Describe your symptoms to the AI</li>
          <li>Get instant diagnosis and recommendations</li>
          <li>For emergencies, call immediately</li>
          <li>Follow up with healthcare provider if needed</li>
        </ol>
      </div>
    </div>
  );
};

export default PhoneAI; 