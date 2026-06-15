import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { statusChipClass } from '../../data/productCatalog';

const EMPTY = { name: '', type: 'custom' };

export default function IntegrationsPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [integrations, setIntegrations] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.getProductIntegrations().then(setIntegrations).catch(() => {});

  useEffect(() => { load(); }, []);

  const toggle = async (id, connected) => {
    const updated = await api.updateProductIntegration(id, { connected: !connected });
    setIntegrations((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (integ) => {
    setEditingId(integ.id);
    setForm({ name: integ.name, type: integ.type });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.updateProductIntegration(editingId, form);
    else await api.createProductIntegration(form);
    setShowForm(false);
    load();
  };

  const remove = (integ) => {
    confirmDelete({
      label: integ.name,
      onConfirm: async () => {
        await api.deleteProductIntegration(integ.id);
        load();
      },
    });
  };

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Integrations"
        subtitle="Connect support, CRM, and messaging tools to capture insights"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm" onClick={openCreate}>
            <AppIcon icon={Icons.plus} size={13} />
            Add integration
          </button>
        )}
      />

      {showForm && (
        <form className="card ws-pm-form-card" onSubmit={submit}>
          <h3 className="ws-pm-form-title">{editingId ? 'Edit integration' : 'New integration'}</h3>
          <div className="ws-pm-form-grid">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Type<input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></label>
          </div>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="ws-pm-integ-grid">
        {integrations.map((integ) => (
          <div key={integ.id} className="card ws-pm-integ-card">
            <div className="ws-pm-integ-head">
              <div className="ws-pm-integ-icon">{integ.name.charAt(0)}</div>
              <div className="ws-pm-integ-info">
                <div className="ws-pm-cell-title">{integ.name}</div>
                <div className="ws-pm-cell-meta">{integ.type}</div>
              </div>
              <PmRowActions onEdit={() => openEdit(integ)} onDelete={() => remove(integ)} />
            </div>
            <div className="ws-pm-integ-meta">
              <span className={`chip chip-xs ws-pm-integ-status ${statusChipClass(integ.connected ? 'processed' : 'discovery')}`}>
                {integ.connected ? 'Connected' : 'Available'}
              </span>
              {integ.lastSync ? (
                <div className="ws-pm-cell-meta">Last sync: {new Date(integ.lastSync).toLocaleString()}</div>
              ) : (
                <div className="ws-pm-integ-sync-placeholder" aria-hidden="true" />
              )}
            </div>
            <div className="ws-pm-integ-actions">
              <button
                type="button"
                className={`ws-hr-btn-primary sm ws-pm-integ-btn${integ.connected ? ' outline' : ''}`}
                onClick={() => toggle(integ.id, integ.connected)}
              >
                <AppIcon icon={integ.connected ? Icons.checkCircle : Icons.plus} size={13} />
                {integ.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
