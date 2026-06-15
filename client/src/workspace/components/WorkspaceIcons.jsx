import { resolveIcon } from '../../components/icons';

export function WorkspaceIcon({ name, size = 20, strokeWidth = 2, className = '', style }) {
  const Icon = resolveIcon(name);
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
