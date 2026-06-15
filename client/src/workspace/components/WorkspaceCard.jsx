import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { AppIcon, Icons } from '../../components/icons';
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
  const accent = solution?.color || '#2563EB';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <article
      className="ws-solution-app-card"
      style={{ '--app-accent': accent }}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="ws-solution-app-icon">
        <WorkspaceIcon name={app.icon} size={24} style={{ color: accent }} />
      </div>

      <div className="ws-solution-app-content">
        <div className="ws-solution-app-head">
          <h3 className="ws-solution-app-title">{app.name}</h3>
          <div className="ws-solution-app-badges">
            {app.isNew && <span className="ws-solution-badge new">New</span>}
            {app.notificationCount > 0 && (
              <span className="ws-solution-badge count">{app.notificationCount}</span>
            )}
          </div>
        </div>
        <p className="ws-solution-app-desc">{app.description}</p>
        {app.highlights?.length > 0 && (
          <div className="ws-solution-app-highlights">
            {app.highlights.map((h) => (
              <span key={h} className="ws-solution-highlight-chip">{h}</span>
            ))}
          </div>
        )}
      </div>

      <div className="ws-solution-app-action">
        <span className="ws-solution-open-btn">
          Open App
          <AppIcon icon={Icons.arrowRight} size={14} />
        </span>
      </div>
    </article>
  );
}
