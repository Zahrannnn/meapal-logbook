import React from 'react';
import { SearchIcon, ChevronDownIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Project } from '../../../entities';

interface DashboardFiltersProps {
  searchQuery: string;
  filterProject: string;
  projects: Project[];
  onSearchChange: (query: string) => void;
  onFilterChange: (project: string) => void;
  resultCount?: number;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchQuery,
  filterProject,
  projects,
  onSearchChange,
  onFilterChange,
  resultCount,
}) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    <div className="relative flex-1">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search activities…"
        className="pl-9 bg-card"
      />
    </div>

    <div className="flex items-center gap-3">
      <Select value={filterProject} onValueChange={onFilterChange}>
        <SelectTrigger className="w-full sm:w-48 bg-card" aria-label="Filter by project">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {typeof resultCount === 'number' && (
        <Badge variant="secondary" className="tabular-nums whitespace-nowrap">
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </Badge>
      )}
    </div>
  </div>
);
