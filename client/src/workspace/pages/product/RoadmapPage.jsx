import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { PM_LANES, PM_FEATURE_STATUSES, statusChipClass } from '../../data/productCatalog';

const EMPTY = {
  productId: '', featureId: '', title: '', lane: 'later',
  startDate: '', endDate: '', status: 'planned',
};

export default function RoadmapPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [features, setFeatures] = useState([]);
  const [productFilter, setProductFilter] = useState('all');
  const [view, setView] = useState('kanban');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadItems = () => {
    const params = productFilter === 'all' ? {} : { productId: productFilter };
    api.getProductRoadmap(params).then(setItems).catch(() => {});
  };

  useEffect(() => {
    api.getProductProducts().then(setProducts).catch(() => {});
    api.getProductFeatures().then(setFeatures).catch(() => {});
  }, []);

  useEffect(() => { loadItems(); }, [productFilter]);

  const openCreate = () => {
    const pid = productFilter === 'all' ? products[0]?.id : productFilter;
    setEditingId(null);
    setForm({ ...EMPTY, productId: pid || '' });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      productId: item.productId,
      featureId: item.featureId || '',
      title: item.title || item.featureTitle || '',
      lane: item.lane,
      startDate: item.startDate,
      endDate: item.endDate,
      status: item.status,
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = { ...form, featureId: form.featureId || null };
    if (editingId) await api.updateProductRoadmapItem(editingId, data);
    else await api.createProductRoadmapItem(data);
    setShowForm(false);
    loadItems();
  };

  const remove = (item) => {
    confirmDelete({
      label: item.featureTitle || item.title,
      onConfirm: async () => {
        await api.deleteProductRoadmapItem(item.id);
        loadItems();
      },
    });
  };

  const productFeatures = features.filter((f) => f.productId === form.productId);

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Roadmap"
        subtitle="Now / Next / Later timeline aligned to initiatives"
        actions={(
          <div className="ws-pm-head-actions">
            <button type="button" className="ws-hr-btn-primary sm" onClick={openCreate}>
              <AppIcon icon={Icons.plus} size={13} />
              Add item
            </button>
            <div className="ws-pm-view-toggle">
              <button type="button" className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>Kanban</button>
              <button type="button" className={view === 'timeline' ? 'active' : ''} onClick={() => setView('timeline')}>Timeline</button>
            </div>
          </div>
        )}
      />

      {showForm && (
        <form className="card ws-pm-form-card" onSubmit={submit}>
          <h3 className="ws-pm-form-title">{editingId ? 'Edit roadmap item' : 'New roadmap item'}</h3>
          <div className="ws-pm-form-grid">
            <label>
              Product
              <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value, featureId: '' })}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>
              Lane
              <select value={form.lane} onChange={(e) => setForm({ ...form, lane: e.target.value })}>
                {PM_LANES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </label>
            <label className="full">Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label>
              Link feature
              <select value={form.featureId} onChange={(e) => setForm({ ...form, featureId: e.target.value })}>
                <option value="">None</option>
                {productFeatures.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {PM_FEATURE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                <option value="done">done</option>
              </select>
            </label>
            <label>Start<input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label>
            <label>End<input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></label>
          </div>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-pm-filter-bar">
        <button type="button" className={`ws-pm-filter-pill${productFilter === 'all' ? ' active' : ''}`} onClick={() => setProductFilter('all')}>All</button>
        {products.map((p) => (
          <button key={p.id} type="button" className={`ws-pm-filter-pill${productFilter === p.id ? ' active' : ''}`} onClick={() => setProductFilter(p.id)}>{p.name}</button>
        ))}
      </div>

      {view === 'kanban' ? (
        <div className="ws-pm-roadmap-board">
          {PM_LANES.map((lane) => (
            <div key={lane.id} className="ws-pm-roadmap-col">
              <div className="ws-pm-roadmap-col-head" style={{ borderColor: lane.color }}>
                <span>{lane.label}</span>
                <span className="ws-pm-roadmap-count">{items.filter((i) => i.lane === lane.id).length}</span>
              </div>
              {items.filter((i) => i.lane === lane.id).map((item) => (
                <div key={item.id} className="card ws-pm-roadmap-card">
                  <div className="ws-pm-roadmap-card-top">
                    <div className="ws-pm-cell-title">{item.featureTitle || item.title}</div>
                    <PmRowActions onEdit={() => openEdit(item)} onDelete={() => remove(item)} />
                  </div>
                  <div className="ws-pm-cell-meta">{item.productName}</div>
                  <div className="ws-pm-roadmap-dates">{item.startDate} – {item.endDate}</div>
                  <span className={`chip chip-xs ws-pm-roadmap-status ${statusChipClass(item.status)}`}>{item.status}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="card ws-pm-timeline">
          {items.map((item) => (
            <div key={item.id} className="ws-pm-timeline-row">
              <div className="ws-pm-timeline-label">
                <div className="ws-pm-cell-title">{item.featureTitle || item.title}</div>
                <div className="ws-pm-cell-meta">{item.productName} · {item.lane}</div>
              </div>
              <div className="ws-pm-timeline-bar-wrap">
                <div className={`ws-pm-timeline-bar lane-${item.lane}`}>{item.startDate} – {item.endDate}</div>
              </div>
              <PmRowActions onEdit={() => openEdit(item)} onDelete={() => remove(item)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
