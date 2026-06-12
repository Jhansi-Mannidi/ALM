export const FINANCE_NAV_SECTIONS = [
  {
    id: 'home',
    label: 'Home',
    icon: 'layoutDashboard',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/workspace/finance', end: true, icon: 'layoutDashboard' },
    ],
  },
  {
    id: 'items',
    label: 'Items',
    icon: 'folder',
    items: [
      { id: 'items', label: 'Items', path: '/workspace/finance/m/items', moduleKey: 'items', icon: 'folder' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: 'cart',
    items: [
      { id: 'customers', label: 'Customers', path: '/workspace/finance/m/customers', moduleKey: 'customers', quickAdd: true, icon: 'users' },
      { id: 'quotes', label: 'Quotes', path: '/workspace/finance/m/quotes', moduleKey: 'quotes', icon: 'fileText' },
      { id: 'sales-orders', label: 'Sales Orders', path: '/workspace/finance/m/sales-orders', moduleKey: 'sales-orders', icon: 'cart' },
      { id: 'invoices', label: 'Invoices', path: '/workspace/finance/invoices', quickAdd: true, quickAddPath: '/workspace/finance/invoices/new', icon: 'fileSpreadsheet' },
      { id: 'recurring-invoices', label: 'Recurring Invoices', path: '/workspace/finance/m/recurring-invoices', moduleKey: 'recurring-invoices', icon: 'refresh' },
      { id: 'delivery-challans', label: 'Delivery Challans', path: '/workspace/finance/m/delivery-challans', moduleKey: 'delivery-challans', icon: 'clipboard' },
      { id: 'payments-received', label: 'Payments Received', path: '/workspace/finance/m/payments-received', moduleKey: 'payments-received', icon: 'arrowLeftRight' },
      { id: 'credit-notes', label: 'Credit Notes', path: '/workspace/finance/m/credit-notes', moduleKey: 'credit-notes', icon: 'fileText' },
      { id: 'eway-bills', label: 'e-Way Bills', path: '/workspace/finance/m/eway-bills', moduleKey: 'eway-bills', icon: 'fileText' },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases',
    icon: 'briefcase',
    items: [
      { id: 'vendors', label: 'Vendors', path: '/workspace/finance/vendors', icon: 'building' },
      { id: 'expenses', label: 'Expenses', path: '/workspace/finance/expenses', quickAdd: true, quickAddPath: '/workspace/finance/expenses/new', icon: 'fileText' },
      { id: 'recurring-expenses', label: 'Recurring Expenses', path: '/workspace/finance/m/recurring-expenses', moduleKey: 'recurring-expenses', icon: 'refresh' },
      { id: 'purchase-orders', label: 'Purchase Orders', path: '/workspace/finance/m/purchase-orders', moduleKey: 'purchase-orders', icon: 'clipboard' },
      { id: 'bills', label: 'Bills', path: '/workspace/finance/m/bills', moduleKey: 'bills', icon: 'fileSpreadsheet' },
      { id: 'recurring-bills', label: 'Recurring Bills', path: '/workspace/finance/m/recurring-bills', moduleKey: 'recurring-bills', icon: 'refresh' },
      { id: 'payments-made', label: 'Payments Made', path: '/workspace/finance/payments', icon: 'arrowLeftRight' },
      { id: 'vendor-credits', label: 'Vendor Credits', path: '/workspace/finance/m/vendor-credits', moduleKey: 'vendor-credits', icon: 'fileText' },
    ],
  },
  {
    id: 'time',
    label: 'Time Tracking',
    icon: 'timer',
    items: [
      { id: 'time-entries', label: 'Timesheet', path: '/workspace/finance/m/time-entries', moduleKey: 'time-entries', icon: 'timer' },
    ],
  },
  {
    id: 'banking',
    label: 'Banking',
    icon: 'building',
    items: [
      { id: 'banking', label: 'Banking Overview', path: '/workspace/finance/banking', icon: 'building' },
    ],
  },
  {
    id: 'accountant',
    label: 'Accountant',
    icon: 'userStar',
    items: [
      { id: 'ledger', label: 'Manual Journals', path: '/workspace/finance/ledger', icon: 'list' },
      { id: 'bulk-updates', label: 'Bulk Update', path: '/workspace/finance/m/bulk-updates', moduleKey: 'bulk-updates', icon: 'layers' },
      { id: 'currency-adjustments', label: 'Currency Adjustments', path: '/workspace/finance/m/currency-adjustments', moduleKey: 'currency-adjustments', icon: 'arrowLeftRight' },
      { id: 'accounts', label: 'Chart of Accounts', path: '/workspace/finance/accounts', icon: 'listChecks' },
      { id: 'transaction-locks', label: 'Transaction Locking', path: '/workspace/finance/m/transaction-locks', moduleKey: 'transaction-locks', icon: 'shieldCheck' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'fileSpreadsheet',
    items: [
      { id: 'reports-hub', label: 'All Reports', path: '/workspace/finance/reports', icon: 'barChart' },
      { id: 'budgets', label: 'Budgets', path: '/workspace/finance/budgets', icon: 'trendingUp' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'folder',
    items: [
      { id: 'documents', label: 'Documents', path: '/workspace/finance/m/documents', moduleKey: 'documents', icon: 'folder' },
      { id: 'settings', label: 'Settings', path: '/workspace/finance/settings', icon: 'sliders' },
    ],
  },
];

export const REPORT_CATEGORIES = [
  'All',
  'Business Overview',
  'Sales',
  'Receivables',
  'Payables',
  'Purchases and Expenses',
  'Accountant',
];

/** @deprecated use FINANCE_NAV_SECTIONS */
export const FINANCE_NAV = FINANCE_NAV_SECTIONS.flatMap((s) => s.items);

export const ACCOUNT_TYPES = [
  { id: 'asset', label: 'Asset' },
  { id: 'liability', label: 'Liability' },
  { id: 'equity', label: 'Equity' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'expense', label: 'Expense' },
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

export const EXPENSE_CATEGORY_CHIPS = {
  food: 'chip-amber',
  rent: 'chip-blue',
  maintenance: 'chip-purple',
  salary: 'chip-green',
  events: 'chip-blue',
  assets: 'chip-purple',
  software: 'chip-blue',
  travel: 'chip-amber',
  marketing: 'chip-red',
  utilities: 'chip-gray',
  operations: 'chip-gray',
  other: 'chip-gray',
};

export const INVOICE_STATUS_CHIPS = {
  draft: 'chip-gray',
  sent: 'chip-blue',
  paid: 'chip-green',
  overdue: 'chip-red',
  cancelled: 'chip-gray',
};

export const EXPENSE_STATUS_CHIPS = {
  pending: 'chip-amber',
  approved: 'chip-green',
  rejected: 'chip-red',
  paid: 'chip-blue',
};

export const PAYMENT_STATUS_CHIPS = {
  pending: 'chip-amber',
  completed: 'chip-green',
  failed: 'chip-red',
  cancelled: 'chip-gray',
};

export const ENTRY_STATUS_CHIPS = {
  draft: 'chip-amber',
  posted: 'chip-green',
};
