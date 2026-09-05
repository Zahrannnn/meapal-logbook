import { authApi, type AuthResponse, type BackendUser } from '../../../lib/api';
import type { TeamType, User } from '../../../entities';

const teamIdToType: Record<number, TeamType> = {
  1: 'app-dev',
  2: 'data-science',
  3: 'cyber-security',
  4: 'tech-support',
  5: 'as400',
  6: 'zos',
};

export const convertBackendUserToFrontend = (backendUser: BackendUser): User => {
  const teamType = teamIdToType[backendUser.teamId] || 'app-dev';

  let frontendRole: User['role'];
  switch (backendUser.role) {
    case 'admin':
      frontendRole = 'admin';
      break;
    case 'project_manager':
      frontendRole = 'manager';
      break;
    default:
      frontendRole = 'employee';
  }

  return {
    id: backendUser.id.toString(),
    name: `${backendUser.firstName} ${backendUser.lastName}`,
    email: backendUser.email,
    role: frontendRole,
    team: (backendUser.team?.name || teamType) as User['team'],
    targetActivitiesPerDay: 5,
    joiningDate: backendUser.hireDate || backendUser.createdAt,
  };
};

export const authService = {
  login: (email: string, password: string): Promise<AuthResponse> => authApi.login(email, password),
  logout: () => authApi.logout(),
  getCurrentUser: () => authApi.getCurrentUser(),
  forgotPassword: (email: string) => authApi.forgotPassword(email),
  verifyOtp: (email: string, otp: string) => authApi.verifyOtp(email, otp),
  resetPassword: (email: string, newPassword: string, resetToken: string) =>
    authApi.resetPassword(email, newPassword, resetToken),
};
