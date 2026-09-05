import type { ComponentType } from 'react';
import {
  Brain,
  CheckCircle2,
  Clock,
  Code,
  Lightbulb,
  MessageSquare,
  Target,
  Users,
  Zap,
} from 'lucide-react';

export type CompetencyTag =
  | 'problem-solving'
  | 'communication'
  | 'technical-skill'
  | 'leadership'
  | 'creativity'
  | 'collaboration'
  | 'time-management'
  | 'analytical-thinking'
  | 'innovation'
  | 'quality-assurance';

export interface CompetencyOption {
  id: CompetencyTag;
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
}

export const competencyOptions: CompetencyOption[] = [
  {
    id: 'problem-solving',
    label: 'Problem Solving',
    icon: Lightbulb,
    color: '#FFB020',
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: MessageSquare,
    color: '#0F62FE',
  },
  {
    id: 'technical-skill',
    label: 'Technical Skill',
    icon: Code,
    color: '#8A3FFC',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    icon: Users,
    color: '#DA1E28',
  },
  {
    id: 'creativity',
    label: 'Creativity',
    icon: Zap,
    color: '#D12771',
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    icon: Users,
    color: '#24A148',
  },
  {
    id: 'time-management',
    label: 'Time Management',
    icon: Clock,
    color: '#FF832B',
  },
  {
    id: 'analytical-thinking',
    label: 'Analytical Thinking',
    icon: Brain,
    color: '#1192E8',
  },
  {
    id: 'innovation',
    label: 'Innovation',
    icon: Target,
    color: '#D12771',
  },
  {
    id: 'quality-assurance',
    label: 'Quality Assurance',
    icon: CheckCircle2,
    color: '#198038',
  },
];
