/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Project } from '../entities';
import {
  competenciesApi,
  projectsApi,
  teamsApi,
  usersApi,
  type BackendCompetency,
  type BackendTeam,
  type BackendUser,
} from '../lib/api';
import { projectStatusToBackend, teamTypeToId, type EditableProject } from './appMappers';

interface UseActivityReportAdminActionsParams {
  backendUserId: number | null;
  editingProject: EditableProject | null;
  setEditingProject: (value: EditableProject | null) => void;
  editingUser: BackendUser | null;
  setEditingUser: (value: BackendUser | null) => void;
  editingTeam: BackendTeam | null;
  setEditingTeam: (value: BackendTeam | null) => void;
  editingCompetency: BackendCompetency | null;
  setEditingCompetency: (value: BackendCompetency | null) => void;
  setIsAddingProject: (value: boolean) => void;
  setIsAddingUser: (value: boolean) => void;
  setIsAddingTeam: (value: boolean) => void;
  setIsAddingCompetency: (value: boolean) => void;
  refreshData: () => Promise<void>;
}

export const useActivityReportAdminActions = ({
  backendUserId,
  editingProject,
  setEditingProject,
  editingUser,
  setEditingUser,
  editingTeam,
  setEditingTeam,
  editingCompetency,
  setEditingCompetency,
  setIsAddingProject,
  setIsAddingUser,
  setIsAddingTeam,
  setIsAddingCompetency,
  refreshData,
}: UseActivityReportAdminActionsParams) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsAddingProject(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project as EditableProject);
    setIsAddingProject(true);
  };

  const handleSaveProject = async (projectData: Omit<Project, 'id'> & { projectType?: string; customerName?: string; teamIds?: number[] }) => {
    if (!backendUserId) return;

    setIsSubmitting(true);
    try {
      const teamIds = projectData.teamIds || projectData.teams.map((team) => teamTypeToId[team]).filter(Boolean);

      if (editingProject) {
        await projectsApi.update(parseInt(editingProject.id), {
          name: projectData.name,
          description: projectData.description,
          status: projectStatusToBackend[projectData.status] as 'active' | 'on_hold' | 'completed',
          priority: projectData.priority,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          progress: projectData.progress,
          teamIds,
          memberIds: (projectData.assignedMembers || []).map((id) => parseInt(id)),
          projectType: projectData.projectType as 'prospected' | 'customer' | 'internal',
          customerName: projectData.customerName || null,
        });
      } else {
        await projectsApi.create({
          name: projectData.name,
          description: projectData.description,
          ownerId: backendUserId,
          status: projectStatusToBackend[projectData.status] as 'active' | 'on_hold' | 'completed',
          priority: projectData.priority,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          progress: projectData.progress,
          teamIds,
          memberIds: (projectData.assignedMembers || []).map((id) => parseInt(id)),
          projectType: projectData.projectType as 'prospected' | 'customer' | 'internal',
          customerName: projectData.customerName || null,
        });
      }

      await refreshData();
      setIsAddingProject(false);
      setEditingProject(null);
    } catch (err: any) {
      console.error('Failed to save project:', err);
      toast.error(err.message || 'Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsApi.delete(parseInt(projectId));
      await refreshData();
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      toast.error(err.message || 'Failed to delete project. Please try again.');
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsAddingUser(true);
  };

  const handleEditUser = (user: BackendUser) => {
    setEditingUser(user);
    setIsAddingUser(true);
  };

  const handleSaveUser = async (userData: {
    email: string;
    username: string;
    password?: string;
    firstName: string;
    lastName: string;
    teamId: number;
    role: 'admin' | 'project_manager' | 'user';
    hireDate?: string;
  }) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, userData);
        toast.success('User updated successfully');
      } else {
        await usersApi.create(userData as Required<typeof userData>);
        toast.success('User created successfully');
      }
      await refreshData();
      setIsAddingUser(false);
      setEditingUser(null);
    } catch (err: any) {
      console.error('Failed to save user:', err);
      toast.error(err.message || 'Failed to save user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await usersApi.delete(userId);
      await refreshData();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      toast.error(err.message || 'Failed to delete user. Please try again.');
    }
  };

  const handleAddTeam = () => {
    setEditingTeam(null);
    setIsAddingTeam(true);
  };

  const handleEditTeam = (team: BackendTeam) => {
    setEditingTeam(team);
    setIsAddingTeam(true);
  };

  const handleSaveTeam = async (teamData: { name: string; description: string }) => {
    setIsSubmitting(true);
    try {
      if (editingTeam) {
        await teamsApi.update(editingTeam.id, teamData);
      } else {
        await teamsApi.create(teamData);
      }
      await refreshData();
      setIsAddingTeam(false);
      setEditingTeam(null);
    } catch (err: any) {
      console.error('Failed to save team:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    try {
      await teamsApi.delete(teamId);
      await refreshData();
    } catch (err: any) {
      console.error('Failed to delete team:', err);
      toast.error(err.message || 'Failed to delete team. Please try again.');
    }
  };

  const handleAddCompetency = () => {
    setEditingCompetency(null);
    setIsAddingCompetency(true);
  };

  const handleEditCompetency = (competency: BackendCompetency) => {
    setEditingCompetency(competency);
    setIsAddingCompetency(true);
  };

  const handleSaveCompetency = async (competencyData: { name: string; description?: string }) => {
    setIsSubmitting(true);
    try {
      if (editingCompetency) {
        await competenciesApi.update(editingCompetency.id, competencyData);
      } else {
        await competenciesApi.create(competencyData);
      }
      await refreshData();
      setIsAddingCompetency(false);
      setEditingCompetency(null);
    } catch (err: any) {
      console.error('Failed to save competency:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompetency = async (competencyId: number) => {
    try {
      await competenciesApi.delete(competencyId);
      await refreshData();
    } catch (err: any) {
      console.error('Failed to delete competency:', err);
      toast.error(err.message || 'Failed to delete competency. Please try again.');
    }
  };

  return {
    isSubmitting,
    handleAddProject,
    handleEditProject,
    handleSaveProject,
    handleDeleteProject,
    handleAddUser,
    handleEditUser,
    handleSaveUser,
    handleDeleteUser,
    handleAddTeam,
    handleEditTeam,
    handleSaveTeam,
    handleDeleteTeam,
    handleAddCompetency,
    handleEditCompetency,
    handleSaveCompetency,
    handleDeleteCompetency,
  };
};
