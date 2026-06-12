export const FINANCE_SETTINGS = {
  currency: 'INR',
  fiscalYearStart: '04-01',
  companyName: 'VoltusWave Technologies',
  taxRate: 18,
};

export const CHART_OF_ACCOUNTS = [
  { id: 'acc-1000', code: '1000', name: 'Cash & Bank', type: 'asset', balance: 1875000, parentId: '' },
  { id: 'acc-1100', code: '1100', name: 'Accounts Receivable', type: 'asset', balance: 845000, parentId: '' },
  { id: 'acc-1200', code: '1200', name: 'Prepaid Expenses', type: 'asset', balance: 125000, parentId: '' },
  { id: 'acc-2000', code: '2000', name: 'Accounts Payable', type: 'liability', balance: 520000, parentId: '' },
  { id: 'acc-2100', code: '2100', name: 'Accrued Expenses', type: 'liability', balance: 180000, parentId: '' },
  { id: 'acc-3000', code: '3000', name: 'Retained Earnings', type: 'equity', balance: 2450000, parentId: '' },
  { id: 'acc-4000', code: '4000', name: 'Service Revenue', type: 'revenue', balance: 4550000, parentId: '' },
  { id: 'acc-4100', code: '4100', name: 'Consulting Revenue', type: 'revenue', balance: 890000, parentId: '' },
  { id: 'acc-5000', code: '5000', name: 'Salaries & Wages', type: 'expense', balance: 1850000, parentId: '' },
  { id: 'acc-5100', code: '5100', name: 'Rent & Utilities', type: 'expense', balance: 420000, parentId: '' },
  { id: 'acc-5200', code: '5200', name: 'Software & Subscriptions', type: 'expense', balance: 285000, parentId: '' },
  { id: 'acc-5300', code: '5300', name: 'Marketing', type: 'expense', balance: 195000, parentId: '' },
  { id: 'acc-5400', code: '5400', name: 'Travel & Entertainment', type: 'expense', balance: 142000, parentId: '' },
];

export const JOURNAL_ENTRIES = [
  {
    id: 'je-1001',
    entryNo: 'JE-1001',
    date: '2025-06-01',
    description: 'Monthly payroll accrual',
    reference: 'PAY-JUN-2025',
    status: 'posted',
    createdBy: 'Finance Team',
    lines: [
      { accountId: 'acc-5000', accountCode: '5000', accountName: 'Salaries & Wages', debit: 1850000, credit: 0 },
      { accountId: 'acc-2000', accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: 1850000 },
    ],
  },
  {
    id: 'je-1002',
    entryNo: 'JE-1002',
    date: '2025-06-03',
    description: 'Client invoice payment received — TechCorp',
    reference: 'INV-2025-042',
    status: 'posted',
    createdBy: 'Finance Team',
    lines: [
      { accountId: 'acc-1000', accountCode: '1000', accountName: 'Cash & Bank', debit: 450000, credit: 0 },
      { accountId: 'acc-1100', accountCode: '1100', accountName: 'Accounts Receivable', debit: 0, credit: 450000 },
    ],
  },
  {
    id: 'je-1003',
    entryNo: 'JE-1003',
    date: '2025-06-05',
    description: 'Office rent payment',
    reference: 'RENT-JUN',
    status: 'posted',
    createdBy: 'Finance Team',
    lines: [
      { accountId: 'acc-5100', accountCode: '5100', accountName: 'Rent & Utilities', debit: 120000, credit: 0 },
      { accountId: 'acc-1000', accountCode: '1000', accountName: 'Cash & Bank', debit: 0, credit: 120000 },
    ],
  },
  {
    id: 'je-1004',
    entryNo: 'JE-1004',
    date: '2025-06-08',
    description: 'SaaS subscription renewal',
    reference: 'SUB-2025-Q2',
    status: 'draft',
    createdBy: 'Finance Team',
    lines: [
      { accountId: 'acc-5200', accountCode: '5200', accountName: 'Software & Subscriptions', debit: 85000, credit: 0 },
      { accountId: 'acc-1000', accountCode: '1000', accountName: 'Cash & Bank', debit: 0, credit: 85000 },
    ],
  },
];

