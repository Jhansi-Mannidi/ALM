import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { slideDownVariants } from '../motion/presets';
import { AppIcon, Icons, PROJECT_SECTION_ICONS } from './icons';
import { PROJ_PAGES, PROJECT_SECTIONS } from '../utils/helpers';

export default function ProjectTabs() {
  const { project, projects, badges, permissions } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const page = location.pathname.slice(1);

  const activeProject = project || projects[0];
  const visible = PROJ_PAGES.includes(page) && activeProject;

  return (
    <AnimatePresence>
      {visible && (
    <motion.div
      className="proj-tabs-bar"
      key={activeProject.id}
      variants={slideDownVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
    >
      <div className="proj-tabs-project">
        <span className="proj-tabs-dot" style={{ background: activeProject.color }} />
        <span className="proj-tabs-name" title={activeProject.name}>
          {activeProject.name}
        </span>
      </div>
      <div className="proj-tabs-wrap">
        <nav className="proj-tabs" aria-label="Project sections">
          {PROJECT_SECTIONS.map(({ path, label, badgeKey, badgeRed }) => (
            <NavLink
              key={path}
              to={`/${path}`}
              className={({ isActive }) => `proj-tab${isActive ? ' active' : ''}`}
            >
              <AppIcon icon={PROJECT_SECTION_ICONS[path]} size={14} className="proj-tab-icon" />
              {label}
              {badgeKey && badges[badgeKey] > 0 && (
                <span className={`proj-tab-badge${badgeRed ? ' red' : ''}`}>{badges[badgeKey]}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      {permissions.createIssue && (
        <button
          type="button"
          className="btn btn-primary btn-sm proj-tabs-create fx"
          onClick={() => navigate('/create?type=story', { state: { from: location.pathname } })}
        >
          <AppIcon icon={Icons.plus} size={14} />
          Create
        </button>
      )}
    </motion.div>
      )}
    </AnimatePresence>
  );
}
