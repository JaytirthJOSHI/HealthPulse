import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import HealthMap from './components/HealthMap';
import SymptomReport from './components/SymptomReport';
import DiseaseInfo from './components/DiseaseInfo';
import About from './components/About';
import { RealTimeProvider } from './contexts/RealTimeContext';
import { SupabaseProvider } from './contexts/SupabaseContext';

const HelmetWrapper = Helmet as any;

function App() {
  return (
    <SupabaseProvider>
      <RealTimeProvider>
        <Router>
          <HelmetWrapper>
            <title>HealthPulse - Real-time Health Monitoring</title>
            <meta name="description" content="Track health symptoms, view outbreak maps, and get health information in real-time with HealthPulse." />
          </HelmetWrapper>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-6">
              <Routes>
                <Route path="/" element={<HealthMap />} />
                <Route path="/report" element={<SymptomReport />} />
                <Route path="/diseases" element={<DiseaseInfo />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </main>
          </div>
        </Router>
      </RealTimeProvider>
    </SupabaseProvider>
  );
}

export default App;
