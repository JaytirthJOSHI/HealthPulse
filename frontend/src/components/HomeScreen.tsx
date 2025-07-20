import React from 'react';
import HealthMap from './HealthMap';
import SymptomReport from './SymptomReport';

export default function HomeScreen() {
  return (
    <div className="space-y-6">
      {/* Health Map Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Health Outbreak Map
        </h2>
        <div className="h-96 rounded-lg overflow-hidden">
          <HealthMap />
        </div>
      </section>

      {/* Symptom Report Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Report Symptoms
        </h2>
        <SymptomReport />
      </section>

      {/* Quick Stats Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Health Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300">Active Cases</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,234</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-green-700 dark:text-green-300">Recovered</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">5,678</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">Under Monitoring</h3>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">890</p>
          </div>
        </div>
      </section>
    </div>
  );
} 