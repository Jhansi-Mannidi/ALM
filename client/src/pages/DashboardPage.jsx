import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppIcon, Icons, NOTIFICATION_ICONS, SDLC_ICONS } from '../components/icons';
import PageHeader from '../components/PageHeader';
import { isWorkflowComplete, normalizeWorkflowStatus, sprintCompletion, uById } from '../utils/helpers';

function DashProgress({ value, color = 'var(--blue)', size = 'md', className = '' }) {
  return (
    <div
      className={`dash-prog-track dash-prog-${size}${className ? ` ${className}` : ''}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ '--dash-prog-color': color }}
    >
      <div className="dash-prog-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

function HealthGauge({ value, color }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  const gradId = `health-grad-${value}`;

  return (
    <div className="dash-health-gauge-wrap">
      <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden className="dash-health-svg">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.65" />
          </linearGradient>
        </defs>
        <circle cx="56" cy="56" r={r} fill="none" stroke="var(--g200)" strokeWidth="9" />
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="9"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 56 56)"
          className="dash-health-ring"
        />
      </svg>
      <div className="dash-health-score">
        <span className="dash-health-score-val">{value}</span>
        <span className="dash-health-score-max">/100</span>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, icon, tone }) {
  return (
    <div className={`dash-stat dash-stat--${tone}`}>
      <div className="dash-stat-top">
        <span className="dash-stat-label">{label}</span>
        <span className="dash-stat-icon">
          <AppIcon icon={icon} size={16} />
        </span>
      </div>
      <div className="dash-stat-value">{value}</div>
      <div className="dash-stat-sub">{sub}</div>
    </div>
  );
}

function HealthMetric({ label, value, color }) {
  return (
    <div className="dash-metric-row">
      <span className="dash-metric-label">{label}</span>
      <DashProgress value={value} color={color} size="sm" className="dash-metric-bar" />
      <span className="dash-metric-val">{value}%</span>
    </div>
  );
}

export default function DashboardPage() {
  const { project, users, notifications } = useApp();
  if (!project) return null;

  const p = project;
  const statusChip =
    p.status === 'ontrack' ? 'chip-green' : p.status === 'delayed' ? 'chip-red' : 'chip-amber';
  const statusLabel =
    p.status === 'ontrack' ? 'On Track' : p.status === 'delayed' ? 'Delayed' : 'On Hold';
  const done = p.issues.filter((i) => isWorkflowComplete(i.status)).length;
  const inprog = p.issues.filter((i) => normalizeWorkflowStatus(i.status) === 'Dev Progress').length;
  const openBugs = p.bugs.filter((b) => !isWorkflowComplete(b.status)).length;
  const mems = p.members.map((id) => uById(users, id)).filter(Boolean);
  const inFlight = p.issues.filter((i) => !isWorkflowComplete(i.status)).length;
  const sprintProg = sprintCompletion(p, p.curSprint);
  const healthColor = p.status === 'delayed' ? 'var(--red)' : 'var(--blue)';

  return (
    <div className="project-dash">
      <PageHeader
        title={`${p.name} — Dashboard`}
        subtitle={`Sprint ${p.curSprint}/${p.totalSprints} · ${p.method} · ${p.spDur}`}
        actions={
          <span className={`dash-status-pill ${statusChip}`}>
            <AppIcon icon={Icons.circle} size={8} className="status-dot-icon" fill="currentColor" />
            {statusLabel}
          </span>
        }
      />

      <div className="dash-stats g4 mb20">
        <KpiCard
          label="Total Issues"
          value={p.issues.length}
          tone="blue"
          icon={Icons.listChecks}
          sub={
            <>
              <span className="up">{inprog}</span> in progress
            </>
          }
        />
        <KpiCard
          label="Completed"
          value={done}
          tone="green"
          icon={Icons.checkCircle}
          sub={
            <span className="up">{p.issues.length ? Math.round((done / p.issues.length) * 100) : 0}%</span>
          }
        />
        <KpiCard
          label="Sprint Progress"
          value={`${sprintProg.done}/${sprintProg.total}`}
          tone="purple"
          icon={Icons.timer}
          sub={<>{sprintProg.pct}% complete</>}
        />
        <KpiCard
          label="Open Bugs"
          value={openBugs}
          tone="red"
          icon={Icons.bug}
          sub={
            <span className="dn">
              {p.bugs.filter((b) => b.sev === 'Critical' && !isWorkflowComplete(b.status)).length} critical
            </span>
          }
        />
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          <div className="card dash-card">
            <div className="card-hd">
              <div className="card-title">Project Health Index</div>
              <span className="chip chip-green">{p.health}/100</span>
            </div>
            <div className="card-body dash-health-body">
              <div className="dash-health-layout">
                <HealthGauge value={p.health} color={healthColor} />
                <div className="dash-health-metrics">
                  <HealthMetric label="Scope" value={p.progress} color="var(--blue)" />
                  <HealthMetric label="Schedule" value={88} color="var(--green)" />
                  <HealthMetric label="Quality" value={74} color="var(--amber)" />
                  <HealthMetric label="Morale" value={91} color="var(--purple)" />
                </div>
              </div>
            </div>
          </div>

          <div className="card dash-card">
            <div className="card-hd">
              <div className="card-title">Sprint History</div>
              <Link to="/sprint" className="card-action">
                Board →
              </Link>
            </div>
            <div className="card-body dash-list-body">
              {p.sprints.map((s) => {
                const sp = sprintCompletion(p, s.num);
                const barColor = s.status === 'done' ? 'var(--green)' : 'var(--blue)';
                return (
                  <div key={s.num} className={`dash-sprint-row${s.status === 'active' ? ' active' : ''}`}>
                    <div className="sprint-num-badge">S{s.num}</div>
                    <div className="dash-sprint-info">
                      <div className="dash-sprint-name">
                        {s.name}
                        {s.status === 'active' ? ' (Active)' : ''}
                      </div>
                      <div className="dash-sprint-dates">
                        {s.start} – {s.end}
                      </div>
                    </div>
                    <div className="dash-sprint-progress">
                      <DashProgress value={sp.pct} color={barColor} size="xs" />
                      <span className="dash-sprint-fraction">
                        {sp.done}/{sp.total} done
                      </span>
                    </div>
                    <span
                      className={`chip dash-sprint-chip ${s.status === 'done' ? 'chip-green' : s.status === 'active' ? 'chip-blue' : 'chip-gray'}`}
                    >
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="dash-col">
          <div className="card dash-card">
            <div className="card-hd">
              <div className="card-title">Sprint {p.curSprint} Status</div>
            </div>
            <div className="card-body">
              <div className="dash-sprint-status-block">
                <blockquote className="dash-sprint-goal">&ldquo;{p.spGoal}&rdquo;</blockquote>
                <div className="dash-sprint-status-prog" style={{ '--dash-prog-color': healthColor }}>
                  <div className="dash-sprint-status-hd">
                    <span className="dash-metric-label">Completion</span>
                    <span className="dash-metric-val">{sprintProg.pct}%</span>
                  </div>
                  <DashProgress value={sprintProg.pct} color={healthColor} size="md" />
                </div>
                <div className="dash-sprint-metrics">
                  <div className="dash-sprint-metric">
                    <div className="dash-sprint-metric-val">{sprintProg.done}</div>
                    <div className="dash-sprint-metric-lbl">completed</div>
                  </div>
                  <div className="dash-sprint-metric">
                    <div className="dash-sprint-metric-val">{sprintProg.total - sprintProg.done}</div>
                    <div className="dash-sprint-metric-lbl">remaining</div>
                  </div>
                  <div className="dash-sprint-metric">
                    <div className="dash-sprint-metric-val">{inFlight}</div>
                    <div className="dash-sprint-metric-lbl">in flight</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card dash-card">
            <div className="card-hd">
              <div className="card-title">SDLC Phase Status</div>
            </div>
            <div className="card-body">
              <div className="dash-sdlc-grid">
                {[
                  ['Planning', 'chip-green', 'Done'],
                  ['Design', 'chip-green', 'Done'],
                  ['Development', 'chip-blue', 'Active'],
                  ['Testing', 'chip-amber', 'Partial'],
                  ['Deployment', 'chip-gray', 'Pending'],
                  ['Maintenance', 'chip-gray', 'Upcoming'],
                ].map(([nm, ch, lb]) => (
                  <div key={nm} className={`dash-sdlc-item${lb === 'Active' ? ' active' : ''}`}>
                    <span className="dash-sdlc-icon">
                      <AppIcon icon={SDLC_ICONS[nm]} size={20} />
                    </span>
                    <div className="dash-sdlc-text">
                      <div className="dash-sdlc-name">{nm}</div>
                      <span className={`chip dash-sdlc-chip ${ch}`}>{lb}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dash-col">
          <div className="card dash-card">
            <div className="card-hd">
              <div className="card-title">Team · {mems.length}</div>
              <Link to="/project-team" className="card-action">
                All →
              </Link>
            </div>
            <div className="card-body dash-list-body">
              {mems.slice(0, 6).map((u) => (
                <div key={u.id} className="dash-team-row">
                  <div className={`av av-sm ${u.c}`}>{u.ini}</div>
                  <div className="dash-team-info">
                    <div className="dash-team-name">{u.name}</div>
                    <div className="dash-team-role">{u.role}</div>
                  </div>
                  <div className="dash-team-stat">
                    <div className="dash-team-stat-val">{u.tasks}</div>
                    <div className="dash-team-stat-lbl">tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card dash-card dash-card-grow">
            <div className="card-hd">
              <div className="card-title">Recent Activity</div>
            </div>
            <div className="card-body dash-list-body">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="dash-act-item">
                  <div className="notif-icon-wrap">
                    <AppIcon icon={NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.default} size={14} />
                  </div>
                  <div className="dash-act-content">
                    <div className="act-text" dangerouslySetInnerHTML={{ __html: n.text }} />
                    <div className="act-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
