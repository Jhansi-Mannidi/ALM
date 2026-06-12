import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import ConfirmModal from '../../../components/ConfirmModal';
import { AppIcon, Icons } from '../../../components/icons';
import { EXPENSE_CATEGORIES } from '../../data/financeCatalog';
import { getModuleConfig } from '../../data/financeModuleConfig';
import FinanceActionsMenu from './FinanceActionsMenu';
import { moduleEditPath, moduleNewPath } from './financeFormPaths';
import { formatDate, formatINR, getExpenseCategoryLabel } from './financeUtils';

function cellValue(col, row, bankAccounts = []) {
  const val = row[col.key];
  if (val == null || val === '') return '—';
  if (col.type === 'currency') return formatINR(val);
  if (col.type === 'date') return formatDate(val);
  if (col.type === 'chip') {
    const chipKey = typeof val === 'boolean' ? String(val) : val;
    const chip = col.chips?.[chipKey] || 'chip-gray';
    if (col.key === 'category') {
      return <span className={`chip ${chip}`}>{getExpenseCategoryLabel(val, EXPENSE_CATEGORIES)}</span>;
    }
    if (col.key === 'reconciled') {
      return <span className={`chip ${chip}`}>{val ? 'Reconciled' : 'Pending'}</span>;
    }
    if (col.key === 'type' && val === 'credit_card') {
      return <span className={`chip ${chip}`}>Credit Card</span>;
    }
    return <span className={`chip ${chip}`}>{String(val).replace(/_/g, ' ')}</span>;
  }
  if (col.key === 'uncategorizedCount') {
    return val > 0 ? <span className="ws-fin-debit">{val} transactions</span> : '—';
  }
  if (col.key === 'bankAccountId') {
    const acc = bankAccounts.find((a) => a.id === val);
    return acc?.name || val || '—';
  }
  if (col.key === 'customerNo' || col.key === 'quoteNo' || col.key === 'orderNo' || col.key === 'billNo' || col.key === 'poNo' || col.key === 'paymentNo' || col.key === 'creditNo' || col.key === 'ewayNo' || col.key === 'challanNo' || col.key === 'sku') {
    return <span className="ws-fin-entry-no">{val}</span>;
  }
  return String(val);
}

function colClassName(col) {
  if (col.type === 'currency') return 'ws-fin-col-num';
  if (col.type === 'date') return 'ws-fin-col-date';
  if (col.type === 'chip') return 'ws-fin-col-status';
  return 'ws-fin-col-text';
}

export default function FinanceModulePage() {
  const { moduleKey } = useParams();
  const navigate = useNavigate();
  const config = getModuleConfig(moduleKey);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);

  const load = () => {
    if (!moduleKey) return;
    setLoading(true);
    api.getFinanceModule(moduleKey).then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [moduleKey]);

  useEffect(() => {
    if (moduleKey === 'bank-transactions') {
      api.getFinanceModule('bank-accounts').then(setBankAccounts).catch(() => setBankAccounts([]));
    }
  }, [moduleKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q)));
  }, [rows, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteFinanceModule(moduleKey, deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  if (!config) {
    return (
      <div className="ws-hr-page ws-fin-page">
        <p className="ws-page-subtitle">Unknown finance module.</p>
      </div>
    );
  }

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-budgets-page ws-hr-ops-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">{config.title}</h1>
          <p className="ws-page-subtitle">{config.subtitle}</p>
        </div>
        <Link to={moduleNewPath(moduleKey)} className="ws-hr-btn-primary sm">
          <AppIcon icon={Icons.plus} size={13} />
          {config.addLabel}
        </Link>
      </div>

      <div className="card ws-hr-panel ws-fin-module-panel">
        <div className="ws-fin-ledger-toolbar">
          <div className="ws-emp-search-wrap ws-fin-ledger-search">
            <AppIcon icon={Icons.search} size={15} className="ws-emp-search-icon" />
            <input
              type="search"
              className="ws-emp-search"
              placeholder={`Search ${config.title.toLowerCase()}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="chip chip-gray ws-fin-toolbar-meta">{filtered.length} records</span>
        </div>
        <div className="ws-hr-panel-body ws-fin-ledger-table-wrap">
          {loading ? (
            <p className="ws-page-subtitle">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="ws-fin-empty-state">
              <p className="ws-page-subtitle">No {config.title.toLowerCase()} yet.</p>
              <Link to={moduleNewPath(moduleKey)} className="ws-hr-btn-primary sm">
                <AppIcon icon={Icons.plus} size={13} />
                {config.addLabel}
              </Link>
            </div>
          ) : (
            <table className="ws-hr-table ws-fin-ledger-table">
              <thead>
                <tr>
                  {config.columns.map((col) => (
                    <th key={col.key} className={colClassName(col)}>{col.label}</th>
                  ))}
                  <th className="ws-fin-col-action" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    {config.columns.map((col) => (
                      <td key={col.key} className={colClassName(col)}>
                        {cellValue(col, row, bankAccounts)}
                      </td>
                    ))}
                    <td className="ws-fin-col-action">
                      <FinanceActionsMenu
                        actions={[
                          { id: 'edit', label: 'Edit', icon: Icons.pencil, onClick: () => navigate(moduleEditPath(moduleKey, row.id)) },
                          { id: 'delete', label: 'Delete', icon: Icons.trash, danger: true, onClick: () => setDeleteTarget(row) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete record?"
        message="This action cannot be undone."
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
