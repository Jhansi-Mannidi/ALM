export function formatINR(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRCompact(amount) {
  if (amount == null) return '—';
  const n = Number(amount);
  if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return formatINR(n);
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function signedINR(amount) {
  const n = Number(amount);
  const prefix = n < 0 ? '−' : '+';
  return `${prefix}${formatINR(Math.abs(n))}`;
}

export function isDebitNormalAccount(type) {
  return ['asset', 'expense'].includes(type);
}

export function lineNetAmount(line, accountType) {
  return isDebitNormalAccount(accountType)
    ? (line.debit || 0) - (line.credit || 0)
    : (line.credit || 0) - (line.debit || 0);
}

export function buildLedgerWithBalance(lines, accountType, endingBalance) {
  const sorted = [...lines].sort((a, b) => {
    const dateDiff = new Date(a.date) - new Date(b.date);
    if (dateDiff !== 0) return dateDiff;
    return (a.entryNo || '').localeCompare(b.entryNo || '');
  });

  const netChange = sorted.reduce((sum, line) => sum + lineNetAmount(line, accountType), 0);
  const openingBalance = (endingBalance ?? 0) - netChange;
  let running = openingBalance;

  const withBalance = sorted.map((line) => {
    running += lineNetAmount(line, accountType);
    return { ...line, runningBalance: running };
  });

  return { openingBalance, lines: withBalance, closingBalance: endingBalance ?? running };
}

export function getExpenseCategoryLabel(categoryId, categories = []) {
  const found = categories.find((c) => c.id === categoryId);
  if (found) return found.label;
  const fallback = {
    food: 'Food & Meals',
    rent: 'Rent & Lease',
    maintenance: 'Maintenance & Repairs',
    salary: 'Employee Salary',
    events: 'Events & Conferences',
    assets: 'Assets & Equipment',
    software: 'Software & Subscriptions',
    travel: 'Travel & Transport',
    marketing: 'Marketing',
    utilities: 'Utilities',
    operations: 'Office & Operations',
    other: 'Other',
  };
  return fallback[categoryId] || categoryId || 'Other';
}

export function entryTotals(lines = []) {
  const debit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const credit = lines.reduce((s, l) => s + (l.credit || 0), 0);
  return { debit, credit };
}

export const ACCOUNT_TYPE_LABELS = {
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expenses',
};

export function fiscalYearLabel(fiscalYearStart = '04-01') {
  const [mm, dd] = fiscalYearStart.split('-').map(Number);
  const now = new Date();
  const year = now.getMonth() + 1 >= mm ? now.getFullYear() : now.getFullYear() - 1;
  return `FY ${year}–${String(year + 1).slice(-2)}`;
}

export function accountingPeriodLabel() {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}
