import { FolderKanbanIcon } from 'lucide-react';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimePicker } from '@/components/time-picker';
import type { ActivityDraft } from '../model/activity.types';
import type { Project } from '../../../entities';

interface ActivityBasicFieldsProps {
  activity: ActivityDraft;
  projects: Project[];
  onChange: (updates: Partial<ActivityDraft>) => void;
}

export const ActivityBasicFields = ({ activity, projects, onChange }: ActivityBasicFieldsProps) => (
  <FieldGroup className="gap-5">
    <Field>
      <FieldLabel htmlFor="activity-title">
        Title <span className="text-destructive">*</span>
      </FieldLabel>
      <Input
        id="activity-title"
        type="text"
        value={activity.title}
        onChange={(event) => onChange({ title: event.target.value })}
        placeholder="e.g. Implemented user authentication"
        autoFocus
      />
    </Field>

    <div className="grid grid-cols-2 gap-4">
      <Field>
        <FieldLabel htmlFor="activity-start">
          Start time <span className="text-destructive">*</span>
        </FieldLabel>
        <TimePicker
          id="activity-start"
          value={activity.startTime}
          onChange={(value) => onChange({ startTime: value })}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="activity-end">
          End time <span className="text-destructive">*</span>
        </FieldLabel>
        <TimePicker
          id="activity-end"
          value={activity.endTime}
          onChange={(value) => onChange({ endTime: value })}
        />
      </Field>
    </div>

    <Field>
      <FieldLabel htmlFor="activity-project">
        <FolderKanbanIcon className="opacity-60" />
        Project <span className="text-destructive">*</span>
      </FieldLabel>
      <Select value={activity.projectId} onValueChange={(value) => onChange({ projectId: value })}>
        <SelectTrigger id="activity-project" className="w-full">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>

    <Field>
      <FieldLabel htmlFor="activity-description">Description</FieldLabel>
      <Textarea
        id="activity-description"
        value={activity.description}
        onChange={(event) => onChange({ description: event.target.value })}
        rows={3}
        placeholder="Describe what you worked on…"
      />
    </Field>

    <Field>
      <FieldLabel htmlFor="activity-notes">
        Notes <span className="font-normal text-muted-foreground">— optional</span>
      </FieldLabel>
      <Textarea
        id="activity-notes"
        value={activity.notes || ''}
        onChange={(event) => onChange({ notes: event.target.value })}
        rows={2}
        placeholder="Challenges, learnings, extra context…"
      />
      <FieldDescription>Only you and approvers see this.</FieldDescription>
    </Field>
  </FieldGroup>
);
