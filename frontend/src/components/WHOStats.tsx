import React, { useState, useEffect } from 'react';

interface WHOStat {
  Id: number;
  IndicatorCode: string;
  SpatialDimType: string;
  SpatialDim: string;
  TimeDimType: string;
  TimeDim: number;
  Dim1Type: string;
  Dim1: string;
  Value: string;
}

const WHOStats: React.FC = () => {
  const [stats, setStats] = useState<WHOStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWHOStats = async () => {
      try {
        const apiBaseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://api.pulse.health-sathi.org'
          : 'http://localhost:8787';

        const response = await fetch(`${apiBaseUrl}/api/who-data`);
        if (!response.ok) {
          throw new Error('Failed to fetch WHO data');
        }
        const data: WHOStat[] = await response.json();
        
        // For this example, let's just show the most recent data for a few countries
        const filteredData = data.filter(d => 
          ['IND', 'USA', 'CHN', 'JPN', 'DEU'].includes(d.SpatialDim) && d.TimeDim === 2019
        );
        
        setStats(filteredData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWHOStats();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading WHO Data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        WHO Data: Life Expectancy at Birth (2019)
      </h2>
      <p className="text-gray-600 mb-4">
        Official data from the World Health Organization's Global Health Observatory. This shows a comparison of life expectancy for both sexes.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sex
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Life Expectancy (Years)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.map((stat) => (
              <tr key={stat.Id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stat.SpatialDim}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.Dim1 === 'MLE' ? 'Male' : stat.Dim1 === 'FMLE' ? 'Female' : 'Both'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {parseFloat(stat.Value).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WHOStats;