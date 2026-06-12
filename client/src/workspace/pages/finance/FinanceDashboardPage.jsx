import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import FinanceHealthBar from './FinanceHealthBar';
import FinancePageHeader from './FinancePageHeader';
import { accountingPeriodLabel, formatINR, formatINRCompact, signedINR } from './financeUtils';

const ACTION_LINKS = {
  invoices: '/workspace/finance/invoices',
  expenses: '/workspace/finance/expenses',
  ledger: '/workspace/finance/ledger',
  payments: '/workspace/finance/payments',
  reports: '/workspace/finance/reports',
};

const WORKFLOW_LINKS = [
  { label: 'Expense', path: '/workspace/finance/expenses/new', icon: Icons.clipboardCheck },
  { label: 'Invoice', path: '/workspace/finance/invoices/new', icon: Icons.fileText },
  { label: 'Journal', path: '/workspace/finance/ledger', icon: Icons.fileSpreadsheet },
  { label: 'Banking', path: '/workspace/finance/banking', icon: Icons.building },
  { label: 'Trial balance', path: '/workspace/finance/reports/statements?focus=trial-balance', icon: Icons.fileSpreadsheet },
  { label: 'Accounts', path: '/workspace/finance/accounts', icon: Icons.layers },
];

const KPI_CONFIG = [
  { key: 'revenue', label: 'Total Revenue', icon: Icons.trendingUp, accent: 'revenue' },
  { key: 'expenses', label: 'Total Expenses', icon: Icons.fileSpreadsheet, accent: 'expense' },
  { key: 'profitMargin', label: 'Net Profit Margin', icon: Icons.checkCircle, accent: 'margin' },
  { key: 'cashPosition', label: 'Cash & Bank', icon: Icons.building, accent: 'cash' },
];

