import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppIcon, Icons } from '../../components/icons';
import { getSolution } from '../data/workspaceCatalog';
import { useWorkspace } from '../context/WorkspaceContext';
import { useRbac } from '../context/RbacContext';
import { AppListCard } from '../components/WorkspaceCard';
import { WorkspaceIcon } from '../components/WorkspaceIcons';

export default function SolutionPage() {
  const { solutionId } = useParams();
  const navigate = useNavigate();
  const { trackRecent } = useWorkspace();
  const { canAccessApp, canAccessSolution } = useRbac();
  const solution = getSolution(solutionId);

  if (!solution) {
    return (
      <div className="ws-page">
        <p>Solution not found.</p>
        <Link to="/workspace" className="btn btn-ghost btn-sm">
          Back to Workspace
        </Link>
      </div>
    );
  }

  if (!canAccessSolution(solutionId)) {
    return (
      <div className="ws-page">
        <Link to="/workspace" className="ws-back-link">
          <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
          Back to Workspace
        </Link>
        <div className="ws-rbac-access-denied card">
          <AppIcon icon={Icons.lock} size={32} />
          <h2>Access Restricted</h2>
          <p>Your role does not include access to {solution.name}. Contact your workspace admin to request access.</p>
        </div>
      </div>
    );
  }

  const visibleApps = solution.apps.filter((app) => canAccessApp(app.id));

  const openApp = (app) => {
    trackRecent(app.id);
    if (app.externalRoute) {
      navigate(app.externalRoute);
      return;
    }
    if (app.route) {
      navigate(app.route);
      return;
    }
    navigate(`/workspace/solutions/${solutionId}/apps/${app.id}`);
  };

  return (
    <div
      className="ws-page ws-solution-page"
      style={{ '--solution-color': solution.color }}
    >
      <Link to="/workspace" className="ws-back-link">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Workspace
      </Link>

      <header className="ws-solution-banner">
        <div className="ws-solution-banner-glow" aria-hidden />
        <div className="ws-solution-banner-inner">
          <div className="ws-solution-hero-icon">
            <WorkspaceIcon name={solution.icon} size={36} strokeWidth={1.75} style={{ color: solution.color }} />
          </div>
          <div className="ws-solution-hero-copy">
            <span className="chip chip-blue chip-xs ws-solution-kicker">Solution</span>
            <h1 className="ws-solution-title">{solution.name}</h1>
            <p className="ws-solution-subtitle">{solution.description}</p>
          </div>
          <div className="ws-solution-hero-badges">
            <span className="ws-solution-pill">{visibleApps.length} apps</span>
            {solution.notificationCount > 0 && (
              <span className="ws-solution-pill ws-solution-pill-alert">
                {solution.notificationCount} alerts
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="ws-hr-stats ws-solution-stats" aria-label="Solution metrics">
        {solution.stats.map((stat) => (
          <div key={stat.label} className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stat.value}</div>
            <div className="ws-hr-stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="ws-solution-apps">
        <div className="ws-solution-apps-head">
          <div>
            <h2 className="ws-section-title">Apps in this Solution</h2>
            <p className="ws-section-sub">Launch a module to manage your operations</p>
          </div>
          <span className="ws-solution-apps-count">{visibleApps.length} available</span>
        </div>

        <div className="ws-solution-app-list">
          {visibleApps.map((app) => (
            <AppListCard key={app.id} app={app} solution={solution} onOpen={() => openApp(app)} />
          ))}
        </div>

        {visibleApps.length === 0 && (
          <p className="ws-rbac-muted">No apps available for your role in this solution.</p>
        )}
      </section>
    </div>
  );
}
