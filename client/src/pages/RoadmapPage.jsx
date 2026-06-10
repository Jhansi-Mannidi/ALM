import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function RoadmapPage() {
  const { project } = useApp();
  if (!project) return null;

  const epicChip = (status) =>
    status === 'done' ? 'chip-green' : status === 'active' ? 'chip-blue' : status === 'planned' ? 'chip-amber' : 'chip-gray';

  return (
    <>
      <PageHeader title="Product Roadmap" subtitle={`${project.name} · Epic timeline`} />

      <div className="card">
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <div className="rm-months">
            {MONTHS.map((m) => (
              <div key={m} className="rm-month">
                {m}
              </div>
            ))}
          </div>
          <div>
            {project.epics.map((ep) => (
              <div key={ep.name} className="rm-row">
                <div className="rm-feat">
                  <div className="rm-feat-name">{ep.name}</div>
                  <div className="rm-feat-sub">{ep.stories} stories</div>
                </div>
                <div className="rm-track">
                  <div
                    className="rm-bar"
                    style={{ left: `${ep.start}%`, width: `${ep.width}%`, background: ep.color }}
                  >
                    {ep.name}
                  </div>
                </div>
                <span className={`chip ${epicChip(ep.status)}`} style={{ marginLeft: 10, flexShrink: 0 }}>
                  {ep.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
