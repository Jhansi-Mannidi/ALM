import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ALL_APPS } from '../data/workspaceCatalog';

const WorkspaceContext = createContext(null);

const FAVORITES_KEY = 'voltusworkspace-favorites';
const PLATFORM_FAVORITES_KEY = 'voltusworkspace-platform-favorites';
const RECENT_KEY = 'voltusworkspace-recent';
const PLATFORM_KEY = 'voltusworkspace-platform-selection';

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

function readPlatformSelection() {
  try {
    const raw = sessionStorage.getItem(PLATFORM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writePlatformSelection(selection) {
  try {
    if (selection) {
      sessionStorage.setItem(PLATFORM_KEY, JSON.stringify(selection));
    } else {
      sessionStorage.removeItem(PLATFORM_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function WorkspaceProvider({ children }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [favoriteIds, setFavoriteIds] = useState(() => readList(FAVORITES_KEY));
  const [platformFavoriteIds, setPlatformFavoriteIds] = useState(() => readList(PLATFORM_FAVORITES_KEY));
  const [recentIds, setRecentIds] = useState(() => readList(RECENT_KEY));
  const [launcherOpen, setLauncherOpen] = useState(false);
  const launcherAnchorRef = useRef(null);
  const [platformSelection, setPlatformSelectionState] = useState(() => readPlatformSelection());

  const setPlatformSelection = useCallback((next) => {
    setPlatformSelectionState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      writePlatformSelection(value);
      return value;
    });
  }, []);

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

  const togglePlatformFavorite = useCallback((key) => {
    setPlatformFavoriteIds((prev) => {
      const next = prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key];
      writeList(PLATFORM_FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const isPlatformFavorite = useCallback(
    (key) => platformFavoriteIds.includes(key),
    [platformFavoriteIds]
  );

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
      platformFavoriteIds,
      togglePlatformFavorite,
      isPlatformFavorite,
      totalNotifications,
      launcherOpen,
      setLauncherOpen,
      launcherAnchorRef,
      platformSelection,
      setPlatformSelection,
    }),
    [
      filter,
      search,
      viewMode,
      favoriteIds,
      recentIds,
      toggleFavorite,
      trackRecent,
      isFavorite,
      platformFavoriteIds,
      togglePlatformFavorite,
      isPlatformFavorite,
      totalNotifications,
      launcherOpen,
      launcherAnchorRef,
      platformSelection,
      setPlatformSelection,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
