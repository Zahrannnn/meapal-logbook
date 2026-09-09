import React from 'react';
import { PlusIcon, SearchIcon, UploadIcon } from 'lucide-react';
import type { AdminTabType } from '../mappers/admin.mapper';
import { Button } from '@/components/ui/button';

interface AdminToolbarProps {
  activeTab: AdminTabType;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onOpenBulkImport: () => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  onAdd,
  onOpenBulkImport,
}) => {
  const noun = activeTab === 'competencies' ? 'competency' : activeTab.slice(0, -1);

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={`Search ${activeTab}…`}
          aria-label={`Search ${activeTab}`}
          className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
      <div className="flex gap-2">
        {activeTab === 'users' && (
          <Button variant="outline" size="sm" onClick={onOpenBulkImport} disabled={false}>
            <UploadIcon data-icon="inline-start" />
            <span className="hidden sm:inline">Upload users</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        )}
        <Button size="sm" onClick={onAdd}>
          <PlusIcon data-icon="inline-start" />
          Add {noun}
        </Button>
      </div>
    </div>
  );
};
