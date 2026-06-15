import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import OfficePageHeader from './OfficePageHeader';
import OfficeRowActions from './OfficeRowActions';
import { useOfficeDeleteConfirm } from './OfficeDeleteConfirmContext';
import { officeStatusChip, formatCurrency } from '../../data/officeCatalog';

const EMPTY = {
  name: '', category: 'General', contact: '', email: '', phone: '',
  paymentDue: '', amountDue: 0, paymentStatus: 'paid', contractEnd: '',
};

export default function VendorsPage() {
  const confirmDelete = useOfficeDeleteConfirm();
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.getOfficeVendors().then(setVendors).catch(() => {});

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (v) => {
    setEditingId(v.id);
    setForm({
      name: v.name,
      category: v.category,
      contact: v.contact,
      email: v.email,
      phone: v.phone,
      paymentDue: v.paymentDue || '',
      amountDue: v.amountDue,
      paymentStatus: v.paymentStatus,
      contractEnd: v.contractEnd || '',
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = { ...form, paymentDue: form.paymentDue || null, contractEnd: form.contractEnd || null };
    if (editingId) await api.updateOfficeVendor(editingId, data);
    else await api.createOfficeVendor(data);
    setShowForm(false);
    load();
  };

  const remove = (v) => {
    confirmDelete({
      label: v.name,
      onConfirm: async () => {
        await api.deleteOfficeVendor(v.id);
        load();
      },
    });
  };

  const markPaid = async (v) => {
    await api.updateOfficeVendor(v.id, { paymentStatus: 'paid', amountDue: 0, paymentDue: null });
    load();
  };

  return (
    <div className="ws-hr-page ws-office-page">
      <OfficePageHeader
        title="Vendors"
        subtitle="Supplier contracts, contacts & payment tracking"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm ws-office-btn-primary" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            Add vendor
          </button>
        )}
      />

      {showForm && (
        <form className="card ws-office-form-card" onSubmit={submit}>
          <h3 className="ws-office-form-title">{editingId ? 'Edit vendor' : 'Add vendor'}</h3>
          <div className="ws-office-form-grid">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
            <label>Contact<input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Contract end<input type="date" value={form.contractEnd} onChange={(e) => setForm({ ...form, contractEnd: e.target.value })} /></label>
            <label>Payment due<input type="date" value={form.paymentDue} onChange={(e) => setForm({ ...form, paymentDue: e.target.value })} /></label>
            <label>Amount due<input type="number" min="0" value={form.amountDue} onChange={(e) => setForm({ ...form, amountDue: Number(e.target.value) })} /></label>
            <label>
              Payment status
              <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                <option value="paid">Paid</option>
                <option value="due">Due</option>
                <option value="overdue">Overdue</option>
              </select>
            </label>
          </div>
          <div className="ws-office-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm ws-office-btn-primary">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-office-vendor-grid">
        {vendors.map((v) => (
          <div key={v.id} className="card ws-office-vendor-card">
            <div className="ws-office-vendor-head">
              <div className="ws-office-vendor-icon">
                <AppIcon icon={Icons.truck} size={18} />
              </div>
              <div className="ws-office-vendor-title-wrap">
                <h3 className="ws-office-cell-title">{v.name}</h3>
                <p className="ws-office-cell-meta">{v.category}</p>
              </div>
              <OfficeRowActions onEdit={() => openEdit(v)} onDelete={() => remove(v)} />
            </div>
            <div className="ws-office-vendor-contact">
              <div><AppIcon icon={Icons.users} size={12} /> {v.contact}</div>
              <div><AppIcon icon={Icons.mail} size={12} /> {v.email}</div>
              <div><AppIcon icon={Icons.phone} size={12} /> {v.phone}</div>
            </div>
            <div className="ws-office-vendor-payment">
              <div className="ws-office-vendor-pay-row">
                <span className="ws-office-cell-meta">Payment</span>
                <span className={`chip chip-xs ${officeStatusChip(v.paymentStatus)}`}>{v.paymentStatus}</span>
              </div>
              {v.amountDue > 0 && (
                <div className="ws-office-vendor-amount">{formatCurrency(v.amountDue)}</div>
              )}
              {v.paymentDue && <div className="ws-office-cell-meta">Due {v.paymentDue}</div>}
              {v.contractEnd && <div className="ws-office-cell-meta">Contract ends {v.contractEnd}</div>}
            </div>
            <div className="ws-office-vendor-actions">
              {(v.paymentStatus === 'due' || v.paymentStatus === 'overdue') && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => markPaid(v)}>
                  <AppIcon icon={Icons.check} size={12} />
                  Mark paid
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
