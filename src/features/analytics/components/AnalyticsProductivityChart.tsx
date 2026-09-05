import React from 'react';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AnalyticsProductivityChartProps {
  isLoading: boolean;
  weeklyTrendData: Array<{
    day: string;
    activities: number;
    completed: number;
  }>;
}

export const AnalyticsProductivityChart: React.FC<AnalyticsProductivityChartProps> = ({
  isLoading,
  weeklyTrendData,
}) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4">Productivity Trend</h3>
    {isLoading ? (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={weeklyTrendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend />
          <Bar dataKey="activities" name="Activities" fill="#2563eb" radius={[4, 4, 0, 0]} />
          <Bar dataKey="completed" name="Completed" fill="#16a34a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);
