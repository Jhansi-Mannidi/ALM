import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

const PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

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
              <select className="fi" value={form.type} onChange={(e) => set('type', e.target.value)} required>
                {meta.types.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="fl">
              <label>Category</label>
              <select className="fi" value={form.category} onChange={(e) => set('category', e.target.value)} required>
                {meta.categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="fl">
              <label>Priority</label>
              <select className="fi" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="fl">
              <label>Related asset (optional)</label>
              <select
                className="fi"
                value={form.relatedAssetId}
                onChange={(e) => handleAssetChange(e.target.value)}
              >
                <option value="">— Not linked to an asset —</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.assetTag})
                  </option>
                ))}
              </select>
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
