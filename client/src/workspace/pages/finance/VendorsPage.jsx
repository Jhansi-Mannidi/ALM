import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import ConfirmModal from '../../../components/ConfirmModal';
import { AppIcon, Icons } from '../../../components/icons';
import FinanceActionsMenu from './FinanceActionsMenu';
import { formatINR } from './financeUtils';

export default function VendorsPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api.getFinanceVendors({ type: filter }).then(setVendors).catch(() => setVendors([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteFinanceVendor(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-budgets-page ws-hr-ops-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Vendors & Clients</h1>
          <p className="ws-page-subtitle">Manage vendor and client relationships</p>
        </div>
        <Link to="/workspace/finance/vendors/new" className="ws-hr-btn-primary sm">
          <AppIcon icon={Icons.plus} size={13} />
          Add Contact
        </Link>
      </div>

      <div className="ws-hr-ops-filters">
        {['all', 'client', 'vendor'].map((f) => (
          <button key={f} type="button" className={`ws-hr-ops-filter${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'client' ? 'Clients' : 'Vendors'}
          </button>
        ))}
      </div>

      <div className="ws-fin-vendors-grid">
        {loading ? <p className="ws-page-subtitle">Loading…</p> : vendors.map((v) => (
          <article key={v.id} className="card ws-emp-card ws-fin-vendor-card">
            <div className="ws-emp-card-body">
              <div className="ws-fin-budget-card-top mb8">
                <div className="ws-hr-ops-row-head">
                  <span className="ws-hr-action-name">{v.name}</span>
                  <span className={`chip ${v.type === 'client' ? 'chip-blue' : 'chip-amber'}`}>{v.type}</span>
                </div>
                <FinanceActionsMenu
                  actions={[
                    { id: 'edit', label: 'Edit', icon: Icons.pencil, onClick: () => navigate(`/workspace/finance/vendors/${v.id}/edit`) },
                    { id: 'delete', label: 'Delete', icon: Icons.trash, danger: true, onClick: () => setDeleteTarget(v) },
                  ]}
                />
              </div>
              <div className="ws-emp-contact ws-fin-vendor-contact">
                {v.email && (
                  <div className="ws-emp-contact-row">
                    <AppIcon icon={Icons.mail} size={14} />
                    <span>{v.email}</span>
                  </div>
                )}
                {v.phone && (
                  <div className="ws-emp-contact-row">
                    <AppIcon icon={Icons.phone} size={14} />
                    <span>{v.phone}</span>
                  </div>
                )}
              </div>
              <div className="ws-fin-vendor-outstanding mt12">
                <span>Outstanding</span>
                <strong>{formatINR(v.outstanding)}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete contact?"
        message={deleteTarget ? `Remove "${deleteTarget.name}"?` : ''}
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
