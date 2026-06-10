import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';

export default function ReportsPage() {
  const { project } = useApp();
  if (!project) return null;

  const issDist = { Feature: 0, Bug: 0, Task: 0, Epic: 0, Story: 0 };
  project.issues.forEach((i) => {
    if (issDist[i.type] !== undefined) issDist[i.type]++;
  });
  const maxI = Math.max(...Object.values(issDist), 1);

  const barColor = (k) =>
    k === 'Bug' ? 'var(--red)' : k === 'Feature' ? 'var(--blue)' : k === 'Epic' ? 'var(--purple)' : 'var(--g300)';

  const open = project.issues.filter((i) => i.status !== 'Done').length;
  const done = project.issues.filter((i) => i.status === 'Done').length;
  const openBugs = project.bugs.filter((b) => b.status !== 'Resolved').length;

  return (
    <>
      <PageHeader title="Reports" subtitle="Analytics and performance" />

      <div className="g4 mb14">
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--blue)' }} />
          <div className="stat-label">Total Issues</div>
          <div className="stat-value">{project.issues.length}</div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--green)' }} />
          <div className="stat-label">Completed</div>
          <div className="stat-value">{done}</div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--amber)' }} />
          <div className="stat-label">Open</div>
          <div className="stat-value">{open}</div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--red)' }} />
          <div className="stat-label">Open Bugs</div>
          <div className="stat-value">{openBugs}</div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-hd">
            <div className="card-title">Issue Distribution</div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120, justifyContent: 'center' }}>
              {Object.entries(issDist).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    style={{
                      width: 30,
                      height: v ? Math.round((v / maxI) * 100) : 0,
                      background: barColor(k),
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                  <div className="t-muted-xs">{k}</div>
                  <div className="t-val-xs-fw800">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <div className="card-title">Cycle Time Breakdown</div>
          </div>
          <div className="card-body">
            {[
              ['Todo → In Progress', '1.2d', 24, 'var(--blue)'],
              ['In Progress → Review', '2.3d', 46, 'var(--purple)'],
              ['Review → Testing', '0.8d', 16, 'var(--amber)'],
              ['Testing → Done', '0.6d', 12, 'var(--green)'],
            ].map(([l, v, w, c]) => (
              <div key={l} style={{ marginBottom: 11 }}>
                <div className="fx" style={{ marginBottom: 4 }}>
                  <span className="t-body-sm">{l}</span>
                  <span className="t-val-sm-fw800 mla">{v} avg</span>
                </div>
                <div className="prog">
                  <div className="prog-fill" style={{ width: `${w}%`, background: c }} />
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 11, borderTop: '1px solid var(--g100)' }}>
              <span className="t-muted-sm">Total: </span>
              <span className="text-base" style={{ fontWeight: 900, color: 'var(--heading)' }}>4.9 days</span>
              <span className="t-muted-sm" style={{ color: 'var(--green)', marginLeft: 8, fontWeight: 700 }}>
                ↓ 0.7d vs last sprint
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
