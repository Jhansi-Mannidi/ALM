import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import OfficePageHeader from './OfficePageHeader';
import OfficeRowActions from './OfficeRowActions';
import { useOfficeDeleteConfirm } from './OfficeDeleteConfirmContext';
import { OFFICE_INVENTORY_CATEGORIES } from '../../data/officeCatalog';

const EMPTY = {
  name: '', sku: '', category: 'Stationery', quantity: 0, minStock: 10, unit: 'units', location: '',
};

export default function InventoryPage() {
  const confirmDelete = useOfficeDeleteConfirm();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowOnly, setLowOnly] = useState(searchParams.get('lowStock') === 'true');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    const params = {};
    if (lowOnly) params.lowStock = 'true';
    if (categoryFilter !== 'all') params.category = categoryFilter;
    api.getOfficeInventory(params).then(setItems).catch(() => {});
  };

  useEffect(() => { load(); }, [categoryFilter, lowOnly]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      minStock: item.minStock,
      unit: item.unit,
      location: item.location,
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.updateOfficeInventory(editingId, form);
    else await api.createOfficeInventory(form);
    setShowForm(false);
    load();
  };

  const remove = (item) => {
    confirmDelete({
      label: item.name,
      onConfirm: async () => {
        await api.deleteOfficeInventory(item.id);
        load();
      },
    });
  };

  const stockPct = (item) => Math.min(100, Math.round((item.quantity / Math.max(item.minStock, 1)) * 100));

  return (
    <div className="ws-hr-page ws-office-page">
      <OfficePageHeader
        title="Inventory"
        subtitle="Track office supplies, pantry stock & equipment"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm ws-office-btn-primary" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            Add item
          </button>
        )}
      />

      <div className="ws-office-toolbar">
        <div className="ws-office-filters">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All categories</option>
            {OFFICE_INVENTORY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="ws-office-check">
            <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
            Low stock only
          </label>
        </div>
        <span className="ws-office-toolbar-meta">{items.length} items</span>
      </div>

      {showForm && (
        <form className="card ws-office-form-card" onSubmit={submit}>
          <h3 className="ws-office-form-title">{editingId ? 'Edit item' : 'Add inventory item'}</h3>
          <div className="ws-office-form-grid">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
            <label>
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {OFFICE_INVENTORY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>Quantity<input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></label>
            <label>Min stock<input type="number" min="0" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} /></label>
            <label>Unit<input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></label>
            <label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
          </div>
          <div className="ws-office-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm ws-office-btn-primary">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-office-inventory-grid">
        {items.map((item) => (
          <div key={item.id} className={`card ws-office-inv-card${item.lowStock ? ' low-stock' : ''}`}>
            <div className="ws-office-inv-head">
              <div>
                <h3 className="ws-office-cell-title">{item.name}</h3>
                <p className="ws-office-cell-meta">{item.sku} · {item.category}</p>
              </div>
              <OfficeRowActions onEdit={() => openEdit(item)} onDelete={() => remove(item)} />
            </div>
            <div className="ws-office-inv-location">
              <AppIcon icon={Icons.mapPin} size={12} />
              {item.location}
            </div>
            <div className="ws-office-stock-bar-wrap">
              <div className="ws-office-stock-bar-labels">
                <span>{item.quantity} {item.unit}</span>
                <span>Min {item.minStock}</span>
              </div>
              <div className="ws-office-stock-bar">
                <div
                  className={`ws-office-stock-fill${item.lowStock ? ' low' : ''}`}
                  style={{ width: `${stockPct(item)}%` }}
                />
              </div>
            </div>
            {item.lowStock && <span className="ws-office-low-badge">Low stock</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
