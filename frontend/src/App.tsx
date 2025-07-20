import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { RealTimeProvider } from './contexts/RealTimeContext';
import Header from './components/Header';
import HealthMap from './components/HealthMap';
import SymptomReport from './components/SymptomReport';
import About from './components/About';
import PhoneAI from './components/PhoneAI';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import ConnectFeature from './components/ConnectFeature';
import HealthCommunity from './components/HealthCommunity';
import CollaborativeFeatures from './components/CollaborativeFeatures';
import PrivateChatRoom from './components/PrivateChatRoom';
import AccessibilityMenu from './components/AccessibilityMenu';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const HelmetWrapper = Helmet as any;

function App() {
  const [connectFeatureEnabled, setConnectFeatureEnabled] = useState(false);
  const [collaborativeFeaturesVisible, setCollaborativeFeaturesVisible] = useState(false);
  const [privateChatRoomVisible, setPrivateChatRoomVisible] = useState(false);

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
              onOpenCollaborativeFeatures={() => setCollaborativeFeaturesVisible(true)}
              onOpenPrivateChatRoom={() => setPrivateChatRoomVisible(true)}
            />
            <main id="main-content" className="container mx-auto px-4 py-6 flex-grow" aria-label="Main Content">
              <Routes>
                <Route path="/" element={<HealthMap />} />
                <Route path="/report" element={<SymptomReport />} />
                <Route path="/about" element={<About />} />
                <Route path="/phone-ai" element={<PhoneAI />} />
                <Route path="/analytics" element={<PredictiveAnalytics />} />
              </Routes>
            </main>
            
            {/* Connect Feature */}
            <ConnectFeature />
            
            {/* Health Community */}
            <HealthCommunity 
              isVisible={collaborativeFeaturesVisible}
              onClose={() => setCollaborativeFeaturesVisible(false)}
            />

            {/* Collaborative Features */}
            <CollaborativeFeatures 
              isVisible={collaborativeFeaturesVisible}
              onClose={() => setCollaborativeFeaturesVisible(false)}
            />

            {/* Private Chat Room */}
            <PrivateChatRoom 
              isVisible={privateChatRoomVisible}
              onClose={() => setPrivateChatRoomVisible(false)}
            />

            {/* Accessibility Menu */}
            <AccessibilityMenu />

            {/* Error Boundary */}
            <ErrorBoundary>
              <div></div>
            </ErrorBoundary>
          </div>
          </Router>
          </RealTimeProvider>
        </SupabaseProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;