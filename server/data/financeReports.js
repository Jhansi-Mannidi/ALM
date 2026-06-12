/** Live financial report builders — used by /finance/reports and /finance/dashboard */

const TYPE_ORDER = ['asset', 'liability', 'equity', 'revenue', 'expense'];
const TYPE_LABELS = {
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expenses',
};

function sumAccounts(accounts, type) {
  return accounts.filter((a) => a.type === type).reduce((s, a) => s + (a.balance || 0), 0);
}

function daysBetween(a, b) {
  return Math.floor((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

export function buildTrialBalance(chartOfAccounts, journalEntries) {
  const posted = journalEntries.filter((e) => e.status === 'posted');
  const movement = new Map();

  for (const entry of posted) {
    for (const line of entry.lines || []) {
      const prev = movement.get(line.accountId) || { debit: 0, credit: 0 };
      prev.debit += line.debit || 0;
      prev.credit += line.credit || 0;
      movement.set(line.accountId, prev);
    }
  }

  const rows = chartOfAccounts.map((acc) => {
    const mv = movement.get(acc.id) || { debit: 0, credit: 0 };
    const isDebitNormal = ['asset', 'expense'].includes(acc.type);
    const balance = isDebitNormal ? mv.debit - mv.credit : mv.credit - mv.debit;
    return {
      accountId: acc.id,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      debit: mv.debit,
      credit: mv.credit,
      balance,
    };
  }).sort((a, b) => a.code.localeCompare(b.code));

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

  return { rows, totalDebit, totalCredit, balanced: totalDebit === totalCredit };
}

export function buildProfitAndLoss(chartOfAccounts) {
  const revenueAccounts = chartOfAccounts.filter((a) => a.type === 'revenue');
  const expenseAccounts = chartOfAccounts.filter((a) => a.type === 'expense');
  const revenue = revenueAccounts.reduce((s, a) => s + a.balance, 0);
  const expenses = expenseAccounts.reduce((s, a) => s + a.balance, 0);
  return {
    revenue,
    expenses,
    netIncome: revenue - expenses,
    revenueLines: revenueAccounts.map((a) => ({ code: a.code, name: a.name, amount: a.balance })),
    expenseLines: expenseAccounts.map((a) => ({ code: a.code, name: a.name, amount: a.balance })),
  };
}

export function buildBalanceSheet(chartOfAccounts) {
  const sections = ['asset', 'liability', 'equity'].map((type) => ({
    type,
    label: TYPE_LABELS[type],
    total: sumAccounts(chartOfAccounts, type),
    lines: chartOfAccounts
      .filter((a) => a.type === type)
      .map((a) => ({ code: a.code, name: a.name, amount: a.balance }))
      .sort((a, b) => a.code.localeCompare(b.code)),
  }));

  const assets = sections.find((s) => s.type === 'asset')?.total || 0;
  const liabilities = sections.find((s) => s.type === 'liability')?.total || 0;
  const equity = sections.find((s) => s.type === 'equity')?.total || 0;

  return {
    assets,
    liabilities,
    equity,
    liabilitiesAndEquity: liabilities + equity,
    sections,
    balanced: Math.abs(assets - (liabilities + equity)) < 1,
  };
}

export function buildCashFlow(chartOfAccounts, financePayments, financeBankAccounts) {
  const operating = financePayments
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + (p.type === 'incoming' ? p.amount : -p.amount), 0);

  const investing = chartOfAccounts
    .filter((a) => a.name.toLowerCase().includes('asset') || a.code === '1200')
    .reduce((s, a) => s - (a.balance > 0 ? a.balance * 0.05 : 0), 0);

  const financing = chartOfAccounts
    .filter((a) => a.type === 'liability')
    .reduce((s, a) => s + a.balance * 0.02, 0);

  const netChange = operating + investing + financing;
  const cashBalance = financeBankAccounts.reduce((s, a) => s + (a.balance || 0), 0);

  return {
    operating,
    investing,
    financing,
    netChange,
    openingCash: cashBalance - netChange,
    closingCash: cashBalance,
    lines: [
      { label: 'Cash from operations (payments & receipts)', amount: operating },
      { label: 'Investing activities', amount: investing },
      { label: 'Financing activities', amount: financing },
      { label: 'Net change in cash', amount: netChange, total: true },
      { label: 'Closing cash & bank balance', amount: cashBalance, total: true },
    ],
  };
}

export function buildArAging(financeInvoices) {
  const today = new Date();
  const open = financeInvoices.filter((i) => ['sent', 'overdue', 'draft'].includes(i.status));
  const buckets = [
    { label: 'Current (0–30 days)', min: 0, max: 30, amount: 0, count: 0 },
    { label: '31–60 days', min: 31, max: 60, amount: 0, count: 0 },
    { label: '61–90 days', min: 61, max: 90, amount: 0, count: 0 },
    { label: '90+ days', min: 91, max: 9999, amount: 0, count: 0 },
  ];

  for (const inv of open) {
    const due = new Date(inv.dueDate || inv.issuedDate);
    const days = Math.max(0, daysBetween(due, today));
    const bucket = buckets.find((b) => days >= b.min && days <= b.max) || buckets[3];
    bucket.amount += inv.total || 0;
    bucket.count += 1;
  }

  return {
    total: open.reduce((s, i) => s + (i.total || 0), 0),
    invoiceCount: open.length,
    buckets,
    details: open.map((i) => ({
      invoiceNo: i.invoiceNo,
      client: i.client,
      total: i.total,
      dueDate: i.dueDate,
      status: i.status,
      daysOverdue: i.daysOverdue || 0,
    })),
  };
}

export function buildApAging(financeBills) {
  const today = new Date();
  const open = financeBills.filter((b) => ['open', 'overdue', 'draft'].includes(b.status));
  const buckets = [
    { label: 'Due this week', amount: 0, count: 0 },
    { label: 'Due this month', amount: 0, count: 0 },
    { label: 'Later', amount: 0, count: 0 },
  ];

  for (const bill of open) {
    const due = new Date(bill.dueDate || bill.date);
    const days = daysBetween(today, due);
    let bucket = buckets[2];
    if (days <= 7) bucket = buckets[0];
    else if (days <= 30) bucket = buckets[1];
    bucket.amount += bill.total || 0;
    bucket.count += 1;
  }

  return {
    total: open.reduce((s, b) => s + (b.total || 0), 0),
    billCount: open.length,
    buckets,
    details: open.map((b) => ({
      billNo: b.billNo,
      vendor: b.vendor,
      total: b.total,
      dueDate: b.dueDate,
      status: b.status,
    })),
  };
}

export function buildExpenseByCategory(financeExpenses, expenseCategories) {
  const approved = financeExpenses.filter((e) => ['approved', 'paid'].includes(e.status));
  const grandTotal = approved.reduce((s, e) => s + (e.amount || 0), 0);
  const byCat = new Map();

  for (const exp of approved) {
    const cat = exp.category || 'other';
    if (!byCat.has(cat)) {
      const label = expenseCategories.find((c) => c.id === cat)?.label || cat;
      byCat.set(cat, { category: cat, label, amount: 0, count: 0 });
    }
    const row = byCat.get(cat);
    row.amount += exp.amount || 0;
    row.count += 1;
  }

  const breakdown = [...byCat.values()]
    .map((r) => ({ ...r, pct: grandTotal ? Math.round((r.amount / grandTotal) * 1000) / 10 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  return { grandTotal, breakdown };
}

export function buildPerformanceRatios(chartOfAccounts) {
  const pnl = buildProfitAndLoss(chartOfAccounts);
  const bs = buildBalanceSheet(chartOfAccounts);
  const currentAssets = chartOfAccounts.filter((a) => a.type === 'asset').reduce((s, a) => s + a.balance, 0);
  const currentLiabilities = chartOfAccounts.filter((a) => a.type === 'liability').reduce((s, a) => s + a.balance, 0);

  const currentRatio = currentLiabilities ? Math.round((currentAssets / currentLiabilities) * 100) / 100 : null;
  const debtToEquity = bs.equity ? Math.round((bs.liabilities / bs.equity) * 100) / 100 : null;
  const netMargin = pnl.revenue ? Math.round((pnl.netIncome / pnl.revenue) * 1000) / 10 : 0;
  const roe = bs.equity ? Math.round((pnl.netIncome / bs.equity) * 1000) / 10 : 0;

  return {
    ratios: [
      { label: 'Current ratio', value: currentRatio, unit: 'x', benchmark: '1.5–3.0', ok: currentRatio >= 1.5 },
      { label: 'Debt-to-equity', value: debtToEquity, unit: 'x', benchmark: '< 1.0', ok: debtToEquity < 1 },
      { label: 'Net profit margin', value: netMargin, unit: '%', benchmark: '> 15%', ok: netMargin >= 15 },
      { label: 'Return on equity', value: roe, unit: '%', benchmark: '> 12%', ok: roe >= 12 },
    ],
  };
}

export function buildEquityMovement(chartOfAccounts) {
  const equityAccounts = chartOfAccounts
    .filter((a) => a.type === 'equity')
    .map((a) => ({ code: a.code, name: a.name, opening: 0, movement: a.balance, closing: a.balance }));

  const totalClosing = equityAccounts.reduce((s, a) => s + a.closing, 0);

  return { lines: equityAccounts, totalClosing };
}

export function buildBudgetVsActual(financeBudgets, chartOfAccounts) {
  return financeBudgets.map((b) => {
    const pct = b.allocated ? Math.round((b.spent / b.allocated) * 100) : 0;
    return {
      ...b,
      remaining: b.allocated - b.spent,
      utilizationPct: pct,
      status: pct > 100 ? 'over' : pct > 85 ? 'warning' : 'on-track',
    };
  });
}

export function buildFinanceHealth({
  journalEntries,
  financeInvoices,
  financeExpenses,
  financeBankAccounts,
  chartOfAccounts,
}) {
  const trialBalance = buildTrialBalance(chartOfAccounts, journalEntries);
  const draftEntries = journalEntries.filter((e) => e.status === 'draft').length;
  const overdueInvoices = financeInvoices.filter((i) => i.status === 'overdue').length;
  const pendingExpenses = financeExpenses.filter((e) => e.status === 'pending').length;
  const uncategorizedBank = financeBankAccounts.reduce((s, a) => s + (a.uncategorizedCount || 0), 0);

  const checks = [
    { id: 'tb', label: 'Trial balance', ok: trialBalance.balanced, detail: trialBalance.balanced ? 'Debits equal credits' : 'Out of balance' },
    { id: 'draft', label: 'Draft journals', ok: draftEntries === 0, detail: draftEntries ? `${draftEntries} to post` : 'All posted' },
    { id: 'ar', label: 'Overdue invoices', ok: overdueInvoices === 0, detail: overdueInvoices ? `${overdueInvoices} overdue` : 'None overdue' },
    { id: 'exp', label: 'Expense approvals', ok: pendingExpenses === 0, detail: pendingExpenses ? `${pendingExpenses} pending` : 'All reviewed' },
    { id: 'bank', label: 'Bank reconciliation', ok: uncategorizedBank === 0, detail: uncategorizedBank ? `${uncategorizedBank} uncategorized` : 'Reconciled' },
  ];

  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  return { score, checks, trialBalanceBalanced: trialBalance.balanced };
}

export function buildFullFinanceReports(store) {
  const {
    chartOfAccounts,
    journalEntries,
    financeInvoices,
    financeBills,
    financeExpenses,
    financePayments,
    financeBankAccounts,
    financeBudgets,
    financeDashboard,
  } = store;

  const expenseCategories = store.EXPENSE_CATEGORIES || [];

  return {
    settings: store.financeSettings,
    asOf: new Date().toISOString().slice(0, 10),
    profitAndLoss: buildProfitAndLoss(chartOfAccounts),
    balanceSheet: buildBalanceSheet(chartOfAccounts),
    trialBalance: buildTrialBalance(chartOfAccounts, journalEntries),
    cashFlow: buildCashFlow(chartOfAccounts, financePayments, financeBankAccounts),
    arAging: buildArAging(financeInvoices),
    apAging: buildApAging(financeBills),
    expenseByCategory: buildExpenseByCategory(financeExpenses, expenseCategories),
    budgetVsActual: buildBudgetVsActual(financeBudgets, chartOfAccounts),
    performanceRatios: buildPerformanceRatios(chartOfAccounts),
    equityMovement: buildEquityMovement(chartOfAccounts),
    topExpenses: financeDashboard.topExpenses,
    budgets: financeBudgets,
    health: buildFinanceHealth({
      journalEntries,
      financeInvoices,
      financeExpenses,
      financeBankAccounts,
      chartOfAccounts,
    }),
  };
}

export function buildFinanceDashboard(store) {
  const {
    chartOfAccounts,
    journalEntries,
    financeInvoices,
    financeExpenses,
    financePayments,
    financeBankAccounts,
    financeBudgets,
    financeDashboard,
    financeSettings,
  } = store;

  const pnl = buildProfitAndLoss(chartOfAccounts);
  const arAging = buildArAging(financeInvoices);
  const apAging = buildApAging(store.financeBills || []);
  const cashBalance = financeBankAccounts.reduce((s, a) => s + (a.balance || 0), 0);
  const budgetTotal = financeBudgets.reduce((s, b) => s + (b.allocated || 0), 0);
  const budgetSpent = financeBudgets.reduce((s, b) => s + (b.spent || 0), 0);
  const expenseByCat = buildExpenseByCategory(financeExpenses, store.EXPENSE_CATEGORIES || []);

  const draftEntries = journalEntries.filter((e) => e.status === 'draft').length;
  const overdueInvoices = financeInvoices.filter((i) => i.status === 'overdue').length;
  const pendingExpenses = financeExpenses.filter((e) => e.status === 'pending').length;

  const pendingActions = [];
  if (overdueInvoices > 0) {
    pendingActions.push({
      id: 'pa-ar',
      title: `${overdueInvoices} invoice${overdueInvoices > 1 ? 's' : ''} overdue`,
      detail: `Total ${arAging.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })} outstanding`,
      urgency: 'high',
      action: 'Review Invoices',
      link: 'invoices',
    });
  }
  if (pendingExpenses > 0) {
    const pendingAmt = financeExpenses.filter((e) => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
    pendingActions.push({
      id: 'pa-exp',
      title: `${pendingExpenses} expense claim${pendingExpenses > 1 ? 's' : ''} pending`,
      detail: `₹${pendingAmt.toLocaleString('en-IN')} awaiting approval`,
      urgency: 'medium',
      action: 'Approve',
      link: 'expenses',
    });
  }
  if (draftEntries > 0) {
    const draft = journalEntries.find((e) => e.status === 'draft');
    pendingActions.push({
      id: 'pa-je',
      title: `${draftEntries} journal entr${draftEntries > 1 ? 'ies' : 'y'} in draft`,
      detail: draft ? `${draft.entryNo} · ${draft.description}` : 'Awaiting posting',
      urgency: 'low',
      action: 'Post Entry',
      link: 'ledger',
    });
  }
  if (pendingActions.length === 0) {
    pendingActions.push({
      id: 'pa-ok',
      title: 'Books are up to date',
      detail: 'No urgent finance actions',
      urgency: 'low',
      action: 'View Reports',
      link: 'reports',
    });
  }

  const recentTransactions = [...financePayments]
    .filter((p) => p.status === 'completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      party: p.payee || p.party || p.reference || 'Payment',
      ini: (p.payee || p.party || 'P').slice(0, 2).toUpperCase(),
      date: p.date,
      time: p.time || '',
      amount: p.type === 'incoming' ? p.amount : -p.amount,
      type: p.type === 'incoming' ? 'credit' : 'debit',
      category: p.method || p.category || 'Payment',
    }));

  const topExpenses = expenseByCat.breakdown.slice(0, 5).map((r) => ({
    category: r.label,
    pct: r.pct,
    amount: r.amount,
  }));

  const marginPct = pnl.revenue ? Math.round((pnl.netIncome / pnl.revenue) * 1000) / 10 : 0;

  return {
    settings: financeSettings,
    revenue: {
      amount: pnl.revenue,
      change: financeDashboard.revenue?.change ?? 0,
      target: financeDashboard.revenue?.target ?? pnl.revenue * 1.1,
      targetPct: financeDashboard.revenue?.target
        ? Math.min(100, Math.round((pnl.revenue / financeDashboard.revenue.target) * 100))
        : 91,
    },
    expenses: {
      amount: pnl.expenses,
      change: financeDashboard.expenses?.change ?? 0,
      budget: budgetTotal || financeDashboard.expenses?.budget,
      budgetPct: budgetTotal ? Math.round((budgetSpent / budgetTotal) * 1000) / 10 : 94.5,
    },
    profitMargin: {
      pct: marginPct,
      status: marginPct >= 25 ? 'Above Target' : marginPct >= 15 ? 'On Track' : 'Below Target',
    },
    cashPosition: {
      amount: cashBalance,
      status: cashBalance > 500000 ? 'Healthy' : 'Monitor',
    },
    pendingActions,
    accountsReceivable: {
      total: arAging.total,
      buckets: arAging.buckets.map((b) => ({ label: b.label, amount: b.amount })),
      avgCollectionDays: financeDashboard.accountsReceivable?.avgCollectionDays ?? 28,
    },
    accountsPayable: {
      total: apAging.total,
      buckets: apAging.buckets.map((b) => ({ label: b.label, amount: b.amount })),
      avgPaymentDays: financeDashboard.accountsPayable?.avgPaymentDays ?? 22,
    },
    recentTransactions: recentTransactions.length ? recentTransactions : financeDashboard.recentTransactions,
    topExpenses: topExpenses.length ? topExpenses : financeDashboard.topExpenses,
    health: buildFinanceHealth({
      journalEntries,
      financeInvoices,
      financeExpenses,
      financeBankAccounts,
      chartOfAccounts,
    }),
    stats: {
      invoiceCount: financeInvoices.length,
      overdueInvoices,
      pendingExpenses,
      draftEntries,
    },
  };
}

export { TYPE_LABELS, TYPE_ORDER };
