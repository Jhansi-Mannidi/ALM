import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { slideDownVariants } from '../motion/presets';
import ThemeToggle from './ThemeToggle';
import { AppIcon, Icons } from './icons';

export default function Topbar() {
  const { badges, setSidebarOpen } = useApp();
  const navigate = useNavigate();

  return (
    <motion.div
      className="topbar"
      variants={slideDownVariants}
      initial="hidden"
      animate="visible"
    >
      <button
        type="button"
        className="icon-btn menu-btn"
        aria-label="Open menu"
        onClick={() => setSidebarOpen(true)}
      >
        <AppIcon icon={Icons.menu} size={18} />
      </button>
      <div className="tb-right">
        <ThemeToggle />
        <div
          className="icon-btn notif-badge"
          data-count={badges.notif}
          onClick={() => navigate('/notifications')}
        >
          <AppIcon icon={Icons.bell} size={15} />
        </div>
      </div>
    </motion.div>
  );
}
