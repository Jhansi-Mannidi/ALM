import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RoleAccessDropdown from './RoleAccessDropdown';
import { AppIcon, Icons } from './icons';

function NavBtn({ to, children, badge, badgeRed, onNavigate, className = '', end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}${className ? ` ${className}` : ''}`}
      onClick={onNavigate}
    >
      {children}
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
    badges,
    permissions,
    switchProject,
    setModal,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapsed,
  } = useApp();
  const navigate = useNavigate();
  const [projectsOpen, setProjectsOpen] = useState(true);

  const selectProject = (pid) => {
    switchProject(pid);
    navigate('/dashboard');
    closeSidebar(setSidebarOpen);
  };

  return (
    <aside className={`sidebar${sidebarOpen ? ' open' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}>
      <button type="button" className="sidebar-close" aria-label="Close menu" onClick={() => setSidebarOpen(false)}>
        <AppIcon icon={Icons.x} size={18} />
      </button>
      <div className="sb-brand">
        <div className="sb-brand-main">
          <div className="sb-logo">
            <AppIcon icon={Icons.logo} size={16} strokeWidth={2.5} className="sb-logo-icon" />
          </div>
          <div>
            <div className="sb-name">VoltusWave ALM</div>
            <div className="sb-tag">Enterprise</div>
          </div>
        </div>
        <button
          type="button"
          className="sb-collapse-btn"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggleSidebarCollapsed}
        >
          <AppIcon icon={sidebarCollapsed ? Icons.panelLeftOpen : Icons.panelLeftClose} size={18} />
        </button>
      </div>
      <div className="sb-role-badge">
        <RoleAccessDropdown variant="sidebar" />
      </div>

      <div className="sb-section">
        <div className="sb-slabel">Workspace</div>
        <NavBtn to="/portfolio" onNavigate={() => closeSidebar(setSidebarOpen)}>
          <AppIcon icon={Icons.layoutGrid} size={13} />
          All Projects
        </NavBtn>
        <NavBtn to="/my-tasks" badge={badges.tasks} badgeRed onNavigate={() => closeSidebar(setSidebarOpen)}>
          <AppIcon icon={Icons.listChecks} size={13} />
          My Tasks
        </NavBtn>
        <NavBtn to="/notifications" badge={badges.notif} badgeRed onNavigate={() => closeSidebar(setSidebarOpen)}>
          <AppIcon icon={Icons.bell} size={13} />
          Notifications
        </NavBtn>
      </div>

      <div className="sb-section sb-team-global-section">
        <div className="sb-slabel">Team Members</div>
        <NavBtn to="/team-members" end onNavigate={() => closeSidebar(setSidebarOpen)}>
          <AppIcon icon={Icons.users} size={13} />
          All Team Members
        </NavBtn>
      </div>

      <div className="sb-proj-section">
        <div className="sb-proj-header">
          <button
            type="button"
            className="sb-proj-toggle"
            onClick={() => setProjectsOpen((o) => !o)}
            aria-expanded={projectsOpen}
          >
            <AppIcon
              icon={Icons.chevronRight}
              size={10}
              strokeWidth={2.5}
              className={`sb-proj-chevron${projectsOpen ? ' open' : ''}`}
            />
            Projects
          </button>
          {permissions.createProj && (
            <button
              type="button"
              className="sb-proj-add"
              title="Create project"
              aria-label="Create project"
              onClick={() => setModal('newproj')}
            >
              <AppIcon icon={Icons.plus} size={14} />
            </button>
          )}
        </div>

        {projectsOpen && (
          <div className="sb-proj-list">
            {projects.length === 0 && (
              <div className="sb-proj-empty">No projects yet</div>
            )}
            {projects.map((p) => {
              const isActive = project?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`proj-item${isActive ? ' active' : ''}`}
                  onClick={() => selectProject(p.id)}
                >
                  <div className="proj-dot" style={{ background: p.color }} />
                  <span className="proj-name" title={p.name}>
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
