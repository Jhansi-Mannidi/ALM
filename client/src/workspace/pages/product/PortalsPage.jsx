import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { statusChipClass } from '../../data/productCatalog';

const EMPTY = { name: '', productId: '', type: 'private' };

export default function PortalsPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [portals, setPortals] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState('');

  const load = () => {
    Promise.all([api.getProductPortals(), api.getProductProducts()])
      .then(([p, prods]) => { setPortals(p); setProducts(prods); })
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, productId: products[0]?.id || '' });
    setShowForm(true);
  };

  const openEdit = (portal) => {
    setEditingId(portal.id);
    setForm({ name: portal.name, productId: portal.productId, type: portal.type });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.updateProductPortal(editingId, form);
    else await api.createProductPortal(form);
    setShowForm(false);
    load();
  };

  const remove = (portal) => {
    confirmDelete({
      label: portal.name,
      onConfirm: async () => {
        await api.deleteProductPortal(portal.id);
        load();
      },
    });
  };

  const togglePublish = async (portal) => {
    await api.updateProductPortal(portal.id, { published: !portal.published });
    load();
  };

  const copyLink = (token) => {
    const url = `${window.location.origin}/workspace/product/share/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(token);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const productName = (id) => products.find((p) => p.id === id)?.name || id;

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Stakeholder Portals"
        subtitle="Share roadmaps and initiatives with customers and executives"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            New portal
          </button>
        )}
      />

      {showForm && (
        <form className="card ws-pm-form-card" onSubmit={submit}>
          <h3 className="ws-pm-form-title">{editingId ? 'Edit portal' : 'Create portal'}</h3>
          <div className="ws-pm-form-grid">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>
              Product
              <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </label>
          </div>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-pm-portal-grid">
        {portals.map((portal) => (
          <div key={portal.id} className="card ws-pm-portal-card">
            <div className="ws-pm-portal-head">
              <div>
                <h3 className="ws-pm-cell-title">{portal.name}</h3>
                <p className="ws-pm-cell-meta">{productName(portal.productId)} · {portal.type}</p>
              </div>
              <div className="ws-pm-init-head-actions">
                <span className={`chip chip-xs ${statusChipClass(portal.published ? 'published' : 'draft')}`}>
                  {portal.published ? 'Published' : 'Draft'}
                </span>
                <PmRowActions onEdit={() => openEdit(portal)} onDelete={() => remove(portal)} />
              </div>
            </div>
            <div className="ws-pm-portal-stats">{portal.views} views · Updated {portal.updatedAt}</div>
            <div className="ws-pm-portal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => togglePublish(portal)}>
                {portal.published ? 'Unpublish' : 'Publish'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => copyLink(portal.token)}>
                <AppIcon icon={Icons.copy} size={12} />
                {copied === portal.token ? 'Copied!' : 'Copy link'}
              </button>
              {portal.published && (
                <a href={`/workspace/product/share/${portal.token}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                  <AppIcon icon={Icons.externalLink} size={12} />
                  Preview
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
