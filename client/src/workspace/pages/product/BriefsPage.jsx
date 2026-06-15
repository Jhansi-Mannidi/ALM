import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { statusChipClass } from '../../data/productCatalog';

const EMPTY = { productId: '', title: '', content: '', status: 'draft' };

export default function BriefsPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [briefs, setBriefs] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    Promise.all([api.getProductBriefs(), api.getProductProducts()])
      .then(([b, p]) => { setBriefs(b); setProducts(p); })
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, productId: products[0]?.id || '' });
    setShowForm(true);
  };

  const openEdit = (brief) => {
    setEditingId(brief.id);
    setForm({
      productId: brief.productId,
      title: brief.title,
      content: brief.content,
      status: brief.status,
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.updateProductBrief(editingId, form);
    else await api.createProductBrief(form);
    setShowForm(false);
    load();
  };

  const remove = (brief) => {
    confirmDelete({
      label: brief.title,
      onConfirm: async () => {
        await api.deleteProductBrief(brief.id);
        load();
      },
    });
  };

  const productName = (id) => products.find((p) => p.id === id)?.name || id;

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Product Briefs"
        subtitle="Stakeholder-ready docs for strategy and scope"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            New brief
          </button>
        )}
      />

      {showForm && (
        <form className="card ws-pm-form-card" onSubmit={submit}>
          <h3 className="ws-pm-form-title">{editingId ? 'Edit brief' : 'Create brief'}</h3>
          <div className="ws-pm-form-grid">
            <label>
              Product
              <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </label>
            <label className="full">Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label className="full">
              Content
              <textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </label>
          </div>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-pm-brief-list">
        {briefs.map((brief) => (
          <div key={brief.id} className="card ws-pm-brief-card">
            <div className="ws-pm-brief-head">
              <div>
                <h3 className="ws-pm-cell-title">{brief.title}</h3>
                <p className="ws-pm-cell-meta">{productName(brief.productId)} · {brief.updatedAt}</p>
              </div>
              <div className="ws-pm-init-head-actions">
                <span className={`chip chip-xs ${statusChipClass(brief.status)}`}>{brief.status}</span>
                <PmRowActions onEdit={() => openEdit(brief)} onDelete={() => remove(brief)} />
              </div>
            </div>
            <div className="ws-pm-brief-body" dangerouslySetInnerHTML={{ __html: brief.content }} />
          </div>
        ))}
      </div>
    </div>
  );
}
