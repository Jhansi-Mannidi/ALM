import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ALM_ROLE_TO_RBAC,
  DEFAULT_RBAC_ROLES,
  DEFAULT_RBAC_USER_ASSIGNMENTS,
  RBAC_ASSIGNMENTS_STORAGE_KEY,
  RBAC_STORAGE_KEY,
  ALL_PERMISSION_IDS,
  expandPermissions,
  getAccessibleAppIds,
  getAccessibleSchemaIds,
  getAccessibleSolutionIds,
  getAccessibleWorkspaceIds,
  hasPermission,
} from '../data/rbacCatalog';
import { WORKSPACES } from '../data/platformCatalog';

const RbacContext = createContext(null);

function readRoles() {
  try {
    const raw = localStorage.getItem(RBAC_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_RBAC_ROLES.map((r) => ({ ...r, permissions: [...r.permissions] }));
}

function writeRoles(roles) {
  try {
    localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(roles));
  } catch {
    /* ignore */
  }
}

function readAssignments() {
  try {
    const raw = localStorage.getItem(RBAC_ASSIGNMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_RBAC_USER_ASSIGNMENTS.map((a) => ({ ...a }));
}

function writeAssignments(assignments) {
  try {
    localStorage.setItem(RBAC_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
  } catch {
    /* ignore */
  }
}

function syncRoleUserCounts(roles, assignments) {
  const counts = assignments.reduce((acc, a) => {
    acc[a.roleId] = (acc[a.roleId] || 0) + 1;
    return acc;
  }, {});
  return roles.map((r) => ({ ...r, users: counts[r.id] ?? 0 }));
}

export function RbacProvider({ children }) {
  const { role: almRole, user } = useApp();
  const [assignments, setAssignmentsState] = useState(readAssignments);
  const [roles, setRolesState] = useState(() => syncRoleUserCounts(readRoles(), readAssignments()));

  const setRoles = useCallback((updater) => {
    setRolesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeRoles(next);
      return next;
    });
  }, []);

  const setAssignments = useCallback((updater) => {
    setAssignmentsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeAssignments(next);
      setRolesState((rolePrev) => {
        const synced = syncRoleUserCounts(rolePrev, next);
        writeRoles(synced);
        return synced;
      });
      return next;
    });
  }, []);

  const assignmentForUser = useMemo(
    () => assignments.find((a) => a.email?.toLowerCase() === user?.email?.toLowerCase()),
    [assignments, user?.email]
  );

  const currentRbacRoleId =
    assignmentForUser?.roleId ?? (almRole ? (ALM_ROLE_TO_RBAC[almRole] ?? 'developer') : 'super-admin');
  const currentRole = roles.find((r) => r.id === currentRbacRoleId) ?? roles[0];
  const currentPermissions = currentRole?.permissions ?? [];
  const roleScope = currentRole?.scope ?? 'all-workspaces';

  const accessibleWorkspaceIds = useMemo(
    () => getAccessibleWorkspaceIds(currentPermissions, roleScope),
    [currentPermissions, roleScope]
  );

  const accessibleWorkspaces = useMemo(
    () => WORKSPACES.filter((w) => accessibleWorkspaceIds.includes(w.id)),
    [accessibleWorkspaceIds]
  );

  const canAccessWorkspace = useCallback(
    (workspaceId) => accessibleWorkspaceIds.includes(workspaceId),
    [accessibleWorkspaceIds]
  );

  const canAccessSchema = useCallback(
    (workspaceId, schemaId) =>
      getAccessibleSchemaIds(currentPermissions, workspaceId, roleScope).includes(schemaId),
    [currentPermissions, roleScope]
  );

  const canAccessSolution = useCallback(
    (solutionId) => getAccessibleSolutionIds(currentPermissions, roleScope).includes(solutionId),
    [currentPermissions, roleScope]
  );

  const canAccessApp = useCallback(
    (appId) => getAccessibleAppIds(currentPermissions).includes(appId),
    [currentPermissions]
  );

  const can = useCallback(
    (permId) => hasPermission(currentPermissions, permId),
    [currentPermissions]
  );

  const updateRole = useCallback(
    (roleId, patch) => {
      setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, ...patch } : r)));
    },
    [setRoles]
  );

  const updateRolePermissions = useCallback(
    (roleId, permissions) => {
      setRoles((prev) =>
        prev.map((r) => {
          if (r.id !== roleId) return r;
          const expanded = expandPermissions(permissions);
          const collapsed =
            r.id === 'super-admin' && expanded.length === ALL_PERMISSION_IDS.length
              ? ['all']
              : expanded;
          return { ...r, permissions: collapsed };
        })
      );
    },
    [setRoles]
  );

  const addRole = useCallback(
    (role) => {
      setRoles((prev) => [...prev, role]);
    },
    [setRoles]
  );

  const deleteRole = useCallback(
    (roleId) => {
      setRoles((prev) => prev.filter((r) => r.id !== roleId || r.type === 'system'));
    },
    [setRoles]
  );

  const assignUserRole = useCallback(
    (assignment) => {
      setAssignments((prev) => {
        const idx = prev.findIndex((a) => a.id === assignment.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...assignment };
          return next;
        }
        return [...prev, assignment];
      });
    },
    [setAssignments]
  );

  const removeUserAssignment = useCallback(
    (userId) => {
      setAssignments((prev) => prev.filter((a) => a.id !== userId));
    },
    [setAssignments]
  );

  const value = useMemo(
    () => ({
      roles,
      assignments,
      setRoles,
      setAssignments,
      updateRole,
      updateRolePermissions,
      addRole,
      deleteRole,
      assignUserRole,
      removeUserAssignment,
      currentRbacRoleId,
      currentRole,
      currentPermissions,
      roleScope,
      accessibleWorkspaces,
      canAccessWorkspace,
      canAccessSchema,
      canAccessSolution,
      canAccessApp,
      can,
    }),
    [
      roles,
      assignments,
      setRoles,
      setAssignments,
      updateRole,
      updateRolePermissions,
      addRole,
      deleteRole,
      assignUserRole,
      removeUserAssignment,
      currentRbacRoleId,
      currentRole,
      currentPermissions,
      roleScope,
      accessibleWorkspaces,
      canAccessWorkspace,
      canAccessSchema,
      canAccessSolution,
      canAccessApp,
      can,
    ]
  );

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>;
}

export function useRbac() {
  const ctx = useContext(RbacContext);
  if (!ctx) throw new Error('useRbac must be used within RbacProvider');
  return ctx;
}

export function useRbacOptional() {
  return useContext(RbacContext);
}
