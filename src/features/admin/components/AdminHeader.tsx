import React from 'react';
import type { User } from '../../../entities';

interface AdminHeaderProps {
  currentUser: User;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{isAdmin ? 'Administration' : 'Project Management'}</h1>
        <p className="text-gray-500 text-sm mt-1">{isAdmin ? 'Manage users, teams, projects, and competencies' : 'Create and manage projects'}</p>
      </div>
    </div>
  );
};
