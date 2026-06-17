import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { can, canCreateAnyWorkItem, isWorkflowComplete, roleLabel } from '../utils/helpers';
import { readStarredProjectIds, writeStarredProjectIds } from '../utils/starredProjects';

const AppContext = createContext(null);
const AUTH_SESSION_KEY = 'voltuswave-auth-session';
const SIDEBAR_COLLAPSED_KEY = 'voltuswave-sidebar-collapsed';

function readAuthSession() {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeAuthSession(session) {
  try {
    if (session) {
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    }
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function AppProvider({ children }) {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [assignCtx, setAssignCtx] = useState({ issueId: null, ticketId: null, userId: null });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);
  const [initError, setInitError] = useState(null);
  const [starredIds, setStarredIds] = useState(readStarredProjectIds);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toast = useCallback((msg, type = '') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const refreshProjects = useCallback(async () => {
    const data = await api.getProjects();
    setProjects(data);
    setProject((cur) => (cur ? data.find((p) => p.id === cur.id) || data[0] : data[0]));
    return data;
  }, []);

  const refreshNotifications = useCallback(async () => {
    const data = await api.getNotifications();
    setNotifications(data);
    return data;
  }, []);

  const refreshUsers = useCallback(async () => {
    const data = await api.getUsers();
    setUsers(data);
    return data;
  }, []);

  const applySession = useCallback((r, u, projs, notifs, usrs) => {
    setRole(r);
    setUser(u);
    setProjects(projs ?? []);
    setProject((cur) => {
      const list = projs ?? [];
      return cur ? list.find((p) => p.id === cur.id) || list[0] : list[0];
    });
    setNotifications(notifs ?? []);
    setUsers(usrs ?? []);
  }, []);

  const login = useCallback(async (selectedRole) => {
    const { role: r, user: u } = await api.login(selectedRole);
    const [projs, notifs, usrs] = await Promise.all([
      api.getProjects(),
      api.getNotifications(),
      api.getUsers(),
    ]);
    applySession(r, u, projs, notifs, usrs);
    writeAuthSession({ role: r, email: u?.email || null });
  }, [applySession]);

  const loginWithCredentials = useCallback(async (email, password) => {
    const { role: r, user: u } = await api.loginWithCredentials(email, password);
    const [projs, notifs, usrs] = await Promise.all([
      api.getProjects(),
      api.getNotifications(),
      api.getUsers(),
    ]);
    applySession(r, u, projs, notifs, usrs);
    writeAuthSession({ role: r, email: u?.email || email });
  }, [applySession]);

  const switchRole = useCallback(
    async (selectedRole) => {
      const { role: r, user: u } = await api.login(selectedRole);
      setRole(r);
      setUser(u);
      toast(`Switched to ${roleLabel(r)} view`, 'ok');
    },
    [toast]
  );

  const logout = useCallback(() => {
    writeAuthSession(null);
    setRole(null);
    setUser(null);
    setProject(null);
    setProjects([]);
    setNotifications([]);
  }, []);

  const switchProject = useCallback(
    async (pid) => {
      const p = projects.find((x) => x.id === pid);
      if (p) {
        setProject(p);
        toast(`Switched to ${p.name}`, 'ok');
      }
    },
    [projects, toast]
  );

  const addNotification = useCallback(
    async (text, type = 'task') => {
      await api.addNotification({ text, type });
      await refreshNotifications();
    },
    [refreshNotifications]
  );

  const starredProjects = useMemo(
    () => starredIds.map((id) => projects.find((p) => p.id === id)).filter(Boolean),
    [starredIds, projects]
  );

  const isProjectStarred = useCallback((projectId) => starredIds.includes(projectId), [starredIds]);

  const toggleStarProject = useCallback(
    (projectId) => {
      setStarredIds((prev) => {
        const next = prev.includes(projectId)
          ? prev.filter((id) => id !== projectId)
          : [...prev, projectId];
        writeStarredProjectIds(next);
        return next;
      });
    },
    []
  );

  const badges = useMemo(() => {
    const openBugs = (projects ?? []).reduce(
      (s, pr) => s + (pr.bugs ?? []).filter((b) => !isWorkflowComplete(b.status)).length,
      0
    );
    return {
      tasks: project
        ? (project.issues ?? []).filter((i) => i.assign === user?.id && !isWorkflowComplete(i.status)).length
        : 0,
      backlog: project ? (project.issues ?? []).filter((i) => !isWorkflowComplete(i.status)).length : 0,
      bugs: openBugs,
      notif: (notifications ?? []).filter((n) => !n.read).length,
    };
  }, [project, projects, user, notifications]);

  const permissions = useMemo(
    () => ({
      createProj: can(role, 'createProj'),
      addMem: can(role, 'addMem'),
      createTask: can(role, 'createTask'),
      createBug: can(role, 'createBug'),
      createFeature: can(role, 'createFeature'),
      createEpic: can(role, 'createEpic'),
      assign: can(role, 'assign'),
      addClientReq: can(role, 'addClientReq'),
      addDevReq: can(role, 'addDevReq'),
      editTechStack: can(role, 'editTechStack'),
      addTesterScope: can(role, 'addTesterScope'),
      deploy: can(role, 'deploy'),
      credentials: can(role, 'credentials'),
      createIssue: canCreateAnyWorkItem(role),
      bug: can(role, 'createBug'),
      addReq: can(role, 'addClientReq') || can(role, 'addDevReq') || can(role, 'editTechStack'),
    }),
    [role]
  );

  useEffect(() => {
    if (!role) return;
    const id = setInterval(() => {
      refreshProjects();
      refreshNotifications();
      refreshUsers();
    }, 30000);
    return () => clearInterval(id);
  }, [role, refreshProjects, refreshNotifications, refreshUsers]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitError(null);
      setInitializing(true);
      try {
        localStorage.removeItem(AUTH_SESSION_KEY);
        const session = readAuthSession();
        if (session?.role) {
          await login(session.role);
        }
      } catch (e) {
        console.error('Failed to restore session', e);
        writeAuthSession(null);
        if (!cancelled) setInitError(e.message || 'Failed to connect to API');
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [login]);

  const retryInit = useCallback(async () => {
    setInitError(null);
    setInitializing(true);
    try {
      const session = readAuthSession();
      if (session?.role) {
        await login(session.role);
      }
    } catch (e) {
      writeAuthSession(null);
      setInitError(e.message || 'Failed to connect to API');
    } finally {
      setInitializing(false);
    }
  }, [login]);

  const value = {
    initializing,
    initError,
    retryInit,
    role,
    user,
    users,
    projects,
    project,
    setProject,
    notifications,
    badges,
    permissions,
    modal,
    setModal,
    assignCtx,
    setAssignCtx,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    toasts,
    toast,
    login,
    loginWithCredentials,
    logout,
    switchRole,
    switchProject,
    refreshProjects,
    refreshNotifications,
    refreshUsers,
    addNotification,
    starredProjects,
    isProjectStarred,
    toggleStarProject,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
