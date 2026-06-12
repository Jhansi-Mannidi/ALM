import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useRbac } from '../context/RbacContext';
import { SOLUTIONS, ALL_APPS, getSolutionForApp } from '../data/workspaceCatalog';
import FilterTabs from '../components/FilterTabs';
import { SolutionCard, AppCard } from '../components/WorkspaceCard';

function matchesSearch(text, query) {
  if (!query) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

export default function WorkspaceHomePage() {
  const { user } = useApp();
  const { filter, setFilter, search, viewMode, favoriteIds, recentIds } = useWorkspace();
  const { canAccessApp, canAccessSolution, currentRole } = useRbac();

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalNotifs = ALL_APPS.reduce((s, a) => s + (a.notificationCount || 0), 0);
  const firstName = user?.name?.split(' ')[0] || 'there';

  const items = useMemo(() => {
    const q = search.trim();
    let solutions = SOLUTIONS.filter(
      (s) =>
        canAccessSolution(s.id) &&
        (matchesSearch(s.name, q) || matchesSearch(s.description, q))
    );
    let apps = ALL_APPS.filter(
      (a) =>
        canAccessApp(a.id) &&
        (matchesSearch(a.name, q) || matchesSearch(a.description, q))
    );

    if (filter === 'favorites') {
      apps = apps.filter((a) => favoriteIds.includes(a.id));
      solutions = [];
    } else if (filter === 'recent') {
      apps = recentIds.map((id) => ALL_APPS.find((a) => a.id === id)).filter(Boolean);
      solutions = [];
    } else if (filter === 'solutions') {
      apps = [];
    } else if (filter === 'apps') {
      solutions = [];
    }

    return { solutions, apps };
  }, [filter, search, favoriteIds, recentIds, canAccessApp, canAccessSolution]);

  const gridClass = viewMode === 'list' ? 'ws-grid ws-grid-list' : 'ws-grid';

  return (
    <div className="ws-page">
      <div className="ws-welcome">
        <h2 className="ws-welcome-title">Welcome back, {firstName}</h2>
        <p className="ws-welcome-sub">
          {today} • You have {totalNotifs} notifications across your items
          {currentRole && (
            <> • Access level: <strong>{currentRole.name}</strong></>
          )}
        </p>
      </div>

      <FilterTabs value={filter} onChange={setFilter} />

      {items.solutions.length === 0 && items.apps.length === 0 && (
        <div className="ws-empty">
          {filter === 'favorites'
            ? 'No favorite apps yet. Star an app to add it here.'
            : filter === 'recent'
              ? 'No recently used apps yet.'
              : 'No results match your search.'}
        </div>
      )}

      <div className={gridClass}>
        {items.solutions.map((solution) => (
          <SolutionCard key={solution.id} solution={solution} />
        ))}
        {items.apps.map((app) => {
          const solution = getSolutionForApp(app.id);
          return <AppCard key={app.id} app={app} solution={solution} layout={viewMode} />;
        })}
      </div>
    </div>
  );
}
