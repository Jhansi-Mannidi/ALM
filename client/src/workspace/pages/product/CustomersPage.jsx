import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';

const EMPTY = { name: '', segment: 'Mid-market', tier: 'Standard', contactEmail: '' };

export default function CustomersPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [customers, setCustomers] = useState([]);
  const [segments, setSegments] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    Promise.all([api.getProductCustomers(), api.getProductSegments()])
      .then(([c, s]) => { setCustomers(c); setSegments(s); })
      .catch(() => api.getProductCustomers().then(setCustomers));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, segment: c.segment, tier: c.tier, contactEmail: c.contactEmail || '' });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.updateProductCustomer(editingId, form);
    else await api.createProductCustomer(form);
    setShowForm(false);
    setEditingId(null);
    load();
  };

  const remove = (c) => {
    confirmDelete({
      label: c.name,
      onConfirm: async () => {
        await api.deleteProductCustomer(c.id);
        load();
      },
    });
  };

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Customers"
        subtitle="Accounts feeding insights and demand signals"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            Add customer
          </button>
        )}
      />

      {showForm && (
        <form className="card ws-pm-form-card" onSubmit={submit}>
          <h3 className="ws-pm-form-title">{editingId ? 'Edit customer' : 'New customer'}</h3>
          <div className="ws-pm-form-grid">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Segment
              <select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
                {segments.length > 0
                  ? segments.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)
                  : <option value={form.segment}>{form.segment || 'Mid-market'}</option>}
              </select>
            </label>
            <label>Tier<input value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} /></label>
            <label>Email<input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></label>
          </div>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-pm-table-wrap card">
        <table className="ws-pm-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Segment</th>
              <th>Tier</th>
              <th>Insights</th>
              <th>Contact</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="ws-pm-cell-title">{c.name}</td>
                <td>{c.segment}</td>
                <td><span className="chip chip-xs chip-blue">{c.tier}</span></td>
                <td>{c.notesCount}</td>
                <td className="ws-pm-cell-meta">{c.contactEmail}</td>
                <td><PmRowActions onEdit={() => openEdit(c)} onDelete={() => remove(c)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
