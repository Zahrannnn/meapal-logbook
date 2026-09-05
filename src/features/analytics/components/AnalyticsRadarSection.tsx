import React from 'react';
import { Loader2 } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface AnalyticsRadarSectionProps {
  isLoading: boolean;
  radarData: Array<{
    competency: string;
    value: number;
  }>;
}

export const AnalyticsRadarSection: React.FC<AnalyticsRadarSectionProps> = ({ isLoading, radarData }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4">Competency Radar</h3>
    {isLoading ? (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="competency" style={{ fontSize: '10px' }} />
          <PolarRadiusAxis style={{ fontSize: '10px' }} />
          <Radar name="Activities" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.5} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    )}
  </div>
);
