import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProjectTabs from './components/ProjectTabs';
import ToastContainer from './components/ToastContainer';
import Modals from './components/Modals';
import PortfolioPage from './pages/PortfolioPage';
import DashboardPage from './pages/DashboardPage';
import MyTasksPage from './pages/MyTasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import MembersPage from './pages/MembersPage';
import BacklogPage from './pages/BacklogPage';
import SprintPage from './pages/SprintPage';
import ScrumPage from './pages/ScrumPage';
import ScopePage from './pages/ScopePage';
import BugsPage from './pages/BugsPage';
import TestingPage from './pages/TestingPage';
import DeployPage from './pages/DeployPage';
import CredentialsPage from './pages/CredentialsPage';
import MaintPage from './pages/MaintPage';
import RoadmapPage from './pages/RoadmapPage';
import ReportsPage from './pages/ReportsPage';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { PROJ_PAGES } from './utils/helpers';

function ProjectRouteSync() {
  const { project, projects, setProject } = useApp();
  const location = useLocation();
  const page = location.pathname.slice(1);

  useEffect(() => {
    if (!PROJ_PAGES.includes(page) || projects.length === 0) return;
    if (!project) setProject(projects[0]);
  }, [page, project, projects, setProject]);

  return null;
}

function AppShell() {
  const { user, initializing, sidebarOpen, setSidebarOpen, sidebarCollapsed } = useApp();
  if (initializing || !user) {
    return (
      <div className="app-init" aria-busy="true" aria-label="Loading application">
        <div className="app-init-spinner" />
      </div>
    );
  }

  return (
    <div className={`app-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay open"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar />
      <main className="main">
        <ProjectRouteSync />
        <Topbar />
        <ProjectTabs />
        <div className="content">
          <div className="page-view">
          <Routes>
            <Route path="/" element={<Navigate to="/portfolio" replace />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-tasks" element={<MyTasksPage />} />
            <Route path="/tasks/:issueId" element={<TaskDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/team-members" element={<MembersPage />} />
            <Route path="/project-team" element={<MembersPage />} />
            <Route path="/members" element={<Navigate to="/team-members" replace />} />
            <Route path="/backlog" element={<BacklogPage />} />
            <Route path="/sprint" element={<SprintPage />} />
            <Route path="/scrum" element={<ScrumPage />} />
            <Route path="/scope" element={<ScopePage />} />
            <Route path="/bugs" element={<BugsPage />} />
            <Route path="/testing" element={<TestingPage />} />
            <Route path="/deploy" element={<DeployPage />} />
            <Route path="/credentials" element={<CredentialsPage />} />
            <Route path="/maint" element={<MaintPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/portfolio" replace />} />
          </Routes>
          </div>
        </div>
      </main>
      <Modals />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
