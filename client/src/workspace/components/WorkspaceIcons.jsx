import {
  Briefcase,
  Building2,
  Code,
  DollarSign,
  GitBranch,
  Layers,
  ListChecks,
  Network,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

const ICON_MAP = {
  rocket: Rocket,
  briefcase: Briefcase,
  shield: Shield,
  listChecks: ListChecks,
  gitBranch: GitBranch,
  building: Building2,
  users: Users,
  dollar: DollarSign,
  network: Network,
  layers: Layers,
  sparkles: Sparkles,
  star: Star,
  code: Code,
};

export function WorkspaceIcon({ name, size = 20, strokeWidth = 2, className = '', style }) {
  const Icon = ICON_MAP[name] || Layers;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className ? `ws-lucide-icon ${className}` : 'ws-lucide-icon'}
      style={style}
      aria-hidden
    />
  );
}
