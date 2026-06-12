import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import ConfirmModal from '../../../components/ConfirmModal';
import { AppIcon, Icons } from '../../../components/icons';
import { ACCOUNT_TYPES } from '../../data/financeCatalog';
import FinanceActionsMenu from './FinanceActionsMenu';
import FinancePageHeader from './FinancePageHeader';
import { accountingPeriodLabel, formatINR } from './financeUtils';

const TYPE_CHIPS = {
  asset: 'chip-blue',
  liability: 'chip-amber',
  equity: 'chip-purple',
  revenue: 'chip-green',
  expense: 'chip-red',
};

export default function ChartOfAccountsPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api.getFinanceAccounts().then(setAccounts).catch(() => setAccounts([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteFinanceAccount(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const grouped = ACCOUNT_TYPES.map((t) => ({
    ...t,
    accounts: accounts.filter((a) => a.type === t.id),
  }));

  const grandTotal = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-budgets-page">
      <FinancePageHeader
        title="Chart of Accounts"
        subtitle="Ledger accounts for double-entry bookkeeping · Assets, liabilities, equity, revenue, and expense"
        period={accountingPeriodLabel()}
        breadcrumbs={[
          { label: 'Finance', path: '/workspace/finance' },
          { label: 'Accountant', path: '/workspace/finance/ledger' },
          { label: 'Chart of Accounts' },
        ]}
        actions={(
          <Link to="/workspace/finance/accounts/new" className="ws-hr-btn-primary sm">
            <AppIcon icon={Icons.plus} size={13} />
            Add Account
          </Link>
        )}
      />

      {loading ? (
        <p className="ws-page-subtitle">Loading accounts…</p>
      ) : (
        grouped.map((group) => {
          const sectionTotal = group.accounts.reduce((s, a) => s + (a.balance || 0), 0);
          return (
          <div key={group.id} className="card ws-hr-panel mb16">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">{group.label}</h2>
              <div className="fx g8">
                <span className="ws-fin-coa-total">{formatINR(sectionTotal)}</span>
                <span className="chip chip-gray">{group.accounts.length} accounts</span>
              </div>
            </div>
            <div className="ws-hr-panel-body">
              {group.accounts.length === 0 ? (
                <p className="ws-page-subtitle">No accounts</p>
              ) : (
                <div className="ws-hr-table-wrap">
                  <table className="ws-hr-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Account Name</th>
                        <th>Type</th>
                        <th>Balance</th>
                        <th className="ws-fin-col-action" />
                      </tr>
                    </thead>
                    <tbody>
                      {group.accounts.map((acc) => (
                        <tr key={acc.id}>
                          <td><span className="ws-fin-account-code">{acc.code}</span></td>
                          <td>{acc.name}</td>
                          <td><span className={`chip ${TYPE_CHIPS[acc.type] || 'chip-gray'}`}>{acc.type}</span></td>
                          <td>{formatINR(acc.balance)}</td>
                          <td className="ws-fin-col-action">
                            <div className="fx g8" style={{ justifyContent: 'flex-end' }}>
                              <Link to={`/workspace/finance/ledger?tab=ledger&accountId=${acc.id}`} className="btn btn-ghost btn-sm">
                                Ledger
                              </Link>
                              <FinanceActionsMenu
                                actions={[
                                  { id: 'edit', label: 'Edit', icon: Icons.pencil, onClick: () => navigate(`/workspace/finance/accounts/${acc.id}/edit`) },
                                  {
                                    id: 'delete',
                                    label: 'Delete',
                                    icon: Icons.trash,
                                    danger: true,
                                    disabled: acc.balance !== 0,
                                    onClick: () => setDeleteTarget(acc),
                                  },
                                ]}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          );
        })
      )}

      {!loading && accounts.length > 0 && (
        <div className="ws-fin-coa-summary">
          <span>{accounts.length} accounts</span>
          <span>Combined balance (all types): <strong>{formatINR(grandTotal)}</strong></span>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete account?"
        message={deleteTarget ? `Delete account ${deleteTarget.code} — ${deleteTarget.name}?` : ''}
        detail="Only accounts with zero balance and no journal entries can be deleted."
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