export const FINANCE_INVOICES = [
  { id: 'inv-1', invoiceNo: 'INV-2025-048', client: 'TechCorp Solutions', clientId: 'ven-1', amount: 450000, tax: 81000, total: 531000, status: 'overdue', dueDate: '2025-05-28', issuedDate: '2025-05-01', daysOverdue: 12 },
  { id: 'inv-2', invoiceNo: 'INV-2025-049', client: 'Global Retail Ltd', clientId: 'ven-2', amount: 320000, tax: 57600, total: 377600, status: 'sent', dueDate: '2025-06-20', issuedDate: '2025-06-01', daysOverdue: 0 },
  { id: 'inv-3', invoiceNo: 'INV-2025-050', client: 'StartupHub Inc', clientId: 'ven-3', amount: 185000, tax: 33300, total: 218300, status: 'paid', dueDate: '2025-06-10', issuedDate: '2025-05-25', daysOverdue: 0 },
  { id: 'inv-4', invoiceNo: 'INV-2025-051', client: 'DataFlow Systems', clientId: 'ven-4', amount: 275000, tax: 49500, total: 324500, status: 'draft', dueDate: '2025-07-01', issuedDate: '2025-06-08', daysOverdue: 0 },
];

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Meals', description: 'Team meals, client dining, cafeteria' },
  { id: 'rent', label: 'Rent & Lease', description: 'Office rent, co-working, lease payments' },
  { id: 'maintenance', label: 'Maintenance & Repairs', description: 'Building, equipment, facility upkeep' },
  { id: 'salary', label: 'Employee Salary', description: 'Payroll, bonuses, contractor payouts' },
  { id: 'events', label: 'Events & Conferences', description: 'Meetups, offsites, sponsorships' },
  { id: 'assets', label: 'Assets & Equipment', description: 'Hardware, furniture, capital purchases' },
  { id: 'software', label: 'Software & Subscriptions', description: 'SaaS, licenses, cloud services' },
  { id: 'travel', label: 'Travel & Transport', description: 'Flights, hotels, cabs, fuel' },
  { id: 'marketing', label: 'Marketing', description: 'Ads, campaigns, branding' },
  { id: 'utilities', label: 'Utilities', description: 'Electricity, internet, water' },
  { id: 'operations', label: 'Office & Operations', description: 'Supplies, postage, misc office' },
  { id: 'other', label: 'Other', description: 'Uncategorized expenses' },
];

const EXPENSE_CATEGORY_IDS = new Set(EXPENSE_CATEGORIES.map((c) => c.id));

export function normalizeExpenseCategory(category) {
  const raw = String(category || 'other').trim().toLowerCase();
  if (EXPENSE_CATEGORY_IDS.has(raw)) return raw;
  const byLabel = EXPENSE_CATEGORIES.find((c) => c.label.toLowerCase() === raw);
  if (byLabel) return byLabel.id;
  const legacy = {
    software: 'software',
    travel: 'travel',
    operations: 'operations',
    marketing: 'marketing',
    general: 'other',
    food: 'food',
    rent: 'rent',
  };
  return legacy[raw] || 'other';
}

export function expenseCategoryLabel(categoryId) {
  return EXPENSE_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
}

export const FINANCE_EXPENSES = [
  { id: 'exp-1', title: 'AWS Cloud Services — June', description: 'Production and staging environment billing', category: 'software', vendor: 'Amazon Web Services', amount: 145000, date: '2025-06-05', status: 'approved', submittedBy: 'IT Team', bills: [{ id: 'bill-1', fileName: 'aws-invoice-jun.pdf', size: 245000, mimeType: 'application/pdf', uploadedAt: '2025-06-05T10:00:00Z' }] },
  { id: 'exp-2', title: 'Team offsite travel', description: 'Flights and hotel for Hyderabad offsite', category: 'travel', vendor: 'MakeMyTrip', amount: 68000, date: '2025-06-03', status: 'pending', submittedBy: 'HR Team', bills: [] },
  { id: 'exp-3', title: 'Client lunch — Global Retail', description: 'Deal closing lunch with client stakeholders', category: 'food', vendor: 'Taj Vivanta', amount: 8500, date: '2025-06-04', status: 'pending', submittedBy: 'Sales Team', bills: [{ id: 'bill-2', fileName: 'restaurant-receipt.jpg', size: 89000, mimeType: 'image/jpeg', uploadedAt: '2025-06-04T14:30:00Z' }] },
  { id: 'exp-4', title: 'WeWork — June rent', description: 'Monthly coworking lease', category: 'rent', vendor: 'WeWork Hyderabad', amount: 120000, date: '2025-06-01', status: 'approved', submittedBy: 'Admin', bills: [] },
  { id: 'exp-5', title: 'AC servicing & repairs', description: 'Quarterly HVAC maintenance', category: 'maintenance', vendor: 'BlueStar Service', amount: 18500, date: '2025-06-06', status: 'approved', submittedBy: 'Facilities', bills: [] },
  { id: 'exp-6', title: 'June payroll', description: 'Payroll processing and contractor fees', category: 'salary', vendor: 'RazorpayX Payroll', amount: 1850000, date: '2025-06-01', status: 'paid', submittedBy: 'Finance Team', bills: [] },
  { id: 'exp-7', title: 'Annual town hall', description: 'Venue and catering for company event', category: 'events', vendor: 'Hyderabad Convention Centre', amount: 95000, date: '2025-06-08', status: 'approved', submittedBy: 'HR Team', bills: [] },
  { id: 'exp-8', title: 'MacBook Pro batch', description: 'Engineering laptop procurement', category: 'assets', vendor: 'Apple Authorized Reseller', amount: 420000, date: '2025-06-07', status: 'approved', submittedBy: 'IT Team', bills: [{ id: 'bill-3', fileName: 'apple-invoice.pdf', size: 312000, mimeType: 'application/pdf', uploadedAt: '2025-06-07T09:15:00Z' }] },
  { id: 'exp-9', title: 'LinkedIn recruitment ads', description: 'Q2 hiring campaign spend', category: 'marketing', vendor: 'LinkedIn', amount: 45000, date: '2025-06-02', status: 'approved', submittedBy: 'HR Team', bills: [] },
  { id: 'exp-10', title: 'Office stationery restock', description: 'Pantry and stationery supplies', category: 'operations', vendor: 'Staples India', amount: 12500, date: '2025-06-07', status: 'approved', submittedBy: 'Admin', bills: [] },
  { id: 'exp-11', title: 'Airtel internet — June', description: 'Business broadband', category: 'utilities', vendor: 'Airtel Business', amount: 22000, date: '2025-06-05', status: 'paid', submittedBy: 'Admin', bills: [] },
  { id: 'exp-12', title: 'Friday team lunch', description: 'Weekly team meal', category: 'food', vendor: 'Swiggy Corporate', amount: 6200, date: '2025-06-06', status: 'approved', submittedBy: 'Admin', bills: [] },
];

