import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { Project } from '../../../entities';
import type { EditableProject as AppEditableProject } from '../../../app/appMappers';
import type { BackendUser } from '../../../lib/api';

export type ProjectType = 'prospected' | 'customer' | 'internal';
export type EditableProject = AppEditableProject;

export interface ProjectFormData extends Partial<Project> {
  projectType?: ProjectType;
  customerName?: string;
}

interface UseProjectModalStateParams {
  isOpen: boolean;
  project: EditableProject | null;
  backendUsers: BackendUser[];
  onSave: (project: Omit<Project, 'id'> & { projectType?: ProjectType; customerName?: string; teamIds?: number[] }) => void | Promise<void>;
}

const createInitialFormData = (): ProjectFormData => ({
  name: '',
  description: '',
  status: 'active',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  teams: [],
  assignedMembers: [],
  priority: 'medium',
  progress: 0,
  projectType: 'internal',
  customerName: '',
});

export const projectTypeColors: Record<ProjectType, { bg: string; text: string; border: string }> = {
  prospected: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  customer: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  internal: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
};

export const useProjectModalState = ({
  isOpen,
  project,
  backendUsers,
  onSave,
}: UseProjectModalStateParams) => {
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [formData, setFormData] = useState<ProjectFormData>(createInitialFormData);

  useEffect(() => {
    if (!isOpen) return;

    setMemberSearch('');
    setFormData({
      ...createInitialFormData(),
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || 'active',
      startDate: project?.startDate || new Date().toISOString().split('T')[0],
      endDate: project?.endDate || '',
      teams: project?.teams || [],
      assignedMembers: project?.assignedMembers || [],
      priority: project?.priority || 'medium',
      progress: project?.progress || 0,
      projectType: project?.projectType || 'internal',
      customerName: project?.customerName || '',
    });
    setSelectedTeamIds(project?.teamIds || []);
  }, [isOpen, project]);

  const availableUsers = useMemo(
    () => backendUsers.filter((user) => selectedTeamIds.includes(user.teamId)),
    [backendUsers, selectedTeamIds],
  );

  const filteredUsers = useMemo(() => {
    if (!memberSearch.trim()) return availableUsers;
    const query = memberSearch.toLowerCase();
    return availableUsers.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [availableUsers, memberSearch]);

  const toggleTeam = (teamId: number) => {
    setSelectedTeamIds((current) =>
      current.includes(teamId) ? current.filter((value) => value !== teamId) : [...current, teamId],
    );
  };

  const toggleMember = (userId: string) => {
    const members = formData.assignedMembers || [];
    setFormData((current) => ({
      ...current,
      assignedMembers: members.includes(userId)
        ? members.filter((memberId) => memberId !== userId)
        : [...members, userId],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name || !formData.description || selectedTeamIds.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.projectType === 'customer' && !formData.customerName?.trim()) {
      toast.error('Please enter customer name for customer projects');
      return;
    }

    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      toast.error('End date cannot be earlier than start date');
      return;
    }

    await onSave({
      ...(formData as Omit<Project, 'id'> & { projectType?: ProjectType; customerName?: string }),
      teamIds: selectedTeamIds,
    });
  };

  return {
    formData,
    setFormData,
    selectedTeamIds,
    memberSearch,
    setMemberSearch,
    filteredUsers,
    toggleTeam,
    toggleMember,
    handleSubmit,
  };
};
