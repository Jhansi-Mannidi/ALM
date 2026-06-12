import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

const DEPARTMENTS = ['Engineering', 'Product', 'Marketing', 'HR & Admin', 'Sales', 'Design', 'Finance', 'Operations'];
const LOCATIONS = ['Hyderabad', 'Bangalore', 'Mumbai', 'Remote'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract'];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'on-leave', label: 'On Leave' },
  { value: 'inactive', label: 'Inactive' },
];

export const HR_DOCUMENT_TYPES = [
  { value: 'id-proof', label: 'Government ID / ID Proof' },
  { value: 'offer-letter', label: 'Offer Letter' },
  { value: 'employment-contract', label: 'Employment Contract' },
  { value: 'resume', label: 'Resume / CV' },
  { value: 'education', label: 'Educational Certificates' },
  { value: 'tax-form', label: 'Tax / Payroll Form' },
  { value: 'other', label: 'Other Document' },
];

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_DOC_BYTES = 10 * 1024 * 1024;

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EmployeeAvatar({ employee, className = '' }) {
  if (employee?.photo?.url) {
    return (
      <img
        src={employee.photo.url}
        alt={employee.name}
        className={`ws-emp-avatar ws-emp-avatar-photo ${className}`.trim()}
      />
    );
  }
  return <div className={`ws-emp-avatar ${className}`.trim()}>{employee?.ini}</div>;
}

const PROBATION_OPTIONS = [
  { value: '3', label: '3 months' },
  { value: '6', label: '6 months' },
  { value: '9', label: '9 months' },
  { value: '12', label: '12 months' },
];

const BOND_DURATION_OPTIONS = [
  { value: '12', label: '12 months' },
  { value: '18', label: '18 months' },
  { value: '24', label: '24 months' },
  { value: '36', label: '36 months' },
];

function addMonthsToDate(dateStr, months) {
  if (!dateStr || !months) return '';
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().slice(0, 10);
}

function emptyDocRow() {
  return { id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type: 'id-proof', file: null };
}

const EMPTY_FORM = {
  name: '',
  role: '',
  department: 'Engineering',
  email: '',
  phone: '',
  location: 'Hyderabad',
  employmentType: 'Full-time',
  status: 'active',
  joinedAt: new Date().toISOString().slice(0, 10),
  bio: '',
  reportsToId: '',
  probationDurationMonths: '6',
  probationUntil: addMonthsToDate(new Date().toISOString().slice(0, 10), 6),
  bondApplicable: 'no',
  bondDurationMonths: '24',
  bondUntil: '',
  bondAmount: '',
  noticeDuringProbationDays: '15',
  noticeAfterProbationDays: '60',
};

