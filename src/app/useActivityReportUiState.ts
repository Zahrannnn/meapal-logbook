import { useEffect, useState } from 'react';
import type { ActivityEntry } from '../entities';
import type { BackendCompetency, BackendTeam, BackendUser } from '../lib/api';
import type { EditableProject } from './appMappers';
import { CURRENT_RELEASE } from '../content/whatsNew';

export type ViewMode = 'dashboard' | 'analytics' | 'admin' | 'reports';

export const useActivityReportUiState = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isAddingCompetency, setIsAddingCompetency] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRecurringActivitiesOpen, setIsRecurringActivitiesOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const [editingProject, setEditingProject] = useState<EditableProject | null>(null);
  const [editingUser, setEditingUser] = useState<BackendUser | null>(null);
  const [editingTeam, setEditingTeam] = useState<BackendTeam | null>(null);
  const [editingCompetency, setEditingCompetency] = useState<BackendCompetency | null>(null);

  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [whatsNewUnseen, setWhatsNewUnseen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('logbook:whats-new-seen') !== CURRENT_RELEASE.version;
    } catch {
      return true;
    }
  });

  const markWhatsNewSeen = () => {
    setWhatsNewUnseen(false);
    try {
      localStorage.setItem('logbook:whats-new-seen', CURRENT_RELEASE.version);
    } catch {
      // storage unavailable — the badge just reappears next session
    }
  };

  // First visit after a release: show the notes once, after login.
  useEffect(() => {
    if (whatsNewUnseen) setIsWhatsNewOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = sessionStorage.getItem('viewMode');
    return saved === 'dashboard' || saved === 'analytics' || saved === 'admin' || saved === 'reports'
      ? saved
      : 'dashboard';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    sessionStorage.setItem('viewMode', mode);
  };

  const openActivityEditor = () => setIsAddingActivity(true);

  const startEditingProject = (project: EditableProject) => {
    setEditingProject(project);
    setIsAddingProject(true);
  };

  const startEditingUser = (user: BackendUser) => {
    setEditingUser(user);
    setIsAddingUser(true);
  };

  const startEditingTeam = (team: BackendTeam) => {
    setEditingTeam(team);
    setIsAddingTeam(true);
  };

  const startEditingCompetency = (competency: BackendCompetency) => {
    setEditingCompetency(competency);
    setIsAddingCompetency(true);
  };

  const resetProjectEditor = () => {
    setEditingProject(null);
    setIsAddingProject(false);
  };

  const resetUserEditor = () => {
    setEditingUser(null);
    setIsAddingUser(false);
  };

  const resetTeamEditor = () => {
    setEditingTeam(null);
    setIsAddingTeam(false);
  };

  const resetCompetencyEditor = () => {
    setEditingCompetency(null);
    setIsAddingCompetency(false);
  };

  const closeActivityEditor = () => setIsAddingActivity(false);

  const startEditingRecurringActivity = (_activity: ActivityEntry) => {
    setIsRecurringActivitiesOpen(false);
    setIsAddingActivity(true);
  };

  return {
    selectedDate,
    setSelectedDate,
    isAddingActivity,
    setIsAddingActivity,
    isAddingProject,
    setIsAddingProject,
    isAddingUser,
    setIsAddingUser,
    isAddingTeam,
    setIsAddingTeam,
    isAddingCompetency,
    setIsAddingCompetency,
    isForgotPasswordOpen,
    setIsForgotPasswordOpen,
    isProfileOpen,
    setIsProfileOpen,
    isRecurringActivitiesOpen,
    setIsRecurringActivitiesOpen,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    isWhatsNewOpen,
    setIsWhatsNewOpen,
    whatsNewUnseen,
    markWhatsNewSeen,
    editingProject,
    setEditingProject,
    editingUser,
    setEditingUser,
    editingTeam,
    setEditingTeam,
    editingCompetency,
    setEditingCompetency,
    viewMode,
    setViewMode,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    searchQuery,
    setSearchQuery,
    filterProject,
    setFilterProject,
    openActivityEditor,
    closeActivityEditor,
    startEditingProject,
    startEditingUser,
    startEditingTeam,
    startEditingCompetency,
    resetProjectEditor,
    resetUserEditor,
    resetTeamEditor,
    resetCompetencyEditor,
    startEditingRecurringActivity,
  };
};
