import React from 'react';
import type { AdminTabType } from '../mappers/admin.mapper';

interface AdminTabsProps {
  activeTab: AdminTabType;
  tabs: Array<{ id: AdminTabType; label: string; count: number; icon: React.ComponentType<{ className?: string }>; activeClass: string; badgeClass: string }>;
  onTabChange: (tab: AdminTabType) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, tabs, onTabChange }) => (
  <div className="flex flex-wrap gap-2">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isActive ? `${tab.activeClass} shadow-lg` : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'}`}>
          <Icon className="w-4 h-4" />
          {tab.label}
          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${isActive ? 'bg-white/30 text-white' : tab.badgeClass}`}>{tab.count}</span>
        </button>
      );
    })}
  </div>
);
