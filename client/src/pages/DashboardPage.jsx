import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppIcon, Icons, NOTIFICATION_ICONS, SDLC_ICONS } from '../components/icons';
import PageHeader from '../components/PageHeader';
import { sprintCompletion, uById } from '../utils/helpers';

export default function DashboardPage() {
  const { project, users, notifications } = useApp();
  if (!project) return null;

  const p = project;
  const statusChip =
    p.status === 'ontrack' ? 'chip-green' : p.status === 'delayed' ? 'chip-red' : 'chip-amber';
  const statusLabel =
    p.status === 'ontrack' ? 'On Track' : p.status === 'delayed' ? 'Delayed' : 'On Hold';
  const done = p.issues.filter((i) => i.status === 'Done').length;
  const inprog = p.issues.filter((i) => i.status === 'In Progress').length;
  const openBugs = p.bugs.filter((b) => b.status !== 'Resolved').length;
  const mems = p.members.map((id) => uById(users, id)).filter(Boolean);
  const inFlight = p.issues.filter((i) => ['In Progress', 'Testing', 'Code Review'].includes(i.status)).length;
  const sprintProg = sprintCompletion(p, p.curSprint);

  return (
    <>
      <PageHeader
        title={`${p.name} — Dashboard`}
        subtitle={`Sprint ${p.curSprint}/${p.totalSprints} · ${p.method} · ${p.spDur}`}
        actions={
          <span className={`chip ${statusChip} fx g4`}>
            <AppIcon icon={Icons.circle} size={8} className="status-dot-icon" fill="currentColor" />
            {statusLabel}
          </span>
        }
      />

      <div className="g4 mb20">
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--blue)' }} />
          <div className="stat-label">Total Issues</div>
          <div className="stat-value">{p.issues.length}</div>
          <div className="stat-sub">
            <span className="up">{inprog}</span> in progress
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--green)' }} />
          <div className="stat-label">Completed</div>
          <div className="stat-value">{done}</div>
          <div className="stat-sub">
            <span className="up">{p.issues.length ? Math.round((done / p.issues.length) * 100) : 0}%</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--amber)' }} />
          <div className="stat-label">Sprint Progress</div>
          <div className="stat-value">
            {sprintProg.done}/{sprintProg.total}
          </div>
          <div className="stat-sub">{sprintProg.pct}% complete</div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--red)' }} />
          <div className="stat-label">Open Bugs</div>
          <div className="stat-value">{openBugs}</div>
          <div className="stat-sub">
            <span className="dn">
              {p.bugs.filter((b) => b.sev === 'Critical' && b.status !== 'Resolved').length} critical
            </span>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div className="card">
            <div className="card-hd">
              <div className="card-title">Project Health Index</div>
              <span className="chip chip-green">{p.health}/100</span>
            </div>
            <div className="card-body">
              <div className="fx g14">
                <svg width="88" height="88" viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r="33" fill="none" stroke="var(--chart-grid)" strokeWidth="7" />
                  <circle
                    cx="44"
                    cy="44"
                    r="33"
                    fill="none"
                    stroke={p.status === 'delayed' ? 'var(--red)' : 'var(--blue)'}
                    strokeWidth="7"
                    strokeDasharray={2 * Math.PI * 33}
                    strokeDashoffset={2 * Math.PI * 33 * (1 - p.health / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 44 44)"
                  />
                  <text x="44" y="40" textAnchor="middle" fontSize="11" fontWeight="900" fill="var(--heading)" fontFamily="Geist Variable, Geist Fallback, sans-serif">
                    {p.health}
                  </text>
                  <text x="44" y="52" textAnchor="middle" fontSize="10" fill="var(--g500)" fontFamily="Geist Variable, Geist Fallback, sans-serif">
                    /100
                  </text>
                </svg>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[
                    ['Scope', 'var(--blue)', p.progress],
                    ['Schedule', 'var(--green)', 88],
                    ['Quality', 'var(--amber)', 74],
                    ['Morale', 'var(--purple)', 91],
                  ].map(([l, c, v]) => (
                    <div key={l} className="fx g8">
                      <span className="t-body-xs" style={{ width: 52 }}>{l}</span>
                      <div className="prog" style={{ flex: 1 }}>
                        <div className="prog-fill" style={{ width: `${v}%`, background: c }} />
                      </div>
                      <span className="t-val-sm-fw800" style={{ width: 25, textAlign: 'right' }}>
                        {v}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd">
              <div className="card-title">Sprint History</div>
              <Link to="/sprint" className="card-action">
                Board →
              </Link>
            </div>
            <div className="card-body" style={{ padding: '9px 14px' }}>
              {p.sprints.map((s) => {
                const sp = sprintCompletion(p, s.num);
                return (
                  <div
                    key={s.num}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: '7px 0',
                      borderBottom: '1px solid var(--g50)',
                    }}
                  >
                    <div className="sprint-num-badge">S{s.num}</div>
                    <div style={{ flex: 1 }}>
                      <div className="t-navy-sm">
                        {s.name}
                        {s.status === 'active' ? ' (Active)' : ''}
                      </div>
                      <div className="t-muted-xs">
                        {s.start} – {s.end}
                      </div>
                    </div>
                    <div style={{ width: 70 }}>
                      <div className="prog prog-xs mb8">
                        <div
                          className="prog-fill"
                          style={{
                            width: `${sp.pct}%`,
                            background: s.status === 'done' ? 'var(--green)' : 'var(--blue)',
                          }}
                        />
                      </div>
                      <div className="t-muted-xs">
                        {sp.done}/{sp.total} done
                      </div>
                    </div>
                    <span
                      className={`chip ${s.status === 'done' ? 'chip-green' : s.status === 'active' ? 'chip-blue' : 'chip-gray'}`}
                    >
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div className="card">
            <div className="card-hd">
              <div className="card-title">Sprint {p.curSprint} Status</div>
            </div>
            <div className="card-body">
              <div className="t-navy-sm" style={{ marginBottom: 12 }}>
                &quot;{p.spGoal}&quot;
              </div>
              <div className="prog mb8">
                <div className="prog-fill" style={{ width: `${sprintProg.pct}%`, background: 'var(--blue)' }} />
              </div>
              <div className="fx g16" style={{ marginTop: 5 }}>
                <div>
                  <div className="t-val-lg">{sprintProg.done}</div>
                  <div className="t-muted-xs">completed</div>
                </div>
                <div>
                  <div className="t-val-lg">{sprintProg.total - sprintProg.done}</div>
                  <div className="t-muted-xs">remaining</div>
                </div>
                <div>
                  <div className="t-val-lg">{inFlight}</div>
                  <div className="t-muted-xs">in flight</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd">
              <div className="card-title">SDLC Phase Status</div>
            </div>
            <div className="card-body">
              <div className="sdlc-grid">
                {[
                  ['Planning', 'chip-green', 'Done'],
                  ['Design', 'chip-green', 'Done'],
                  ['Development', 'chip-blue', 'Active'],
                  ['Testing', 'chip-amber', 'Partial'],
                  ['Deployment', 'chip-gray', 'Pending'],
                  ['Maintenance', 'chip-gray', 'Upcoming'],
                ].map(([nm, ch, lb]) => (
                  <div key={nm} className="fx g8" style={{ padding: 7, background: 'var(--g50)', borderRadius: 'var(--r)' }}>
                    <span className="t-icon-lg">
                      <AppIcon icon={SDLC_ICONS[nm]} size={20} />
                    </span>
                    <div>
                      <div className="t-navy-sm">{nm}</div>
                      <span className={`chip ${ch}`} style={{ marginTop: 2 }}>
                        {lb}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div className="card">
            <div className="card-hd">
              <div className="card-title">Team · {mems.length}</div>
              <Link to="/project-team" className="card-action">
                All →
              </Link>
            </div>
            <div className="card-body" style={{ padding: '9px 14px' }}>
              {mems.slice(0, 6).map((u) => (
                <div key={u.id} className="fx g8" style={{ padding: '7px 0', borderBottom: '1px solid var(--g50)' }}>
                  <div className={`av av-sm ${u.c}`}>{u.ini}</div>
                  <div>
                    <div className="t-navy-sm">{u.name}</div>
                    <div className="t-muted-xs">{u.role}</div>
                  </div>
                  <div className="mla" style={{ textAlign: 'right' }}>
                    <div className="t-navy-sm-fw800">{u.tasks}</div>
                    <div className="t-muted-xs">tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <div className="card-hd">
              <div className="card-title">Recent Activity</div>
            </div>
            <div className="card-body" style={{ padding: '9px 14px' }}>
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="act-item">
                  <div className="notif-icon-wrap" style={{ marginTop: 2 }}>
                    <AppIcon icon={NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.default} size={14} />
                  </div>
                  <div>
                    <div className="act-text" dangerouslySetInnerHTML={{ __html: n.text }} />
                    <div className="act-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
