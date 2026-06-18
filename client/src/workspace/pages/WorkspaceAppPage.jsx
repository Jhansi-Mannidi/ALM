import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppIcon, Icons } from '../../components/icons';
import { getApp, getSolution } from '../data/workspaceCatalog';
import { useWorkspace } from '../context/WorkspaceContext';
import { WorkspaceIcon } from '../components/WorkspaceIcons';

export default function WorkspaceAppPage() {
  const { solutionId, appId } = useParams();
  const navigate = useNavigate();
  const { trackRecent } = useWorkspace();
  const solution = getSolution(solutionId);
  const app = getApp(solutionId, appId);

  if (!solution || !app) {
    return (
      <div className="ws-page">
        <p>App not found.</p>
      </div>
    );
  }

  const handleOpen = () => {
    trackRecent(app.id);
    if (app.externalRoute) {
      navigate(app.externalRoute);
    }
  };

  return (
    <div className="ws-page">
      <Link to={`/workspace/solutions/${solutionId}`} className="ws-back-link">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to {solution.name}
      </Link>

      <div className="ws-app-detail">
        <div className="ws-app-detail-icon">
          <WorkspaceIcon name={app.icon} size={40} />
        </div>
        <div className="ws-app-detail-body">
          <h1 className="ws-page-title">{app.name}</h1>
          <span className="chip chip-blue">{solution.name}</span>
          <p className="ws-page-subtitle">{app.description}</p>
          {app.highlights?.length > 0 && (
            <ul className="ws-app-highlights ws-app-highlights-detail">
              {app.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          <div className="ws-app-detail-actions">
            {app.externalRoute ? (
              <button type="button" className="btn btn-primary" onClick={handleOpen}>
                {app.externalLabel || 'Open App'}
                <AppIcon icon={Icons.externalLink} size={14} />
              </button>
            ) : (
              <div className="ws-coming-soon">
                <AppIcon icon={Icons.clock} size={18} />
                <div>
                  <strong>Coming soon</strong>
                  <p>This app module is under development in VoltusWave ALM.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
