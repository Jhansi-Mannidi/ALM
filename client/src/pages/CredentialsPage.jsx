import { useMemo, useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { AppIcon, IconButton, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';
import { CREDENTIAL_TEMPLATES } from '../utils/helpers';

const TYPE_FILTERS = [
  ['all', 'All', null],
  ['database', 'Database', Icons.monitor],
  ['lucidchart', 'Lucid Chart', Icons.fileText],
  ['loom', 'Loom', Icons.play],
];

const TYPE_CHIP = {
  database: 'chip-blue',
  lucidchart: 'chip-purple',
  loom: 'chip-teal',
  custom: 'chip-gray',
};

function blankCred(type = 'database') {
  const tpl = CREDENTIAL_TEMPLATES[type] || CREDENTIAL_TEMPLATES.custom;
  return {
    type,
    name: '',
    notes: '',
    fields: tpl.fields.map((f) => ({ ...f })),
  };
}

function CredModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);

  if (!open) return null;

  const setType = (type) => {
    const tpl = CREDENTIAL_TEMPLATES[type] || CREDENTIAL_TEMPLATES.custom;
    setForm((f) => ({
      ...f,
      type,
      fields: tpl.fields.map((field) => ({ ...field })),
    }));
  };

  const updateField = (idx, patch) => {
    setForm((f) => ({
      ...f,
      fields: f.fields.map((field, i) => (i === idx ? { ...field, ...patch } : field)),
    }));
  };

  const addField = () => {
    setForm((f) => ({
      ...f,
      fields: [...f.fields, { label: 'Field', value: '', secret: false }],
    }));
  };

  const removeField = (idx) => {
    setForm((f) => ({
      ...f,
      fields: f.fields.filter((_, i) => i !== idx),
    }));
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (!form.fields.length) return;
    onSave(form);
  };

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 520 }}>
        <div className="modal-hd">
          <span className="modal-title">{initial.id ? 'Edit Credential' : 'Add Credential'}</span>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="fl">
            <label>Type</label>
            <select className="fs" value={form.type} onChange={(e) => setType(e.target.value)}>
              {Object.entries(CREDENTIAL_TEMPLATES).map(([key, tpl]) => (
                <option key={key} value={key}>
                  {tpl.label}
                </option>
              ))}
            </select>
          </div>
          <div className="fl">
            <label>Name *</label>
            <input
              className="fi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Production Database"
            />
          </div>
          <div className="fl">
            <label>Fields</label>
            <div className="cred-fields-form">
              {form.fields.map((field, idx) => (
                <div key={idx} className="cred-field-row">
                  <input
                    className="fi"
                    value={field.label}
                    onChange={(e) => updateField(idx, { label: e.target.value })}
                    placeholder="Label"
                  />
                  <input
                    className="fi"
                    type={field.secret ? 'password' : 'text'}
                    value={field.value}
                    onChange={(e) => updateField(idx, { value: e.target.value })}
                    placeholder="Value"
                  />
                  <label className="cred-secret-toggle" title="Mark as secret">
                    <input
                      type="checkbox"
                      checked={!!field.secret}
                      onChange={(e) => updateField(idx, { secret: e.target.checked })}
                    />
                    Secret
                  </label>
                  {form.fields.length > 1 && (
                    <IconButton icon={Icons.trash} label="Remove field" variant="danger" size={12} onClick={() => removeField(idx)} />
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-sm fx g4 mt8" onClick={addField}>
              <AppIcon icon={Icons.plus} size={12} />
              Add Field
            </button>
          </div>
          <div className="fl">
            <label>Notes</label>
            <textarea
              className="fa"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes…"
              rows={2}
            />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary fx g4" onClick={save}>
            <AppIcon icon={initial.id ? Icons.check : Icons.plus} size={14} />
            {initial.id ? 'Save Changes' : 'Add Credential'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CredentialCard({ cred, canEdit, onEdit, onDelete, toast }) {
  const [revealed, setRevealed] = useState({});

  const copyValue = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast('Copied to clipboard', 'ok');
    } catch {
      toast('Could not copy', 'err');
    }
  };

  return (
    <div className="cred-card">
      <div className="cred-card-hd">
        <div>
          <div className="cred-card-title">{cred.name}</div>
          <div className="cred-card-meta">
            <span className={`chip ${TYPE_CHIP[cred.type] || 'chip-gray'}`}>
              {CREDENTIAL_TEMPLATES[cred.type]?.label || 'Custom'}
            </span>
            <span className="t-muted-xs">Updated {cred.updated}</span>
          </div>
        </div>
        {canEdit && (
          <div className="cred-card-actions fx g4">
            <IconButton icon={Icons.pencil} label="Edit credential" onClick={() => onEdit(cred)} />
            <IconButton icon={Icons.trash} label="Delete credential" variant="danger" onClick={() => onDelete(cred)} />
          </div>
        )}
      </div>
      <div className="cred-fields">
        {cred.fields.map((field, idx) => {
          const isSecret = field.secret;
          const show = !isSecret || revealed[idx];
          return (
            <div key={idx} className="cred-field">
              <span className="cred-field-label">{field.label}</span>
              <div className="cred-field-value">
                <span className={isSecret && !show ? 'cred-masked' : ''}>
                  {show ? field.value || '—' : '••••••••'}
                </span>
                <div className="cred-field-btns fx g4">
                  {isSecret && (
                    <IconButton
                      icon={show ? Icons.eyeOff : Icons.eye}
                      label={show ? 'Hide value' : 'Show value'}
                      onClick={() => setRevealed((r) => ({ ...r, [idx]: !r[idx] }))}
                    />
                  )}
                  {field.value && (
                    <IconButton icon={Icons.copy} label="Copy value" onClick={() => copyValue(field.value)} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="cred-notes">{cred.notes || '\u00a0'}</div>
    </div>
  );
}

export default function CredentialsPage() {
  const { project, permissions, toast, refreshProjects } = useApp();
  const [search, setSearch] = useState('');
  const [typeFil, setTypeFil] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCred, setEditCred] = useState(null);

  const credentials = project?.credentials ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return credentials.filter((c) => {
      if (typeFil !== 'all' && c.type !== typeFil) return false;
      if (!q) return true;
      const hay = [
        c.name,
        c.notes,
        CREDENTIAL_TEMPLATES[c.type]?.label,
        ...c.fields.map((f) => `${f.label} ${f.value}`),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [credentials, search, typeFil]);

  if (!project) return null;

  const openAdd = () => {
    setEditCred(blankCred());
    setModalOpen(true);
  };

  const openEdit = (cred) => {
    setEditCred({
      id: cred.id,
      type: cred.type,
      name: cred.name,
      notes: cred.notes || '',
      fields: cred.fields.map((f) => ({ ...f })),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditCred(null);
  };

  const saveCred = async (form) => {
    if (!form.name.trim()) return toast('Name required', 'err');
    try {
      if (form.id) {
        await api.updateCredential(project.id, form.id, form);
        toast('Credential updated', 'ok');
      } else {
        await api.addCredential(project.id, form);
        toast('Credential added', 'ok');
      }
      await refreshProjects();
      closeModal();
    } catch (e) {
      toast(e.message || 'Failed to save', 'err');
    }
  };

  const deleteCred = async (cred) => {
    if (!window.confirm(`Delete "${cred.name}"?`)) return;
    try {
      await api.deleteCredential(project.id, cred.id);
      await refreshProjects();
      toast('Credential deleted', 'ok');
    } catch (e) {
      toast(e.message || 'Failed to delete', 'err');
    }
  };

  return (
    <>
      <PageHeader
        title="Project Credentials"
        subtitle={`${credentials.length} credential${credentials.length !== 1 ? 's' : ''} for ${project.name}`}
        actions={
          permissions.credentials && (
            <button type="button" className="btn btn-primary btn-sm ph-btn-compact fx g4" onClick={openAdd}>
              <AppIcon icon={Icons.plus} size={14} />
              Add Credential
            </button>
          )
        }
      />

      <div className="fbar">
        <div className="si">
          <AppIcon icon={Icons.search} size={12} />
          <input
            placeholder="Search credentials…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {TYPE_FILTERS.map(([f, label, Icon]) => (
          <button
            key={f}
            type="button"
            className={`fc${typeFil === f ? ' active' : ''}`}
            onClick={() => setTypeFil(f)}
          >
            {Icon && <AppIcon icon={Icon} size={12} />}
            {label}
          </button>
        ))}
        <span className="fbar-cnt">{filtered.length} entries</span>
      </div>

      {filtered.length === 0 ? (
        <div className="cred-empty">
          <AppIcon icon={Icons.keyRound} size={32} className="cred-empty-icon" />
          <div className="cred-empty-title">No credentials found</div>
          <div className="t-muted-sm">
            {credentials.length === 0
              ? 'Add database, Lucid Chart, or Loom credentials for this project.'
              : 'Try a different search or filter.'}
          </div>
          {permissions.credentials && credentials.length === 0 && (
            <button type="button" className="btn btn-primary btn-sm mt12" onClick={openAdd}>
              <AppIcon icon={Icons.plus} size={14} />
              Add First Credential
            </button>
          )}
        </div>
      ) : (
        <div className="cred-grid">
          {filtered.map((cred) => (
            <CredentialCard
              key={cred.id}
              cred={cred}
              canEdit={permissions.credentials}
              onEdit={openEdit}
              onDelete={deleteCred}
              toast={toast}
            />
          ))}
        </div>
      )}

      {modalOpen && editCred && (
        <CredModal
          key={editCred.id || 'new'}
          open={modalOpen}
          initial={editCred}
          onClose={closeModal}
          onSave={saveCred}
        />
      )}
    </>
  );
}
