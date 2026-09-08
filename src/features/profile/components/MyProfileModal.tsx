import React from 'react';
import { format } from 'date-fns';
import { BriefcaseBusinessIcon, MailIcon, UsersRoundIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { teams, User as UserType } from '../../../entities';
import { useProfileSkills } from '../hooks/useProfileSkills';
import { ProfileSkillForm } from './ProfileSkillForm';
import { ProfileSkillsList } from './ProfileSkillsList';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onProfileUpdated?: () => void;
}

const roleLabelFor = (role: UserType['role']) => {
  if (role === 'admin') return 'Administrator';
  if (role === 'manager' || role === 'project_manager') return 'Project Manager';
  return 'Team Member';
};

const AccountTile: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="size-4" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export const MyProfileModal: React.FC<MyProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const { skills, isLoading, isSaving, selectedCompetency, setSelectedCompetency, selectedLevel, setSelectedLevel, unownedCompetencies, handleAddSkill, handleUpdateSkillLevel, handleRemoveSkill } = useProfileSkills({
    isOpen,
    onProfileUpdated,
  });

  const userTeam = teams.find((team) => team.id === currentUser.team);
  const joiningDate = currentUser.joiningDate ? new Date(currentUser.joiningDate) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90dvh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border space-y-0">
          <DialogTitle className="text-lg">My profile</DialogTitle>
          <DialogDescription className="sr-only">Your account details and skills</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Identity */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-border">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-white tracking-wide"
              style={{ backgroundColor: userTeam?.color || '#6B7280' }}
              aria-hidden="true"
            >
              {currentUser.name
                .split(' ')
                .map((name) => name[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold tracking-tight text-foreground">{currentUser.name}</h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                <span className="font-semibold">{roleLabelFor(currentUser.role)}</span>
                {userTeam && (
                  <>
                    <span className="opacity-40">·</span>
                    <span className="flex items-center gap-1">
                      <UsersRoundIcon className="size-3.5 opacity-70" aria-hidden="true" />
                      {userTeam.name}
                    </span>
                  </>
                )}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MailIcon className="size-3.5 opacity-70" aria-hidden="true" />
                <span className="truncate">{currentUser.email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-6 py-5">
            {/* Account */}
            <section aria-label="Account" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <AccountTile icon={BriefcaseBusinessIcon} label="Role" value={roleLabelFor(currentUser.role)} />
              <AccountTile icon={UsersRoundIcon} label="Team" value={userTeam?.name ?? 'Unassigned'} />
              <AccountTile
                icon={MailIcon}
                label="Member since"
                value={joiningDate && !Number.isNaN(joiningDate.getTime()) ? format(joiningDate, 'MMM yyyy') : '—'}
              />
            </section>

            {/* Skills */}
            <section aria-label="Skills" className="flex flex-col gap-3">
              <ProfileSkillForm
                skillCount={skills.length}
                unownedCompetencies={unownedCompetencies}
                selectedCompetency={selectedCompetency}
                selectedLevel={selectedLevel}
                isSaving={isSaving}
                onSelectCompetency={setSelectedCompetency}
                onSelectLevel={setSelectedLevel}
                onAddSkill={handleAddSkill}
              />
              <ProfileSkillsList
                skills={skills}
                isLoading={isLoading}
                onUpdateSkillLevel={handleUpdateSkillLevel}
                onRemoveSkill={handleRemoveSkill}
              />
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
