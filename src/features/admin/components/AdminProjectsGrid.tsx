import React from 'react';
import { Edit2, Eye, FolderKanban, Loader2, Trash2 } from 'lucide-react';
import type { Project } from '../../../entities';
import type { BackendProject } from '../../../lib/api';
import { Badge } from '@/components/ui/badge';

interface AdminProjectsGridProps {
  filteredProjects: BackendProject[];
  projects: Project[];
  deletingId: string | number | null;
  onViewProject: (project: BackendProject) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => Promise<void>;
}

const statusVariant: Record<string, { variant: 'success' | 'warning' | 'info' | 'destructive' | 'secondary'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  on_hold: { variant: 'warning', label: 'On hold' },
  completed: { variant: 'info', label: 'Completed' },
  cancelled: { variant: 'destructive', label: 'Cancelled' },
  planned: { variant: 'secondary', label: 'Planned' },
};

const priorityDot: Record<string, string> = {
  critical: 'bg-destructive',
  high: 'bg-warning',
  medium: 'bg-info',
  low: 'bg-muted-foreground/40',
};

export const AdminProjectsGrid: React.FC<AdminProjectsGridProps> = ({
  filteredProjects,
  projects,
  deletingId,
  onViewProject,
  onEditProject,
  onDeleteProject,
}) => (
  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
    {filteredProjects.map((project) => {
      const status = statusVariant[project.status] ?? { variant: 'secondary' as const, label: project.status };
      const priority = project.priority || 'medium';

      return (
        <article
          key={project.id}
          className="flex flex-col rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {project.projectType || 'internal'}
                {project.customerName ? ` · ${project.customerName}` : ''}
              </p>
              <h4 className="mt-1 truncate text-sm font-bold text-foreground" title={project.name}>
                {project.name}
              </h4>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
            {project.description || 'No description available'}
          </p>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground tabular-nums">{project.progress}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold capitalize text-muted-foreground">
              <span className={`size-1.5 rounded-full ${priorityDot[project.priority] ?? 'bg-muted-foreground/40'}`} aria-hidden="true" />
              {project.priority} priority
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onViewProject(project)}
                aria-label={`View ${project.name}`}
                title="View details"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Eye className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const frontendProject = projects.find((entry) => entry.id === project.id.toString());
                  if (frontendProject) onEditProject(frontendProject);
                }}
                aria-label={`Edit ${project.name}`}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Edit2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => void onDeleteProject(project.id.toString())}
                disabled={deletingId === `project-${project.id}`}
                aria-label={`Delete ${project.name}`}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                {deletingId === `project-${project.id}` ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </button>
            </div>
          </div>
        </article>
      );
    })}

    {filteredProjects.length === 0 && (
      <div className="col-span-full flex min-h-[10rem] flex-col items-center justify-center gap-1 py-10 text-center">
        <FolderKanban className="mb-2 size-10 text-muted-foreground/30" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">No projects found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search, or add a new project.</p>
      </div>
    )}
  </div>
);
