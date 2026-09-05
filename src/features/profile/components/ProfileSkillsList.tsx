import React from 'react';
import { Award, Loader2, Star, Trash2 } from 'lucide-react';
import type { SkillLevel, UserSkill } from '../../../lib/api';
import { profileSkillLevels } from '../hooks/useProfileSkills';

interface ProfileSkillsListProps {
  skills: UserSkill[];
  isLoading: boolean;
  onUpdateSkillLevel: (competencyId: number, level: SkillLevel) => void;
  onRemoveSkill: (competencyId: number) => void;
}

const getLevelColor = (level: SkillLevel) =>
  profileSkillLevels.find((skill) => skill.value === level)?.color || 'bg-gray-100 text-gray-700';

export const ProfileSkillsList: React.FC<ProfileSkillsListProps> = ({
  skills,
  isLoading,
  onUpdateSkillLevel,
  onRemoveSkill,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No skills added yet</p>
        <p className="text-sm">Add your first skill above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {skills.map((skill) => (
        <div
          key={skill.competencyId}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{skill.competencyName}</p>
              <p className="text-xs text-gray-500">Added {new Date(skill.addedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={skill.level}
              onChange={(event) => onUpdateSkillLevel(skill.competencyId, event.target.value as SkillLevel)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-0 cursor-pointer ${getLevelColor(skill.level)}`}
            >
              {profileSkillLevels.map((skillLevel) => (
                <option key={skillLevel.value} value={skillLevel.value}>
                  {skillLevel.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onRemoveSkill(skill.competencyId)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove skill"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
