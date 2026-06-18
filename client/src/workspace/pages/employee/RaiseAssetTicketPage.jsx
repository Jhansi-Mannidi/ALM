import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

const PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

function FormSelect({ value, options, onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <div className="ws-form-select" ref={ref}>
      <button
        type="button"
        className={`fi ws-form-select-btn${open ? ' open' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected?.label || placeholder}</span>
        <AppIcon icon={Icons.chevronDown} size={16} />
      </button>
      {open && (
        <div className="ws-form-select-menu" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`ws-form-select-option${option.value === value ? ' active' : ''}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RaiseAssetTicketPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [meta, setMeta] = useState({ types: [], categories: [] });
  const [assets, setAssets] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    type: 'replacement',
    category: 'Laptop',
    subject: '',
    description: '',
    priority: 'medium',
    relatedAssetId: searchParams.get('assetId') || '',
    relatedAssetName: searchParams.get('assetName') || '',
  });

  useEffect(() => {
    api.getEmployeePortal().then((d) => setMeta(d.ticketMeta || { types: [], categories: [] })).catch(() => {});
    api.getEmployeeAssets().then(setAssets).catch(() => {});
  }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleAssetChange = (assetId) => {
    const asset = assets.find((a) => a.id === assetId);
    setForm((prev) => ({
      ...prev,
      relatedAssetId: assetId,
      relatedAssetName: asset?.name || '',
      category: asset?.category || prev.category,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setError('Subject and description are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.createEmployeeAssetTicket(form);
      navigate('/workspace/employee/asset-tickets');
    } catch (err) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ws-hr-page ws-emp-portal-page">
      <Link to="/workspace/employee/asset-tickets" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to asset tickets
      </Link>

      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Raise asset ticket</h1>
          <p className="ws-page-subtitle">
            Request a new asset, replacement, repair, or return company equipment
          </p>
        </div>
      </div>

      <div className="card ws-hr-panel ws-emp-ticket-form-card">
        <form onSubmit={handleSubmit} className="ws-hr-panel-body ws-emp-ticket-form">
          <div className="ws-emp-form-grid">
            <div className="fl">
              <label>Request type</label>
              <FormSelect
                value={form.type}
                options={meta.types.map((t) => ({ value: t.id, label: t.label }))}
                onChange={(value) => set('type', value)}
              />
            </div>

            <div className="fl">
              <label>Category</label>
              <FormSelect
                value={form.category}
                options={meta.categories.map((category) => ({ value: category, label: category }))}
                onChange={(value) => set('category', value)}
              />
            </div>

            <div className="fl">
              <label>Priority</label>
              <FormSelect
                value={form.priority}
                options={PRIORITIES.map((priority) => ({ value: priority.id, label: priority.label }))}
                onChange={(value) => set('priority', value)}
              />
            </div>

            <div className="fl">
              <label>Related asset (optional)</label>
              <FormSelect
                value={form.relatedAssetId}
                options={[
                  { value: '', label: '— Not linked to an asset —' },
                  ...assets.map((asset) => ({
                    value: asset.id,
                    label: `${asset.name} (${asset.assetTag})`,
                  })),
                ]}
                onChange={handleAssetChange}
              />
            </div>

            <div className="fl ws-emp-form-field full">
              <label>Subject</label>
              <input
                className="fi"
                value={form.subject}
                onChange={(e) => set('subject', e.target.value)}
                placeholder="Brief summary of your request"
                required
              />
            </div>

            <div className="fl ws-emp-form-field full">
              <label>Description</label>
              <textarea
                className="fi"
                rows={5}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe the issue or what you need. Include any relevant details for IT."
                required
              />
            </div>
          </div>

          {error && <p className="ws-emp-form-error">{error}</p>}

          <div className="ws-emp-ticket-form-actions">
            <Link to="/workspace/employee/asset-tickets" className="btn btn-ghost">
              Cancel
            </Link>
            <button type="submit" className="ws-hr-btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
