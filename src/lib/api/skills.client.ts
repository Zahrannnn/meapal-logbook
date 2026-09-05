import { apiRequest } from './core';
import type { ApiResponse, SkillLevel, TeamMemberSkills, TeamSkills, UserSkill } from './types';

export const skillsApi = {
  getMySkills: async () => {
    const response = await apiRequest<ApiResponse<UserSkill[]>>('/skills/me');
    return response.data;
  },
  addMySkill: async (competencyId: number, level: SkillLevel = 'intermediate') => {
    const response = await apiRequest<ApiResponse<UserSkill>>('/skills/me', {
      method: 'POST',
      body: JSON.stringify({ competencyId, level }),
    });
    return response.data;
  },
  setMySkills: async (skills: { competencyId: number; level: SkillLevel }[]) => {
    const response = await apiRequest<ApiResponse<UserSkill[]>>('/skills/me', {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    });
    return response.data;
  },
  updateMySkill: async (competencyId: number, level: SkillLevel) => {
    const response = await apiRequest<ApiResponse<UserSkill>>(`/skills/me/${competencyId}`, {
      method: 'PATCH',
      body: JSON.stringify({ level }),
    });
    return response.data;
  },
  removeMySkill: async (competencyId: number) => {
    await apiRequest<ApiResponse<null>>(`/skills/me/${competencyId}`, {
      method: 'DELETE',
    });
  },
  getUserSkills: async (userId: number) => {
    const response = await apiRequest<ApiResponse<UserSkill[]>>(`/skills/user/${userId}`);
    return response.data;
  },
  setUserSkills: async (userId: number, skills: { competencyId: number; level: SkillLevel }[]) => {
    const response = await apiRequest<ApiResponse<UserSkill[]>>(`/skills/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    });
    return response.data;
  },
  getTeamSkills: async (teamId: number) => {
    const response = await apiRequest<ApiResponse<TeamMemberSkills[]>>(`/skills/team/${teamId}`);
    return response.data;
  },
  getAllTeamsSkills: async () => {
    const response = await apiRequest<ApiResponse<TeamSkills[]>>('/skills/teams');
    return response.data;
  },
  getSkillMatrix: async () => {
    const response = await apiRequest<ApiResponse<unknown>>('/skills/matrix');
    return response.data;
  },
};
