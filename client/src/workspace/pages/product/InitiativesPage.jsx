import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { statusChipClass } from '../../data/productCatalog';

const EMPTY = {
  productId: '', name: '', description: '', status: 'planning',
  startDate: '', endDate: '', featureIds: [],
};

export default function InitiativesPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [initiatives, setInitiatives] = useState([]);
  const [features, setFeatures] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    Promise.all([
      api.getProductInitiatives(),
      api.getProductFeatures(),
      api.getProductProducts(),
    ]).then(([i, f, p]) => {
      setInitiatives(i);
      setFeatures(f);
      setProducts(p);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, productId: products[0]?.id || '' });
    setShowForm(true);
  };

  const openEdit = (init) => {
    setEditingId(init.id);
    setForm({
      productId: init.productId,
      name: init.name,
      description: init.description,
      status: init.status,
      startDate: init.startDate,
      endDate: init.endDate,
      featureIds: init.featureIds || [],
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.updateProductInitiative(editingId, form);
    else await api.createProductInitiative(form);
    setShowForm(false);
    load();
  };

  const remove = (init) => {
    confirmDelete({
      label: init.name,
      onConfirm: async () => {
        await api.deleteProductInitiative(init.id);
        load();
      },
    });
  };

  const toggleFeature = (fid) => {
    setForm((f) => ({
      ...f,
      featureIds: f.featureIds.includes(fid)
        ? f.featureIds.filter((id) => id !== fid)
        : [...f.featureIds, fid],
    }));
  };

  const productName = (id) => products.find((p) => p.id === id)?.name || id;
  const featureTitle = (id) => features.find((f) => f.id === id)?.title || id;
  const productFeatures = features.filter((f) => f.productId === form.productId);

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Initiatives"
        subtitle="Strategic themes grouping features across quarters"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            Add initiative
          </button>
        )}
      />

      {showForm && (
        <form className="card ws-pm-form-card" onSubmit={submit}>
          <h3 className="ws-pm-form-title">{editingId ? 'Edit initiative' : 'New initiative'}</h3>
          <div className="ws-pm-form-grid">
            <label>
              Product
              <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value, featureIds: [] })}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="planning">planning</option>
                <option value="active">active</option>
                <option value="completed">completed</option>
              </select>
            </label>
            <label className="full">Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label className="full">Description<textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>Start<input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label>
            <label>End<input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></label>
            <div className="full ws-pm-feature-picks">
              <span className="ws-pm-form-title">Features</span>
              <div className="ws-pm-init-features">
                {productFeatures.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`chip chip-xs${form.featureIds.includes(f.id) ? ' chip-blue' : ''}`}
                    onClick={() => toggleFeature(f.id)}
                  >
                    {f.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-pm-init-grid">
        {initiatives.map((init) => (
          <div key={init.id} className="card ws-pm-init-card">
            <div className="ws-pm-init-head">
              <div>
                <h3 className="ws-pm-cell-title">{init.name}</h3>
                <p className="ws-pm-cell-meta">{productName(init.productId)}</p>
              </div>
              <div className="ws-pm-init-head-actions">
                <span className={`chip chip-xs ${statusChipClass(init.status)}`}>{init.status}</span>
                <PmRowActions onEdit={() => openEdit(init)} onDelete={() => remove(init)} />
              </div>
            </div>
            <p className="ws-pm-init-desc">{init.description}</p>
            <div className="ws-pm-init-dates">{init.startDate} → {init.endDate}</div>
            <div className="ws-pm-init-features">
              {(init.featureIds || []).map((fid) => (
                <span key={fid} className="chip chip-xs chip-blue">{featureTitle(fid)}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
