import React from 'react';
import { Users, CheckCircle2, Clock } from 'lucide-react';
import type { BackendUser } from '../../../lib/api';
import { calculateActualHours } from '../../../lib/utils';
import { DetailSection } from './DetailSection';

// Hoisted out of the row map — identical values every row.
const ACTIVITY_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  completed: { bg: 'bg-green-100', text: 'text-green-700' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700' },
  blocked: { bg: 'bg-red-100', text: 'text-red-700' },
  pending: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export const TeamsSection: React.FC<{
  teams: Array<{ team: { id: number; name: string } }>;
  users: BackendUser[];
  getTeamColor: (name: string) => string;
}> = ({ teams, users, getTeamColor }) => (
  <DetailSection icon={Users} title={`Assigned Teams (${teams.length})`}>
    <div className="flex flex-wrap gap-3">
      {teams.map((t, idx) => {
        const teamColor = getTeamColor(t.team.name);
        const teamMemberCount = users.filter(u => u.teamId === t.team.id).length;
        return (
          <div
            key={idx}
            className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-gray-200 shadow-sm"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${teamColor}20` }}
            >
              <Users className="w-5 h-5" style={{ color: teamColor }} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{t.team.name}</p>
              <p className="text-sm text-gray-500">{teamMemberCount} members</p>
            </div>
          </div>
        );
      })}
    </div>
  </DetailSection>
);

export const MembersSection: React.FC<{
  members: Array<{
    userId: number;
    user: { firstName: string; lastName: string; email: string; team?: { name: string } | null };
  }>;
}> = ({ members }) => (
  <DetailSection icon={Users} title={`Assigned Members (${members.length})`} iconClassName="text-violet-600">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {members.map((member) => (
        <div
          key={member.userId}
          className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
            {member.user.firstName[0]}{member.user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {member.user.firstName} {member.user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
          </div>
          {member.user.team && (
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">
              {member.user.team.name}
            </span>
          )}
        </div>
      ))}
    </div>
  </DetailSection>
);

export const ContributorsSection: React.FC<{
  activeUsers: BackendUser[];
  projectActivities: Array<{ userId: number; date?: string; startTime: string; endTime: string }>;
  teamsById: Map<number, { name: string }>;
  getTeamColor: (name: string) => string;
}> = ({ activeUsers, projectActivities, teamsById, getTeamColor }) => (
  <DetailSection icon={CheckCircle2} title={`Active Contributors (${activeUsers.length})`} iconClassName="text-green-600">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {activeUsers.map(user => {
        const userActivities = projectActivities.filter(a => a.userId === user.id);
        const userHours = calculateActualHours(userActivities);
        const userTeam = teamsById.get(user.teamId);
        const teamColor = userTeam ? getTeamColor(userTeam.name) : '#6B7280';

        return (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 bg-card rounded-xl border border-gray-200"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: teamColor }}
            >
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{userActivities.length} tasks</span>
                <span className="text-gray-300">•</span>
                <span className="text-blue-600 font-medium">{userHours.toFixed(1)}h</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </DetailSection>
);

export const RecentActivitiesSection: React.FC<{
  projectActivities: Array<{
    id: number;
    userId: number;
    title: string;
    startTime: string;
    duration?: number;
    status: string;
  }>;
  users: BackendUser[];
  formatDate: (d: string) => string;
}> = ({ projectActivities, users, formatDate }) => (
  <DetailSection icon={Clock} title="Recent Activities">
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {projectActivities.slice(0, 10).map(activity => {
        const activityUser = users.find(u => u.id === activity.userId);
        const activityStatus = ACTIVITY_STATUS_STYLES[activity.status] || ACTIVITY_STATUS_STYLES.pending;

        return (
          <div
            key={activity.id}
            className="flex items-center gap-4 p-3 bg-card rounded-lg border border-gray-200"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{activity.title}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{activityUser ? `${activityUser.firstName} ${activityUser.lastName}` : 'Unknown'}</span>
                <span>•</span>
                <span>{formatDate(activity.startTime)}</span>
                <span>•</span>
                <span>{activity.duration?.toFixed(1)}h</span>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${activityStatus.bg} ${activityStatus.text}`}>
              {activity.status.replace('_', ' ')}
            </span>
          </div>
        );
      })}
    </div>
    {projectActivities.length > 10 && (
      <p className="text-sm text-gray-500 mt-3 text-center">
        And {projectActivities.length - 10} more activities...
      </p>
    )}
  </DetailSection>
);
