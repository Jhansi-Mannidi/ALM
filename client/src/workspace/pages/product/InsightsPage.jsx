import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { PM_INSIGHT_SOURCES, statusChipClass } from '../../data/productCatalog';

const EMPTY = { title: '', body: '', customerId: '', source: 'manual', status: 'unprocessed', featureId: '' };

export default function InsightsPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [insights, setInsights] = useState([]);
  const [features, setFeatures] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    const params = filter === 'all' ? {} : { status: filter };
    Promise.all([
      api.getProductInsights(params),
      api.getProductFeatures(),
      api.getProductCustomers(),
    ]).then(([ins, feats, custs]) => {
      setInsights(ins);
      setFeatures(feats);
      setCustomers(custs);
    }).catch(() => {});
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, customerId: customers[0]?.id || '' });
    setShowForm(true);
  };

  const openEdit = (ins) => {
    setEditingId(ins.id);
    setForm({
      title: ins.title,
      body: ins.body,
      customerId: ins.customerId,
      source: ins.source,
      status: ins.status,
      featureId: ins.featureId || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const submitInsight = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const data = {
      title: form.title,
      body: form.body,
      customerId: form.customerId,
      source: form.source,
      status: form.status,
      featureId: form.featureId || null,
    };
    if (editingId) await api.updateProductInsight(editingId, data);
    else await api.createProductInsight(data);
    closeForm();
    load();
  };

  const remove = (ins) => {
    confirmDelete({
      label: ins.title,
      onConfirm: async () => {
        await api.deleteProductInsight(ins.id);
        load();
      },
    });
  };

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Insights"
        subtitle="Customer feedback and demand signals from integrations"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            Add insight
          </button>
        )}
      />

      <div className="ws-pm-filter-bar">
        {['all', 'unprocessed', 'processed'].map((f) => (
          <button key={f} type="button" className={`ws-pm-filter-pill${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {showForm && (
        <form className="card ws-pm-form-card" onSubmit={submitInsight}>
          <h3 className="ws-pm-form-title">{editingId ? 'Edit insight' : 'New insight'}</h3>
          <div className="ws-pm-form-grid">
            <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label>
              Customer
              <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>
              Source
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {PM_INSIGHT_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="unprocessed">unprocessed</option>
                <option value="processed">processed</option>
              </select>
            </label>
            <label className="full">
              Link to feature
              <select value={form.featureId} onChange={(e) => setForm({ ...form, featureId: e.target.value })}>
                <option value="">None</option>
                {features.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
            </label>
            <label className="full">
              Details
              <textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </label>
          </div>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={closeForm}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-pm-insight-list">
        {insights.map((ins) => (
          <div key={ins.id} className="card ws-pm-insight-card">
            <div className="ws-pm-insight-head">
              <div>
                <h3 className="ws-pm-insight-title">{ins.title}</h3>
                <p className="ws-pm-insight-meta">{ins.customerName} · {ins.source} · {ins.createdAt}</p>
              </div>
              <div className="ws-pm-insight-head-actions">
                <span className={`chip chip-xs ${statusChipClass(ins.status)}`}>{ins.status}</span>
                <PmRowActions onEdit={() => openEdit(ins)} onDelete={() => remove(ins)} />
              </div>
            </div>
            <p className="ws-pm-insight-body">{ins.body}</p>
            {ins.featureTitle && <div className="ws-pm-linked">Linked: {ins.featureTitle}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
