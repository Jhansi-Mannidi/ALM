import { useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { AppIcon, ENV_ICONS, IconButton, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';

const ENVS = [
  { label: 'Development', ver: 'v3.0.0-dev', date: 'Updated: Now' },
  { label: 'Staging', ver: 'v2.9.4', date: 'Updated: 2h ago' },
  { label: 'UAT', ver: 'v2.9.1', date: 'Updated: Jul 4' },
];

const RELEASE_TYPES = ['Patch', 'Minor', 'Major', 'Beta', 'Alpha'];
const RELEASE_STATUSES = ['Stable', 'Beta', 'Deprecated', 'Rolling Out'];

function releaseKey(r) {
  return r.id || r.ver;
}

function ReleaseModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);

  if (!open) return null;

  const save = () => {
    if (!form.ver.trim()) return;
    onSave(form);
  };

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 480 }}>
        <div className="modal-hd">
          <span className="modal-title">Edit Release</span>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="fl">
            <label>Version *</label>
            <input
              className="fi"
              value={form.ver}
              onChange={(e) => setForm({ ...form, ver: e.target.value })}
              placeholder="e.g. v2.8.7"
            />
          </div>
          <div className="fl">
            <label>Released</label>
            <input
              className="fi"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              placeholder="e.g. Jun 28"
            />
          </div>
          <div className="fl">
            <label>Type</label>
            <select className="fs" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {RELEASE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="fl">
            <label>Changes</label>
            <textarea
              className="fa"
              value={form.changes}
              onChange={(e) => setForm({ ...form, changes: e.target.value })}
              rows={2}
            />
          </div>
          <div className="fl">
            <label>Status</label>
            <select className="fs" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {RELEASE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="fl">
            <label>Deployed By</label>
            <input
              className="fi"
              value={form.by}
              onChange={(e) => setForm({ ...form, by: e.target.value })}
              placeholder="e.g. Kiran P."
            />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary fx g4" onClick={save}>
            <AppIcon icon={Icons.check} size={14} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DeployPage() {
  const { project, permissions, toast, refreshProjects } = useApp();
  const [editRelease, setEditRelease] = useState(null);

  if (!project) return null;

  const envs = [
    ...ENVS,
    {
      label: 'Production',
      ver: project.releases[0]?.ver || 'v—',
      date: `Updated: ${project.releases[0]?.date || '—'}`,
    },
  ];

  const openEdit = (release) => {
    setEditRelease({
      id: release.id,
      key: releaseKey(release),
      ver: release.ver,
      date: release.date,
      type: release.type,
      changes: release.changes,
      status: release.status,
      by: release.by,
    });
  };

  const closeModal = () => setEditRelease(null);

  const saveRelease = async (form) => {
    if (!form.ver.trim()) return toast('Version required', 'err');
    try {
      await api.updateRelease(project.id, form.key, {
        ver: form.ver,
        date: form.date,
        type: form.type,
        changes: form.changes,
        status: form.status,
        by: form.by,
      });
      await refreshProjects();
      toast('Release updated', 'ok');
      closeModal();
    } catch (e) {
      toast(e.message || 'Failed to save', 'err');
    }
  };

  const deleteRelease = async (release) => {
    if (!window.confirm(`Delete release "${release.ver}"?`)) return;
    try {
      await api.deleteRelease(project.id, releaseKey(release));
      await refreshProjects();
      toast('Release deleted', 'ok');
    } catch (e) {
      toast(e.message || 'Failed to delete', 'err');
    }
  };

  const typeChip = (type) => {
    if (type === 'Patch') return 'chip-green';
    if (type === 'Minor') return 'chip-blue';
    if (type === 'Major') return 'chip-purple';
    if (type === 'Beta') return 'chip-amber';
    return 'chip-gray';
  };

  return (
    <>
      <PageHeader title="Deployment & CI/CD" subtitle="Environments and releases" />

      <div className="g4 mb14">
        {envs.map((e) => {
          const EnvIcon = ENV_ICONS[e.label];
          return (
            <div key={e.label} className="env-card">
              <div className="env-label-row">
                {EnvIcon && <AppIcon icon={EnvIcon} size={14} />}
                <div className="env-label">{e.label}</div>
              </div>
              <div className="env-ver">{e.ver}</div>
              <div className="env-date">{e.date}</div>
            </div>
          );
        })}
      </div>

      <div className="tbl-wrap">
        <div className="card-hd" style={{ padding: '11px 14px' }}>
          <div className="card-title">Release History</div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Version</th>
              <th>Released</th>
              <th>Type</th>
              <th>Changes</th>
              <th>Status</th>
              <th>Deployed By</th>
              {permissions.deploy && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {project.releases.map((r) => (
              <tr key={releaseKey(r)}>
                <td>
                  <span className="iid">{r.ver}</span>
                </td>
                <td className="t-muted-xs">{r.date}, 2025</td>
                <td>
                  <span className={`chip ${typeChip(r.type)}`}>{r.type}</span>
                </td>
                <td className="t-body-sm">{r.changes}</td>
                <td>
                  <span className="chip chip-green">{r.status}</span>
                </td>
                <td className="t-body-xs">{r.by}</td>
                {permissions.deploy && (
                  <td>
                    <div className="fx g4">
                      <IconButton icon={Icons.pencil} label="Edit release" onClick={() => openEdit(r)} />
                      <IconButton icon={Icons.trash} label="Delete release" variant="danger" onClick={() => deleteRelease(r)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editRelease && (
        <ReleaseModal
          key={editRelease.key}
          open
          initial={editRelease}
          onClose={closeModal}
          onSave={saveRelease}
        />
      )}
    </>
  );
}
