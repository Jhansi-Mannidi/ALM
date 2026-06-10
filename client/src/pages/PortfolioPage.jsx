import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { roleLabel } from '../utils/helpers';
import { AppIcon, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';
import { downloadScopeDoc, phaseChipClass, phaseLabel } from '../utils/helpers';

export default function PortfolioPage() {
  const { role, projects = [], permissions, switchProject, setModal } = useApp();
  const navigate = useNavigate();

  const tot = projects.length;
  const on = projects.filter((p) => p.status === 'ontrack').length;
  const del = projects.filter((p) => p.status === 'delayed').length;
  const totIssues = projects.reduce((s, p) => s + p.issues.length, 0);

  const handleProjectClick = (pid) => {
    switchProject(pid);
    navigate('/dashboard');
  };

  return (
    <>
      <PageHeader
        title="Portfolio Overview"
        subtitle={`${roleLabel(role).toUpperCase()} View · ${projects.length} projects`}
        actions={
          permissions.createProj && (
            <button type="button" className="btn btn-ghost btn-sm ph-btn-compact fx g4" onClick={() => setModal('newproj')}>
              <AppIcon icon={Icons.plus} size={14} />
              New Project
            </button>
          )
        }
      />

      <div className="g4 mb20">
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--blue)' }} />
          <div className="stat-label">Total Projects</div>
          <div className="stat-value">{tot}</div>
          <div className="stat-sub">Active portfolio</div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--green)' }} />
          <div className="stat-label">On Track</div>
          <div className="stat-value">{on}</div>
          <div className="stat-sub">
            <span className="up">{tot ? Math.round((on / tot) * 100) : 0}%</span> healthy
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--red)' }} />
          <div className="stat-label">Delayed</div>
          <div className="stat-value">{del}</div>
          <div className="stat-sub">
            <span className="dn">{del} need attention</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--amber)' }} />
          <div className="stat-label">Total Issues</div>
          <div className="stat-value">{totIssues}</div>
          <div className="stat-sub">Across all projects</div>
        </div>
      </div>

      <div className="g3">
        {projects.map((p) => {
          const openBugs = p.bugs.filter((b) => b.status !== 'Resolved').length;
          const crit = p.bugs.filter((b) => b.sev === 'Critical' && b.status !== 'Resolved').length;
          const statusChip =
            p.status === 'ontrack' ? 'chip-green' : p.status === 'delayed' ? 'chip-red' : 'chip-amber';
          const statusLabel =
            p.status === 'ontrack' ? 'On Track' : p.status === 'delayed' ? 'Delayed' : 'On Hold';

          return (
            <div key={p.id} className="proj-card" onClick={() => handleProjectClick(p.id)}>
              <div className="proj-card-top">
                <div className="proj-card-hd">
                  <div
                    className="proj-code-badge"
                    style={{
                      background: `${p.color}22`,
                      border: `1.5px solid ${p.color}44`,
                      color: p.color,
                    }}
                  >
                    {p.code}
                  </div>
                  <div className="proj-card-title-wrap">
                    <div className="proj-card-name">{p.name}</div>
                    <div className="proj-card-meta">
                      {p.clientName ? `${p.clientName} · ` : ''}
                      Sprint {p.curSprint}/{p.totalSprints} · {p.method}
                    </div>
                  </div>
                  <span className={`chip proj-card-status ${statusChip}`}>
                    <AppIcon icon={Icons.circle} size={7} className="status-dot-icon" fill="currentColor" />
                    {statusLabel}
                  </span>
                </div>
                <div className="proj-card-desc">{p.desc}</div>
                <div className="proj-card-stage">
                  <span className="proj-card-stage-lbl">Stage</span>
                  <span className={`chip proj-card-phase-chip ${phaseChipClass(p.phase || 'development')}`}>
                    {phaseLabel(p.phase || 'development')}
                  </span>
                </div>
                <div className="proj-card-progress">
                  <div className="proj-card-progress-hd">
                    <span className="proj-card-lbl">Progress</span>
                    <span className="proj-card-val">{p.progress}%</span>
                  </div>
                  <div className="prog">
                    <div
                      className="prog-fill"
                      style={{
                        width: `${p.progress}%`,
                        background: p.status === 'delayed' ? 'var(--red)' : p.color,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="proj-card-body">
                <div className="proj-card-stats">
                  <div className="proj-card-stat">
                    <span className="proj-card-stat-num">{p.members.length}</span>
                    <span className="proj-card-stat-lbl">members</span>
                  </div>
                  <div className="proj-card-stat">
                    <span
                      className="proj-card-stat-num"
                      style={{ color: openBugs > 0 ? 'var(--red)' : 'var(--green)' }}
                    >
                      {openBugs}
                    </span>
                    <span className="proj-card-stat-lbl">bugs</span>
                  </div>
                  <div className="proj-card-stat">
                    <span className="proj-card-stat-num">
                      {p.issues.filter((i) => i.status !== 'Done').length}
                    </span>
                    <span className="proj-card-stat-lbl">open</span>
                  </div>
                </div>
                <div className="proj-card-critical">
                  {crit > 0 && (
                    <span className="chip chip-red proj-card-critical-chip">
                      <AppIcon icon={Icons.circleAlert} size={11} />
                      {crit} critical
                    </span>
                  )}
                </div>
                {(p.scopeDocs?.length ?? 0) > 0 && (
                  <div className="proj-card-docs" onClick={(e) => e.stopPropagation()}>
                    <div className="proj-card-docs-lbl">Scope Documents</div>
                    <div className="proj-card-docs-list">
                      {p.scopeDocs.map((doc) => (
                        <button
                          key={doc.name}
                          type="button"
                          className="proj-doc-dl"
                          title={`Download ${doc.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadScopeDoc(p, doc);
                          }}
                        >
                          <AppIcon icon={Icons.download} size={12} />
                          <span>{doc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="proj-card-pm">
                  PM: <strong>{p.pm}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
