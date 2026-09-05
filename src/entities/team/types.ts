import type { ComponentType } from 'react';
import {
  Brain,
  Cloud,
  Code,
  Cpu,
  Palette,
  Server,
} from 'lucide-react';

export type TeamType =
  | 'data-science'
  | 'app-dev'
  | 'backend'
  | 'devops'
  | 'ui-ux'
  | 'embedded'
  | 'cyber-security'
  | 'tech-support'
  | 'as400'
  | 'zos';

export interface Team {
  id: TeamType;
  name: string;
  color: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
}

export const teams: Team[] = [
  {
    id: 'data-science',
    name: 'Data Science & AI',
    color: '#8B5CF6',
    icon: Brain,
    description: 'Advanced analytics, ML/AI, NLP, and Computer Vision solutions',
  },
  {
    id: 'app-dev',
    name: 'Application Development',
    color: '#3B82F6',
    icon: Code,
    description: 'Full-stack web and mobile application development',
  },
  {
    id: 'backend',
    name: 'Backend Engineering',
    color: '#10B981',
    icon: Server,
    description: 'Backend systems, APIs, and database architecture',
  },
  {
    id: 'devops',
    name: 'DevOps & Infrastructure',
    color: '#F59E0B',
    icon: Cloud,
    description: 'CI/CD, cloud infrastructure, and system operations',
  },
  {
    id: 'ui-ux',
    name: 'UI/UX Design',
    color: '#EC4899',
    icon: Palette,
    description: 'User interface design and user experience',
  },
  {
    id: 'embedded',
    name: 'Embedded Systems',
    color: '#6366F1',
    icon: Cpu,
    description: 'Embedded systems and IoT development',
  },
];
