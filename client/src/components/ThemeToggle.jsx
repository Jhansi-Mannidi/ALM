import { useTheme } from '../context/ThemeContext';
import { AppIcon, Icons } from './icons';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`icon-btn theme-toggle ${className}`}
      onClick={toggleTheme}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <AppIcon icon={theme === 'light' ? Icons.moon : Icons.sun} size={16} />
    </button>
  );
}
