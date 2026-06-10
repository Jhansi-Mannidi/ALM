import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import { api } from '../api/client';
import { AppIcon, IconButton, Icons } from '../components/icons';
import { formatSheetDate, prioChip, sChip } from '../utils/helpers';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function PostponeModal({ open, task, mode = 'create', saving, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const [reason, setReason] = useState('');
  const [postponeDate, setPostponeDate] = useState(tomorrowISO());

  useEffect(() => {
    if (!open || !task) return;
    if (isEdit) {
      setReason(task.postponeReason || '');
      setPostponeDate(task.due || tomorrowISO());
    } else {
      setReason('');
      setPostponeDate(tomorrowISO());
    }
  }, [open, task, isEdit]);

  if (!open || !task) return null;

  const close = () => {
    if (saving) return;
    onClose();
  };

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal" style={{ width: 420 }}>
        <div className="modal-hd">
          <span className="modal-title">{isEdit ? 'Edit Postponed Task' : 'Postpone Task'}</span>
          <button type="button" className="modal-x" onClick={close} aria-label="Close" disabled={saving}>
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="fl">
            <label>Task</label>
            <div className="fi fi-readonly" style={{ fontWeight: 600 }}>
              {task.id} — {task.title}
            </div>
          </div>
          <div className="fl">
            <label>Postpone Until *</label>
            <input
              className="fi"
              type="date"
              value={postponeDate}
              min={todayISO()}
              onChange={(e) => setPostponeDate(e.target.value)}
            />
          </div>
          <div className="fl">
            <label>Reason</label>
            <textarea
              className="fa"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you postponing this task?"
              rows={3}
            />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={close} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary fx g4"
            onClick={() => onSubmit({ reason, postponeDate })}
            disabled={saving || !postponeDate}
          >
            <AppIcon icon={isEdit ? Icons.pencil : Icons.timer} size={14} />
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Postpone Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyTasksPage() {
  const { user, projects, toast, refreshProjects } = useApp();
  const [postponeModal, setPostponeModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const uid = user?.id;
  const allIssues = projects.flatMap((p) =>
    p.issues
      .filter((i) => i.assign === uid && i.status !== 'Done')
      .map((i) => ({ ...i, pName: p.name, pCode: p.code, projectId: p.id }))
  );
  const critBugs = projects.flatMap((p) =>
    p.bugs.filter(
      (b) => b.assign === uid && (b.sev === 'Critical' || b.postpones) && b.status !== 'Resolved'
    )
  );

  const manualPostRows = allIssues.filter((i) => i.postponed);
  const todayRows =
    critBugs.length > 0
      ? []
      : allIssues
          .filter((i) => !i.postponed && (i.prio === 'Critical' || i.prio === 'High'))
          .slice(0, 5);
  const postRows =
    critBugs.length > 0
      ? allIssues
      : manualPostRows;

  const confirmPostpone = async ({ reason, postponeDate }) => {
    if (!postponeModal?.task) return;
    if (!postponeDate) return toast('Choose a postpone date', 'err');
    if (postponeDate < todayISO()) return toast('Postpone date cannot be in the past', 'err');
    const task = postponeModal.task;
    const isEdit = postponeModal.mode === 'edit';
    setSaving(true);
    try {
      const label = formatSheetDate(postponeDate);
      const payload = {
        postponed: true,
        postponeReason: reason.trim() || `Postponed to ${label}`,
        due: postponeDate,
      };
      if (!isEdit) {
        payload.originalDue = task.originalDue || task.due || '';
      }
      await api.updateIssue(task.projectId, task.id, payload);
      await refreshProjects();
      setPostponeModal(null);
      toast(
        isEdit ? `${task.id} postpone updated` : `${task.id} postponed to ${label}`,
        'ok'
      );
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setSaving(false);
    }
  };

  const removePostpone = async (task) => {
    if (!window.confirm(`Remove postpone for "${task.title}" and restore it to today's tasks?`)) return;
    try {
      await api.updateIssue(task.projectId, task.id, {
        postponed: false,
        postponeReason: '',
        due: task.originalDue || task.due || '',
        originalDue: '',
      });
      await refreshProjects();
      toast(`${task.id} restored to today's tasks`, 'ok');
    } catch (e) {
      toast(e.message, 'err');
    }
  };

  const postponeReason = (task) => {
    if (task.postponeReason) return task.postponeReason;
    if (critBugs.length > 0) return 'Priority bug assigned — postponed to tomorrow';
    return 'Postponed to tomorrow';
  };

  return (
    <>
      <PageHeader
        title="My Tasks"
        subtitle={`${allIssues.length} open tasks · ${critBugs.length} critical bugs`}
      />

      {critBugs.length > 0 && (
        <div className="post-banner" style={{ display: 'flex' }}>
          <span className="t-val-4xl">⚠️</span>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--amber)' }}>
              Priority Bug Alert — {critBugs.length} Critical Bug(s) Require Immediate Attention
            </div>
            <div className="t-body-sm" style={{ marginTop: 2 }}>
              {critBugs.map((b) => (
                <span key={b.id}>
                  <strong>{b.id}</strong>: {b.title}
                  {' · '}
                </span>
              ))}
              Your today tasks have been postponed to tomorrow.
            </div>
          </div>
        </div>
      )}

      <div className="tbl-wrap mb14">
        <div className="tbl-section-hd">Today&apos;s Tasks</div>
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Task</th>
              <th>Project</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due</th>
              <th>Postpone</th>
            </tr>
          </thead>
          <tbody>
            {todayRows.length === 0 && critBugs.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 20, color: 'var(--g500)' }}>
                  No tasks for today. 🎉
                </td>
              </tr>
            )}
            {critBugs.length > 0 && todayRows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 16, color: 'var(--amber)', fontWeight: 700 }}>
                  ⚠ Tasks postponed due to priority bug(s). See below.
                </td>
              </tr>
            )}
            {todayRows.map((t) => (
              <tr key={t.id} className="task-row-link">
                <td>
                  <Link to={`/tasks/${t.id}`} className="iid task-link">
                    {t.id}
                  </Link>
                </td>
                <td>
                  <Link to={`/tasks/${t.id}`} className="task-link t-cell-sm">
                    {t.title}
                  </Link>
                </td>
                <td>
                  <span className="t-muted-xs">{t.pCode}</span>
                </td>
                <td>
                  <span className={`chip ${prioChip(t.prio)}`}>{t.prio}</span>
                </td>
                <td>
                  <span className={`chip ${sChip(t.status)}`}>{t.status}</span>
                </td>
                <td className="t-muted-xs">{t.due || '—'}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm fx g4 mytasks-postpone-btn"
                    onClick={() => setPostponeModal({ task: t, mode: 'create' })}
                  >
                    <AppIcon icon={Icons.timer} size={13} />
                    Postpone
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tbl-wrap">
        <div className="tbl-section-hd tbl-section-hd--flex">
          Postponed Tasks{' '}
          <span className="chip chip-amber">{postRows.length}</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Task</th>
              <th>Project</th>
              <th>Priority</th>
              <th>Reason</th>
              <th>Original Due</th>
              <th>Postponed Until</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {postRows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 14, color: 'var(--g400)' }}>
                  No postponed tasks.
                </td>
              </tr>
            ) : (
              postRows.map((t) => (
                <tr key={t.id} className="task-row-link">
                  <td>
                    <Link to={`/tasks/${t.id}`} className="iid task-link">
                      {t.id}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/tasks/${t.id}`} className="task-link t-cell-sm">
                      {t.title}
                    </Link>
                  </td>
                  <td className="t-muted-xs">{t.pCode || t.pName}</td>
                  <td>
                    <span className={`chip ${prioChip(t.prio)}`}>{t.prio}</span>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--amber)', fontWeight: 600 }}>
                    {postponeReason(t).startsWith('Priority bug') ? '⚠ ' : ''}
                    {postponeReason(t)}
                  </td>
                  <td className="t-muted-xs">{formatSheetDate(t.postponed ? t.originalDue : t.due)}</td>
                  <td className="t-muted-xs">
                    {t.postponed ? formatSheetDate(t.due) : formatSheetDate(tomorrowISO())}
                  </td>
                  <td>
                    {t.postponed ? (
                      <div className="fx g4 mytasks-post-actions">
                        <IconButton
                          icon={Icons.pencil}
                          label={`Edit ${t.id}`}
                          size={14}
                          onClick={() => setPostponeModal({ task: t, mode: 'edit' })}
                        />
                        <IconButton
                          icon={Icons.trash}
                          label={`Remove postpone for ${t.id}`}
                          variant="danger"
                          size={14}
                          onClick={() => removePostpone(t)}
                        />
                      </div>
                    ) : (
                      <span className="t-muted-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {postponeModal && (
        <PostponeModal
          open
          task={postponeModal.task}
          mode={postponeModal.mode}
          saving={saving}
          onClose={() => setPostponeModal(null)}
          onSubmit={confirmPostpone}
        />
      )}
    </>
  );
}
