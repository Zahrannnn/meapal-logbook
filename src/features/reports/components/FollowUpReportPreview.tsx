import React from 'react';
import { DownloadIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { FollowUpRow } from '../../../lib/api/types';

const followUpStatusClass = (status: string) => {
  if (status === 'Done') return 'bg-success/10 text-success';
  if (status === 'En cours') return 'bg-info/10 text-info';
  if (status === 'Bloqué') return 'bg-destructive/10 text-destructive';
  return 'bg-warning/10 text-warning';
};

/** The French rapport de suivi table with its export action. */
export const FollowUpPreview: React.FC<{
  rows: FollowUpRow[];
  isLoading: boolean;
  isExporting: boolean;
  onExport: () => void;
}> = ({ rows, isLoading, isExporting, onExport }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2.5 px-5 py-4" aria-label="Loading follow-up report">
        {[0, 1, 2, 3].map((row) => (
          <Skeleton key={row} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[8rem] flex-col items-center justify-center gap-1 py-8 text-center">
        <p className="text-sm font-semibold text-foreground">No follow-up data found</p>
        <p className="text-sm text-muted-foreground">Try adjusting the period or filters.</p>
      </div>
    );
  }

  const headers = ['Projet', 'Tâche', 'Responsable', 'Statut', 'Avancement', 'Charges (J)', 'Date Début', 'Deadline', 'Date de Fin', 'Points Bloquants', 'Commentaires'];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              {headers.map((header) => (
                <th key={header} className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={`${row.project}-${row.task}-${index}`} className="transition-colors hover:bg-muted/40">
                <td className="px-3 py-2.5">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{row.project}</span>
                </td>
                <td className="max-w-xs truncate py-2.5 pr-3 text-foreground" title={row.task}>{row.task}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{row.responsible}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold', followUpStatusClass(row.status))}>{row.status}</span>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{row.progress !== null && row.progress !== undefined ? `${row.progress}%` : '—'}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{row.chargesEnJ !== null && row.chargesEnJ !== undefined ? row.chargesEnJ.toFixed(1) : '—'}</td>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">{row.dateDebut || '—'}</td>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">{row.deadline || '—'}</td>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">{row.dateDeFin || '—'}</td>
                <td className="max-w-[12rem] truncate px-3 py-2.5 text-muted-foreground" title={row.pointsBloquants || ''}>{row.pointsBloquants || '—'}</td>
                <td className="max-w-[12rem] truncate px-3 py-2.5 text-muted-foreground" title={row.commentaires || ''}>{row.commentaires || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
        <p className="text-xs font-medium text-muted-foreground tabular-nums">
          {rows.length} {rows.length === 1 ? 'row' : 'rows'}
        </p>
        <Button size="sm" variant="outline" onClick={onExport} disabled={isExporting}>
          {isExporting ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <DownloadIcon data-icon="inline-start" />}
          Export follow-up CSV
        </Button>
      </div>
    </div>
  );
};
