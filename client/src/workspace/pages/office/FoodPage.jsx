import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import OfficePageHeader from './OfficePageHeader';
import OfficeRowActions from './OfficeRowActions';
import { useOfficeDeleteConfirm } from './OfficeDeleteConfirmContext';
import { OFFICE_MEAL_TYPES, OFFICE_FOOD_STATUSES, officeStatusChip } from '../../data/officeCatalog';

const EMPTY = {
  vendorId: '', menuItem: '', quantity: 1, orderDate: '', mealType: 'lunch', status: 'scheduled', attendees: 0, notes: '',
};

export default function FoodPage() {
  const confirmDelete = useOfficeDeleteConfirm();
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    const params = statusFilter !== 'all' ? { status: statusFilter } : {};
    Promise.all([api.getOfficeFood(params), api.getOfficeVendors()])
      .then(([o, v]) => { setOrders(o); setVendors(v); })
      .catch(() => {});
  };

  useEffect(() => { load(); }, [statusFilter]);

  const foodVendors = vendors.filter((v) => v.category === 'Food & Beverage' || v.category === 'General');

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, vendorId: foodVendors[0]?.id || vendors[0]?.id || '', orderDate: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const openEdit = (order) => {
    setEditingId(order.id);
    setForm({
      vendorId: order.vendorId,
      menuItem: order.menuItem,
      quantity: order.quantity,
      orderDate: order.orderDate,
      mealType: order.mealType,
      status: order.status,
      attendees: order.attendees,
      notes: order.notes || '',
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.updateOfficeFood(editingId, form);
    else await api.createOfficeFood(form);
    setShowForm(false);
    load();
  };

  const remove = (order) => {
    confirmDelete({
      label: order.menuItem,
      onConfirm: async () => {
        await api.deleteOfficeFood(order.id);
        load();
      },
    });
  };

  return (
    <div className="ws-hr-page ws-office-page">
      <OfficePageHeader
        title="Food Orders"
        subtitle="Catering, pantry deliveries & meal scheduling"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm ws-office-btn-primary" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            Schedule order
          </button>
        )}
      />

      <div className="ws-office-toolbar">
        <div className="ws-office-filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {OFFICE_FOOD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <span className="ws-office-toolbar-meta">{orders.length} orders</span>
      </div>

      {showForm && (
        <form className="card ws-office-form-card" onSubmit={submit}>
          <h3 className="ws-office-form-title">{editingId ? 'Edit order' : 'Schedule food order'}</h3>
          <div className="ws-office-form-grid">
            <label className="span-2">Menu item<input value={form.menuItem} onChange={(e) => setForm({ ...form, menuItem: e.target.value })} required /></label>
            <label>
              Vendor
              <select value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}>
                {vendors.filter((v) => v.category === 'Food & Beverage' || v.category === 'General').map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </label>
            <label>
              Meal type
              <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}>
                {OFFICE_MEAL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label>Order date<input type="date" value={form.orderDate} onChange={(e) => setForm({ ...form, orderDate: e.target.value })} required /></label>
            <label>Quantity<input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></label>
            <label>Attendees<input type="number" min="0" value={form.attendees} onChange={(e) => setForm({ ...form, attendees: Number(e.target.value) })} /></label>
            {editingId && (
              <label>
                Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {OFFICE_FOOD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            )}
            <label className="span-2">Notes<textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          </div>
          <div className="ws-office-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm ws-office-btn-primary">{editingId ? 'Save' : 'Schedule'}</button>
          </div>
        </form>
      )}

      <div className="ws-office-food-grid">
        {orders.map((order) => (
          <div key={order.id} className="card ws-office-food-card">
            <div className="ws-office-food-head">
              <div className="ws-office-food-icon">
                <AppIcon icon={Icons.utensils} size={16} />
              </div>
              <div>
                <h3 className="ws-office-cell-title">{order.menuItem}</h3>
                <p className="ws-office-cell-meta">{order.vendorName}</p>
              </div>
              <OfficeRowActions onEdit={() => openEdit(order)} onDelete={() => remove(order)} />
            </div>
            <div className="ws-office-food-meta">
              <span className={`chip chip-xs ${officeStatusChip(order.mealType)}`}>{order.mealType}</span>
              <span className={`chip chip-xs ${officeStatusChip(order.status)}`}>{order.status}</span>
            </div>
            <div className="ws-office-food-details">
              <div><AppIcon icon={Icons.calendarDays} size={12} /> {order.orderDate}</div>
              <div><AppIcon icon={Icons.users} size={12} /> {order.attendees || order.quantity} servings</div>
            </div>
            {order.notes && <p className="ws-office-food-notes">{order.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