export const FINANCE_PAYMENTS = [
  { id: 'pay-1', paymentNo: 'PAY-2025-089', payee: 'Amazon Web Services', type: 'outgoing', amount: 145000, date: '2025-06-06', method: 'Bank Transfer', status: 'completed', reference: 'AWS-JUN' },
  { id: 'pay-2', paymentNo: 'PAY-2025-090', payee: 'TechCorp Solutions', type: 'incoming', amount: 450000, date: '2025-06-03', method: 'NEFT', status: 'completed', reference: 'INV-2025-042' },
  { id: 'pay-3', paymentNo: 'PAY-2025-091', payee: 'WeWork Hyderabad', type: 'outgoing', amount: 120000, date: '2025-06-05', method: 'Bank Transfer', status: 'completed', reference: 'RENT-JUN' },
  { id: 'pay-4', paymentNo: 'PAY-2025-092', payee: 'StartupHub Inc', type: 'incoming', amount: 218300, date: '2025-06-08', method: 'UPI', status: 'pending', reference: 'INV-2025-050' },
  { id: 'pay-5', paymentNo: 'PAY-2025-093', payee: 'Apple Authorized Reseller', type: 'outgoing', amount: 420000, date: '2025-06-07', method: 'Bank Transfer', status: 'pending', reference: 'PO-2025-017' },
  { id: 'pay-6', paymentNo: 'PAY-2025-094', payee: 'BlueStar Service', type: 'outgoing', amount: 18500, date: '2025-06-06', method: 'UPI', status: 'completed', reference: 'MAINT-JUN' },
  { id: 'pay-7', paymentNo: 'PAY-2025-095', payee: 'Global Retail Ltd', type: 'incoming', amount: 200000, date: '2025-06-10', method: 'NEFT', status: 'completed', reference: 'INV-2025-049' },
];

export const FINANCE_VENDORS = [
  { id: 'ven-1', name: 'TechCorp Solutions', type: 'client', email: 'billing@techcorp.io', phone: '+91 40 1234 5678', outstanding: 531000, status: 'active' },
  { id: 'ven-2', name: 'Global Retail Ltd', type: 'client', email: 'ap@globalretail.com', phone: '+91 80 9876 5432', outstanding: 377600, status: 'active' },
  { id: 'ven-3', name: 'StartupHub Inc', type: 'client', email: 'finance@startuphub.io', phone: '+91 22 5555 1234', outstanding: 0, status: 'active' },
  { id: 'ven-4', name: 'Amazon Web Services', type: 'vendor', email: 'billing@aws.amazon.com', phone: '', outstanding: 145000, status: 'active' },
  { id: 'ven-5', name: 'WeWork Hyderabad', type: 'vendor', email: 'hyderabad@wework.com', phone: '+91 40 4444 8888', outstanding: 120000, status: 'active' },
  { id: 'ven-6', name: 'Apple Authorized Reseller', type: 'vendor', email: 'enterprise@applepartner.in', phone: '+91 80 2222 3333', outstanding: 495600, status: 'active' },
];

