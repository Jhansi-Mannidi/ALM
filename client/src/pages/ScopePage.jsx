import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { AppIcon, IconButton, Icons } from '../components/icons';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';
import { downloadScopeSheet, formatScopeAudit, formatSheetDate } from '../utils/helpers';

function ScopeAuditLine({ text }) {
  if (!text) return null;
  return <div className="scope-audit">{text}</div>;
}

function ScopeSubSection({ title, count, chipClass = 'chip-gray', actions, children }) {
  return (
    <div className="scope-sub">
      <div className="scope-sub-hd">
        <div className="scope-sub-hd-left">
          <span className="scope-sub-title">{title}</span>
          {count != null && <span className={`chip ${chipClass}`}>{count}</span>}
        </div>
        {actions && <div className="scope-sub-actions">{actions}</div>}
      </div>
      <div className="scope-sub-body">{children}</div>
    </div>
  );
}

function DevLink({ label, url }) {
  if (!url) {
    return (
      <div className="scope-dev-link scope-dev-link-empty">
        <span className="scope-dev-link-lbl">{label}</span>
        <span className="t-muted-xs">Not set</span>
      </div>
    );
  }
  return (
    <a
      className="scope-dev-link"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="scope-dev-link-lbl">{label}</span>
      <span className="scope-dev-link-url">{url}</span>
      <AppIcon icon={Icons.externalLink} size={13} className="scope-dev-link-icon" />
    </a>
  );
}

function fileIcon(sheet) {
  if (sheet.contentType === 'text' || (!sheet.name && sheet.description)) return Icons.fileText;
  if (sheet.contentType === 'recording' || /\.(mp3|wav|m4a|webm|ogg|aac)$/i.test(sheet.name || '')) {
    return Icons.play;
  }
  return /\.pdf$/i.test(sheet.name || '') ? Icons.fileText : Icons.fileSpreadsheet;
}

const CONTENT_TYPES = [
  { id: 'file', label: 'File attachment' },
  { id: 'text', label: 'Text only' },
  { id: 'recording', label: 'Recording' },
];

const RECORDING_EXT = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.aac'];

const CUSTOM_SECTION_CHIPS = ['chip-purple', 'chip-navy', 'chip-blue', 'chip-teal', 'chip-amber'];

function customSectionApiKey(sectionId) {
  return `custom-${sectionId}`;
}

function canManageScopeSections(permissions) {
  return !!(permissions.addClientReq || permissions.addDevReq || permissions.addTesterScope);
}

function ScopeCardHeader({ title, chipClass, chipLabel, canDelete, onDeleteRequest }) {
  return (
    <div className="card-hd">
      <div className="card-title">{title}</div>
      <div className="scope-card-hd-actions fx g6">
        <span className={`chip ${chipClass}`}>{chipLabel}</span>
        {canDelete && (
          <IconButton
            icon={Icons.trash}
            label={`Delete ${title} section`}
            variant="danger"
            size={14}
            onClick={onDeleteRequest}
          />
        )}
      </div>
    </div>
  );
}

function buildSectionDeleteDetail(title, docCount, extraNote) {
  const parts = [`You are about to delete the "${title}" section.`];
  if (docCount) parts.push(`${docCount} document(s) inside will be removed.`);
  if (extraNote) parts.push(extraNote);
  parts.push('This action cannot be undone.');
  return parts.join(' ');
}

