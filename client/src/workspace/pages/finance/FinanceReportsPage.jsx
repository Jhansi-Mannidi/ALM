import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import FinancePageHeader from './FinancePageHeader';
import { accountingPeriodLabel, formatINR, formatDate } from './financeUtils';

const REPORT_TABS = [
  { id: 'profit-loss', label: 'Profit & Loss' },
  { id: 'balance-sheet', label: 'Balance Sheet' },
  { id: 'trial-balance', label: 'Trial Balance' },
  { id: 'cash-flow', label: 'Cash Flow' },
  { id: 'ar-aging', label: 'AR Aging' },
  { id: 'ap-aging', label: 'AP Aging' },
  { id: 'expenses-by-category', label: 'Expenses' },
  { id: 'budget-vs-actual', label: 'Budget vs Actual' },
  { id: 'ratios', label: 'Ratios' },
  { id: 'equity', label: 'Equity' },
];

const FOCUS_TITLES = Object.fromEntries(REPORT_TABS.map((t) => [t.id, t.label]));

function ReportSection({ title, children, badge }) {
  return (
    <div className="card ws-hr-panel ws-fin-report-panel">
      <div className="ws-hr-panel-head">
        <h2 className="ws-hr-panel-title">{title}</h2>
        {badge}
      </div>
      <div className="ws-hr-panel-body">{children}</div>
    </div>
  );
}

