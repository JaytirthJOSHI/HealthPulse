import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HealthMap from './components/HealthMap';
import SymptomReport from './components/SymptomReport';
import DiseaseInfo from './components/DiseaseInfo';
import About from './components/About';
import { SocketProvider } from './contexts/SocketContext';
import { SupabaseProvider } from './contexts/SupabaseContext';

function App() {
  return (
    <SupabaseProvider>
      <SocketProvider>
        <Router>
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
      </SocketProvider>
    </SupabaseProvider>
  );
}

export default App;
