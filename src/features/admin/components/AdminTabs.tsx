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
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          aria-pressed={isActive}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
            isActive
              ? `${tab.activeClass} shadow-xs`
              : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
          }`}
        >
          <Icon className="size-4" />
          {tab.label}
          <span
            className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
              isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}
          >
            {tab.count}
          </span>
        </button>
      );
    })}
  </div>
);