function LineTable({ rows, columns }) {
  if (!rows?.length) return <p className="ws-page-subtitle">No data for this period.</p>;
  return (
    <div className="ws-hr-table-wrap">
      <table className="ws-hr-table ws-fin-report-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || row.code || i}>
              {columns.map((col) => (
                <td key={col.key} className={col.className}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfitLossReport({ data }) {
  if (!data) return null;
  return (
    <ReportSection title="Statement of Profit & Loss">
      <p className="ws-fin-report-intro">Revenue and expense accounts from the chart of accounts. Net income = Revenue − Expenses.</p>
      <h3 className="ws-fin-report-subhead">Revenue</h3>
      {data.revenueLines?.map((line) => (
        <div key={line.code} className="ws-fin-report-row">
          <span><span className="ws-fin-account-code">{line.code}</span> {line.name}</span>
          <span className="ws-fin-credit">{formatINR(line.amount)}</span>
        </div>
      ))}
      <div className="ws-fin-report-row ws-fin-report-subtotal">
        <span>Total Revenue</span>
        <strong className="ws-fin-credit">{formatINR(data.revenue)}</strong>
      </div>
      <h3 className="ws-fin-report-subhead mt16">Expenses</h3>
      {data.expenseLines?.map((line) => (
        <div key={line.code} className="ws-fin-report-row">
          <span><span className="ws-fin-account-code">{line.code}</span> {line.name}</span>
          <span className="ws-fin-debit">{formatINR(line.amount)}</span>
        </div>
      ))}
      <div className="ws-fin-report-row ws-fin-report-subtotal">
        <span>Total Expenses</span>
        <strong className="ws-fin-debit">{formatINR(data.expenses)}</strong>
      </div>
      <div className="ws-fin-report-row ws-fin-report-total">
        <span>Net Income</span>
        <strong className={data.netIncome >= 0 ? 'ws-fin-credit' : 'ws-fin-debit'}>{formatINR(data.netIncome)}</strong>
      </div>
    </ReportSection>
  );
}

function BalanceSheetReport({ data }) {
  if (!data) return null;
  return (
    <ReportSection
      title="Balance Sheet"
      badge={data.balanced ? (
        <span className="chip chip-green">Balanced</span>
      ) : (
        <span className="chip chip-amber">Review required</span>
      )}
    >
      <p className="ws-fin-report-intro">Assets = Liabilities + Equity. Amounts reflect current ledger balances.</p>
      {data.sections?.map((section) => (
        <div key={section.type} className="ws-fin-bs-section">
          <h3 className="ws-fin-report-subhead">{section.label}</h3>
          {section.lines.map((line) => (
            <div key={line.code} className="ws-fin-report-row">
              <span><span className="ws-fin-account-code">{line.code}</span> {line.name}</span>
              <span>{formatINR(line.amount)}</span>
            </div>
          ))}
          <div className="ws-fin-report-row ws-fin-report-subtotal">
            <span>Total {section.label}</span>
            <strong>{formatINR(section.total)}</strong>
          </div>
        </div>
      ))}
      <div className="ws-fin-report-row ws-fin-report-total mt16">
        <span>Assets</span>
        <strong>{formatINR(data.assets)}</strong>
      </div>
      <div className="ws-fin-report-row ws-fin-report-total">
        <span>Liabilities + Equity</span>
        <strong>{formatINR(data.liabilitiesAndEquity)}</strong>
      </div>
    </ReportSection>
  );
}

function TrialBalanceReport({ data }) {
  if (!data) return null;
  return (
    <ReportSection
      title="Trial Balance"
      badge={data.balanced ? (
        <span className="chip chip-green">Debits = Credits</span>
      ) : (
        <span className="chip chip-red">Out of balance</span>
      )}
    >
      <p className="ws-fin-report-intro">Posted journal entry totals by account. Debits must equal credits before period close.</p>
      <LineTable
        rows={data.rows}
        columns={[
          { key: 'code', label: 'Code', className: 'ws-fin-col-code', render: (r) => <span className="ws-fin-account-code">{r.code}</span> },
          { key: 'name', label: 'Account', className: 'ws-fin-col-text' },
          { key: 'type', label: 'Type', render: (r) => <span className="chip chip-gray">{r.type}</span> },
          { key: 'debit', label: 'Debit', className: 'ws-fin-col-num', render: (r) => formatINR(r.debit) },
          { key: 'credit', label: 'Credit', className: 'ws-fin-col-num', render: (r) => formatINR(r.credit) },
        ]}
      />
      <div className="ws-fin-report-totals-bar">
        <span>Total Debits: <strong>{formatINR(data.totalDebit)}</strong></span>
        <span>Total Credits: <strong>{formatINR(data.totalCredit)}</strong></span>
      </div>
    </ReportSection>
  );
}

function CashFlowReport({ data }) {
  if (!data) return null;
  return (
    <ReportSection title="Cash Flow Statement">
      <p className="ws-fin-report-intro">Summary of cash movement from operations, investing, and financing activities.</p>
      {data.lines?.map((line) => (
        <div key={line.label} className={`ws-fin-report-row${line.total ? ' ws-fin-report-total' : ''}`}>
          <span>{line.label}</span>
          <strong className={line.amount >= 0 ? 'ws-fin-credit' : 'ws-fin-debit'}>{formatINR(line.amount)}</strong>
        </div>
      ))}
    </ReportSection>
  );
}

function ArAgingReport({ data }) {
  if (!data) return null;
  return (
    <ReportSection title="Accounts Receivable Aging">
      <p className="ws-fin-report-intro">{data.invoiceCount} open invoice{data.invoiceCount !== 1 ? 's' : ''} · Total outstanding {formatINR(data.total)}</p>
      {data.buckets?.map((b) => (
        <div key={b.label} className="ws-fin-report-row">
          <span>{b.label} ({b.count})</span>
          <span>{formatINR(b.amount)}</span>
        </div>
      ))}
      {data.details?.length > 0 && (
        <>
          <h3 className="ws-fin-report-subhead mt16">Invoice detail</h3>
          <LineTable
            rows={data.details}
            columns={[
              { key: 'invoiceNo', label: 'Invoice #' },
              { key: 'client', label: 'Customer', className: 'ws-fin-col-text' },
              { key: 'dueDate', label: 'Due', className: 'ws-fin-col-date', render: (r) => formatDate(r.dueDate) },
              { key: 'status', label: 'Status', render: (r) => <span className={`chip chip-${r.status === 'overdue' ? 'red' : 'amber'}`}>{r.status}</span> },
              { key: 'total', label: 'Amount', className: 'ws-fin-col-num', render: (r) => formatINR(r.total) },
            ]}
          />
        </>
      )}
    </ReportSection>
  );
}

function ApAgingReport({ data }) {
  if (!data) return null;
  return (
    <ReportSection title="Accounts Payable Aging">
      <p className="ws-fin-report-intro">{data.billCount} open bill{data.billCount !== 1 ? 's' : ''} · Total payable {formatINR(data.total)}</p>
      {data.buckets?.map((b) => (
        <div key={b.label} className="ws-fin-report-row">
          <span>{b.label} ({b.count})</span>
          <span>{formatINR(b.amount)}</span>
        </div>
      ))}
      {data.details?.length > 0 && (
        <>
          <h3 className="ws-fin-report-subhead mt16">Bill detail</h3>
          <LineTable
            rows={data.details}
            columns={[
              { key: 'billNo', label: 'Bill #' },
              { key: 'vendor', label: 'Vendor', className: 'ws-fin-col-text' },
              { key: 'dueDate', label: 'Due', className: 'ws-fin-col-date', render: (r) => formatDate(r.dueDate) },
              { key: 'status', label: 'Status', render: (r) => <span className="chip chip-gray">{r.status}</span> },
              { key: 'total', label: 'Amount', className: 'ws-fin-col-num', render: (r) => formatINR(r.total) },
            ]}
          />
        </>
      )}
    </ReportSection>
  );
}

function ExpenseCategoryReport({ data }) {
  if (!data) return null;
  return (
    <ReportSection title="Expenses by Category">
      <p className="ws-fin-report-intro">Approved and paid expenses grouped by category · Total {formatINR(data.grandTotal)}</p>
      {data.breakdown?.map((row) => (
        <div key={row.category} className="ws-fin-exp-bar-row">
          <div className="ws-fin-exp-bar-head">
            <span>{row.label} ({row.count})</span>
            <span>{row.pct}% · {formatINR(row.amount)}</span>
          </div>
          <div className="ws-hr-progress-bar">
            <div className="ws-hr-progress-fill" style={{ width: `${Math.min(100, row.pct)}%` }} />
          </div>
        </div>
      ))}
    </ReportSection>
  );
}

function RatiosReport({ data }) {
  if (!data?.ratios) return null;
  return (
    <ReportSection title="Business Performance Ratios">
      <p className="ws-fin-report-intro">Key financial ratios derived from the balance sheet and profit & loss accounts.</p>
      <LineTable
        rows={data.ratios}
        columns={[
          { key: 'label', label: 'Ratio', className: 'ws-fin-col-text' },
          {
            key: 'value',
            label: 'Value',
            className: 'ws-fin-col-num',
            render: (r) => (r.value != null ? `${r.value}${r.unit}` : '—'),
          },
          { key: 'benchmark', label: 'Benchmark', render: (r) => r.benchmark },
          {
            key: 'ok',
            label: 'Status',
            render: (r) => <span className={`chip ${r.ok ? 'chip-green' : 'chip-amber'}`}>{r.ok ? 'Healthy' : 'Review'}</span>,
          },
        ]}
      />
    </ReportSection>
  );
}

function EquityReport({ data }) {
  if (!data) return null;
  return (
    <ReportSection title="Movement of Equity">
      <p className="ws-fin-report-intro">Equity account balances representing owner&apos;s funds and retained earnings.</p>
      {data.lines?.map((line) => (
        <div key={line.code} className="ws-fin-report-row">
          <span><span className="ws-fin-account-code">{line.code}</span> {line.name}</span>
          <span>{formatINR(line.closing)}</span>
        </div>
      ))}
      <div className="ws-fin-report-row ws-fin-report-total">
        <span>Total Equity</span>
        <strong>{formatINR(data.totalClosing)}</strong>
      </div>
    </ReportSection>
  );
}

function BudgetVsActualReport({ data }) {
  if (!data?.length) return <p className="ws-page-subtitle">No budgets configured.</p>;
  return (
    <ReportSection title="Budget vs Actual">
      <p className="ws-fin-report-intro">Department budget utilization against allocated amounts.</p>
      <LineTable
        rows={data}
        columns={[
          { key: 'department', label: 'Department', className: 'ws-fin-col-text' },
          { key: 'allocated', label: 'Budget', className: 'ws-fin-col-num', render: (r) => formatINR(r.allocated) },
          { key: 'spent', label: 'Spent', className: 'ws-fin-col-num', render: (r) => formatINR(r.spent) },
          { key: 'remaining', label: 'Remaining', className: 'ws-fin-col-num', render: (r) => formatINR(r.remaining) },
          {
            key: 'utilizationPct',
            label: 'Utilization',
            render: (r) => (
              <span className={`chip ${r.status === 'over' ? 'chip-red' : r.status === 'warning' ? 'chip-amber' : 'chip-green'}`}>
                {r.utilizationPct}%
              </span>
            ),
          },
        ]}
      />
    </ReportSection>
  );
}

const REPORT_VIEWS = {
  'profit-loss': (r) => <ProfitLossReport data={r.profitAndLoss} />,
  'balance-sheet': (r) => <BalanceSheetReport data={r.balanceSheet} />,
  'trial-balance': (r) => <TrialBalanceReport data={r.trialBalance} />,
  'cash-flow': (r) => <CashFlowReport data={r.cashFlow} />,
  'ar-aging': (r) => <ArAgingReport data={r.arAging} />,
  'ap-aging': (r) => <ApAgingReport data={r.apAging} />,
  'expenses-by-category': (r) => <ExpenseCategoryReport data={r.expenseByCategory} />,
  'budget-vs-actual': (r) => <BudgetVsActualReport data={r.budgetVsActual} />,
  ratios: (r) => <RatiosReport data={r.performanceRatios} />,
  equity: (r) => <EquityReport data={r.equityMovement} />,
};

export default function FinanceReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focus = searchParams.get('focus') || 'profit-loss';
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.getFinanceReports().then(setReport).catch(() => {});
  }, []);

  const setFocus = (id) => {
    setSearchParams({ focus: id });
  };

  if (!report) {
    return (
      <div className="ws-hr-page ws-fin-page ws-fin-reports-page">
        <p className="ws-page-subtitle">Loading financial statements…</p>
      </div>
    );
  }

  const title = FOCUS_TITLES[focus] || 'Financial Statements';
  const View = REPORT_VIEWS[focus] || REPORT_VIEWS['profit-loss'];

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-reports-page">
      <FinancePageHeader
        title={title}
        subtitle={`As of ${formatDate(report.asOf)} · ${report.settings?.companyName || 'Company'}`}
        period={accountingPeriodLabel()}
        breadcrumbs={[
          { label: 'Finance', path: '/workspace/finance' },
          { label: 'Reports', path: '/workspace/finance/reports' },
          { label: title },
        ]}
        actions={(
          <Link to="/workspace/finance/reports" className="btn btn-ghost">
            <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
            All Reports
          </Link>
        )}
      />

      <div className="ws-fin-report-tabs" role="tablist">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={focus === tab.id}
            className={`ws-fin-ledger-tab${focus === tab.id ? ' active' : ''}`}
            onClick={() => setFocus(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {View(report)}
    </div>
  );
}