function CreateScopeSectionModal({ open, saving, addedByUser, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
  }, [open]);

  if (!open) return null;

  const close = () => {
    if (saving) return;
    onClose();
  };

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal" style={{ width: 460 }}>
        <div className="modal-hd">
          <span className="modal-title">Create Scope Section</span>
          <button type="button" className="modal-x" onClick={close} aria-label="Close" disabled={saving}>
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <div className="modal-body">
          <p className="scope-create-intro">
            Add a new scope column for other document types — e.g. <strong>BA Scope</strong>, DevOps runbooks,
            or compliance packs. Each section gets its own card with title, description, and file uploads.
          </p>
          <div className="fl">
            <label>Section Title *</label>
            <input
              className="fi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. BA Scope, DevOps Docs, Compliance"
            />
          </div>
          <div className="fl">
            <label>Description</label>
            <textarea
              className="fa"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of documents belong in this section?"
              rows={3}
            />
          </div>
          <div className="fl">
            <label>Created By</label>
            <input className="fi fi-readonly" value={addedByUser?.name || '—'} readOnly tabIndex={-1} />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={close} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary fx g4"
            onClick={() => onSubmit({ title: title.trim(), description: description.trim() })}
            disabled={saving || !title.trim()}
          >
            <AppIcon icon={Icons.plus} size={14} />
            {saving ? 'Creating…' : 'Create Section'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddScopeDocModal({ open, allowedExt, uploading, addedByUser, onClose, onSubmit }) {
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(today);
  const [contentType, setContentType] = useState('file');
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setDate(today);
    setContentType('file');
    setFile(null);
  }, [open]);

  if (!open) return null;

  const close = () => {
    if (uploading) return;
    onClose();
  };

  const fileAccept =
    contentType === 'recording'
      ? [...RECORDING_EXT, ...allowedExt].join(',')
      : allowedExt.join(',');

  const submit = () => {
    if (!title.trim()) return;
    if (contentType === 'text' && !description.trim()) return;
    if (!file && !description.trim() && contentType !== 'text') return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date: date || today,
      contentType,
      file: contentType === 'text' ? null : file,
      addedBy: addedByUser?.id || '',
      addedByName: addedByUser?.name || '',
    });
  };

  const canSubmit =
    title.trim() &&
    (contentType === 'text' ? description.trim() : file || description.trim());

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal" style={{ width: 440 }}>
        <div className="modal-hd">
          <span className="modal-title">Add Document</span>
          <button type="button" className="modal-x" onClick={close} aria-label="Close" disabled={uploading}>
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="fl">
            <label>Document Title *</label>
            <input
              className="fi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. BRD Sign-off v3"
            />
          </div>
          <div className="fl">
            <label>Content Type</label>
            <select className="fs" value={contentType} onChange={(e) => { setContentType(e.target.value); setFile(null); }}>
              {CONTENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <div className="t-muted-xs mt4">
              {contentType === 'text' && 'Save notes or requirements as text — no file needed.'}
              {contentType === 'recording' && 'Attach a meeting recording, or add notes in the description.'}
              {contentType === 'file' && 'Attach a PDF or Excel file, or save text-only in the description.'}
            </div>
          </div>
          <div className="fl">
            <label>{contentType === 'text' ? 'Notes *' : 'Description'}</label>
            <textarea
              className="fa"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                contentType === 'text'
                  ? 'Enter requirements, meeting notes, or scope text…'
                  : 'Brief notes about this document…'
              }
              rows={contentType === 'text' ? 4 : 2}
            />
          </div>
          <div className="fl">
            <label>Date *</label>
            <input className="fi" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="fl">
            <label>Added By</label>
            <input className="fi fi-readonly" value={addedByUser?.name || '—'} readOnly tabIndex={-1} />
          </div>
          {contentType !== 'text' && (
            <div className="fl">
              <label>{contentType === 'recording' ? 'Recording file' : 'File'}</label>
              <input
                className="fi scope-doc-input"
                type="file"
                accept={fileAccept}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file && <div className="t-muted-xs mt4">{file.name}</div>}
              <div className="t-muted-xs mt4">Optional — provide a file, description, or both.</div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={close} disabled={uploading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary fx g4"
            onClick={submit}
            disabled={uploading || !canSubmit}
          >
            <AppIcon icon={Icons.plus} size={14} />
            {uploading ? 'Saving…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditScopeDocModal({ open, sheet, uploading, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (!open || !sheet) return;
    setTitle(sheet.title || '');
    setDescription(sheet.description || '');
    setDate(sheet.date || new Date().toISOString().slice(0, 10));
  }, [open, sheet]);

  if (!open || !sheet) return null;

  const close = () => {
    if (uploading) return;
    onClose();
  };

  const submit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date: date || sheet.date,
    });
  };

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal" style={{ width: 440 }}>
        <div className="modal-hd">
          <span className="modal-title">Edit Document</span>
          <button type="button" className="modal-x" onClick={close} aria-label="Close" disabled={uploading}>
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="fl">
            <label>Document Title *</label>
            <input className="fi" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="fl">
            <label>Description</label>
            <textarea
              className="fa"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief notes about this document…"
              rows={2}
            />
          </div>
          <div className="fl">
            <label>Date *</label>
            <input className="fi" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {sheet.updatedByName && (
            <div className="fl">
              <label>Last Updated By</label>
              <div className="fi scope-doc-readonly">
                {sheet.updatedByName}
                {sheet.updatedAt ? ` · ${formatSheetDate(sheet.updatedAt)}` : ''}
              </div>
            </div>
          )}
          <div className="fl">
            <label>{sheet.updatedByName ? 'Originally Added By' : 'Added By'}</label>
            <div className="fi scope-doc-readonly">{sheet.addedByName || '—'}</div>
          </div>
          {sheet.name && sheet.contentType !== 'text' && (
            <div className="fl">
              <label>File</label>
              <div className="fi scope-doc-readonly">{sheet.name}</div>
              <div className="t-muted-xs mt4">Upload a new document to replace the attached file.</div>
            </div>
          )}
          {(!sheet.name || sheet.contentType === 'text') && (
            <div className="fl">
              <label>Attachment</label>
              <div className="fi scope-doc-readonly">
                {sheet.contentType === 'text' ? 'Text only' : sheet.contentType === 'recording' ? 'Recording (no file)' : 'No file attached'}
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={close} disabled={uploading}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary fx g4" onClick={submit} disabled={uploading}>
            <AppIcon icon={Icons.pencil} size={14} />
            {uploading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditLinksModal({ open, mockUrl, uiUxUrl, saving, onClose, onSubmit }) {
  const [mock, setMock] = useState('');
  const [uiUx, setUiUx] = useState('');

  useEffect(() => {
    if (!open) return;
    setMock(mockUrl || '');
    setUiUx(uiUxUrl || '');
  }, [open, mockUrl, uiUxUrl]);

  if (!open) return null;

  const close = () => {
    if (saving) return;
    onClose();
  };

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal" style={{ width: 440 }}>
        <div className="modal-hd">
          <span className="modal-title">Edit Design & Mock Links</span>
          <button type="button" className="modal-x" onClick={close} aria-label="Close" disabled={saving}>
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="fl">
            <label>Mock / Prototype URL</label>
            <input
              className="fi"
              value={mock}
              onChange={(e) => setMock(e.target.value)}
              placeholder="https://prototype.example.com"
            />
          </div>
          <div className="fl">
            <label>UI / UX URL</label>
            <input
              className="fi"
              value={uiUx}
              onChange={(e) => setUiUx(e.target.value)}
              placeholder="https://www.figma.com/file/…"
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
            onClick={() => onSubmit({ mockUrl: mock.trim(), uiUxUrl: uiUx.trim() })}
            disabled={saving}
          >
            <AppIcon icon={Icons.pencil} size={14} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTechStackModal({ open, items, saving, onClose, onSubmit }) {
  const [rows, setRows] = useState(['']);

  useEffect(() => {
    if (!open) return;
    setRows(items?.length ? [...items] : ['']);
  }, [open, items]);

  if (!open) return null;

  const close = () => {
    if (saving) return;
    onClose();
  };

  const addRow = () => setRows((prev) => [...prev, '']);
  const updateRow = (idx, value) => setRows((prev) => prev.map((r, i) => (i === idx ? value : r)));
  const removeRow = (idx) => setRows((prev) => (prev.length <= 1 ? [''] : prev.filter((_, i) => i !== idx)));

  const save = () => {
    const techStack = rows.map((r) => r.trim()).filter(Boolean);
    onSubmit(techStack);
  };

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal" style={{ width: 440 }}>
        <div className="modal-hd">
          <span className="modal-title">Edit Tech Stack</span>
          <button type="button" className="modal-x" onClick={close} aria-label="Close" disabled={saving}>
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <div className="modal-body">
          <p className="t-muted-xs mb8">Add one technology or tool per row.</p>
          <div className="scope-tech-edit-list">
            {rows.map((row, idx) => (
              <div key={idx} className="scope-tech-edit-row">
                <input
                  className="fi"
                  value={row}
                  onChange={(e) => updateRow(idx, e.target.value)}
                  placeholder="e.g. React Native"
                />
                <IconButton
                  icon={Icons.trash}
                  label="Remove item"
                  variant="danger"
                  size={14}
                  onClick={() => removeRow(idx)}
                />
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm fx g4 mt8" onClick={addRow}>
            <AppIcon icon={Icons.plus} size={12} />
            Add item
          </button>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={close} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary fx g4" onClick={save} disabled={saving}>
            <AppIcon icon={Icons.pencil} size={14} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeveloperScopeSections({ project, canEditDev, canEditTechStack, user, toast, refreshProjects }) {
  const dev = project.developerScope || {};
  const techStack = dev.techStack || [];
  const linksAudit = formatScopeAudit(dev.linksMeta);
  const techAudit = formatScopeAudit(dev.techStackMeta);
  const [linksOpen, setLinksOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const editAction = (allowed, label, onClick) =>
    allowed ? <IconButton icon={Icons.pencil} label={label} size={13} onClick={onClick} /> : null;

  const auditPayload = {
    updatedBy: user?.id || '',
    updatedByName: user?.name || '',
  };

  const saveLinks = async ({ mockUrl, uiUxUrl }) => {
    setSaving(true);
    try {
      await api.updateDeveloperScope(project.id, { mockUrl, uiUxUrl, ...auditPayload });
      await refreshProjects();
      setLinksOpen(false);
      toast('Design links updated', 'ok');
    } catch (err) {
      toast(err.message || 'Failed to save', 'err');
    } finally {
      setSaving(false);
    }
  };

  const saveTechStack = async (items) => {
    setSaving(true);
    try {
      await api.updateDeveloperScope(project.id, { techStack: items, ...auditPayload });
      await refreshProjects();
      setTechOpen(false);
      toast('Tech stack updated', 'ok');
    } catch (err) {
      toast(err.message || 'Failed to save', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ScopeSubSection
        title="Design & Mock"
        actions={editAction(canEditDev, 'Edit design links', () => setLinksOpen(true))}
      >
        <DevLink label="Mock / Prototype" url={dev.mockUrl} />
        <DevLink label="UI / UX" url={dev.uiUxUrl} />
        <ScopeAuditLine text={linksAudit} />
      </ScopeSubSection>
      <ScopeSubSection
        title="Tech Stack"
        count={techStack.length}
        chipClass="chip-teal"
        actions={editAction(canEditTechStack, 'Edit tech stack', () => setTechOpen(true))}
      >
        {techStack.length === 0 ? (
          <div className="scope-empty">
            {canEditTechStack ? 'No tech stack yet — click edit to add items' : 'Tech stack not documented'}
          </div>
        ) : (
          <div className="scope-tech-stack">
            {techStack.map((item) => (
              <span key={item} className="chip chip-gray scope-tech-chip">
                {item}
              </span>
            ))}
          </div>
        )}
        <ScopeAuditLine text={techAudit} />
      </ScopeSubSection>
      {linksOpen && (
        <EditLinksModal
          open
          mockUrl={dev.mockUrl}
          uiUxUrl={dev.uiUxUrl}
          saving={saving}
          onClose={() => setLinksOpen(false)}
          onSubmit={saveLinks}
        />
      )}
      {techOpen && (
        <EditTechStackModal
          open
          items={techStack}
          saving={saving}
          onClose={() => setTechOpen(false)}
          onSubmit={saveTechStack}
        />
      )}
    </>
  );
}

function ScopeFileSection({
  subsectionTitle,
  sheets,
  section,
  sectionLabel,
  project,
  canEdit,
  toast,
  refreshProjects,
  addedByUser,
  allowedExt = ['.xlsx', '.xls'],
  addLabel = 'Add Excel',
  emptyMessage = 'No files uploaded',
  hideSubTitle = false,
}) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSheet, setEditSheet] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState(null);
  const [deletingSheet, setDeletingSheet] = useState(false);
  const extPattern = new RegExp(`(${allowedExt.map((e) => e.replace('.', '\\.')).join('|')})$`, 'i');
  const recordingPattern = new RegExp(`(${RECORDING_EXT.map((e) => e.replace('.', '\\.')).join('|')})$`, 'i');

  const filteredSheets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sheets;
    return sheets.filter((s) => {
      const hay = `${s.title} ${s.name || ''} ${s.description || ''} ${s.addedByName || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sheets, search]);

  const submitUpload = async ({ title, description, date, contentType, file, addedBy, addedByName }) => {
    if (!title?.trim()) return toast('Document title required', 'err');
    if (contentType === 'text' && !description?.trim()) {
      return toast('Notes are required for text-only entries', 'err');
    }
    if (!file && !description?.trim()) {
      return toast('Add a description or attach a file', 'err');
    }
    if (file && contentType === 'recording' && !recordingPattern.test(file.name) && !extPattern.test(file.name)) {
      toast(`Allowed recording formats: ${RECORDING_EXT.join(', ')}`, 'err');
      return;
    }
    if (file && contentType === 'file' && !extPattern.test(file.name)) {
      toast(`Allowed formats: ${allowedExt.join(', ')}`, 'err');
      return;
    }
    setUploading(true);
    try {
      await api.addScopeSheet(project.id, section, {
        title,
        description: description || '',
        date,
        contentType,
        name: file?.name || '',
        size: file?.size || 0,
        addedBy,
        addedByName,
      });
      await refreshProjects();
      setModalOpen(false);
      toast('Document added', 'ok');
    } catch (err) {
      toast(err.message || 'Upload failed', 'err');
    } finally {
      setUploading(false);
    }
  };

  const submitEdit = async (data) => {
    if (!editSheet) return;
    setSaving(true);
    try {
      await api.updateScopeSheet(project.id, section, editSheet.id, {
        ...data,
        updatedBy: addedByUser?.id || '',
        updatedByName: addedByUser?.name || '',
      });
      await refreshProjects();
      setEditSheet(null);
      toast('Document updated', 'ok');
    } catch (err) {
      toast(err.message || 'Failed to update', 'err');
    } finally {
      setSaving(false);
    }
  };

  const confirmRemoveSheet = async () => {
    if (!sheetToDelete) return;
    setDeletingSheet(true);
    try {
      await api.deleteScopeSheet(project.id, section, sheetToDelete.id);
      await refreshProjects();
      setSheetToDelete(null);
      toast('File removed', 'ok');
    } catch (err) {
      toast(err.message || 'Failed to remove', 'err');
    } finally {
      setDeletingSheet(false);
    }
  };

  const uploadBlock = (
    <>
      <div className="scope-sheet-toolbar">
        <div className="si scope-sheet-search">
          <AppIcon icon={Icons.search} size={13} />
          <input
            placeholder="Search documents by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canEdit && (
          <button type="button" className="btn btn-ghost btn-sm scope-sheet-add" onClick={() => setModalOpen(true)}>
            <AppIcon icon={Icons.plus} size={12} />
            {addLabel}
          </button>
        )}
      </div>
      {sheets.length === 0 ? (
        <div className="scope-empty">{emptyMessage}</div>
      ) : filteredSheets.length === 0 ? (
        <div className="scope-empty">No documents match your search</div>
      ) : (
        <ul className="scope-sheet-list">
          {filteredSheets.map((sheet) => (
            <li key={sheet.id} className="scope-sheet-item">
              <AppIcon icon={fileIcon(sheet)} size={16} className="scope-sheet-icon" />
              <div className="scope-sheet-info">
                <div className="scope-sheet-title">{sheet.title}</div>
                {sheet.description && (
                  <div className="scope-sheet-desc">{sheet.description}</div>
                )}
                <div className="scope-sheet-meta">
                  <span>{formatSheetDate(sheet.date)}</span>
                  {(sheet.updatedByName || sheet.addedByName) && (
                    <>
                      <span className="scope-sheet-sep">·</span>
                      <span>
                        {sheet.updatedByName
                          ? `Updated by ${sheet.updatedByName}`
                          : `Added by ${sheet.addedByName}`}
                      </span>
                    </>
                  )}
                  <span className="scope-sheet-sep">·</span>
                  <span className="scope-sheet-fname">
                    {sheet.contentType === 'text'
                      ? 'Text only'
                      : sheet.contentType === 'recording'
                        ? sheet.name || 'Recording'
                        : sheet.name || 'No file'}
                  </span>
                </div>
              </div>
              <div className="scope-sheet-actions fx g4">
                {(sheet.name || sheet.description) && (
                  <IconButton
                    icon={Icons.download}
                    label={`Download ${sheet.title}`}
                    size={14}
                    onClick={() => downloadScopeSheet(project, sheet, sectionLabel)}
                  />
                )}
                {canEdit && (
                  <>
                    <IconButton
                      icon={Icons.pencil}
                      label={`Edit ${sheet.title}`}
                      size={14}
                      onClick={() => setEditSheet(sheet)}
                    />
                    <IconButton
                      icon={Icons.trash}
                      label={`Remove ${sheet.title}`}
                      variant="danger"
                      size={14}
                      onClick={() => setSheetToDelete(sheet)}
                    />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {modalOpen && (
        <AddScopeDocModal
          key={section}
          open
          allowedExt={allowedExt}
          uploading={uploading}
          addedByUser={addedByUser}
          onClose={() => setModalOpen(false)}
          onSubmit={submitUpload}
        />
      )}
      {editSheet && (
        <EditScopeDocModal
          open
          sheet={editSheet}
          uploading={saving}
          onClose={() => setEditSheet(null)}
          onSubmit={submitEdit}
        />
      )}
      <ConfirmModal
        open={!!sheetToDelete}
        title="Are you sure you want to delete?"
        message={`Remove "${sheetToDelete?.title}"?`}
        detail="This document will be permanently removed from this section."
        confirmLabel="Delete"
        busy={deletingSheet}
        onClose={() => !deletingSheet && setSheetToDelete(null)}
        onConfirm={confirmRemoveSheet}
      />
    </>
  );

  if (hideSubTitle) return uploadBlock;

  return (
    <ScopeSubSection title={subsectionTitle} count={sheets.length} chipClass="chip-gray">
      {uploadBlock}
    </ScopeSubSection>
  );
}

function CustomScopeCard({
  section,
  sheets,
  chipClass,
  canEdit,
  onDeleteRequest,
  user,
  toast,
  refreshProjects,
  project,
}) {
  return (
    <div className="card scope-card scope-card-custom">
      <ScopeCardHeader
        title={section.title}
        chipClass={chipClass}
        chipLabel={`${sheets.length} documents`}
        canDelete={canEdit}
        onDeleteRequest={() =>
          onDeleteRequest({
            sectionId: section.id,
            title: section.title,
            docCount: sheets.length,
          })
        }
      />
      <div className="card-body scope-card-body">
        {section.description && <p className="scope-client-note">{section.description}</p>}
        {section.addedByName && (
          <div className="scope-section-meta t-muted-xs">
            Created by {section.addedByName}
            {section.addedAt ? ` · ${formatSheetDate(section.addedAt)}` : ''}
          </div>
        )}
        <ScopeFileSection
          subsectionTitle="Documents"
          sheets={sheets}
          section={customSectionApiKey(section.id)}
          sectionLabel={section.title}
          project={project}
          canEdit={canEdit}
          toast={toast}
          refreshProjects={refreshProjects}
          addedByUser={user}
          allowedExt={['.pdf', '.xlsx', '.xls']}
          addLabel="Add PDF / Excel"
          emptyMessage={`Upload documents for ${section.title}`}
          hideSubTitle
        />
      </div>
    </div>
  );
}

export default function ScopePage() {
  const { project, permissions, user, toast, refreshProjects } = useApp();
  const [createSectionOpen, setCreateSectionOpen] = useState(false);
  const [creatingSection, setCreatingSection] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [deletingSection, setDeletingSection] = useState(false);

  if (!project) return null;

  const dev = project.developerScope || {};
  const techStack = dev.techStack || [];
  const scopeSheets = project.scopeSheets || { client: [], tester: [], developer: [] };
  const clientSheets = scopeSheets.client || [];
  const testerSheets = scopeSheets.tester || [];
  const developerSheets = scopeSheets.developer || [];
  const customSections = project.customScopeSections || [];
  const hiddenSections = project.hiddenScopeSections || [];
  const canCreateSection = canManageScopeSections(permissions);
  const showClient = !hiddenSections.includes('client');
  const showDeveloper = !hiddenSections.includes('developer');
  const showTester = !hiddenSections.includes('tester');
  const hasVisibleSections =
    showClient || showDeveloper || showTester || customSections.length > 0;

  const requestDeleteSection = (payload) => setSectionToDelete(payload);

  const confirmDeleteSection = async () => {
    if (!sectionToDelete) return;
    setDeletingSection(true);
    try {
      await api.deleteScopeSection(project.id, sectionToDelete.sectionId);
      await refreshProjects();
      toast(`"${sectionToDelete.title}" section removed`, 'ok');
      setSectionToDelete(null);
    } catch (err) {
      toast(err.message || 'Failed to delete section', 'err');
    } finally {
      setDeletingSection(false);
    }
  };

  const submitCreateSection = async ({ title, description }) => {
    if (!title) return toast('Section title required', 'err');
    setCreatingSection(true);
    try {
      await api.createScopeSection(project.id, {
        title,
        description,
        addedBy: user?.id || '',
        addedByName: user?.name || '',
      });
      await refreshProjects();
      setCreateSectionOpen(false);
      toast(`${title} section created`, 'ok');
    } catch (err) {
      toast(err.message || 'Failed to create section', 'err');
    } finally {
      setCreatingSection(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Scope & Requirements"
        subtitle="Client requirements, developer feature list, testers scope & custom document sections"
        actions={
          canCreateSection ? (
            <button
              type="button"
              className="btn btn-primary btn-sm ph-btn-compact fx g4"
              onClick={() => setCreateSectionOpen(true)}
            >
              <AppIcon icon={Icons.plus} size={14} />
              Create Section
            </button>
          ) : null
        }
      />

      {!hasVisibleSections && (
        <div className="card scope-empty-all">
          <p>No scope sections on this project. Use <strong>Create Section</strong> to add one.</p>
        </div>
      )}

      <div className="g3 scope-grid">
        {showClient && (
        <div className="card scope-card">
          <ScopeCardHeader
            title="Client Requirements"
            chipClass="chip-green"
            chipLabel={`${clientSheets.length} documents`}
            canDelete={permissions.addClientReq}
            onDeleteRequest={() =>
              requestDeleteSection({
                sectionId: 'client',
                title: 'Client Requirements',
                docCount: clientSheets.length,
              })
            }
          />
          <div className="card-body scope-card-body">
            <p className="scope-client-note">
              Client requirements are captured in uploaded PDF or Excel documents — not listed as text here.
            </p>
            <ScopeFileSection
              subsectionTitle="Client Documents"
              sheets={clientSheets}
              section="client"
              sectionLabel="Client Requirements"
              project={project}
              canEdit={permissions.addClientReq}
              toast={toast}
              refreshProjects={refreshProjects}
              addedByUser={user}
              allowedExt={['.pdf', '.xlsx', '.xls']}
              addLabel="Add PDF / Excel"
              emptyMessage="Upload client requirement PDFs or Excel sheets"
              hideSubTitle
            />
          </div>
        </div>
        )}

        {showDeveloper && (
        <div className="card scope-card">
          <ScopeCardHeader
            title="Developer feature list"
            chipClass="chip-teal"
            chipLabel={`${techStack.length + developerSheets.length} items`}
            canDelete={permissions.addDevReq || permissions.editTechStack}
            onDeleteRequest={() =>
              requestDeleteSection({
                sectionId: 'developer',
                title: 'Developer feature list',
                docCount: techStack.length + developerSheets.length,
                extraNote: 'Design links and tech stack will be cleared too.',
              })
            }
          />
          <div className="card-body scope-card-body">
            <DeveloperScopeSections
              project={project}
              canEditDev={permissions.addDevReq}
              canEditTechStack={permissions.editTechStack}
              user={user}
              toast={toast}
              refreshProjects={refreshProjects}
            />
            <ScopeFileSection
              subsectionTitle="Feature List (Excel)"
              sheets={developerSheets}
              section="developer"
              sectionLabel="Developer feature list"
              project={project}
              canEdit={permissions.addDevReq}
              toast={toast}
              refreshProjects={refreshProjects}
              addedByUser={user}
              emptyMessage="Upload developer feature list Excel sheets"
            />
          </div>
        </div>
        )}

        {showTester && (
        <div className="card scope-card">
          <ScopeCardHeader
            title="Testers Scope"
            chipClass="chip-amber"
            chipLabel={`${testerSheets.length} documents`}
            canDelete={permissions.addTesterScope}
            onDeleteRequest={() =>
              requestDeleteSection({
                sectionId: 'tester',
                title: 'Testers Scope',
                docCount: testerSheets.length,
              })
            }
          />
          <div className="card-body scope-card-body">
            <p className="scope-client-note">
              Test scope, cases and scenarios are captured in uploaded PDF or Excel documents — not listed as text here.
            </p>
            <ScopeFileSection
              subsectionTitle="Test Scope Documents"
              sheets={testerSheets}
              section="tester"
              sectionLabel="Testers Scope"
              project={project}
              canEdit={permissions.addTesterScope}
              toast={toast}
              refreshProjects={refreshProjects}
              addedByUser={user}
              allowedExt={['.pdf', '.xlsx', '.xls']}
              addLabel="Add PDF / Excel"
              emptyMessage="Upload testers scope PDFs or Excel sheets"
              hideSubTitle
            />
          </div>
        </div>
        )}

        {customSections.map((section, idx) => {
          const sheets = scopeSheets[customSectionApiKey(section.id)] || [];
          const chipClass = CUSTOM_SECTION_CHIPS[idx % CUSTOM_SECTION_CHIPS.length];
          return (
            <CustomScopeCard
              key={section.id}
              section={section}
              sheets={sheets}
              chipClass={chipClass}
              project={project}
              canEdit={canCreateSection}
              onDeleteRequest={requestDeleteSection}
              user={user}
              toast={toast}
              refreshProjects={refreshProjects}
            />
          );
        })}
      </div>

      {createSectionOpen && (
        <CreateScopeSectionModal
          open
          saving={creatingSection}
          addedByUser={user}
          onClose={() => setCreateSectionOpen(false)}
          onSubmit={submitCreateSection}
        />
      )}

      <ConfirmModal
        open={!!sectionToDelete}
        title="Are you sure you want to delete?"
        message={
          sectionToDelete
            ? `Delete the "${sectionToDelete.title}" section?`
            : ''
        }
        detail={
          sectionToDelete
            ? buildSectionDeleteDetail(
                sectionToDelete.title,
                sectionToDelete.docCount,
                sectionToDelete.extraNote,
              )
            : ''
        }
        confirmLabel="Delete"
        busy={deletingSection}
        onClose={() => !deletingSection && setSectionToDelete(null)}
        onConfirm={confirmDeleteSection}
      />
    </>
  );
}
