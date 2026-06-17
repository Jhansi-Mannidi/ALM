import { useApp } from '../context/AppContext';
import { isWorkflowComplete } from '../utils/helpers';
import PageHeader from '../components/PageHeader';
import { MotionStagger } from '../motion/MotionStagger';
import { MotionInteractive } from '../motion/MotionCard';
import { motion } from 'framer-motion';

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

  const open = project.issues.filter((i) => !isWorkflowComplete(i.status)).length;
  const done = project.issues.filter((i) => isWorkflowComplete(i.status)).length;
  const openBugs = project.bugs.filter((b) => !isWorkflowComplete(b.status)).length;

  return (
    <>
      <PageHeader title="Reports" subtitle="Analytics and performance" />

      <MotionStagger className="g4 mb14">
        <MotionInteractive className="stat">
          <div className="stat-bar" style={{ background: 'var(--blue)' }} />
          <div className="stat-label">Total Issues</div>
          <div className="stat-value">{project.issues.length}</div>
        </MotionInteractive>
        <MotionInteractive className="stat">
          <div className="stat-bar" style={{ background: 'var(--green)' }} />
          <div className="stat-label">Completed</div>
          <div className="stat-value">{done}</div>
        </MotionInteractive>
        <MotionInteractive className="stat">
          <div className="stat-bar" style={{ background: 'var(--amber)' }} />
          <div className="stat-label">Open</div>
          <div className="stat-value">{open}</div>
        </MotionInteractive>
        <MotionInteractive className="stat">
          <div className="stat-bar" style={{ background: 'var(--red)' }} />
          <div className="stat-label">Open Bugs</div>
          <div className="stat-value">{openBugs}</div>
        </MotionInteractive>
      </MotionStagger>

      <MotionStagger className="g2">
        <MotionInteractive className="card">
          <div className="card-hd">
            <div className="card-title">Issue Distribution</div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120, justifyContent: 'center' }}>
              {Object.entries(issDist).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <motion.div
                    style={{
                      width: 30,
                      height: v ? Math.round((v / maxI) * 100) : 0,
                      background: barColor(k),
                      borderRadius: '4px 4px 0 0',
                    }}
                    initial={{ height: 0, opacity: 0.6 }}
                    animate={{ height: v ? Math.round((v / maxI) * 100) : 0, opacity: 1 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <div className="t-muted-xs">{k}</div>
                  <div className="t-val-xs-fw800">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </MotionInteractive>

        <MotionInteractive className="card">
          <div className="card-hd">
            <div className="card-title">Cycle Time Breakdown</div>
          </div>
          <div className="card-body">
            {[
              ['Dev Progress → Dev Completed', '1.2d', 24, 'var(--blue)'],
              ['Dev Completed → QA', '2.3d', 46, 'var(--teal)'],
              ['QA → UAT', '0.8d', 16, 'var(--amber)'],
              ['UAT → Prod', '0.6d', 12, 'var(--green)'],
            ].map(([l, v, w, c]) => (
              <div key={l} style={{ marginBottom: 11 }}>
                <div className="fx" style={{ marginBottom: 4 }}>
                  <span className="t-body-sm">{l}</span>
                  <span className="t-val-sm-fw800 mla">{v} avg</span>
                </div>
                <div className="prog">
                  <motion.div
                    className="prog-fill"
                    style={{ background: c }}
                    initial={{ width: 0 }}
                    animate={{ width: `${w}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
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
        </MotionInteractive>
      </MotionStagger>
    </>
  );
}