export function AddEmployeeForm({ onCancel, onCreated, managers = [] }) {
  const [form, setForm] = useState(() => {
    const joinedAt = new Date().toISOString().slice(0, 10);
    return {
      ...EMPTY_FORM,
      joinedAt,
      probationUntil: addMonthsToDate(joinedAt, 6),
    };
  });
  const [photo, setPhoto] = useState(null);
  const [documentRows, setDocumentRows] = useState([emptyDocRow()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'joinedAt' || key === 'probationDurationMonths') {
        const months = key === 'probationDurationMonths' ? value : next.probationDurationMonths;
        const join = key === 'joinedAt' ? value : next.joinedAt;
        next.probationUntil = addMonthsToDate(join, months);
      }
      if (key === 'bondApplicable' && value === 'yes' && !next.bondUntil) {
        next.bondUntil = addMonthsToDate(next.joinedAt, next.bondDurationMonths);
      }
      if (key === 'bondDurationMonths' || (key === 'joinedAt' && next.bondApplicable === 'yes')) {
        if (next.bondApplicable === 'yes') {
          next.bondUntil = addMonthsToDate(
            key === 'joinedAt' ? value : next.joinedAt,
            key === 'bondDurationMonths' ? value : next.bondDurationMonths,
          );
        }
      }
      return next;
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Profile photo must be an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Profile photo must be under 2 MB');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto({
        fileName: file.name,
        url: reader.result,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addDocumentRow = () => {
    setDocumentRows((prev) => [...prev, emptyDocRow()]);
  };

  const updateDocumentRow = (rowId, updates) => {
    setDocumentRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...updates } : row)));
  };

  const removeDocumentRow = (rowId) => {
    setDocumentRows((prev) => (prev.length === 1 ? [emptyDocRow()] : prev.filter((r) => r.id !== rowId)));
  };

  const handleRowFileChange = (rowId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_DOC_BYTES) {
      setError(`"${file.name}" exceeds the 10 MB limit per document`);
      return;
    }
    setError('');
    updateDocumentRow(rowId, {
      file: {
        fileName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      },
    });
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const documents = documentRows
        .filter((row) => row.file?.fileName)
        .map((row) => ({
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: row.type,
          fileName: row.file.fileName,
          size: row.file.size,
          uploadedAt: row.file.uploadedAt,
        }));

      const created = await api.createHrEmployee({
        ...form,
        photo: photo || null,
        documents,
        employmentTerms: {
          probation: {
            durationMonths: Number(form.probationDurationMonths) || 6,
            until: form.probationUntil,
          },
          bond: {
            applicable: form.bondApplicable === 'yes',
            durationMonths: form.bondApplicable === 'yes' ? Number(form.bondDurationMonths) || 24 : 0,
            until: form.bondApplicable === 'yes' ? form.bondUntil : '',
            amount: form.bondApplicable === 'yes' ? Number(form.bondAmount) || 0 : 0,
          },
          noticePeriod: {
            duringProbationDays: Number(form.noticeDuringProbationDays) || 15,
            afterProbationDays: Number(form.noticeAfterProbationDays) || 60,
          },
        },
      });
      onCreated(created);
    } catch (err) {
      setError(err.message || 'Failed to add employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ws-emp-add-form">
          {error && <div className="ws-emp-form-error">{error}</div>}

          <section className="ws-emp-form-section">
            <h4 className="ws-emp-form-section-title">Profile Photo <span className="ws-emp-optional">(optional)</span></h4>
            <div className="ws-emp-photo-upload">
              <div className="ws-emp-photo-preview">
                {photo?.url ? (
                  <img src={photo.url} alt="Preview" className="ws-emp-photo-img" />
                ) : (
                  <div className="ws-emp-photo-placeholder">
                    <AppIcon icon={Icons.users} size={28} />
                  </div>
                )}
              </div>
              <div className="ws-emp-photo-actions">
                <label className="ws-hr-btn-outline ws-emp-file-label">
                  <AppIcon icon={Icons.plus} size={14} />
                  {photo ? 'Change Photo' : 'Upload Photo'}
                  <input type="file" accept="image/*" className="ws-emp-file-input" onChange={handlePhotoChange} />
                </label>
                {photo && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPhoto(null)}>
                    Remove
                  </button>
                )}
                <p className="ws-emp-field-hint">JPG or PNG, max 2 MB. Not required.</p>
              </div>
            </div>
          </section>

          <div className="ws-emp-form-grid">
            <div className="ws-emp-form-field full">
              <label className="fl">Full Name *</label>
              <input className="fi" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Alex Kumar" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Designation *</label>
              <input className="fi" required value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Department *</label>
              <select className="fi" value={form.department} onChange={(e) => set('department', e.target.value)}>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Email *</label>
              <input className="fi" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@voltuswave.io" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Phone</label>
              <input className="fi" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Location</label>
              <select className="fi" value={form.location} onChange={(e) => set('location', e.target.value)}>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Employment Type</label>
              <select className="fi" value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Status</label>
              <select className="fi" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Join Date</label>
              <input className="fi" type="date" value={form.joinedAt} onChange={(e) => set('joinedAt', e.target.value)} />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Reports To</label>
              <select className="fi" value={form.reportsToId || ''} onChange={(e) => set('reportsToId', e.target.value)}>
                <option value="">None</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field full">
              <label className="fl">Bio</label>
              <textarea className="fi" rows={3} value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Short professional summary..." />
            </div>
          </div>

          <section className="ws-emp-form-section">
            <h4 className="ws-emp-form-section-title">Probation & Notice Period</h4>
            <div className="ws-emp-form-grid">
              <div className="ws-emp-form-field">
                <label className="fl">Probation Period</label>
                <select className="fi" value={form.probationDurationMonths} onChange={(e) => set('probationDurationMonths', e.target.value)}>
                  {PROBATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="ws-emp-form-field">
                <label className="fl">Probation Until</label>
                <input className="fi" type="date" value={form.probationUntil} onChange={(e) => set('probationUntil', e.target.value)} />
              </div>
              <div className="ws-emp-form-field">
                <label className="fl">Notice (During Probation)</label>
                <div className="ws-emp-input-suffix">
                  <input
                    className="fi"
                    type="number"
                    min="0"
                    value={form.noticeDuringProbationDays}
                    onChange={(e) => set('noticeDuringProbationDays', e.target.value)}
                  />
                  <span className="ws-emp-input-suffix-text">days</span>
                </div>
              </div>
              <div className="ws-emp-form-field">
                <label className="fl">Notice (After Probation)</label>
                <div className="ws-emp-input-suffix">
                  <input
                    className="fi"
                    type="number"
                    min="0"
                    value={form.noticeAfterProbationDays}
                    onChange={(e) => set('noticeAfterProbationDays', e.target.value)}
                  />
                  <span className="ws-emp-input-suffix-text">days</span>
                </div>
              </div>
            </div>
          </section>

          <section className="ws-emp-form-section">
            <h4 className="ws-emp-form-section-title">Bond Details</h4>
            <div className="ws-emp-form-grid">
              <div className="ws-emp-form-field">
                <label className="fl">Employment Bond</label>
                <select className="fi" value={form.bondApplicable} onChange={(e) => set('bondApplicable', e.target.value)}>
                  <option value="no">No bond</option>
                  <option value="yes">Bond applicable</option>
                </select>
              </div>
              {form.bondApplicable === 'yes' && (
                <>
                  <div className="ws-emp-form-field">
                    <label className="fl">Bond Duration</label>
                    <select className="fi" value={form.bondDurationMonths} onChange={(e) => set('bondDurationMonths', e.target.value)}>
                      {BOND_DURATION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ws-emp-form-field">
                    <label className="fl">Bond Until</label>
                    <input className="fi" type="date" value={form.bondUntil} onChange={(e) => set('bondUntil', e.target.value)} />
                  </div>
                  <div className="ws-emp-form-field">
                    <label className="fl">Bond Amount (₹)</label>
                    <input
                      className="fi"
                      type="number"
                      min="0"
                      value={form.bondAmount}
                      onChange={(e) => set('bondAmount', e.target.value)}
                      placeholder="e.g. 500000"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="ws-emp-form-section">
            <h4 className="ws-emp-form-section-title">
              Related Documents <span className="ws-emp-optional">(optional)</span>
            </h4>
            <p className="ws-emp-field-hint mb12">
              Upload ID proof, offer letter, contract, or other HR documents. Add multiple documents using the + button below.
            </p>

            <div className="ws-emp-doc-rows">
              {documentRows.map((row) => (
                <div key={row.id} className="ws-emp-doc-row">
                  <select
                    className="fi ws-emp-doc-type"
                    value={row.type}
                    onChange={(e) => updateDocumentRow(row.id, { type: e.target.value })}
                  >
                    {HR_DOCUMENT_TYPES.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <label className="ws-hr-btn-outline ws-emp-file-label ws-emp-doc-file-btn">
                    <AppIcon icon={Icons.fileText} size={14} />
                    {row.file ? 'Change File' : 'Choose File'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="ws-emp-file-input"
                      onChange={(e) => handleRowFileChange(row.id, e)}
                    />
                  </label>
                  {row.file && (
                    <span className="ws-emp-doc-row-filename" title={row.file.fileName}>
                      {row.file.fileName} · {formatFileSize(row.file.size)}
                    </span>
                  )}
                  {documentRows.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-sm ws-emp-doc-row-remove" onClick={() => removeDocumentRow(row.id)} aria-label="Remove row">
                      <AppIcon icon={Icons.x} size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="button" className="ws-emp-add-doc-btn" onClick={addDocumentRow}>
              <AppIcon icon={Icons.plus} size={14} />
              Add another document
            </button>
          </section>

      <div className="ws-emp-form-foot">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="ws-hr-btn-primary" disabled={saving}>
          {saving ? 'Adding…' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
}

const ASSET_CATEGORIES = ['Laptop', 'Monitor', 'Phone', 'Tablet', 'Accessories', 'ID Card', 'Other'];

const EMPTY_ASSET_FORM = {
  name: '',
  category: 'Laptop',
  serial: '',
  assetTag: '',
  assignedAt: new Date().toISOString().slice(0, 10),
  value: '',
};

export function AddAssetModal({ open, onClose, employeeId, onAdded }) {
  const [form, setForm] = useState(EMPTY_ASSET_FORM);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_ASSET_FORM, assignedAt: new Date().toISOString().slice(0, 10) });
      setImage(null);
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Asset image must be an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Asset image must be under 2 MB');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setImage({
        fileName: file.name,
        url: reader.result,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await api.addHrEmployeeAsset(employeeId, {
        ...form,
        value: form.value ? Number(form.value) : 0,
        image: image || null,
      });
      onAdded(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add asset');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal ws-emp-modal">
        <div className="modal-hd">
          <span className="modal-title">Add Company Asset</span>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="ws-emp-form-error">{error}</div>}

          <section className="ws-emp-form-section">
            <h4 className="ws-emp-form-section-title">Asset Image <span className="ws-emp-optional">(optional)</span></h4>
            <div className="ws-emp-photo-upload">
              <div className="ws-emp-asset-image-wrap ws-emp-asset-modal-preview">
                {image?.url ? (
                  <img src={image.url} alt="Asset preview" className="ws-emp-asset-image" />
                ) : (
                  <div className="ws-emp-asset-image-placeholder">
                    <AppIcon icon={Icons.monitor} size={32} />
                    <span className="ws-emp-field-hint">No image uploaded</span>
                  </div>
                )}
              </div>
              <div className="ws-emp-photo-actions">
                <label className="ws-hr-btn-outline ws-emp-file-label">
                  <AppIcon icon={Icons.plus} size={14} />
                  {image ? 'Change Image' : 'Upload Image'}
                  <input type="file" accept="image/*" className="ws-emp-file-input" onChange={handleImageChange} />
                </label>
                {image && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setImage(null)}>
                    Remove
                  </button>
                )}
                <p className="ws-emp-field-hint">JPG or PNG, max 2 MB.</p>
              </div>
            </div>
          </section>

          <div className="ws-emp-form-grid">
            <div className="ws-emp-form-field full">
              <label className="fl">Asset Name *</label>
              <input className="fi" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. MacBook Pro 14&quot;" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Category *</label>
              <select className="fi" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {ASSET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Assigned Date</label>
              <input className="fi" type="date" value={form.assignedAt} onChange={(e) => set('assignedAt', e.target.value)} />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Serial Number</label>
              <input className="fi" value={form.serial} onChange={(e) => set('serial', e.target.value)} placeholder="Auto-generated if empty" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Asset Tag</label>
              <input className="fi" value={form.assetTag} onChange={(e) => set('assetTag', e.target.value)} placeholder="Auto-generated if empty" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Value (₹)</label>
              <input className="fi" type="number" min="0" value={form.value} onChange={(e) => set('value', e.target.value)} placeholder="e.g. 120000" />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary" disabled={saving}>
              {saving ? 'Adding…' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
