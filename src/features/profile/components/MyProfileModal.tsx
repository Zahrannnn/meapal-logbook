import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User as UserType } from '../../../entities';
import { useProfileSkills } from '../hooks/useProfileSkills';
import { ProfileModalHeader } from './ProfileModalHeader';
import { ProfileSuccessBanner } from './ProfileSuccessBanner';
import { ProfileOverviewCard } from './ProfileOverviewCard';
import { ProfileSkillForm } from './ProfileSkillForm';
import { ProfileSkillsList } from './ProfileSkillsList';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onProfileUpdated?: () => void;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const {
    skills,
    isLoading,
    isSaving,
    selectedCompetency,
    setSelectedCompetency,
    selectedLevel,
    setSelectedLevel,
    successMessage,
    unownedCompetencies,
    handleAddSkill,
    handleUpdateSkillLevel,
    handleRemoveSkill,
  } = useProfileSkills({
    isOpen,
    onProfileUpdated,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90dvh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>My profile</DialogTitle>
          <DialogDescription>Personal info and skills</DialogDescription>
        </DialogHeader>

        <ProfileModalHeader currentUser={currentUser} onClose={onClose} />

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <ProfileSuccessBanner message={successMessage} />
          <ProfileOverviewCard currentUser={currentUser} />

          <div className="flex flex-col gap-4">
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
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/50 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
