import React from 'react';
import { Mail, X } from 'lucide-react';
import { teams as frontendTeams, type User } from '../../../entities';

interface ProfileModalHeaderProps {
  currentUser: User;
  onClose: () => void;
}

export const ProfileModalHeader: React.FC<ProfileModalHeaderProps> = ({ currentUser, onClose }) => {
  const userTeam = frontendTeams.find((team) => team.id === currentUser.team);

  return (
    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg tracking-wide"
          style={{ backgroundColor: userTeam?.color || '#6B7280' }}
        >
          {currentUser.name
            .split(' ')
            .map((name) => name[0])
            .join('')}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{currentUser.name}</h2>
          <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5" />
            {currentUser.email}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="p-2 -mr-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
