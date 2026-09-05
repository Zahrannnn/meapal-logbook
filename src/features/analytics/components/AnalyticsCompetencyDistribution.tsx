import React from 'react';
import { Loader2 } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip } from 'recharts';

interface AnalyticsCompetencyDistributionProps {
  isLoading: boolean;
  competencyDistribution: Array<{
    competency: string;
    percentage: number;
    value: number;
    color: string;
  }>;
}

export const AnalyticsCompetencyDistribution: React.FC<AnalyticsCompetencyDistributionProps> = ({
  isLoading,
  competencyDistribution,
}) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4">Competency Distribution</h3>
    {isLoading ? (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    ) : competencyDistribution.length > 0 ? (
      <ResponsiveContainer width="100%" height={280}>
        <RechartsPie>
          <Pie
            data={competencyDistribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ competency, percentage }) => `${competency}: ${percentage}%`}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {competencyDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </RechartsPie>
      </ResponsiveContainer>
    ) : (
      <div className="h-64 flex items-center justify-center text-gray-500">No competency data available</div>
    )}
  </div>
);
