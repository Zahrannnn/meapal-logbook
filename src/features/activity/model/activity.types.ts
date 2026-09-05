import type { ActivityEntry, CompetencyTag, Project } from '../../../entities';
import type { BackendActivity, BackendCompetency } from '../../../lib/api';

export type ActivityStatus = 'completed' | 'in-progress' | 'pending-approval' | 'blocked';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type RecurrenceCustomType = 'daily' | 'weekly' | 'monthly';

export interface RecurrenceSettings {
  type: RecurrenceType;
  interval: number;
  daysOfWeek: number[];
  endDate: string;
  startDate: string;
  customType: RecurrenceCustomType;
}

export interface ActivityDraft {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  projectId: string;
  competencies: CompetencyTag[];
  status: ActivityStatus;
  notes: string;
  recurring: RecurrenceSettings;
  progress?: number;
  deadline?: string;
}

export interface ActivityUpdateContext {
  selectedDate: string;
  backendUserId: number;
  backendCompetencies: BackendCompetency[];
}

export interface ActivitySubmitOptions extends ActivityUpdateContext {
  editingActivity: ActivityEntry | null;
  isEditingRecurringActivity: boolean;
}

export interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityDraft;
  onChange: (activity: ActivityDraft) => void;
  onSave: () => void;
  isEditing: boolean;
  projects: Project[];
  isSubmitting?: boolean;
  isEditingRecurringActivity?: boolean;
}

export interface ConvertBackendActivityOptions {
  resolveTeamType: (teamId: number) => ActivityEntry['team'];
  backendCompetencies?: BackendCompetency[];
}

export type FrontendActivityEntry = ActivityEntry;
export type FrontendProject = Project;
export type FrontendBackendActivity = BackendActivity;
