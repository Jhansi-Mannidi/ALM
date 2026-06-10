import { useApp } from '../context/AppContext';
import { AppIcon, CEREMONY_ICONS, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';
import { sprintCompletion } from '../utils/helpers';

const CEREMONIES = [
  { icon: 'planning', title: 'Sprint Planning', sub: 'Define goal, select backlog items', date: 'Jun 30', dur: '4 hrs', chip: 'chip-green', lbl: 'Completed' },
  { icon: 'standup', title: 'Daily Standup', sub: 'Yesterday · Today · Blockers', date: 'Daily 9:30 AM', dur: '15 min', chip: 'chip-blue', lbl: 'Today 9:30' },
  { icon: 'review', title: 'Sprint Review', sub: 'Demo completed features to stakeholders', date: 'Jul 11', dur: '2 hrs', chip: 'chip-amber', lbl: 'In 4 days' },
  { icon: 'retro', title: 'Retrospective', sub: 'What went well / Improve / Actions', date: 'Jul 11', dur: '1.5 hrs', chip: 'chip-amber', lbl: 'In 4 days' },
  { icon: 'grooming', title: 'Backlog Grooming', sub: 'Refine and prioritize items', date: 'Jul 8', dur: '2 hrs', chip: 'chip-amber', lbl: 'In 1 day' },
  { icon: 'stakeholder', title: 'Stakeholder Sync', sub: 'Status update and milestone review', date: 'Weekly Fri', dur: '1 hr', chip: 'chip-gray', lbl: 'Recurring' },
];

export default function ScrumPage() {
  const { project } = useApp();
  if (!project) return null;

  const p = project;
  const blockers = p.bugs.filter((b) => b.status !== 'Resolved' && b.sev === 'Critical');
  const sprintProg = sprintCompletion(p, p.curSprint);

  return (
    <>
      <PageHeader title="Scrum & Ceremonies" subtitle={`${p.name} · Sprint ${p.curSprint}`} />

      <div className="g3 mb16">
        {CEREMONIES.map((c) => (
          <div key={c.title} className="card">
            <div className="card-body">
              <div className="t-icon-3xl" style={{ marginBottom: 9 }}>
                <AppIcon icon={CEREMONY_ICONS[c.icon]} size={28} />
              </div>
              <div className="t-navy-sm-fw800" style={{ marginBottom: 3 }}>{c.title}</div>
              <div className="t-muted-sm" style={{ marginBottom: 10 }}>{c.sub}</div>
              <div className="fx g12">
                <div className="t-body-xs fx g4">
                  <AppIcon icon={Icons.calendarDays} size={12} />
                  {c.date}
                </div>
                <div className="t-body-xs fx g4">
                  <AppIcon icon={Icons.timer} size={12} />
                  {c.dur}
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <span className={`chip ${c.chip}`}>{c.lbl}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="g2 mb14">
        <div className="card">
          <div className="card-hd">
            <div className="card-title">Today&apos;s Standup</div>
            <span className="chip chip-green fx g4">
              <AppIcon icon={Icons.circle} size={8} className="status-dot-icon" fill="currentColor" />
              Live
            </span>
          </div>
          <div className="card-body">
            <div className="standup-grid">
              <div className="std-col">
                <div className="std-col-title fx g4" style={{ color: 'var(--green)' }}>
                  <AppIcon icon={Icons.check} size={14} />
                  Yesterday
                </div>
                <div className="t-body-sm">
                  • Merged OAuth token rotation PR
                  <br />
                  • Fixed 2 critical auth bugs
                  <br />• Updated API docs for v2
                </div>
              </div>
              <div className="std-col">
                <div className="std-col-title fx g4" style={{ color: 'var(--blue)' }}>
                  <AppIcon icon={Icons.arrowRight} size={14} />
                  Today
                </div>
                <div className="t-body-sm">
                  • Rate limiting middleware
                  <br />
                  • Investigate payment gateway
                  <br />• Code review PHXN-283
                </div>
              </div>
              <div className="std-col" style={{ background: 'var(--red-l)' }}>
                <div className="std-col-title fx g4" style={{ color: 'var(--red)' }}>
                  <AppIcon icon={Icons.alertTriangle} size={14} />
                  Blockers
                </div>
                <div className="t-body-sm">
                  {blockers.length > 0
                    ? blockers.map((b) => (
                        <span key={b.id}>
                          • {b.id}: {b.title}
                          <br />
                        </span>
                      ))
                    : (
                      <span className="fx g4">
                        <AppIcon icon={Icons.check} size={12} />
                        No blockers
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <div className="card-title">Sprint Goal</div>
          </div>
          <div className="card-body">
            <div className="t-navy-sm" style={{ marginBottom: 10 }}>
              &quot;{p.spGoal}&quot;
            </div>
            <div className="fx g12">
              <div>
                <span className="t-val-4xl">{sprintProg.done}</span>
                <span className="t-muted-xs"> / {sprintProg.total} issues</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="prog">
                  <div className="prog-fill" style={{ width: `${sprintProg.pct}%`, background: 'var(--blue)' }} />
                </div>
                <div className="t-muted-xs" style={{ marginTop: 3 }}>{sprintProg.pct}% complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd">
          <div className="card-title">Last Sprint Retrospective</div>
        </div>
        <div className="card-body">
          <div className="retro-grid">
            <div className="retro-col" style={{ background: 'var(--green-l)' }}>
              <div className="retro-title" style={{ color: 'var(--green-d)' }}>
                What went well
              </div>
              <div className="retro-item">OAuth module shipped on time</div>
              <div className="retro-item">Zero P1 bugs in production</div>
              <div className="retro-item">Sprint delivery improved week over week</div>
            </div>
            <div className="retro-col" style={{ background: 'var(--amber-l)' }}>
              <div className="retro-title" style={{ color: 'var(--amber-d)' }}>
                What to improve
              </div>
              <div className="retro-item">Code review turnaround too slow</div>
              <div className="retro-item">Test coverage gaps in payment module</div>
              <div className="retro-item">Standup running over time</div>
            </div>
            <div className="retro-col" style={{ background: 'var(--blue-l)' }}>
              <div className="retro-title" style={{ color: 'var(--blue-d)' }}>
                Action items
              </div>
              <div className="retro-item">Set 4hr SLA for PR reviews</div>
              <div className="retro-item">Add payment integration tests</div>
              <div className="retro-item">Timebox standup to 15 min</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
