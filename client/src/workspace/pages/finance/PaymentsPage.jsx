import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import ConfirmModal from '../../../components/ConfirmModal';
import { AppIcon, Icons } from '../../../components/icons';
import { PAYMENT_STATUS_CHIPS } from '../../data/financeCatalog';
import FinanceActionsMenu from './FinanceActionsMenu';
import { formatDate, formatINR, signedINR } from './financeUtils';

const PAYMENT_TABS = [
  { id: 'outgoing', label: 'Payments Made' },
  { id: 'incoming', label: 'Payments Received' },
  { id: 'all', label: 'All Payments' },
];

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [typeFilter, setTypeFilter] = useState('outgoing');
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api.getFinancePayments().then(setPayments).catch(() => setPayments([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return payments;
    return payments.filter((p) => p.type === typeFilter);
  }, [payments, typeFilter]);

  const newPaymentPath = typeFilter === 'incoming'
    ? '/workspace/finance/payments/new?type=incoming'
    : '/workspace/finance/payments/new';

  const updateStatus = async (id, status) => {
    setActingId(id);
    try {
      await api.updateFinancePayment(id, { status });
      load();
    } catch { /* ignore */ } finally { setActingId(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteFinancePayment(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  const menuActions = (p) => {
    const actions = [
      { id: 'edit', label: 'Edit', icon: Icons.pencil, onClick: () => navigate(`/workspace/finance/payments/${p.id}/edit`) },
    ];
    if (p.status === 'pending') {
      actions.push({ id: 'complete', label: 'Mark Complete', icon: Icons.check, onClick: () => updateStatus(p.id, 'completed') });
    }
    if (p.status !== 'completed') {
      actions.push({ id: 'delete', label: 'Delete', icon: Icons.trash, danger: true, onClick: () => setDeleteTarget(p) });
    }
    return actions;
  };

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-budgets-page ws-hr-ops-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Payments</h1>
          <p className="ws-page-subtitle">Track payments made to vendors and received from customers</p>
        </div>
        <Link to={newPaymentPath} className="ws-hr-btn-primary sm">
          <AppIcon icon={Icons.plus} size={13} />
          {typeFilter === 'incoming' ? 'Record Receipt' : 'Record Payment'}
        </Link>
      </div>

      <div className="ws-fin-expense-filters mb16">
        <div className="ws-hr-ops-filters ws-fin-expense-cat-filters">
          {PAYMENT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`ws-hr-ops-filter${typeFilter === tab.id ? ' active' : ''}`}
              onClick={() => setTypeFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="chip chip-gray">{filtered.length} records</span>
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-body">
          {loading ? <p className="ws-page-subtitle">Loading…</p> : filtered.length === 0 ? (
            <div className="ws-fin-empty-state">
              <p className="ws-page-subtitle">No payments in this view.</p>
              <Link to={newPaymentPath} className="ws-hr-btn-primary sm">
                <AppIcon icon={Icons.plus} size={13} />
                Record Payment
              </Link>
            </div>
          ) : (
            <div className="ws-hr-table-wrap">
              <table className="ws-hr-table">
                <thead>
                  <tr>
                    <th className="ws-fin-col-text">Payment</th>
                    <th className="ws-fin-col-text">Payee</th>
                    <th className="ws-fin-col-status">Type</th>
                    <th className="ws-fin-col-num">Amount</th>
                    <th className="ws-fin-col-text">Method</th>
                    <th className="ws-fin-col-date">Date</th>
                    <th className="ws-fin-col-status">Status</th>
                    <th className="ws-fin-col-action" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="ws-fin-col-text"><span className="ws-fin-entry-no">{p.paymentNo}</span></td>
                      <td className="ws-fin-col-text">{p.payee}</td>
                      <td className="ws-fin-col-status"><span className={`chip ${p.type === 'incoming' ? 'chip-green' : 'chip-amber'}`}>{p.type}</span></td>
                      <td className={`ws-fin-col-num ${p.type === 'incoming' ? 'ws-fin-credit' : 'ws-fin-debit'}`}>
                        {signedINR(p.type === 'incoming' ? p.amount : -p.amount)}
                      </td>
                      <td className="ws-fin-col-text">{p.method}</td>
                      <td className="ws-fin-col-date">{formatDate(p.date)}</td>
                      <td className="ws-fin-col-status"><span className={`chip ${PAYMENT_STATUS_CHIPS[p.status] || 'chip-gray'}`}>{p.status}</span></td>
                      <td className="ws-fin-col-action">
                        <FinanceActionsMenu actions={menuActions(p)} disabled={actingId === p.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete payment?"
        message={deleteTarget ? `Delete payment ${deleteTarget.paymentNo}?` : ''}
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
