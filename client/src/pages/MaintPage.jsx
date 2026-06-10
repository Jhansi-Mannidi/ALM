import { useApp } from '../context/AppContext';
import { AppIcon, IconButton, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';
import { can } from '../utils/helpers';

export default function MaintPage() {
  const { role, project, toast, setModal } = useApp();
  if (!project) return null;

  const p1 = project.tickets.filter((t) => t.prio === 'P1').length;
  const p2 = project.tickets.filter((t) => t.prio === 'P2').length;

  return (
    <>
      <PageHeader
        title="Maintenance"
        subtitle="Tickets, tech debt and system health"
        actions={
          <button type="button" className="btn btn-primary btn-sm ph-btn-compact fx g4" onClick={() => setModal('ticket')}>
            <AppIcon icon={Icons.plus} size={14} />
            Log Ticket
          </button>
        }
      />

      <div className="g4 mb16">
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--red)' }} />
          <div className="stat-label">P1 Open</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>
            {p1}
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--amber)' }} />
          <div className="stat-label">P2 Open</div>
          <div className="stat-value">{p2}</div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--green)' }} />
          <div className="stat-label">Resolved/Month</div>
          <div className="stat-value">34</div>
          <div className="stat-sub">
            <span className="up">↑ 22%</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--blue)' }} />
          <div className="stat-label">Uptime (30d)</div>
          <div className="stat-value">99.94%</div>
        </div>
      </div>

      <div className="g2">
        <div className="tbl-wrap">
          <div className="card-hd" style={{ padding: '11px 14px' }}>
            <div className="card-title">Support Tickets</div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Issue</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Age</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {project.tickets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className="iid">{t.id}</span>
                  </td>
                  <td className="t-cell-sm" style={{ fontWeight: 500 }}>{t.title}</td>
                  <td>
                    <span
                      className={`chip ${t.prio === 'P1' ? 'chip-red' : t.prio === 'P2' ? 'chip-amber' : 'chip-blue'}`}
                    >
                      {t.prio}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`chip ${t.status === 'In Progress' ? 'chip-blue' : 'chip-amber'}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="t-muted-xs">{t.age}</td>
                  <td>
                    {can(role, 'assign') && (
                      <IconButton icon={Icons.checkCircle} label="Resolve ticket" variant="success" onClick={() => toast('Ticket resolved', 'ok')} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-hd">
            <div className="card-title">Technical Debt Registry</div>
            <span className="chip chip-amber">{project.techDebt.length} items</span>
          </div>
          <div className="card-body" style={{ padding: '8px 14px' }}>
            {project.techDebt.map((d) => (
              <div key={d.id} className="req-row">
                <div className="req-id" style={{ color: d.impact === 'High' ? 'var(--red)' : 'var(--amber)' }}>
                  {d.id}
                </div>
                <div>
                  <div className="req-title">{d.title}</div>
                  <div className="req-meta">
                    Effort: {d.effort} · Impact: {d.impact} · Owner: {d.owner}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
