import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import ConfirmModal from '../../../components/ConfirmModal';
import { AppIcon, Icons } from '../../../components/icons';
import FinanceActionsMenu from './FinanceActionsMenu';
import { moduleEditPath, moduleNewPath } from './financeFormPaths';
import { formatINR } from './financeUtils';

const TYPE_LABELS = { bank: 'Bank Accounts', cash: 'Cash & Cash Equivalents', credit_card: 'Credit Cards' };

export default function BankingPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteAccount, setDeleteAccount] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api.getFinanceBanking().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDeleteAccount = async () => {
    if (!deleteAccount) return;
    setDeleting(true);
    try {
      await api.deleteFinanceModule('bank-accounts', deleteAccount.id);
      setDeleteAccount(null);
      load();
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  const handleDeleteTx = async () => {
    if (!deleteTx) return;
    setDeleting(true);
    try {
      await api.deleteFinanceModule('bank-transactions', deleteTx.id);
      setDeleteTx(null);
      load();
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="ws-hr-page ws-fin-page ws-fin-budgets-page">
        <p className="ws-page-subtitle">Loading banking overview…</p>
      </div>
    );
  }

  const grouped = ['bank', 'cash', 'credit_card'].map((type) => ({
    type,
    label: TYPE_LABELS[type],
    accounts: data.accounts.filter((a) => a.type === type),
  })).filter((g) => g.accounts.length > 0);

  const txNewPath = (accountId) => moduleNewPath('bank-transactions', `?from=banking${accountId ? `&bankAccountId=${accountId}` : ''}`);

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-budgets-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Banking Overview</h1>
          <p className="ws-page-subtitle">Bank accounts, cash, credit cards, and reconciliation</p>
        </div>
        <div className="fx g8">
          <Link to={txNewPath()} className="btn btn-ghost btn-sm">Add Transaction</Link>
          <Link to={moduleNewPath('bank-accounts', '?from=banking')} className="ws-hr-btn-primary sm">
            <AppIcon icon={Icons.plus} size={13} />
            Add Bank or Credit Card
          </Link>
        </div>
      </div>

      <div className="ws-fin-ledger-stats mb16">
        <div className="ws-fin-ledger-stat">
          <span className="ws-fin-ledger-stat-label">Total Balance</span>
          <strong className="ws-fin-ledger-stat-value">{formatINR(data.totalBalance)}</strong>
        </div>
        <div className="ws-fin-ledger-stat">
          <span className="ws-fin-ledger-stat-label">Active Accounts</span>
          <strong className="ws-fin-ledger-stat-value">{data.accounts.length}</strong>
        </div>
        <div className="ws-fin-ledger-stat">
          <span className="ws-fin-ledger-stat-label">Uncategorized</span>
          <strong className="ws-fin-ledger-stat-value ws-fin-debit">{data.uncategorized} transactions</strong>
        </div>
      </div>

      <div className="card ws-hr-panel mb16">
        <div className="ws-hr-panel-head">
          <h2 className="ws-hr-panel-title">Active Accounts</h2>
          <Link to="/workspace/finance/m/bank-transactions" className="btn btn-ghost btn-sm">Manage All</Link>
        </div>
        <div className="ws-hr-panel-body ws-fin-ledger-table-wrap">
          <table className="ws-hr-table ws-fin-ledger-table">
            <thead>
              <tr>
                <th>Account Details</th>
                <th>Uncategorized</th>
                <th className="ws-fin-col-num">Amount in Bank</th>
                <th className="ws-fin-col-action" />
              </tr>
            </thead>
            <tbody>
              {grouped.map((group) => (
                <Fragment key={group.type}>
                  <tr className="ws-fin-bank-group-row">
                    <td colSpan={4}><strong>{group.label}</strong></td>
                  </tr>
                  {group.accounts.map((acc) => (
                    <tr key={acc.id}>
                      <td>
                        <div className="ws-fin-bank-account-name">{acc.name}</div>
                        {acc.accountNumber && <div className="ws-page-subtitle">{acc.accountNumber}</div>}
                      </td>
                      <td>
                        {acc.uncategorizedCount > 0 ? (
                          <span className="ws-fin-debit">{acc.uncategorizedCount} transactions</span>
                        ) : (
                          <span className="ws-page-subtitle">—</span>
                        )}
                      </td>
                      <td className={`ws-fin-col-num${acc.balance < 0 ? ' ws-fin-debit' : ''}`}>
                        {formatINR(acc.balance)}
                      </td>
                      <td className="ws-fin-col-action">
                        <FinanceActionsMenu
                          actions={[
                            { id: 'tx', label: 'Add Transaction', icon: Icons.plus, onClick: () => navigate(txNewPath(acc.id)) },
                            { id: 'edit', label: 'Edit Account', icon: Icons.pencil, onClick: () => navigate(`${moduleEditPath('bank-accounts', acc.id)}?from=banking`) },
                            { id: 'delete', label: 'Delete', icon: Icons.trash, danger: true, onClick: () => setDeleteAccount(acc) },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-head">
          <h2 className="ws-hr-panel-title">Recent Bank Transactions</h2>
          <Link to={txNewPath()} className="btn btn-ghost btn-sm">Add Transaction</Link>
        </div>
        <div className="ws-hr-panel-body ws-fin-ledger-table-wrap">
          <table className="ws-hr-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th className="ws-fin-col-num">Amount</th>
                <th>Status</th>
                <th className="ws-fin-col-action" />
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx) => {
                const acc = data.accounts.find((a) => a.id === tx.bankAccountId);
                return (
                  <tr key={tx.id}>
                    <td>{tx.date}</td>
                    <td>
                      <div>{tx.description}</div>
                      <div className="ws-page-subtitle">{acc?.name}</div>
                    </td>
                    <td>{tx.category || <span className="ws-fin-debit">Uncategorized</span>}</td>
                    <td className={`ws-fin-col-num ${tx.type === 'credit' ? 'ws-fin-credit' : 'ws-fin-debit'}`}>
                      {formatINR(tx.amount)}
                    </td>
                    <td>
                      <span className={`chip ${tx.reconciled ? 'chip-green' : 'chip-amber'}`}>
                        {tx.reconciled ? 'Reconciled' : 'Pending'}
                      </span>
                    </td>
                    <td className="ws-fin-col-action">
                      <FinanceActionsMenu
                        actions={[
                          { id: 'edit', label: 'Edit', icon: Icons.pencil, onClick: () => navigate(`${moduleEditPath('bank-transactions', tx.id)}?from=banking`) },
                          { id: 'reconcile', label: tx.reconciled ? 'Mark Pending' : 'Mark Reconciled', icon: Icons.check, onClick: async () => { await api.updateFinanceModule('bank-transactions', tx.id, { reconciled: !tx.reconciled }); load(); } },
                          { id: 'delete', label: 'Delete', icon: Icons.trash, danger: true, onClick: () => setDeleteTx(tx) },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteAccount}
        title="Delete bank account?"
        message={deleteAccount ? `Remove ${deleteAccount.name}?` : ''}
        busy={deleting}
        onConfirm={handleDeleteAccount}
        onClose={() => setDeleteAccount(null)}
      />

      <ConfirmModal
        open={!!deleteTx}
        title="Delete transaction?"
        message="This action cannot be undone."
        busy={deleting}
        onConfirm={handleDeleteTx}
        onClose={() => setDeleteTx(null)}
      />
    </div>
  );
}
