import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { PM_DOC_TABS, statusChipClass } from '../../data/productCatalog';

const EMPTY = {
  productId: '', title: '', content: '', status: 'draft', featureId: '', sharedWith: '',
};

export default function ProductDocsPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [tab, setTab] = useState('all');
  const [docs, setDocs] = useState([]);
  const [products, setProducts] = useState([]);
  const [features, setFeatures] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    Promise.all([
      api.getProductDocs({ tab }),
      api.getProductProducts(),
      api.getProductFeatures(),
    ]).then(([d, p, f]) => { setDocs(d); setProducts(p); setFeatures(f); }).catch(() => {});
  };

  useEffect(() => { load(); }, [tab]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, productId: products[0]?.id || '' });
    setShowForm(true);
  };

  const openEdit = (doc) => {
    setEditingId(doc.id);
    setForm({
      productId: doc.productId,
      title: doc.title,
      content: doc.content,
      status: doc.status,
      featureId: doc.featureId || '',
      sharedWith: (doc.sharedWith || []).join(', '),
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      featureId: form.featureId || null,
      sharedWith: form.sharedWith ? form.sharedWith.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    if (editingId) await api.updateProductDoc(editingId, data);
    else await api.createProductDoc(data);
    setShowForm(false);
    load();
  };

  const remove = (doc) => {
    confirmDelete({
      label: doc.title,
      onConfirm: async () => { await api.deleteProductDoc(doc.id); load(); },
    });
  };

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Documents"
        subtitle="PRDs, briefs, specs, and meeting notes — link to features and share with teammates"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            New document
          </button>
        )}
      />

      <div className="ws-pm-data-tabs">
        {PM_DOC_TABS.map((t) => (
          <button key={t.id} type="button" className={`ws-pm-filter-pill${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {showForm && (
        <form className="card ws-pm-form-card" onSubmit={submit}>
          <h3 className="ws-pm-form-title">{editingId ? 'Edit document' : 'New document'}</h3>
          <div className="ws-pm-form-grid">
            <label>Product<select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
            <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">draft</option><option value="published">published</option></select></label>
            <label className="full">Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label>Linked feature<select value={form.featureId} onChange={(e) => setForm({ ...form, featureId: e.target.value })}><option value="">None</option>{features.filter((f) => f.productId === form.productId).map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}</select></label>
            <label>Share with (comma-separated)<input value={form.sharedWith} onChange={(e) => setForm({ ...form, sharedWith: e.target.value })} placeholder="team, executives" /></label>
            <label className="full"><textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Document content (HTML supported)" /></label>
          </div>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-pm-doc-list">
        {docs.length === 0 && (
          <p className="ws-pm-cell-meta ws-pm-doc-empty">No documents in this view yet.</p>
        )}
        {docs.map((doc) => (
          <div key={doc.id} className="card ws-pm-brief-card">
            <div className="ws-pm-brief-head">
              <div>
                <h3 className="ws-pm-cell-title">{doc.title}</h3>
                <p className="ws-pm-cell-meta">
                  {doc.productName} · {doc.createdBy} · {doc.updatedAt}
                  {doc.featureTitle && ` · Linked: ${doc.featureTitle}`}
                </p>
              </div>
              <div className="ws-pm-init-head-actions">
                <span className={`chip chip-xs ${statusChipClass(doc.status)}`}>{doc.status}</span>
                <PmRowActions onEdit={() => openEdit(doc)} onDelete={() => remove(doc)} />
              </div>
            </div>
            {doc.sharedWith?.length > 0 && (
              <div className="ws-pm-doc-shared">
                {doc.sharedWith.map((s) => <span key={s} className="chip chip-xs chip-blue">{s}</span>)}
              </div>
            )}
            <div className="ws-pm-brief-body" dangerouslySetInnerHTML={{ __html: doc.content }} />
          </div>
        ))}
      </div>
    </div>
  );
}
