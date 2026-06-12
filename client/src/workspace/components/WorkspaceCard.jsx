import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { WorkspaceIcon } from './WorkspaceIcons';

function useTrackOpen(appId) {
  const { trackRecent } = useWorkspace();
  return () => trackRecent(appId);
}

export function SolutionCard({ solution }) {
  return (
    <Link to={`/workspace/solutions/${solution.id}`} className="ws-card ws-card-solution">
      <span className="ws-badge ws-badge-solution">
        <WorkspaceIcon name="layers" size={10} strokeWidth={2.25} />
        Solution
      </span>
      {solution.notificationCount > 0 && (
        <span className="ws-badge ws-badge-count">{solution.notificationCount}</span>
      )}
      <div className="ws-card-icon-wrap" style={{ background: `${solution.color}18` }}>
        <WorkspaceIcon name={solution.icon} size={20} className="ws-card-icon" style={{ color: solution.color }} />
      </div>
      <h3 className="ws-card-title">{solution.name}</h3>
      <span className="chip chip-gray ws-card-meta">{solution.apps.length} apps</span>
      <p className="ws-card-desc">{solution.description}</p>
    </Link>
  );
}

export function AppCard({ app, solution, layout = 'grid' }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useWorkspace();
  const trackOpen = useTrackOpen(app.id);
  const favorited = isFavorite(app.id);
  const isExternalAlm = Boolean(app.externalRoute);
  const href = isExternalAlm
    ? app.externalRoute
    : app.route ||
      (solution
        ? `/workspace/solutions/${solution.id}/apps/${app.id}`
        : `/workspace/apps/${app.id}`);

  const handleClick = (e) => {
    trackOpen();
    if (isExternalAlm) {
      e.preventDefault();
      navigate(app.externalRoute);
    }
  };

  const cardClass = `ws-card ws-card-app${layout === 'list' ? ' ws-card-list' : ''}`;

  if (isExternalAlm) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={cardClass}
        onClick={() => {
          trackOpen();
          navigate(app.externalRoute);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trackOpen();
            navigate(app.externalRoute);
          }
        }}
      >
        <CardContent
          app={app}
          solution={solution}
          favorited={favorited}
          onToggleFavorite={() => toggleFavorite(app.id)}
        />
      </div>
    );
  }

  return (
    <Link to={href} className={cardClass} onClick={handleClick}>
      <CardContent
        app={app}
        solution={solution}
        favorited={favorited}
        onToggleFavorite={() => toggleFavorite(app.id)}
      />
    </Link>
  );
}

function CardContent({ app, solution, favorited, onToggleFavorite }) {
  return (
    <>
      {app.isNew && <span className="ws-badge ws-badge-new">New</span>}
      {app.notificationCount > 0 && (
        <span className="ws-badge ws-badge-count">{app.notificationCount}</span>
      )}
      <button
        type="button"
        className={`ws-fav-btn${favorited ? ' active' : ''}`}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        <Star size={13} strokeWidth={2} fill={favorited ? 'currentColor' : 'none'} aria-hidden />
      </button>
      <div className="ws-card-icon-wrap ws-card-icon-app">
        <WorkspaceIcon name={app.icon} size={20} className="ws-card-icon" />
      </div>
      <h3 className="ws-card-title">{app.name}</h3>
      {solution?.name && <span className="chip chip-blue ws-card-meta">{solution.name}</span>}
      <p className="ws-card-desc">{app.description}</p>
    </>
  );
}

export function AppListCard({ app, solution, onOpen }) {
  return (
    <div className="ws-app-list-card">
      <div className="ws-app-list-icon">
        <WorkspaceIcon name={app.icon} size={22} />
      </div>
      <div className="ws-app-list-body">
        <div className="ws-app-list-head">
          <h3 className="ws-app-list-title">{app.name}</h3>
          {app.isNew && <span className="ws-badge ws-badge-new ws-badge-inline">New</span>}
          {app.notificationCount > 0 && (
            <span className="ws-badge ws-badge-count ws-badge-inline">{app.notificationCount}</span>
          )}
        </div>
        <p className="ws-app-list-desc">{app.description}</p>
        {app.highlights?.length > 0 && (
          <ul className="ws-app-highlights">
            {app.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" className="btn btn-primary btn-sm" onClick={onOpen}>
        Open App
      </button>
    </div>
  );
}
