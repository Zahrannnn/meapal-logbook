import { useEffect, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { competenciesApi, type BackendCompetency } from '../../../lib/api';
import type { ActivityDraft } from '../model/activity.types';

interface ActivityCompetencyPickerProps {
  competencies: ActivityDraft['competencies'];
  onToggle: (competency: ActivityDraft['competencies'][number]) => void;
}

const tagColors = [
  '#FFB020', '#0F62FE', '#8A3FFC', '#DA1E28', '#D12771',
  '#24A148', '#FF832B', '#1192E8', '#D12771', '#198038',
];

export const ActivityCompetencyPicker = ({ competencies, onToggle }: ActivityCompetencyPickerProps) => {
  const [backendCompetencies, setBackendCompetencies] = useState<BackendCompetency[]>([]);

  useEffect(() => {
    let cancelled = false;
    competenciesApi.getAll().then((data) => {
      if (!cancelled) setBackendCompetencies(data);
    }).catch(console.error);
    return () => { cancelled = true; };
  }, []);

  if (backendCompetencies.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-sm font-medium flex items-center gap-2" role="label">
        Skills used
        {competencies.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold tabular-nums">
            {competencies.length}
          </span>
        )}
      </span>
      <div className="flex flex-wrap gap-2">
        {backendCompetencies.map((competency, index) => {
          const tag = competency.name.toLowerCase().replace(/\s+/g, '-');
          const isSelected = competencies.includes(tag as ActivityDraft['competencies'][number]);
          const color = tagColors[index % tagColors.length];

          return (
            <button
              key={competency.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(tag as ActivityDraft['competencies'][number])}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 active:scale-[0.97]',
                isSelected ? 'text-white border-transparent' : 'bg-card text-muted-foreground border-border hover:border-muted-foreground/40',
              )}
              style={isSelected ? { backgroundColor: color } : undefined}
            >
              {isSelected && <CheckIcon className="size-3" strokeWidth={3} />}
              {competency.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
