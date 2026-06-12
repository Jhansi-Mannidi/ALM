import { useEffect } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AnimatedOutlet from './motion/AnimatedOutlet';
import WorkspaceApp from './workspace/WorkspaceApp';
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
import TimeSpentPage from './pages/TimeSpentPage';
import OrganizationTimePage from './pages/OrganizationTimePage';
import DeployPage from './pages/DeployPage';
import CredentialsPage from './pages/CredentialsPage';
import MaintPage from './pages/MaintPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import CreateWorkItemPage from './pages/CreateWorkItemPage';
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
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useApp();
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

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
              <Route element={<AnimatedOutlet />}>
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/create" element={<CreateWorkItemPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/my-tasks" element={<MyTasksPage />} />
                <Route path="/tasks/:issueId" element={<TaskDetailPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/team-members" element={<MembersPage />} />
                <Route path="/time-tracking" element={<OrganizationTimePage />} />
                <Route path="/project-team" element={<MembersPage />} />
                <Route path="/members" element={<Navigate to="/team-members" replace />} />
                <Route path="/backlog" element={<BacklogPage />} />
                <Route path="/sprint" element={<SprintPage />} />
                <Route path="/scrum" element={<ScrumPage />} />
                <Route path="/scope" element={<ScopePage />} />
                <Route path="/bugs" element={<BugsPage />} />
                <Route path="/testing" element={<Navigate to="/deploy" replace />} />
                <Route path="/time" element={<TimeSpentPage />} />
                <Route path="/deploy" element={<DeployPage />} />
                <Route path="/credentials" element={<CredentialsPage />} />
                <Route path="/maint" element={<MaintPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/roadmap" element={<Navigate to="/calendar" replace />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="*" element={<Navigate to="/portfolio" replace />} />
              </Route>
            </Routes>
          </div>
        </div>
      </main>
      <Modals />
      <ToastContainer />
    </div>
  );
}

function AppInitGate({ children }) {
  const { user, initializing, initError, retryInit } = useApp();

  if (initializing) {
    return (
      <motion.div
        className="app-init"
        aria-busy="true"
        aria-label="Loading application"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="app-init-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    );
  }

  if (!user) {
    return (
      <div className="app-init app-init-error">
        <div className="app-init-error-title">Could not load VoltusWave ALM</div>
        <p className="app-init-error-msg">{initError || 'Unable to connect to the API.'}</p>
        <button type="button" className="btn btn-primary" onClick={retryInit}>
          Retry
        </button>
      </div>
    );
  }

  return children;
}

function AppRouter() {
  const location = useLocation();

  if (location.pathname === '/') {
    return (
      <AppInitGate>
        <Navigate to="/workspace" replace />
      </AppInitGate>
    );
  }

  return (
    <AppInitGate>
      {location.pathname.startsWith('/workspace') ? <WorkspaceApp /> : <AppShell />}
    </AppInitGate>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <AppProvider>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </AppProvider>
        </ThemeProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
