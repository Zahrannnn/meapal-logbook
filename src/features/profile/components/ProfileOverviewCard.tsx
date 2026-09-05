import React from 'react';
import { Briefcase } from 'lucide-react';
import type { User } from '../../../entities';

interface ProfileOverviewCardProps {
  currentUser: User;
}

export const ProfileOverviewCard: React.FC<ProfileOverviewCardProps> = ({ currentUser }) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <Briefcase className="w-5 h-5 text-gray-500" />
      <div>
        <p className="text-xs text-gray-500">Role</p>
        <p className="font-semibold text-gray-900 capitalize">{currentUser.role}</p>
      </div>
    </div>
  </div>
);
