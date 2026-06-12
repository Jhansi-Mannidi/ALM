import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import ConfirmModal from '../../../components/ConfirmModal';
import { AppIcon, Icons } from '../../../components/icons';
import FinanceActionsMenu from './FinanceActionsMenu';
import { formatINR } from './financeUtils';

export default function BudgetsPage() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api.getFinanceBudgets().then(setBudgets).catch(() => setBudgets([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteFinanceBudget(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-budgets-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Budgets</h1>
          <p className="ws-page-subtitle">Track spending against allocated budgets</p>
        </div>
        <Link to="/workspace/finance/budgets/new" className="ws-hr-btn-primary sm">
          <AppIcon icon={Icons.plus} size={13} />
          Add Budget
        </Link>
      </div>

      <div className="ws-fin-budgets-grid">
        {loading ? <p className="ws-page-subtitle">Loading…</p> : budgets.map((b) => {
          const pct = b.allocated ? Math.round((b.spent / b.allocated) * 100) : 0;
          const over = pct > 100;
          return (
            <div key={b.id} className="ws-fin-stat-card ws-fin-budget-card">
              <div className="ws-fin-budget-card-top">
                <div className="ws-fin-stat-label">{b.category}</div>
                <FinanceActionsMenu
                  actions={[
                    { id: 'edit', label: 'Edit', icon: Icons.pencil, onClick: () => navigate(`/workspace/finance/budgets/${b.id}/edit`) },
                    { id: 'delete', label: 'Delete', icon: Icons.trash, danger: true, onClick: () => setDeleteTarget(b) },
                  ]}
                />
              </div>
              <div className="ws-fin-stat-value">{formatINR(b.spent)}</div>
              <div className="ws-fin-stat-foot">
                <span className="ws-fin-stat-meta">of {formatINR(b.allocated)}</span>
                <span className={`chip ${over ? 'chip-red' : pct > 90 ? 'chip-amber' : 'chip-green'}`}>{pct}%</span>
              </div>
              <div className="ws-fin-progress">
                <div className="ws-hr-progress-bar">
                  <div className={`ws-hr-progress-fill${over ? ' ws-fin-progress-over' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
              <p className="ws-fin-footnote">{b.period}</p>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete budget?"
        message={deleteTarget ? `Remove "${deleteTarget.category}" from budgets?` : ''}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
