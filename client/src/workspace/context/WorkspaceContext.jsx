import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ALL_APPS } from '../data/workspaceCatalog';

const WorkspaceContext = createContext(null);

const FAVORITES_KEY = 'voltusworkspace-favorites';
const RECENT_KEY = 'voltusworkspace-recent';

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function WorkspaceProvider({ children }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [favoriteIds, setFavoriteIds] = useState(() => readList(FAVORITES_KEY));
  const [recentIds, setRecentIds] = useState(() => readList(RECENT_KEY));

  const toggleFavorite = useCallback((appId) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId];
      writeList(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const trackRecent = useCallback((appId) => {
    setRecentIds((prev) => {
      const next = [appId, ...prev.filter((id) => id !== appId)].slice(0, 8);
      writeList(RECENT_KEY, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((appId) => favoriteIds.includes(appId), [favoriteIds]);

  const totalNotifications = useMemo(
    () => ALL_APPS.reduce((sum, app) => sum + (app.notificationCount || 0), 0),
    []
  );

  const value = useMemo(
    () => ({
      filter,
      setFilter,
      search,
      setSearch,
      viewMode,
      setViewMode,
      favoriteIds,
      recentIds,
      toggleFavorite,
      trackRecent,
      isFavorite,
      totalNotifications,
    }),
    [filter, search, viewMode, favoriteIds, recentIds, toggleFavorite, trackRecent, isFavorite, totalNotifications]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
