import { useState } from 'react';
import { api } from '../api/client';
import CeremonyModal from '../components/CeremonyModal';
import ConfirmModal from '../components/ConfirmModal';
import { AppIcon, CEREMONY_ICONS, IconButton, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import { formatCeremonySchedule } from '../utils/ceremonyHelpers';
import { canManageCeremonies, isWorkflowComplete, sprintCompletion } from '../utils/helpers';

const INITIAL_RETRO = {
  wentWell: [
    'OAuth module shipped on time',
    'Zero P1 bugs in production',
    'Sprint delivery improved week over week',
  ],
  improve: [
    'Code review turnaround too slow',
    'Test coverage gaps in payment module',
    'Standup running over time',
  ],
  actions: [
    'Set 4hr SLA for PR reviews',
    'Add payment integration tests',
    'Timebox standup to 15 min',
  ],
};

export default function ScrumPage() {
  const { project, role, refreshProjects, toast } = useApp();
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [retro, setRetro] = useState(INITIAL_RETRO);
  const [retroDraft, setRetroDraft] = useState({ wentWell: '', improve: '', actions: '' });

  if (!project) return null;

  const p = project;
  const ceremonies = p.ceremonies || [];
  const canManage = canManageCeremonies(role);
  const blockers = p.bugs.filter((b) => !isWorkflowComplete(b.status) && b.sev === 'Critical');
  const sprintProg = sprintCompletion(p, p.curSprint);

  const openCreate = () => setModal({ mode: 'create' });
  const openEdit = (ceremony) => setModal({ mode: 'edit', ceremony });

  const saveCeremony = async (form) => {
    if (!form.title.trim()) {
      toast('Title is required', 'warn');
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast('Start and end date are required', 'warn');
      return;
    }
    setSaving(true);
    try {
      if (modal?.mode === 'edit' && modal.ceremony?.id) {
        await api.updateCeremony(p.id, modal.ceremony.id, form);
        toast('Ceremony updated', 'ok');
      } else {
        await api.createCeremony(p.id, form);
        toast('Ceremony added', 'ok');
      }
      await refreshProjects();
      setModal(null);
    } catch (e) {
      toast(e.message || 'Could not save ceremony', 'err');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await api.deleteCeremony(p.id, deleteTarget.id);
      await refreshProjects();
      toast('Ceremony deleted', 'ok');
      setDeleteTarget(null);
    } catch (e) {
      toast(e.message || 'Could not delete ceremony', 'err');
    } finally {
      setSaving(false);
    }
  };

  const addRetroItem = (bucket) => {
    const value = (retroDraft[bucket] || '').trim();
    if (!value) return;
    setRetro((prev) => ({ ...prev, [bucket]: [...prev[bucket], value] }));
    setRetroDraft((prev) => ({ ...prev, [bucket]: '' }));
  };

  const removeRetroItem = (bucket, index) => {
    setRetro((prev) => ({
      ...prev,
      [bucket]: prev[bucket].filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <PageHeader
        title="Scrum & Ceremonies"
        subtitle={`${p.name} · Sprint ${p.curSprint}`}
        actions={
          canManage ? (
            <button type="button" className="btn btn-primary btn-sm fx g4" onClick={openCreate}>
              <AppIcon icon={Icons.plus} size={14} />
              Add ceremony
            </button>
          ) : null
        }
      />

      {ceremonies.length === 0 ? (
        <div className="card ceremony-empty">
          <div className="card-body ceremony-empty-body">
            <AppIcon icon={Icons.calendarDays} size={32} className="ceremony-empty-icon" />
            <div className="t-navy-sm-fw800">No ceremonies yet</div>
            <p className="t-muted-sm ceremony-empty-text">
              Add Sprint Planning, Daily Standup, Retrospective, and other recurring events for your team.
            </p>
            {canManage && (
              <button type="button" className="btn btn-primary btn-sm fx g4" onClick={openCreate}>
                <AppIcon icon={Icons.plus} size={14} />
                Add ceremony
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="g3 mb16">
          {ceremonies.map((c) => (
            <div key={c.id} className="card ceremony-card">
              {canManage && (
                <div className="ceremony-card-actions">
                  <IconButton
                    icon={Icons.pencil}
                    label="Edit ceremony"
                    size={14}
                    onClick={() => openEdit(c)}
                  />
                  <IconButton
                    icon={Icons.trash}
                    label="Delete ceremony"
                    variant="danger"
                    size={14}
                    onClick={() => setDeleteTarget(c)}
                  />
                </div>
              )}
              <div className="card-body">
                <div className="t-icon-3xl" style={{ marginBottom: 9 }}>
                  <AppIcon icon={CEREMONY_ICONS[c.icon] || CEREMONY_ICONS.planning} size={28} />
                </div>
                <div className="t-navy-sm-fw800" style={{ marginBottom: 3 }}>
                  {c.title}
                </div>
                <div className="t-muted-sm" style={{ marginBottom: 10 }}>
                  {c.description || '—'}
                </div>
                <div className="fx g12" style={{ flexWrap: 'wrap' }}>
                  {formatCeremonySchedule(c) && (
                    <div className="t-body-xs fx g4">
                      <AppIcon icon={Icons.calendarDays} size={12} />
                      {formatCeremonySchedule(c)}
                    </div>
                  )}
                  {c.startDate && c.endDate && c.startDate !== c.endDate && (
                    <span className="chip chip-navy ceremony-daily-chip">Daily</span>
                  )}
                  {c.duration && (
                    <div className="t-body-xs fx g4">
                      <AppIcon icon={Icons.timer} size={12} />
                      {c.duration}
                    </div>
                  )}
                </div>
                {c.statusLabel && (
                  <div style={{ marginTop: 8 }}>
                    <span className={`chip ${c.statusChip || 'chip-gray'}`}>{c.statusLabel}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
                <div className="t-muted-xs" style={{ marginTop: 3 }}>
                  {sprintProg.pct}% complete
                </div>
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
              {retro.wentWell.map((item, index) => (
                <div key={`well-${index}`} className="retro-item retro-item-row">
                  <span>{item}</span>
                  {canManage && (
                    <IconButton
                      icon={Icons.trash}
                      label="Remove item"
                      variant="danger"
                      size={12}
                      className="icon-btn-sm retro-remove-btn"
                      onClick={() => removeRetroItem('wentWell', index)}
                    />
                  )}
                </div>
              ))}
              {canManage && (
                <div className="retro-add-row">
                  <input
                    className="fi retro-add-input"
                    value={retroDraft.wentWell}
                    onChange={(e) => setRetroDraft((prev) => ({ ...prev, wentWell: e.target.value }))}
                    placeholder="Add entry..."
                  />
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => addRetroItem('wentWell')}>
                    Add
                  </button>
                </div>
              )}
            </div>
            <div className="retro-col" style={{ background: 'var(--amber-l)' }}>
              <div className="retro-title" style={{ color: 'var(--amber-d)' }}>
                What to improve
              </div>
              {retro.improve.map((item, index) => (
                <div key={`improve-${index}`} className="retro-item retro-item-row">
                  <span>{item}</span>
                  {canManage && (
                    <IconButton
                      icon={Icons.trash}
                      label="Remove item"
                      variant="danger"
                      size={12}
                      className="icon-btn-sm retro-remove-btn"
                      onClick={() => removeRetroItem('improve', index)}
                    />
                  )}
                </div>
              ))}
              {canManage && (
                <div className="retro-add-row">
                  <input
                    className="fi retro-add-input"
                    value={retroDraft.improve}
                    onChange={(e) => setRetroDraft((prev) => ({ ...prev, improve: e.target.value }))}
                    placeholder="Add entry..."
                  />
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => addRetroItem('improve')}>
                    Add
                  </button>
                </div>
              )}
            </div>
            <div className="retro-col" style={{ background: 'var(--blue-l)' }}>
              <div className="retro-title" style={{ color: 'var(--blue-d)' }}>
                Action items
              </div>
              {retro.actions.map((item, index) => (
                <div key={`action-${index}`} className="retro-item retro-item-row">
                  <span>{item}</span>
                  {canManage && (
                    <IconButton
                      icon={Icons.trash}
                      label="Remove item"
                      variant="danger"
                      size={12}
                      className="icon-btn-sm retro-remove-btn"
                      onClick={() => removeRetroItem('actions', index)}
                    />
                  )}
                </div>
              ))}
              {canManage && (
                <div className="retro-add-row">
                  <input
                    className="fi retro-add-input"
                    value={retroDraft.actions}
                    onChange={(e) => setRetroDraft((prev) => ({ ...prev, actions: e.target.value }))}
                    placeholder="Add entry..."
                  />
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => addRetroItem('actions')}>
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CeremonyModal
        open={!!modal}
        ceremony={modal?.mode === 'edit' ? modal.ceremony : null}
        saving={saving}
        onClose={() => !saving && setModal(null)}
        onSave={saveCeremony}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete ceremony?"
        message={`Remove "${deleteTarget?.title}" from this project?`}
        detail="This cannot be undone."
        confirmLabel="Delete"
        busy={saving}
        onConfirm={confirmDelete}
        onClose={() => !saving && setDeleteTarget(null)}
      />
    </>
  );
}
