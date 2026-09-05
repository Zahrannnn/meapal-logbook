import { useEffect, useState } from 'react';
import type { User } from '../../entities';
import { getAuthToken, setAuthToken } from '../../lib/api';
import { authService, convertBackendUserToFrontend } from '../../features/auth';

export const useAuthBootstrap = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [backendUserId, setBackendUserId] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            setCurrentUser(convertBackendUserToFrontend(user));
            setBackendUserId(user.id);
          }
        } catch {
          setAuthToken(null);
        }
      }
      setIsAuthLoading(false);
    };

    void checkSession();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setBackendUserId(parseInt(user.id, 10));
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setBackendUserId(null);
  };

  return {
    currentUser,
    backendUserId,
    isAuthLoading,
    handleLogin,
    handleLogout,
  };
};
