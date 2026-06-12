import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import ConfirmModal from '../../../components/ConfirmModal';
import { AppIcon, Icons } from '../../../components/icons';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_CHIPS,
  EXPENSE_STATUS_CHIPS,
} from '../../data/financeCatalog';
import FinanceActionsMenu from './FinanceActionsMenu';
import { formatDate, formatINR, getExpenseCategoryLabel } from './financeUtils';

function expenseTitle(exp) {
  return exp.title?.trim() || exp.description || 'Untitled expense';
}

export default function ExpensesPage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actingId, setActingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    const params = {};
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    Promise.all([
      api.getFinanceExpenses(params),
      api.getFinanceExpenseSummary(),
    ])
      .then(([list, sum]) => {
        setExpenses(list);
        setSummary(sum);
      })
      .catch(() => {
        setExpenses([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [categoryFilter, statusFilter]);

  const categoryLabel = (id) => getExpenseCategoryLabel(id, EXPENSE_CATEGORIES);

  const filteredTotal = useMemo(
    () => expenses.reduce((s, e) => s + (e.amount || 0), 0),
    [expenses],
  );

  const updateStatus = async (id, status) => {
    setActingId(id);
    try {
      await api.updateFinanceExpense(id, { status });
      load();
    } catch { /* ignore */ } finally { setActingId(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteFinanceExpense(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  const menuActions = (exp) => {
    const actions = [
      { id: 'edit', label: 'Edit', icon: Icons.pencil, onClick: () => navigate(`/workspace/finance/expenses/${exp.id}/edit`) },
    ];
    if (exp.status === 'pending') {
      actions.push(
        { id: 'approve', label: 'Approve', icon: Icons.check, onClick: () => updateStatus(exp.id, 'approved') },
        { id: 'reject', label: 'Reject', icon: Icons.x, onClick: () => updateStatus(exp.id, 'rejected') },
      );
    }
    actions.push({ id: 'delete', label: 'Delete', icon: Icons.trash, danger: true, onClick: () => setDeleteTarget(exp) });
    return actions;
  };

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-budgets-page ws-hr-ops-page ws-fin-expenses-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Expenses</h1>
          <p className="ws-page-subtitle">
            Track food, rent, maintenance, payroll, events, assets, and other expense scenarios
          </p>
        </div>
        <Link to="/workspace/finance/expenses/new" className="ws-hr-btn-primary sm">
          <AppIcon icon={Icons.plus} size={13} />
          Add Expense
        </Link>
      </div>

      {summary && (
        <div className="ws-fin-expense-summary">
          <div className="ws-fin-expense-summary-head">
            <div>
              <span className="ws-fin-expense-summary-label">Total recorded</span>
              <strong className="ws-fin-expense-summary-total">{formatINR(summary.grandTotal)}</strong>
            </div>
            {(categoryFilter !== 'all' || statusFilter !== 'all') && (
              <div className="ws-fin-expense-summary-filtered">
                <span className="ws-page-subtitle">Filtered view</span>
                <strong>{formatINR(filteredTotal)}</strong>
              </div>
            )}
          </div>
          <div className="ws-fin-expense-category-grid">
            {summary.breakdown.map((item) => (
              <button
                key={item.category}
                type="button"
                className={`ws-fin-expense-cat-card${categoryFilter === item.category ? ' active' : ''}`}
                onClick={() => setCategoryFilter((f) => (f === item.category ? 'all' : item.category))}
              >
                <span className={`chip ${EXPENSE_CATEGORY_CHIPS[item.category] || 'chip-gray'}`}>
                  {item.label}
                </span>
                <strong>{formatINR(item.amount)}</strong>
                <span className="ws-fin-expense-cat-meta">{item.count} claims · {item.pct}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card ws-fin-expense-filters">
        <div className="ws-fin-expense-filter-row">
          <div className="ws-fin-expense-filter-field">
            <label htmlFor="expense-category-filter">Category</label>
            <select
              id="expense-category-filter"
              className="ws-emp-select ws-fin-expense-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="ws-fin-expense-filter-field">
            <label htmlFor="expense-status-filter">Status</label>
            <select
              id="expense-status-filter"
              className="ws-emp-select ws-fin-expense-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          {(categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              className="btn btn-ghost btn-sm ws-fin-expense-filter-clear"
              onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); }}
            >
              Clear filters
            </button>
          )}
          <span className="chip chip-gray ws-fin-expense-filter-count">{expenses.length} records</span>
        </div>
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-body ws-hr-ops-list">
          {loading ? (
            <p className="ws-page-subtitle">Loading…</p>
          ) : expenses.length === 0 ? (
            <p className="ws-page-subtitle">No expenses match your filters.</p>
          ) : expenses.map((exp) => (
            <div key={exp.id} className="ws-hr-ops-row">
              <div className="ws-hr-ops-row-main">
                <div className="ws-hr-ops-row-head">
                  <span className="ws-hr-action-name">{expenseTitle(exp)}</span>
                  <span className={`chip ${EXPENSE_CATEGORY_CHIPS[exp.category] || 'chip-gray'}`}>
                    {categoryLabel(exp.category)}
                  </span>
                  <span className={`chip ${EXPENSE_STATUS_CHIPS[exp.status] || 'chip-gray'}`}>{exp.status}</span>
                  {(exp.bills?.length > 0) && (
                    <span className="chip chip-gray ws-fin-bill-chip">
                      <AppIcon icon={Icons.fileText} size={11} />
                      {exp.bills.length} bill{exp.bills.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="ws-hr-ops-meta">
                  {exp.description && exp.title && <span>{exp.description}</span>}
                  <span>{exp.vendor}</span>
                  <span>{formatDate(exp.date)}</span>
                  <span>By {exp.submittedBy}</span>
                </div>
              </div>
              <div className="ws-hr-ops-row-actions">
                <span className="ws-fin-amount-lg">{formatINR(exp.amount)}</span>
                <FinanceActionsMenu actions={menuActions(exp)} disabled={actingId === exp.id} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete expense?"
        message={deleteTarget ? `Remove "${expenseTitle(deleteTarget)}"?` : ''}
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
