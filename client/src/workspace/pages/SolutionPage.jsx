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
    <div className="ws-page">
      <Link to="/workspace" className="ws-back-link">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Workspace
      </Link>

      <div className="ws-solution-hero">
        <div className="ws-solution-hero-icon" style={{ background: `${solution.color}18` }}>
          <WorkspaceIcon name={solution.icon} size={36} style={{ color: solution.color }} />
        </div>
        <div>
          <h1 className="ws-page-title">{solution.name}</h1>
          <p className="ws-page-subtitle">{solution.description}</p>
        </div>
      </div>

      <div className="g4 mb20">
        {solution.stats.map((stat) => (
          <div key={stat.label} className="stat">
            <div className="stat-bar" style={{ background: solution.color }} />
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="ws-section-head">
        <h2 className="ws-section-title">Apps in this Solution</h2>
        <p className="ws-section-sub">Select an app to get started</p>
      </div>

      <div className="ws-app-list">
        {visibleApps.map((app) => (
          <AppListCard key={app.id} app={app} solution={solution} onOpen={() => openApp(app)} />
        ))}
      </div>
      {visibleApps.length === 0 && (
        <p className="ws-rbac-muted">No apps available for your role in this solution.</p>
      )}
    </div>
  );
}
