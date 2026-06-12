import { useApp } from '../context/AppContext';
import { AppIcon, IconButton, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';
import { can, isWorkflowComplete, uById, WORKFLOW_COL_COLORS, WORKFLOW_STATUSES } from '../utils/helpers';

export default function SprintPage() {
  const { role, project, users, toast, setModal, setAssignCtx } = useApp();
  if (!project) return null;

  const p = project;
  const spIssues = p.issues.filter((i) => i.sprint === `Sprint ${p.curSprint}`);

  const openAssign = (issueId) => {
    setAssignCtx({ issueId, userId: null });
    setModal('assign');
  };

  const completeSprint = () => {
    if (!can(role, 'assign')) {
      toast('No permission', 'err');
      return;
    }
    toast(`Sprint ${p.curSprint} completed! Starting Sprint ${p.curSprint + 1}`, 'ok');
  };

  const cardStyle = (col, hasCritBug) => {
    const style = {};
    const accent = WORKFLOW_COL_COLORS[col];
    if (accent) style.borderLeft = `3px solid ${accent}`;
    if (col === 'Prod') style.opacity = 0.72;
    if (hasCritBug) style.borderLeft = '3px solid var(--red)';
    return Object.keys(style).length ? style : undefined;
  };

  return (
    <>
      <PageHeader
        title={`Sprint ${p.curSprint} Board — ${p.name}`}
        subtitle={`Goal: ${p.spGoal}`}
        actions={
          <>
            <span className="chip chip-blue">Day 7 of 10</span>
            {can(role, 'assign') && (
              <button type="button" className="btn btn-ghost btn-sm ph-btn-compact fx g4" onClick={completeSprint}>
                <AppIcon icon={Icons.flag} size={14} />
                Complete Sprint
              </button>
            )}
          </>
        }
      />

      <div className="board">
        {WORKFLOW_STATUSES.map((col) => {
          const cards = spIssues.filter((i) => i.status === col);
          return (
            <div key={col} className="bcol">
              <div className="bcol-hd">
                <span className="bcol-title" style={{ color: WORKFLOW_COL_COLORS[col] || 'var(--g600)' }}>
                  {col}
                </span>
                <span className="bcol-cnt">{cards.length}</span>
              </div>
              {cards.map((i) => {
                const u = uById(users, i.assign);
                const hasCritBug = p.bugs.some(
                  (b) => b.linked === i.id && b.sev === 'Critical' && !isWorkflowComplete(b.status)
                );
                return (
                  <div key={i.id} className="kcard" style={cardStyle(col, hasCritBug)}>
                    <div className="kcard-id">{i.id}</div>
                    <div className="kcard-title">
                      {i.title}
                      {hasCritBug && <span className="kcard-flag"> ⚠ Bug</span>}
                    </div>
                    <div className="kcard-foot">
                      <div className="fx g5 mla" style={{ width: '100%', justifyContent: 'flex-end' }}>
                        {can(role, 'assign') && (
                          <IconButton icon={Icons.userPlus} label="Assign task" size={14} onClick={() => openAssign(i.id)} />
                        )}
                        {u && <div className={`av av-xs ${u.c}`}>{u.ini}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