export default function FinanceDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getFinanceDashboard().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="ws-hr-page ws-fin-page ws-fin-dash-page">
        <p className="ws-page-subtitle">Loading finance dashboard…</p>
      </div>
    );
  }

  const {
    revenue,
    expenses,
    profitMargin,
    cashPosition,
    pendingActions,
    accountsReceivable,
    accountsPayable,
    recentTransactions,
    topExpenses,
    health,
    settings,
  } = data;

  const kpiValues = { revenue, expenses, profitMargin, cashPosition };

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-dash-page">
      <FinancePageHeader
        title="Finance Dashboard"
        subtitle={`${settings?.companyName || 'Company'} · ${settings?.currency || 'INR'} · Double-entry accounting`}
        period={accountingPeriodLabel()}
        actions={(
          <Link to="/workspace/finance/reports" className="ws-hr-btn-primary sm">
            <AppIcon icon={Icons.fileSpreadsheet} size={13} />
            Reports
          </Link>
        )}
      />

      <FinanceHealthBar health={health} />

      <div className="ws-fin-stats ws-fin-kpi-grid">
        {KPI_CONFIG.map((kpi) => {
          const val = kpiValues[kpi.key];
          return (
            <div key={kpi.key} className={`ws-fin-kpi-card ws-fin-kpi-${kpi.accent}`}>
              <div className="ws-fin-kpi-top">
                <span className="ws-fin-kpi-label">{kpi.label}</span>
                <span className="ws-fin-kpi-icon">
                  <AppIcon icon={kpi.icon} size={15} />
                </span>
              </div>
              <div className="ws-fin-kpi-value">
                {kpi.key === 'profitMargin' ? `${val.pct}%` : formatINRCompact(val.amount)}
              </div>
              <div className="ws-fin-kpi-foot">
                {kpi.key === 'revenue' && (
                  <>
                    <span className="chip chip-green chip-xs">GL</span>
                    <span className="ws-fin-kpi-meta">Target {val.targetPct}%</span>
                  </>
                )}
                {kpi.key === 'expenses' && (
                  <>
                    <span className="chip chip-amber chip-xs">GL</span>
                    <span className="ws-fin-kpi-meta">Budget {val.budgetPct}%</span>
                  </>
                )}
                {kpi.key === 'profitMargin' && (
                  <span className={`chip chip-xs ${val.pct >= 20 ? 'chip-green' : 'chip-amber'}`}>{val.status}</span>
                )}
                {kpi.key === 'cashPosition' && (
                  <span className="chip chip-blue chip-xs">{val.status}</span>
                )}
              </div>
              {(kpi.key === 'revenue' || kpi.key === 'expenses') && (
                <div className="ws-fin-kpi-bar">
                  <div
                    className={`ws-fin-kpi-bar-fill${kpi.key === 'expenses' ? ' warn' : ''}`}
                    style={{ width: `${kpi.key === 'revenue' ? val.targetPct : val.budgetPct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="ws-fin-quick-bar">
        <span className="ws-fin-quick-label">Quick actions</span>
        <div className="ws-fin-quick-links">
          {WORKFLOW_LINKS.map((item) => (
            <Link key={item.path} to={item.path} className="ws-fin-quick-link">
              <AppIcon icon={item.icon} size={13} />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="ws-fin-dash-grid">
        <div className="card ws-hr-panel ws-fin-panel-wide">
          <div className="ws-hr-panel-head ws-fin-panel-head-compact">
            <h2 className="ws-hr-panel-title">Pending actions</h2>
            <span className="ws-fin-panel-count">{pendingActions.length}</span>
          </div>
          <div className="ws-hr-panel-body ws-fin-action-list">
            {pendingActions.map((action) => (
              <div key={action.id} className="ws-fin-action-row">
                <div className={`ws-fin-action-dot ${action.urgency}`} />
                <div className="ws-fin-action-body">
                  <div className="ws-fin-action-title">{action.title}</div>
                  <div className="ws-fin-action-detail">{action.detail}</div>
                </div>
                <Link
                  to={ACTION_LINKS[action.link] || '/workspace/finance'}
                  className="ws-fin-action-btn"
                >
                  {action.action}
                  <AppIcon icon={Icons.chevronRight} size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="ws-fin-side-stack">
          <div className="card ws-hr-panel ws-fin-summary-card">
            <div className="ws-hr-panel-head ws-fin-panel-head-compact">
              <h2 className="ws-hr-panel-title">Accounts Receivable</h2>
              <Link to="/workspace/finance/reports/statements?focus=ar-aging" className="ws-fin-panel-link">Aging</Link>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-fin-ar-total">{formatINR(accountsReceivable.total)}</div>
              {accountsReceivable.buckets.map((b) => (
                <div key={b.label} className="ws-fin-bucket-row">
                  <span>{b.label}</span>
                  <span className="ws-fin-bucket-amt">{formatINR(b.amount)}</span>
                </div>
              ))}
              <p className="ws-fin-footnote">Avg collection: {accountsReceivable.avgCollectionDays} days</p>
            </div>
          </div>

          <div className="card ws-hr-panel ws-fin-summary-card">
            <div className="ws-hr-panel-head ws-fin-panel-head-compact">
              <h2 className="ws-hr-panel-title">Accounts Payable</h2>
              <Link to="/workspace/finance/reports/statements?focus=ap-aging" className="ws-fin-panel-link">Aging</Link>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-fin-ar-total">{formatINR(accountsPayable.total)}</div>
              {accountsPayable.buckets.map((b) => (
                <div key={b.label} className="ws-fin-bucket-row">
                  <span>{b.label}</span>
                  <span className="ws-fin-bucket-amt">{formatINR(b.amount)}</span>
                </div>
              ))}
              <p className="ws-fin-footnote">Avg payment: {accountsPayable.avgPaymentDays} days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="ws-hr-grid-2 ws-fin-dash-bottom">
        <div className="card ws-hr-panel">
          <div className="ws-hr-panel-head ws-fin-panel-head-compact">
            <h2 className="ws-hr-panel-title">Recent transactions</h2>
            <Link to="/workspace/finance/payments" className="ws-fin-panel-link">View all</Link>
          </div>
          <div className="ws-hr-panel-body ws-fin-tx-list">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="ws-fin-tx-row">
                <div className="ws-hr-avatar sm ws-fin-tx-avatar">{tx.ini}</div>
                <div className="ws-fin-tx-body">
                  <div className="ws-fin-tx-party">{tx.party}</div>
                  <div className="ws-fin-tx-meta">{tx.date}{tx.time ? ` · ${tx.time}` : ''}</div>
                </div>
                <div className="ws-fin-tx-amount">
                  <span className={tx.type === 'credit' ? 'ws-fin-credit' : 'ws-fin-debit'}>
                    {signedINR(tx.amount)}
                  </span>
                  <span className="ws-fin-tx-cat">{tx.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card ws-hr-panel">
          <div className="ws-hr-panel-head ws-fin-panel-head-compact">
            <h2 className="ws-hr-panel-title">Top expenses</h2>
            <Link to="/workspace/finance/reports/statements?focus=expenses-by-category" className="ws-fin-panel-link">Report</Link>
          </div>
          <div className="ws-hr-panel-body ws-fin-top-exp">
            {topExpenses.map((item) => (
              <div key={item.category} className="ws-fin-exp-bar-row">
                <div className="ws-fin-exp-bar-head">
                  <span>{item.category}</span>
                  <span>{item.pct}%</span>
                </div>
                <div className="ws-hr-progress-bar ws-fin-exp-bar">
                  <div className="ws-hr-progress-fill" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
