import React from 'react';
import { Heart, Shield, Users, MapPin, Activity, Zap } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About HealthPulse Lite
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A real-time collaborative health heatmap platform where communities can anonymously 
          report symptoms and monitor local health trends.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed">
          HealthPulse Lite aims to create a privacy-respecting, community-driven health monitoring 
          system that helps identify potential health outbreaks early while maintaining complete 
          anonymity for users. By aggregating anonymous symptom reports, we provide valuable 
          insights into local health trends without compromising individual privacy.
        </p>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Anonymity</h3>
              <p className="text-gray-600">
                Report symptoms anonymously with optional nicknames. No personal information 
                is collected or stored.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Privacy</h3>
              <p className="text-gray-600">
                Only PIN code level location data is collected, never exact addresses or 
                GPS coordinates.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">
                Live updates using WebSocket technology. See health trends as they develop 
                in your area.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Heatmap</h3>
              <p className="text-gray-600">
                Visualize health trends with an interactive map showing symptom density 
                across different areas.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Tips</h3>
              <p className="text-gray-600">
                Get instant health advice from Dr. Fatafat based on your reported symptoms.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Built for communities to monitor and respond to health trends collectively.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Symptoms</h3>
              <p className="text-gray-600">
                Users anonymously report their symptoms, including type, severity, and general location 
                (country and PIN code only).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Processing</h3>
              <p className="text-gray-600">
                Reports are processed and aggregated by location, creating heatmap data points 
                while maintaining individual anonymity.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Visualization</h3>
              <p className="text-gray-600">
                The interactive map displays health trends in real-time, showing areas with 
                higher symptom reports.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Awareness</h3>
              <p className="text-gray-600">
                Communities can monitor trends and take appropriate health precautions based 
                on the aggregated data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy & Security</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-600">
              <strong>No Personal Data:</strong> We never collect names, phone numbers, email addresses, 
              or any personally identifiable information.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-600">
              <strong>Location Privacy:</strong> Only country and PIN code are collected, never exact 
              addresses or GPS coordinates.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-600">
              <strong>Data Aggregation:</strong> Individual reports are aggregated to show trends, 
              making it impossible to identify specific individuals.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-600">
              <strong>Secure Infrastructure:</strong> Built on Supabase with enterprise-grade security 
              and data protection.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Frontend</h3>
            <p className="text-sm text-gray-600">React + TypeScript</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Styling</h3>
            <p className="text-sm text-gray-600">Tailwind CSS</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Maps</h3>
            <p className="text-sm text-gray-600">Leaflet.js</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Real-time</h3>
            <p className="text-sm text-gray-600">Socket.io</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Database</h3>
            <p className="text-sm text-gray-600">Supabase</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Backend</h3>
            <p className="text-sm text-gray-600">Node.js</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Deployment</h3>
            <p className="text-sm text-gray-600">Vercel + Render</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Icons</h3>
            <p className="text-sm text-gray-600">Lucide React</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Help Your Community?</h2>
        <p className="text-primary-100 mb-6">
          Join thousands of users who are already contributing to community health monitoring.
        </p>
        <button 
          onClick={() => window.location.href = '/report'}
          className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Report Symptoms Now
        </button>
      </div>
    </div>
  );
};

export default About; 