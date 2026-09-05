import { useEffect, useState } from 'react';
import type { BackendTeam, BackendUser } from '../../../lib/api';

type UserRole = 'admin' | 'project_manager' | 'user';

interface UserFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  teamId: number;
  role: UserRole;
  hireDate: string;
}

interface UseUserModalStateParams {
  isOpen: boolean;
  user: BackendUser | null;
  teams: BackendTeam[];
  isEditing: boolean;
  onSave: (data: {
    email: string;
    username: string;
    password?: string;
    firstName: string;
    lastName: string;
    teamId: number;
    role: UserRole;
    hireDate?: string;
  }) => Promise<void>;
}

const createInitialFormData = (teams: BackendTeam[]): UserFormData => ({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  teamId: teams[0]?.id || 0,
  role: 'user',
  hireDate: '',
});

export const useUserModalState = ({
  isOpen,
  user,
  teams,
  isEditing,
  onSave,
}: UseUserModalStateParams) => {
  const [formData, setFormData] = useState<UserFormData>(createInitialFormData(teams));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      setFormData({
        email: user.email,
        username: user.username,
        password: '',
        confirmPassword: '',
        firstName: user.firstName,
        lastName: user.lastName,
        teamId: user.teamId,
        role: user.role,
        hireDate: user.hireDate?.split('T')[0] || '',
      });
    } else {
      setFormData(createInitialFormData(teams));
    }

    setError('');
  }, [isOpen, user, teams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!formData.email || !formData.username || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return;
    }

    const nameRegex = /^[a-zA-Z0-9 ]{2,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{2,}$/;

    if (!nameRegex.test(formData.firstName.trim())) {
      setError('First name must be at least 2 characters and contain only letters, numbers, and spaces');
      return;
    }

    if (!nameRegex.test(formData.lastName.trim())) {
      setError('Last name must be at least 2 characters and contain only letters, numbers, and spaces');
      return;
    }

    if (!usernameRegex.test(formData.username.trim())) {
      setError('Username must be at least 2 characters and contain only letters, numbers, and underscores');
      return;
    }

    const emailRegex = /^[a-zA-Z]+@corelia\.ai$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email must be letters followed by @corelia.ai (e.g. abc@corelia.ai)');
      return;
    }

    if (!isEditing && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password) {
      if (!/[A-Z]/.test(formData.password)) {
        setError('Password must contain at least one uppercase letter');
        return;
      }
      if (!/[a-z]/.test(formData.password)) {
        setError('Password must contain at least one lowercase letter');
        return;
      }
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(formData.password)) {
        setError('Password must contain at least one special character');
        return;
      }
    }

    if (formData.hireDate) {
      const today = new Date().toISOString().split('T')[0];
      if (formData.hireDate > today) {
        setError('Hire date cannot be in the future');
        return;
      }
    }

    try {
      await onSave({
        email: formData.email,
        username: formData.username,
        ...(formData.password ? { password: formData.password } : {}),
        firstName: formData.firstName,
        lastName: formData.lastName,
        teamId: formData.teamId,
        role: formData.role,
        ...(formData.hireDate ? { hireDate: formData.hireDate } : {}),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    }
  };

  return {
    formData,
    setFormData,
    error,
    handleSubmit,
  };
};
