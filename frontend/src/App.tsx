import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import HealthMap from './components/HealthMap';
import SymptomReport from './components/SymptomReport';
import DiseaseInfo from './components/DiseaseInfo';
import About from './components/About';
import PhoneAI from './components/PhoneAI';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import ConnectFeature from './components/ConnectFeature';
import { RealTimeProvider } from './contexts/RealTimeContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { Heart, Github, Mail, Shield } from 'lucide-react';

const HelmetWrapper = Helmet as any;

function App() {
  const [connectFeatureEnabled, setConnectFeatureEnabled] = useState(false);

  return (
    <ThemeProvider>
      <ToastProvider>
        <SupabaseProvider>
          <RealTimeProvider>
          <Router>
          <HelmetWrapper>
            <title>HealthSathi's Pulse - Real-time Health Monitoring</title>
            <meta name="description" content="Track health symptoms, view outbreak maps, and get health information in real-time with HealthSathi's Pulse." />
          </HelmetWrapper>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Skip to Content Link for Accessibility */}
            <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-primary-600 text-white px-4 py-2 rounded shadow transition-all">
              Skip to main content
            </a>
            <Header 
              connectFeatureEnabled={connectFeatureEnabled}
              onToggleConnectFeature={setConnectFeatureEnabled}
            />
            <main id="main-content" className="container mx-auto px-4 py-6 flex-grow" aria-label="Main Content">
              <Routes>
                <Route path="/" element={<HealthMap />} />
                <Route path="/report" element={<SymptomReport />} />
                <Route path="/diseases" element={<DiseaseInfo />} />
                <Route path="/about" element={<About />} />
                <Route path="/phone-ai" element={<PhoneAI />} />
                <Route path="/analytics" element={<PredictiveAnalytics />} />
              </Routes>
            </main>
            
            {/* Connect Feature */}
            <ConnectFeature />
            
            <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Heart className="w-5 h-5 text-red-500 mr-2" />
                      HealthSathi's Pulse
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Real-time health monitoring platform by HealthSathi, helping communities track and respond to health trends.
                    </p>
                    <div className="flex space-x-4">
                      <a href="https://github.com" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Github className="w-5 h-5" />
                      </a>
                      <a href="mailto:info@healthsathi.org" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Mail className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                                              <li><a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Health Map</a></li>
                        <li><a href="/report" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Report Symptoms</a></li>
                        <li><a href="/diseases" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Disease Info</a></li>
                        <li><a href="/phone-ai" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">AI Diagnosis</a></li>
                        <li><a href="/analytics" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Analytics</a></li>
                        <li><a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">About</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Privacy & Security
                    </h4>
                    <ul className="space-y-2">
                                              <li><a href="https://health-sathi.org/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="https://health-sathi.org/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a></li>
                        <li><a href="/security" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Security</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    © {new Date().getFullYear()} HealthSathi's Pulse. Made with ❤️ for community health.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </RealTimeProvider>
        </SupabaseProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;