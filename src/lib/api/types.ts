export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  token: string;
  user: BackendUser;
}

export interface BackendUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'project_manager' | 'user';
  teamId: number;
  isActive: boolean;
  hireDate: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  team?: { id: number; name: string };
}

export interface BackendTeam {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  users?: { id: number; firstName: string; lastName: string; email: string; role: string }[];
  _count?: { users: number; projects: number };
}

export interface BackendProject {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  status: 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectType: 'prospected' | 'customer' | 'internal';
  customerName: string | null;
  startDate: string;
  endDate: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
  owner: { id: number; firstName: string; lastName: string; email: string };
  teams: { team: { id: number; name: string } }[];
  members?: {
    projectId: number;
    userId: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      team: { id: number; name: string } | null;
    };
  }[];
  _count?: { activities: number };
}

export interface BackendActivity {
  id: number;
  userId: number;
  projectId: number;
  title: string;
  startTime: string;
  endTime: string;
  status: 'in_progress' | 'blocked' | 'completed' | 'pending';
  notes: string | null;
  duration: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    teamId: number;
    team: { id: number; name: string };
  };
  project: { id: number; name: string };
  competencies: { competency: { id: number; name: string } }[];
  competencyIds?: number[] | null;
  recurring?: {
    frequency?: string;
    interval?: number;
    daysOfWeek?: number[];
    startDate?: string;
    endDate?: string;
  } | null;
  frequency?: string;
  interval?: number;
  daysOfWeek?: number[];
  startDate?: string;
  endDate?: string;
  progress?: number;
  deadline?: string;
}

export interface BackendCompetency {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  [key: string]: T[] | { page: number; limit: number; total: number; pages: number };
}

export interface ReportSummary {
  totalActivities: number;
  completedActivities: number;
  totalHours: number;
  averageHoursPerDay: number;
  completionRate: number;
  activeDays: number;
}

export interface CompetencyDistribution {
  competencyId: number;
  competencyName: string;
  count: number;
  percentage: number;
}

export interface DailyBreakdown {
  date: string;
  activitiesCount: number;
  completedCount: number;
  totalHours: number;
}

export interface TeamPerformance {
  teamId: number;
  teamName: string;
  totalMembers: number;
  activeMembers: number;
  totalActivities: number;
  completedActivities: number;
  totalHours: number;
  averageHoursPerMember: number;
  completionRate: number;
}

export interface ProjectStatus {
  projectId: number;
  projectName: string;
  status: string;
  priority: string;
  progress: number;
  totalActivities: number;
  completedActivities: number;
  totalHours: number;
  completionRate: number;
}

export interface EmployeePerformance {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  teamId: number;
  teamName: string;
  totalActivities: number;
  completedActivities: number;
  totalHours: number;
  completionRate: number;
}

export interface OverallReport {
  reportPeriod: {
    type: string;
    startDate: string;
    endDate: string;
  };
  summary: ReportSummary;
  competencyDistribution: CompetencyDistribution[];
  dailyBreakdown: DailyBreakdown[];
  teamPerformance: TeamPerformance[];
  projectStatus: ProjectStatus[];
  topPerformers: EmployeePerformance[];
}

export interface ProjectReport {
  reportPeriod: {
    type: string;
    startDate: string;
    endDate: string;
  };
  project: ProjectStatus;
  activityStats: ReportSummary;
  competencyDistribution: CompetencyDistribution[];
  teamPerformance: TeamPerformance[];
  dailyBreakdown: DailyBreakdown[];
  topPerformers: EmployeePerformance[];
}

export interface TeamReport {
  reportPeriod: {
    type: string;
    startDate: string;
    endDate: string;
  };
  team: TeamPerformance;
  activityStats: ReportSummary;
  competencyDistribution: CompetencyDistribution[];
  projectStatus: ProjectStatus[];
  memberPerformance: EmployeePerformance[];
  dailyBreakdown: DailyBreakdown[];
}

export interface EmployeeReport {
  reportPeriod: {
    type: string;
    startDate: string;
    endDate: string;
  };
  employee: EmployeePerformance;
  activityStats: ReportSummary;
  competencyDistribution: CompetencyDistribution[];
  dailyBreakdown: DailyBreakdown[];
  projectContributions: {
    projectId: number;
    projectName: string;
    activitiesCount: number;
    hoursSpent: number;
    completionRate: number;
  }[];
  recentActivities: { id: number; title: string; projectName: string; date: string; duration: number; status: string }[];
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface UserSkill {
  competencyId: number;
  competencyName: string;
  level: SkillLevel;
  addedAt: string;
}

export interface TeamMemberSkills {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  skills: UserSkill[];
}

export interface TeamSkills {
  teamId: number;
  teamName: string;
  members: TeamMemberSkills[];
}

export interface FollowUpRow {
  project: string;
  task: string;
  responsible: string;
  status: 'Done' | 'En cours' | 'Bloqué' | 'En attente';
  progress: number | null;
  chargesEnJ: number;
  dateDebut: string | null;
  deadline: string | null;
  dateDeFin: string | null;
  pointsBloquants: string | null;
  commentaires: string;
}

export interface ParsedVoiceActivity {
  title?: string;
  description?: string;
  notes?: string;
  projectId?: number;
  startTime?: string;
  endTime?: string;
  status?: string;
}
