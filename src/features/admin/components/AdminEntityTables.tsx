import React from 'react';
import { Award, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BackendCompetency, BackendTeam, BackendUser } from '../../../lib/api';
import { AdminRowActions, AdminTable } from './AdminTable';

export const UsersTable: React.FC<{
  users: BackendUser[];
  backendTeams: BackendTeam[];
  deletingId: string | number | null;
  onEditUser: (user: BackendUser) => void;
  onDeleteUser: (id: number) => void;
}> = ({ users, backendTeams, deletingId, onEditUser, onDeleteUser }) => (
  <AdminTable headers={['User', 'Email', 'Team', 'Role', 'Actions']}>
    {users.map((user) => (
      <tr key={user.id} className="transition-colors hover:bg-muted/40">
        <td className="px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
              {user.firstName[0]}{user.lastName[0]}
            </span>
            <div>
              <p className="font-semibold text-foreground">{user.firstName} {user.lastName}</p>
              <p className="text-xs font-medium text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        </td>
        <td className="px-5 py-3 text-muted-foreground">{user.email}</td>
        <td className="px-5 py-3">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
            {backendTeams.find((team) => team.id === user.teamId)?.name || 'Unknown'}
          </span>
        </td>
        <td className="px-5 py-3">
          <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'project_manager' ? 'info' : 'secondary'} className="capitalize">
            {user.role.replace('_', ' ')}
          </Badge>
        </td>
        <td className="px-5 py-3">
          <AdminRowActions
            entityName={user.firstName}
            deleting={deletingId === user.id}
            onEdit={() => onEditUser(user)}
            onDelete={() => onDeleteUser(user.id)}
          />
        </td>
      </tr>
    ))}
  </AdminTable>
);

export const TeamsTable: React.FC<{
  teams: BackendTeam[];
  deletingId: string | number | null;
  onEditTeam: (team: BackendTeam) => void;
  onDeleteTeam: (id: number) => void;
}> = ({ teams, deletingId, onEditTeam, onDeleteTeam }) => (
  <AdminTable headers={['Team', 'Description', 'Members', 'Actions']}>
    {teams.map((team) => (
      <tr key={team.id} className="transition-colors hover:bg-muted/40">
        <td className="px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </span>
            <p className="font-semibold text-foreground">{team.name}</p>
          </div>
        </td>
        <td className="max-w-xs truncate px-5 py-3 text-muted-foreground">{team.description || '-'}</td>
        <td className="px-5 py-3">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground tabular-nums">
            {team._count?.users || 0} members
          </span>
        </td>
        <td className="px-5 py-3">
          <AdminRowActions
            entityName={team.name}
            deleting={deletingId === `team-${team.id}`}
            onEdit={() => onEditTeam(team)}
            onDelete={() => onDeleteTeam(team.id)}
          />
        </td>
      </tr>
    ))}
  </AdminTable>
);

export const CompetenciesTable: React.FC<{
  competencies: BackendCompetency[];
  deletingId: string | number | null;
  onEditCompetency: (competency: BackendCompetency) => void;
  onDeleteCompetency: (id: number) => void;
}> = ({ competencies, deletingId, onEditCompetency, onDeleteCompetency }) => (
  <AdminTable headers={['Competency', 'Description', 'Created', 'Actions']}>
    {competencies.map((competency) => (
      <tr key={competency.id} className="transition-colors hover:bg-muted/40">
        <td className="px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="size-4" />
            </span>
            <p className="font-semibold text-foreground">{competency.name}</p>
          </div>
        </td>
        <td className="max-w-xs truncate px-5 py-3 text-muted-foreground">{competency.description || '-'}</td>
        <td className="px-5 py-3 text-muted-foreground">{new Date(competency.createdAt).toLocaleDateString()}</td>
        <td className="px-5 py-3">
          <AdminRowActions
            entityName={competency.name}
            deleting={deletingId === `comp-${competency.id}`}
            onEdit={() => onEditCompetency(competency)}
            onDelete={() => onDeleteCompetency(competency.id)}
          />
        </td>
      </tr>
    ))}
  </AdminTable>
);
