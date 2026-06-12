import { useEffect, useState } from 'react';
import MotionModal from '../../../motion/MotionModal';
import { AppIcon, Icons } from '../../../components/icons';
import { WorkspaceIcon } from '../../components/WorkspaceIcons';
import { useRbac } from '../../context/RbacContext';
import { RBAC_SCOPES, scopeLabel } from '../../data/rbacCatalog';

const ICON_OPTIONS = [
  { id: 'briefcase', label: 'Briefcase' },
  { id: 'users', label: 'People' },
  { id: 'building', label: 'Building' },
  { id: 'code', label: 'Developer' },
  { id: 'shield', label: 'Shield' },
  { id: 'listChecks', label: 'Tasks' },
  { id: 'dollar', label: 'Finance' },
];

const COLOR_OPTIONS = [
  { id: '#6366F1', label: 'Indigo' },
  { id: '#2563EB', label: 'Blue' },
  { id: '#059669', label: 'Green' },
  { id: '#EC4899', label: 'Pink' },
  { id: '#7C3AED', label: 'Purple' },
  { id: '#0891B2', label: 'Teal' },
  { id: '#D97706', label: 'Amber' },
];

export default function CreateRoleModal({ open = true, onClose, onCreated }) {
  const { addRole } = useRbac();
  const [form, setForm] = useState({
    name: '',
    description: '',
    scope: 'product-development',
    icon: 'briefcase',
    color: '#6366F1',
  });

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    const name = form.name.trim();
    if (!name) return;

    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newId = `${id}-${Date.now().toString(36)}`;

    addRole({
      id: newId,
      name,
      description: form.description.trim() || `Custom role: ${name}`,
      type: 'custom',
      status: 'active',
      users: 0,
      scope: form.scope,
      icon: form.icon,
      color: form.color,
      permissions: [],
    });

    onCreated(newId);
  };

  const previewName = form.name.trim() || 'New Role';
  const previewDesc =
    form.description.trim() || 'Describe what members with this role can access and manage.';

  return (
    <MotionModal open={open} onClose={onClose} modalClassName="ws-rbac-create-modal">
      <div className="modal-hd ws-rbac-create-modal-hd">
        <div className="ws-rbac-create-modal-hd-text">
          <span className="ws-rbac-create-modal-kicker">Custom role</span>
          <span className="modal-title">Create Role</span>
          <p className="ws-rbac-create-modal-sub">
            Define a new role, then configure permissions on the next screen.
          </p>
        </div>
        <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
          <AppIcon icon={Icons.x} size={16} />
        </button>
      </div>

      <div className="modal-body ws-rbac-create-modal-body">
        <div className="ws-rbac-create-layout">
          <div className="ws-rbac-create-form">
            <section className="ws-rbac-create-section">
              <h3 className="ws-rbac-create-section-title">Role details</h3>
              <div className="fl">
                <label htmlFor="rbac-role-name">Role name *</label>
                <input
                  id="rbac-role-name"
                  className="fi"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="e.g. Finance Analyst"
                  autoFocus
                />
              </div>
              <div className="fl">
                <label htmlFor="rbac-role-desc">Description</label>
                <textarea
                  id="rbac-role-desc"
                  className="fa ws-rbac-create-textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="What this role is responsible for…"
                />
              </div>
            </section>

            <section className="ws-rbac-create-section">
              <h3 className="ws-rbac-create-section-title">Scope</h3>
              <p className="ws-rbac-create-section-hint">Where this role primarily applies in the workspace.</p>
              <div className="ws-rbac-scope-picks">
                {RBAC_SCOPES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`ws-rbac-scope-pick${form.scope === s.id ? ' active' : ''}`}
                    onClick={() => update({ scope: s.id })}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="ws-rbac-create-section">
              <h3 className="ws-rbac-create-section-title">Appearance</h3>
              <div className="fl">
                <label>Icon</label>
                <div className="ws-rbac-icon-picks ws-rbac-icon-picks--pro">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`ws-rbac-icon-pick ws-rbac-icon-pick--pro${form.icon === opt.id ? ' active' : ''}`}
                      style={
                        form.icon === opt.id
                          ? { background: `${form.color}18`, color: form.color, borderColor: form.color }
                          : undefined
                      }
                      onClick={() => update({ icon: opt.id })}
                      title={opt.label}
                      aria-label={opt.label}
                      aria-pressed={form.icon === opt.id}
                    >
                      <WorkspaceIcon name={opt.id} size={18} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="fl">
                <label>Accent color</label>
                <div className="ws-rbac-color-picks ws-rbac-color-picks--pro">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`ws-rbac-color-pick ws-rbac-color-pick--pro${form.color === c.id ? ' active' : ''}`}
                      style={{ background: c.id }}
                      onClick={() => update({ color: c.id })}
                      title={c.label}
                      aria-label={c.label}
                      aria-pressed={form.color === c.id}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="ws-rbac-create-preview" aria-label="Role preview">
            <div className="ws-rbac-create-preview-label">Preview</div>
            <div className="ws-role-card ws-rbac-create-preview-card">
              <div
                className="ws-role-card-icon"
                style={{ background: `${form.color}18`, color: form.color }}
              >
                <WorkspaceIcon name={form.icon} size={22} />
              </div>
              <div className="ws-role-card-body">
                <div className="ws-role-card-head">
                  <h3 className="ws-role-card-name">{previewName}</h3>
                  <span className="ws-rbac-badge">active</span>
                </div>
                <p className="ws-role-card-desc">{previewDesc}</p>
                <div className="ws-role-card-meta">
                  <span className="ws-role-card-meta-item">
                    <AppIcon icon={Icons.users} size={13} />
                    0 users
                  </span>
                  <span className="ws-role-card-meta-item">
                    Scope: {scopeLabel(form.scope)}
                  </span>
                </div>
              </div>
            </div>
            <p className="ws-rbac-create-preview-note">
              Custom roles can be edited, assigned to users, and deleted after creation.
            </p>
          </aside>
        </div>
      </div>

      <div className="modal-foot ws-rbac-create-modal-foot">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="ws-rbac-btn-primary"
          onClick={save}
          disabled={!form.name.trim()}
        >
          <AppIcon icon={Icons.plus} size={14} />
          Create Role
        </button>
      </div>
    </MotionModal>
  );
}
