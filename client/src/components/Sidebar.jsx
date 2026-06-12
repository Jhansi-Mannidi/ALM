import { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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

function ProjectRow({ project, isActive, isStarred, onSelect, onToggleStar }) {
  return (
    <motion.div
      className={`proj-item-wrap${isActive ? ' active' : ''}`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
      whileHover={{ x: 2 }}
    >
      <button type="button" className="proj-item" onClick={() => onSelect(project.id)}>
        <span className="proj-name" title={project.name}>
          {project.name}
        </span>
      </button>
      <button
        type="button"
        className={`proj-star-btn${isStarred ? ' starred' : ''}`}
        aria-label={isStarred ? `Remove ${project.name} from starred` : `Star ${project.name}`}
        title={isStarred ? 'Remove from starred' : 'Add to starred'}
        onClick={() => onToggleStar(project.id)}
      >
        <AppIcon icon={Icons.star} size={12} fill={isStarred ? 'currentColor' : 'none'} />
      </button>
    </motion.div>
  );
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
            <div className="sb-name">VoltusWorkspace</div>
            <div className="sb-tag">Tasks &amp; Projects</div>
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
      </div>

      <div className="sb-section sb-team-global-section">
        <div className="sb-slabel">Team Members</div>
        <NavBtn to="/team-members" end onNavigate={() => closeSidebar(setSidebarOpen)}>
          <AppIcon icon={Icons.users} size={13} />
          All Team Members
        </NavBtn>
        <NavBtn to="/time-tracking" onNavigate={() => closeSidebar(setSidebarOpen)}>
          <AppIcon icon={Icons.timer} size={13} />
          Time Tracking
        </NavBtn>
      </div>

      <div className="sb-section sb-starred-section">
        <div className="sb-slabel">Starred</div>
        {starredProjects.length === 0 && (
          <div className="sb-proj-empty">Star a project from the list below</div>
        )}
        {starredProjects.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`nav-item${project?.id === p.id ? ' active' : ''}`}
            onClick={() => selectProject(p.id)}
          >
            <AppIcon icon={Icons.star} size={13} className="sb-starred-icon" fill="currentColor" />
            <span className="proj-name" title={p.name}>{p.name}</span>
          </button>
        ))}
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
        </div>

        {projectsOpen && (
          <div className="sb-proj-list">
            {projects.length === 0 && (
              <div className="sb-proj-empty">No projects yet</div>
            )}
            {projects.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
                isActive={project?.id === p.id}
                isStarred={isProjectStarred(p.id)}
                onSelect={selectProject}
                onToggleStar={toggleStarProject}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
