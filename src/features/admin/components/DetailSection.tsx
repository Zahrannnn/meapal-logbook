import React from 'react';
import type { LucideIcon } from 'lucide-react';

/** The gray card wrapper every project-detail section shares: icon + heading + children. */
export const DetailSection: React.FC<{
  icon: LucideIcon;
  title: string;
  iconClassName?: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, iconClassName = 'text-gray-600', children }) => (
  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Icon className={`w-5 h-5 ${iconClassName}`} />
      {title}
    </h3>
    {children}
  </div>
);
