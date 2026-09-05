import React from 'react';
import {
  Activity,
  BarChart3,
  FileSpreadsheet,
  FolderKanban,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MobileNavProps {
  viewMode: 'dashboard' | 'analytics' | 'reports' | 'admin';
  onViewModeChange: (mode: 'dashboard' | 'analytics' | 'reports' | 'admin') => void;
  onAddActivity: () => void;
  isManager: boolean;
}

type TabItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
};

interface NavTabProps {
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}

const NavTab: React.FC<NavTabProps> = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      'relative flex flex-1 flex-col items-center justify-center gap-1 min-h-[52px] px-1 transition-colors',
      isActive ? 'text-primary' : 'text-muted-foreground active:text-foreground',
    )}
  >
    {isActive && (
      <span
        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
        aria-hidden="true"
      />
    )}
    <Icon className="size-[18px]" strokeWidth={isActive ? 2.25 : 2} />
    <span className="text-[10px] font-medium leading-none">{label}</span>
  </button>
);

const AddTab: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Log activity"
    className="relative flex flex-1 flex-col items-center justify-center gap-1 min-h-[52px] px-1"
  >
    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform">
      <Plus className="size-[18px]" strokeWidth={2.5} />
    </span>
    <span className="text-[10px] font-medium leading-none text-primary">Log</span>
  </button>
);

export const MobileNav: React.FC<MobileNavProps> = ({
  viewMode,
  onViewModeChange,
  onAddActivity,
  isManager,
}) => {
  const tabs: TabItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Activity,
      isActive: viewMode === 'dashboard',
      onClick: () => onViewModeChange('dashboard'),
    },
  ];

  if (isManager) {
    tabs.push(
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        isActive: viewMode === 'analytics',
        onClick: () => onViewModeChange('analytics'),
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: FileSpreadsheet,
        isActive: viewMode === 'reports',
        onClick: () => onViewModeChange('reports'),
      },
      {
        id: 'admin',
        label: 'Projects',
        icon: FolderKanban,
        isActive: viewMode === 'admin',
        onClick: () => onViewModeChange('admin'),
      },
    );
  }

  // Insert the primary action in the centre of the tab row
  const mid = Math.ceil(tabs.length / 2);
  const leftTabs = tabs.slice(0, mid);
  const rightTabs = tabs.slice(mid);

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-sm border-t border-border shadow-[0_-1px_3px_rgb(0_0_0/0.04)]"
      aria-label="Quick navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch max-w-lg mx-auto">
        {leftTabs.map((tab) => (
          <NavTab
            key={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={tab.isActive}
            onClick={tab.onClick}
          />
        ))}

        <AddTab onClick={onAddActivity} />

        {rightTabs.map((tab) => (
          <NavTab
            key={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={tab.isActive}
            onClick={tab.onClick}
          />
        ))}
      </div>
    </nav>
  );
};
