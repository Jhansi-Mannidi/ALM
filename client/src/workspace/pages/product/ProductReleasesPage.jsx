import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { statusChipClass } from '../../data/productCatalog';

const EMPTY = {
  productId: '', ver: 'v1.0.0', date: '', type: 'Minor', changes: '', environment: 'dev',
};

export default function ProductReleasesPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [releases, setReleases] = useState([]);
  const [products, setProducts] = useState([]);
  const [productFilter, setProductFilter] = useState('all');
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    const params = productFilter === 'all' ? {} : { productId: productFilter };
    api.getProductReleases(params).then(setReleases).catch(() => {});
  };

  useEffect(() => {
    api.getProductProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [productFilter]);

  const openCreate = () => {
    const pid = productFilter === 'all' ? products[0]?.id : productFilter;
    setEditing(null);
    setForm({ ...EMPTY, productId: pid || '' });
    setShowForm(true);
  };

  const openEdit = (rel) => {
    setEditing(rel);
    setForm({
      productId: rel.productId,
      ver: rel.ver,
      date: rel.date,
      type: rel.type,
      changes: rel.changes || '',
      environment: rel.environment || 'dev',
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.updateProductRelease(editing.projectId, editing.id, {
        ver: form.ver,
        date: form.date,
        type: form.type,
        changes: form.changes,
        environment: form.environment,
      });
    } else {
      await api.createProductRelease(form);
    }
    setShowForm(false);
    load();
  };

  const remove = (rel) => {
    confirmDelete({
      label: rel.ver,
      onConfirm: async () => {
        await api.deleteProductRelease(rel.projectId, rel.id);
        load();
      },
    });
  };

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Releases"
        subtitle="Shipped versions from linked ALM projects"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            Add release
          </button>
        )}
      />

      {showForm && (
        <form className="card ws-pm-form-card" onSubmit={submit}>
          <h3 className="ws-pm-form-title">{editing ? 'Edit release' : 'New release'}</h3>
          <div className="ws-pm-form-grid">
            <label>
              Product
              <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} disabled={Boolean(editing)}>
                {products.filter((p) => p.almProjectId).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label>Version<input value={form.ver} onChange={(e) => setForm({ ...form, ver: e.target.value })} required /></label>
            <label>Date<input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="Jun 12" /></label>
            <label>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Major</option>
                <option>Minor</option>
                <option>Patch</option>
              </select>
            </label>
            <label>
              Environment
              <select value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })}>
                <option>dev</option>
                <option>qa</option>
                <option>uat</option>
                <option>prod</option>
              </select>
            </label>
            <label className="full">Changes<textarea rows={2} value={form.changes} onChange={(e) => setForm({ ...form, changes: e.target.value })} /></label>
          </div>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">{editing ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-pm-filter-bar">
        <button type="button" className={`ws-pm-filter-pill${productFilter === 'all' ? ' active' : ''}`} onClick={() => setProductFilter('all')}>All</button>
        {products.map((p) => (
          <button key={p.id} type="button" className={`ws-pm-filter-pill${productFilter === p.id ? ' active' : ''}`} onClick={() => setProductFilter(p.id)}>{p.name}</button>
        ))}
      </div>

      <div className="ws-pm-release-list">
        {releases.map((rel) => (
          <div key={`${rel.projectId}-${rel.id}`} className="card ws-pm-release-card">
            <div className="ws-pm-release-head">
              <div>
                <h3 className="ws-pm-cell-title">{rel.ver}</h3>
                <p className="ws-pm-cell-meta">{rel.projectName} · {rel.date} · {rel.type}</p>
              </div>
              <div className="ws-pm-init-head-actions">
                <span className={`chip chip-xs ${statusChipClass(rel.environment === 'prod' ? 'released' : 'planned')}`}>{rel.environment}</span>
                <PmRowActions onEdit={() => openEdit(rel)} onDelete={() => remove(rel)} />
              </div>
            </div>
            {rel.changes && <p className="ws-pm-cell-meta">{rel.changes}</p>}
          </div>
        ))}
        {releases.length === 0 && <p className="ws-page-subtitle">No releases found for this product.</p>}
      </div>
    </div>
  );
}
