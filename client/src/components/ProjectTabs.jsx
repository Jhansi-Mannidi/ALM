import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppIcon, Icons, PROJECT_SECTION_ICONS } from './icons';
import { PROJ_PAGES, PROJECT_SECTIONS } from '../utils/helpers';

export default function ProjectTabs() {
  const { project, projects, badges, permissions, setModal, setCreateTab } = useApp();
  const location = useLocation();
  const page = location.pathname.slice(1);

  if (!PROJ_PAGES.includes(page)) return null;

  const activeProject = project || projects[0];
  if (!activeProject) return null;

  return (
    <div className="proj-tabs-bar">
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
          onClick={() => {
            setCreateTab('story');
            setModal('create');
          }}
        >
          <AppIcon icon={Icons.plus} size={14} />
          Create
        </button>
      )}
    </div>
  );
}
