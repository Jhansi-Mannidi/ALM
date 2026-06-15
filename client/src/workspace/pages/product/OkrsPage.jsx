import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { statusChipClass } from '../../data/productCatalog';

function KrBar({ kr, onChange }) {
  const pct = Math.min(100, Math.round((kr.current / Math.max(kr.target, 1)) * 100));
  return (
    <div className="ws-pm-kr">
      <div className="ws-pm-kr-head">
        <input className="ws-pm-kr-title-input" value={kr.title} onChange={(e) => onChange({ title: e.target.value })} />
        <span className="ws-pm-kr-val">
          <input type="number" className="ws-pm-num-input" value={kr.current} onChange={(e) => onChange({ current: Number(e.target.value) })} />
          {' / '}
          <input type="number" className="ws-pm-num-input" value={kr.target} onChange={(e) => onChange({ target: Number(e.target.value) })} />
          {' '}{kr.unit}
        </span>
      </div>
      <div className="ws-pm-kr-track"><div className="ws-pm-kr-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

const EMPTY = { productId: '', objective: '', quarter: 'Q3 2026', status: 'on-track', keyResults: [] };

export default function OkrsPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [okrs, setOkrs] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    Promise.all([api.getProductOkrs(), api.getProductProducts()])
      .then(([o, p]) => { setOkrs(o); setProducts(p); })
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY,
      productId: products[0]?.id || '',
      keyResults: [{ id: `kr-${Date.now()}`, title: 'New key result', target: 100, current: 0, unit: '%' }],
    });
    setShowForm(true);
  };

  const openEdit = (okr) => {
    setEditingId(okr.id);
    setForm({
      productId: okr.productId,
      objective: okr.objective,
      quarter: okr.quarter,
      status: okr.status,
      keyResults: okr.keyResults ? [...okr.keyResults] : [],
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.updateProductOkr(editingId, form);
    else await api.createProductOkr(form);
    setShowForm(false);
    load();
  };

  const remove = (okr) => {
    confirmDelete({
      label: okr.objective,
      onConfirm: async () => {
        await api.deleteProductOkr(okr.id);
        load();
      },
    });
  };

  const updateKr = (idx, patch) => {
    setForm((f) => ({
      ...f,
      keyResults: f.keyResults.map((kr, i) => (i === idx ? { ...kr, ...patch } : kr)),
    }));
  };

  const addKr = () => {
    setForm((f) => ({
      ...f,
      keyResults: [...f.keyResults, { id: `kr-${Date.now()}`, title: 'New key result', target: 100, current: 0, unit: '%' }],
    }));
  };

  const productName = (id) => products.find((p) => p.id === id)?.name || id;

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="OKRs"
        subtitle="Objectives and key results aligned to product outcomes"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            Add OKR
          </button>
        )}
      />

      {showForm && (
        <form className="card ws-pm-form-card" onSubmit={submit}>
          <h3 className="ws-pm-form-title">{editingId ? 'Edit OKR' : 'New OKR'}</h3>
          <div className="ws-pm-form-grid">
            <label>
              Product
              <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>Quarter<input value={form.quarter} onChange={(e) => setForm({ ...form, quarter: e.target.value })} /></label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="on-track">on-track</option>
                <option value="at-risk">at-risk</option>
                <option value="completed">completed</option>
              </select>
            </label>
            <label className="full">Objective<input value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} required /></label>
          </div>
          <div className="ws-pm-kr-list">
            {form.keyResults.map((kr, idx) => (
              <KrBar key={kr.id || idx} kr={kr} onChange={(patch) => updateKr(idx, patch)} />
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addKr}>+ Add key result</button>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-pm-okr-grid">
        {okrs.map((okr) => (
          <div key={okr.id} className="card ws-pm-okr-card">
            <div className="ws-pm-okr-head">
              <div>
                <div className="ws-pm-cell-meta">{productName(okr.productId)} · {okr.quarter}</div>
                <h3 className="ws-pm-cell-title">{okr.objective}</h3>
              </div>
              <div className="ws-pm-init-head-actions">
                <span className={`chip chip-xs ${statusChipClass(okr.status)}`}>{okr.status}</span>
                <PmRowActions onEdit={() => openEdit(okr)} onDelete={() => remove(okr)} />
              </div>
            </div>
            <div className="ws-pm-kr-list">
              {(okr.keyResults || []).map((kr) => {
                const pct = Math.min(100, Math.round((kr.current / Math.max(kr.target, 1)) * 100));
                return (
                  <div key={kr.id} className="ws-pm-kr">
                    <div className="ws-pm-kr-head">
                      <span>{kr.title}</span>
                      <span className="ws-pm-kr-val">{kr.current} / {kr.target} {kr.unit}</span>
                    </div>
                    <div className="ws-pm-kr-track"><div className="ws-pm-kr-fill" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
