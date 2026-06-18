import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppIcon, Icons, PROJECT_SECTION_ICONS } from './icons';
import { PROJECT_SECTIONS, PROJ_PAGES } from '../utils/helpers';

function NavBtn({ to, children, badge, badgeRed, onNavigate, className = '', end = false }) {
  const [iconNode, ...labelNodes] = Array.isArray(children) ? children : [children];
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item nav-item-stacked${isActive ? ' active' : ''}${className ? ` ${className}` : ''}`}
      onClick={onNavigate}
    >
      {iconNode}
      <span className="nav-item-label">{labelNodes}</span>
      {badge != null && badge > 0 && (
        <span className={`nb${badgeRed ? ' nb-red' : ''}`}>{badge}</span>
      )}
    </NavLink>
  );
}

function closeSidebar(setSidebarOpen) {
  setSidebarOpen(false);
}

export default function Sidebar() {
  const {
    projects = [],
    project,
    starredProjects,
    isProjectStarred,
    toggleStarProject,
    badges,
    switchProject,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [projectSearch, setProjectSearch] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    const applyPanelWidth = () => {
      const isMobile = window.innerWidth <= 900;
      const panelWidth = projectsOpen && !sidebarCollapsed && !isMobile ? '236px' : '0px';
      root.style.setProperty('--projects-panel-w', panelWidth);
    };
    applyPanelWidth();
    window.addEventListener('resize', applyPanelWidth);
    return () => {
      window.removeEventListener('resize', applyPanelWidth);
      root.style.setProperty('--projects-panel-w', '0px');
    };
  }, [projectsOpen, sidebarCollapsed]);

  const selectProject = (pid) => {
    switchProject(pid);
    setProjectsOpen(true);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(projectSearch.trim().toLowerCase())
  );

  const handlePrimaryNav = () => {
    setProjectsOpen(false);
    closeSidebar(setSidebarOpen);
  };

  const handleProjectsToggle = () => {
    setProjectsOpen((open) => {
      const next = !open;
      if (next) {
        const page = location.pathname.slice(1);
        if (!PROJ_PAGES.includes(page)) {
          if (!project && projects[0]?.id) {
            switchProject(projects[0].id);
          }
          navigate('/dashboard');
        }
      }
      return next;
    });
  };

  return (
    <aside className={`sidebar${sidebarOpen ? ' open' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}>
      <div className="sb-mobile-head">
        <span>Navigation</span>
        <strong>Tasks & Projects</strong>
      </div>
      <button type="button" className="sidebar-close" aria-label="Close menu" onClick={() => setSidebarOpen(false)}>
        <AppIcon icon={Icons.x} size={18} />
      </button>
      <div className="sb-section">
        <NavBtn to="/portfolio" onNavigate={handlePrimaryNav}>
          <AppIcon icon={Icons.layoutGrid} size={13} />
          All Projects
        </NavBtn>
        <NavBtn to="/my-tasks" badge={badges.tasks} badgeRed onNavigate={handlePrimaryNav}>
          <AppIcon icon={Icons.listChecks} size={13} />
          My Tasks
        </NavBtn>
      </div>

      <div className="sb-section sb-team-global-section">
        <NavBtn to="/team-members" end onNavigate={handlePrimaryNav}>
          <AppIcon icon={Icons.users} size={13} />
          All Team Members
        </NavBtn>
        <NavBtn to="/time-tracking" onNavigate={handlePrimaryNav}>
          <AppIcon icon={Icons.timer} size={13} />
          Time Tracking
        </NavBtn>
      </div>

     

      <div className="sb-proj-section">
        <div className="sb-proj-header">
          <button
            type="button"
            className={`sb-proj-toggle${projectsOpen ? ' active' : ''}`}
            onClick={handleProjectsToggle}
            aria-expanded={projectsOpen}
          >
            <span className="sb-proj-toggle-icon-wrap">
              <AppIcon
                icon={Icons.folder}
                size={13}
                strokeWidth={2}
                className="sb-proj-icon"
              />
              <AppIcon
                icon={Icons.chevronRight}
                size={10}
                strokeWidth={2.5}
                className={`sb-proj-chevron${projectsOpen ? ' open' : ''}`}
              />
            </span>
            <span className="sb-proj-toggle-label">Projects</span>
          </button>
        </div>
      </div>
      {projectsOpen && !sidebarCollapsed && (
        <div className="sb-proj-sidepanel" role="region" aria-label="Projects">
          <div className="sb-proj-sidepanel-label">Project navigation</div>
          <div className="sb-proj-sidepanel-search">
            <AppIcon icon={Icons.search} size={13} />
            <input
              type="text"
              placeholder="Search..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              aria-label="Search projects"
            />
          </div>
          <div className="sb-proj-sidepanel-list">
            {filteredProjects.length === 0 && (
              <div className="sb-proj-empty">No projects yet</div>
            )}
            {filteredProjects.map((p) => {
              const isActiveProject = project?.id === p.id;
              return (
              <div key={p.id} className={`sb-proj-side-item-wrap${isActiveProject ? ' expanded' : ''}`}>
                <div className="sb-proj-side-head">
                  <button
                    type="button"
                    className={`sb-proj-side-item${isActiveProject ? ' active' : ''}`}
                    aria-expanded={isActiveProject}
                    onClick={() => selectProject(p.id)}
                  >
                    <AppIcon icon={Icons.layoutGrid} size={13} />
                    <span className="sb-proj-side-item-name" title={p.name}>{p.name}</span>
                  </button>
                  <button
                    type="button"
                    className={`proj-star-btn${isProjectStarred(p.id) ? ' starred' : ''}`}
                    aria-label={isProjectStarred(p.id) ? `Remove ${p.name} from starred` : `Star ${p.name}`}
                    title={isProjectStarred(p.id) ? 'Remove from starred' : 'Add to starred'}
                    onClick={() => toggleStarProject(p.id)}
                  >
                    <AppIcon icon={Icons.star} size={12} fill={isProjectStarred(p.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                {isActiveProject && (
                  <div className="sb-proj-subsections sb-proj-subsections--inline" role="menu" aria-label={`${p.name} sections`}>
                    {PROJECT_SECTIONS.map(({ path, label, badgeKey, badgeRed }) => (
                      <NavLink
                        key={`${p.id}-${path}`}
                        to={`/${path}`}
                        className={({ isActive }) => `sb-proj-subitem${isActive ? ' active' : ''}`}
                        onClick={() => {
                          switchProject(p.id);
                          if (location.pathname !== `/${path}`) {
                            navigate(`/${path}`);
                          }
                          closeSidebar(setSidebarOpen);
                        }}
                      >
                        <AppIcon icon={PROJECT_SECTION_ICONS[path]} size={12} />
                        <span>{label}</span>
                        {badgeKey && badges[badgeKey] > 0 && (
                          <span className={`proj-tab-badge${badgeRed ? ' red' : ''}`}>{badges[badgeKey]}</span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