export const FINANCE_BUDGETS = [
  { id: 'bud-1', category: 'Salaries & Wages', allocated: 2000000, spent: 1850000, period: 'Jun 2025' },
  { id: 'bud-2', category: 'Rent & Utilities', allocated: 450000, spent: 420000, period: 'Jun 2025' },
  { id: 'bud-3', category: 'Software & Subscriptions', allocated: 300000, spent: 285000, period: 'Jun 2025' },
  { id: 'bud-4', category: 'Marketing', allocated: 250000, spent: 195000, period: 'Jun 2025' },
  { id: 'bud-5', category: 'Travel & Entertainment', allocated: 200000, spent: 142000, period: 'Jun 2025' },
];

export const FINANCE_DASHBOARD = {
  revenue: { amount: 4550000, change: 12.5, target: 5000000, targetPct: 91 },
  expenses: { amount: 3212000, change: -3.2, budget: 3400000, budgetPct: 94.5 },
  profitMargin: { pct: 29.4, status: 'Above Target' },
  cashPosition: { amount: 1875000, status: 'Healthy' },
  pendingActions: [
    { id: 'pa-1', title: '3 invoices overdue', detail: 'Total ₹8,45,000 · Oldest 12 days', urgency: 'high', action: 'Review Invoices', link: 'invoices' },
    { id: 'pa-2', title: '2 expense claims pending', detail: '₹76,500 awaiting approval', urgency: 'medium', action: 'Approve', link: 'expenses' },
    { id: 'pa-3', title: '1 journal entry in draft', detail: 'JE-1004 · SaaS subscription', urgency: 'low', action: 'Post Entry', link: 'ledger' },
    { id: 'pa-4', title: 'Vendor payment due', detail: 'WeWork · ₹1,20,000 due this week', urgency: 'medium', action: 'Schedule Payment', link: 'payments' },
  ],
  accountsReceivable: {
    total: 845000,
    buckets: [
      { label: '0–30 days', amount: 377600 },
      { label: '31–60 days', amount: 324500 },
      { label: '60+ days', amount: 143000 },
    ],
    avgCollectionDays: 28,
  },
  accountsPayable: {
    total: 520000,
    buckets: [
      { label: 'Due this week', amount: 120000 },
      { label: 'Due this month', amount: 265000 },
      { label: 'Later', amount: 135000 },
    ],
    avgPaymentDays: 22,
  },
  recentTransactions: [
    { id: 'tx-1', party: 'TechCorp Solutions', ini: 'TC', date: '2025-06-08', time: '10:30 AM', amount: 450000, type: 'credit', category: 'Invoice Payment' },
    { id: 'tx-2', party: 'Amazon Web Services', ini: 'AW', date: '2025-06-06', time: '2:15 PM', amount: -145000, type: 'debit', category: 'Cloud Services' },
    { id: 'tx-3', party: 'WeWork Hyderabad', ini: 'WW', date: '2025-06-05', time: '11:00 AM', amount: -120000, type: 'debit', category: 'Rent' },
    { id: 'tx-4', party: 'StartupHub Inc', ini: 'SH', date: '2025-06-04', time: '4:45 PM', amount: 218300, type: 'credit', category: 'Invoice Payment' },
    { id: 'tx-5', party: 'LinkedIn', ini: 'LI', date: '2025-06-02', time: '9:00 AM', amount: -45000, type: 'debit', category: 'Marketing' },
  ],
  topExpenses: [
    { category: 'Employee Salary', pct: 52.8 },
    { category: 'Assets & Equipment', pct: 12.0 },
    { category: 'Software & Subscriptions', pct: 4.1 },
    { category: 'Rent & Lease', pct: 3.4 },
    { category: 'Events & Conferences', pct: 2.7 },
  ],
};

function nextEntryNo(entries) {
  const nums = entries.map((e) => parseInt(String(e.entryNo || '').replace('JE-', ''), 10) || 0);
  return `JE-${Math.max(1000, ...nums) + 1}`;
}

function nextInvoiceNo(invoices) {
  const nums = invoices.map((i) => parseInt(String(i.invoiceNo || '').replace('INV-2025-', ''), 10) || 0);
  return `INV-2025-${String(Math.max(48, ...nums) + 1).padStart(3, '0')}`;
}

export function buildLedgerLines(entries, accountId) {
  const lines = [];
  for (const entry of entries) {
    if (entry.status !== 'posted') continue;
    for (const line of entry.lines || []) {
      if (accountId && line.accountId !== accountId) continue;
      lines.push({
        id: `${entry.id}-${line.accountId}`,
        date: entry.date,
        entryNo: entry.entryNo,
        description: entry.description,
        reference: entry.reference,
        accountCode: line.accountCode,
        accountName: line.accountName,
        debit: line.debit || 0,
        credit: line.credit || 0,
      });
    }
  }
  return lines.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export { nextEntryNo, nextInvoiceNo };
