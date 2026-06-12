/** Comprehensive finance module seed — Sales, Purchases, Banking, Accountant, Reports */

export const FINANCE_CUSTOMERS = [
  { id: 'cust-1', customerNo: 'CUS-001', name: 'TechCorp Solutions', email: 'billing@techcorp.io', phone: '+91 40 1234 5678', company: 'TechCorp Solutions Pvt Ltd', gstin: '36AABCT1234F1Z5', outstanding: 531000, status: 'active', createdAt: '2024-01-15' },
  { id: 'cust-2', customerNo: 'CUS-002', name: 'Global Retail Ltd', email: 'ap@globalretail.com', phone: '+91 80 9876 5432', company: 'Global Retail Ltd', gstin: '29AABCG5678G1Z2', outstanding: 377600, status: 'active', createdAt: '2024-03-20' },
  { id: 'cust-3', customerNo: 'CUS-003', name: 'StartupHub Inc', email: 'finance@startuphub.io', phone: '+91 22 5555 1234', company: 'StartupHub Inc', gstin: '27AABCS9012H1Z8', outstanding: 0, status: 'active', createdAt: '2024-06-10' },
  { id: 'cust-4', customerNo: 'CUS-004', name: 'DataFlow Systems', email: 'accounts@dataflow.in', phone: '+91 44 3333 4444', company: 'DataFlow Systems Pvt Ltd', gstin: '33AABCD4567J1Z1', outstanding: 324500, status: 'active', createdAt: '2024-08-22' },
  { id: 'cust-5', customerNo: 'CUS-005', name: 'MediCare Health', email: 'finance@medicare.in', phone: '+91 11 7777 8888', company: 'MediCare Health Services', gstin: '07AABCM7890K1Z3', outstanding: 185000, status: 'active', createdAt: '2024-11-05' },
];

export const FINANCE_QUOTES = [
  { id: 'qt-1', quoteNo: 'QT-2025-012', customerId: 'cust-2', customer: 'Global Retail Ltd', date: '2025-06-01', validUntil: '2025-06-30', amount: 320000, tax: 57600, total: 377600, status: 'sent' },
  { id: 'qt-2', quoteNo: 'QT-2025-013', customerId: 'cust-1', customer: 'TechCorp Solutions', date: '2025-06-05', validUntil: '2025-07-05', amount: 450000, tax: 81000, total: 531000, status: 'accepted' },
  { id: 'qt-3', quoteNo: 'QT-2025-014', customerId: 'cust-4', customer: 'DataFlow Systems', date: '2025-06-08', validUntil: '2025-07-08', amount: 275000, tax: 49500, total: 324500, status: 'draft' },
  { id: 'qt-4', quoteNo: 'QT-2025-015', customerId: 'cust-5', customer: 'MediCare Health', date: '2025-06-09', validUntil: '2025-07-09', amount: 185000, tax: 33300, total: 218300, status: 'sent' },
];

export const FINANCE_SALES_ORDERS = [
  { id: 'so-1', orderNo: 'SO-2025-008', customerId: 'cust-1', customer: 'TechCorp Solutions', date: '2025-06-02', deliveryDate: '2025-06-20', amount: 450000, tax: 81000, total: 531000, status: 'confirmed' },
  { id: 'so-2', orderNo: 'SO-2025-009', customerId: 'cust-3', customer: 'StartupHub Inc', date: '2025-06-07', deliveryDate: '2025-06-25', amount: 185000, tax: 33300, total: 218300, status: 'shipped' },
];

export const FINANCE_RECURRING_INVOICES = [
  { id: 'rinv-1', profileName: 'TechCorp Monthly Retainer', customerId: 'cust-1', customer: 'TechCorp Solutions', frequency: 'monthly', nextDate: '2025-07-01', amount: 450000, tax: 81000, total: 531000, status: 'active' },
  { id: 'rinv-2', profileName: 'Global Retail Support', customerId: 'cust-2', customer: 'Global Retail Ltd', frequency: 'quarterly', nextDate: '2025-07-01', amount: 320000, tax: 57600, total: 377600, status: 'active' },
];

export const FINANCE_DELIVERY_CHALLANS = [
  { id: 'dc-1', challanNo: 'DC-2025-004', customerId: 'cust-1', customer: 'TechCorp Solutions', date: '2025-06-08', items: 'Consulting deliverables — Phase 2', status: 'delivered' },
  { id: 'dc-2', challanNo: 'DC-2025-005', customerId: 'cust-3', customer: 'StartupHub Inc', date: '2025-06-09', items: 'SaaS onboarding kit', status: 'in-transit' },
];

export const FINANCE_PAYMENTS_RECEIVED = [
  { id: 'pr-1', paymentNo: 'PR-2025-041', customer: 'TechCorp Solutions', invoiceNo: 'INV-2025-042', amount: 450000, date: '2025-06-03', method: 'NEFT', reference: 'NEFT-TCS-0603', status: 'completed' },
  { id: 'pr-2', paymentNo: 'PR-2025-042', customer: 'StartupHub Inc', invoiceNo: 'INV-2025-050', amount: 218300, date: '2025-06-08', method: 'UPI', reference: 'UPI-SH-0608', status: 'pending' },
  { id: 'pr-3', paymentNo: 'PR-2025-043', customer: 'Global Retail Ltd', invoiceNo: 'INV-2025-049', amount: 200000, date: '2025-06-10', method: 'NEFT', reference: 'NEFT-GR-0610', status: 'completed' },
  { id: 'pr-4', paymentNo: 'PR-2025-044', customer: 'MediCare Health', invoiceNo: 'INV-2025-052', amount: 95000, date: '2025-06-09', method: 'Cheque', reference: 'CHQ-MC-4521', status: 'pending' },
];

export const FINANCE_CREDIT_NOTES = [
  { id: 'cn-1', creditNo: 'CN-2025-003', customerId: 'cust-2', customer: 'Global Retail Ltd', date: '2025-06-04', amount: 15000, reason: 'Service credit — SLA breach', status: 'open' },
];

export const FINANCE_EWAY_BILLS = [
  { id: 'ewb-1', ewayNo: 'EWB-2025-018', invoiceNo: 'INV-2025-049', date: '2025-06-06', vehicleNo: 'TS09AB1234', distance: 42, status: 'generated' },
];

export const FINANCE_RECURRING_EXPENSES = [
  { id: 'rexp-1', description: 'WeWork Hyderabad — monthly rent', category: 'rent', vendor: 'WeWork Hyderabad', amount: 120000, frequency: 'monthly', nextDate: '2025-07-01', status: 'active' },
  { id: 'rexp-2', description: 'AWS cloud infrastructure', category: 'software', vendor: 'Amazon Web Services', amount: 145000, frequency: 'monthly', nextDate: '2025-07-05', status: 'active' },
  { id: 'rexp-3', description: 'Airtel business internet', category: 'utilities', vendor: 'Airtel Business', amount: 22000, frequency: 'monthly', nextDate: '2025-07-01', status: 'active' },
];

export const FINANCE_PURCHASE_ORDERS = [
  { id: 'po-1', poNo: 'PO-2025-015', vendorId: 'ven-4', vendor: 'Amazon Web Services', date: '2025-06-01', expectedDate: '2025-06-10', amount: 145000, tax: 26100, total: 171100, status: 'received' },
  { id: 'po-2', poNo: 'PO-2025-016', vendorId: 'ven-5', vendor: 'WeWork Hyderabad', date: '2025-05-28', expectedDate: '2025-06-01', amount: 120000, tax: 21600, total: 141600, status: 'billed' },
  { id: 'po-3', poNo: 'PO-2025-017', vendorId: 'ven-6', vendor: 'Apple Authorized Reseller', date: '2025-06-05', expectedDate: '2025-06-15', amount: 420000, tax: 75600, total: 495600, status: 'open' },
];

export const FINANCE_BILLS = [
  { id: 'bill-1', billNo: 'BILL-2025-031', vendorId: 'ven-4', vendor: 'Amazon Web Services', date: '2025-06-05', dueDate: '2025-06-20', amount: 145000, tax: 26100, total: 171100, status: 'open' },
  { id: 'bill-2', billNo: 'BILL-2025-032', vendorId: 'ven-5', vendor: 'WeWork Hyderabad', date: '2025-06-01', dueDate: '2025-06-10', amount: 120000, tax: 21600, total: 141600, status: 'paid' },
  { id: 'bill-3', billNo: 'BILL-2025-033', vendorId: 'ven-6', vendor: 'Apple Authorized Reseller', date: '2025-06-07', dueDate: '2025-07-07', amount: 420000, tax: 75600, total: 495600, status: 'overdue' },
];

export const FINANCE_RECURRING_BILLS = [
  { id: 'rbill-1', vendorId: 'ven-5', vendor: 'WeWork Hyderabad', description: 'Office lease — Hyderabad', amount: 120000, frequency: 'monthly', nextDate: '2025-07-01', status: 'active' },
  { id: 'rbill-2', vendorId: 'ven-4', vendor: 'Amazon Web Services', description: 'Cloud hosting', amount: 145000, frequency: 'monthly', nextDate: '2025-07-05', status: 'active' },
];

export const FINANCE_VENDOR_CREDITS = [
  { id: 'vc-1', creditNo: 'VC-2025-002', vendorId: 'ven-4', vendor: 'Amazon Web Services', date: '2025-06-04', amount: 12000, reason: 'Promotional credit', status: 'open' },
];

export const FINANCE_BANK_ACCOUNTS = [
  { id: 'bank-1', name: 'ICICI — 174905000627', type: 'bank', bankName: 'ICICI Bank', accountNumber: 'xxxx0627', balance: 1245000, uncategorizedCount: 9, status: 'active' },
  { id: 'bank-2', name: 'Kotak — 9652', type: 'bank', bankName: 'Kotak Mahindra', accountNumber: 'xxxx9250', balance: 630000, uncategorizedCount: 0, status: 'active' },
  { id: 'bank-3', name: 'Petty Cash', type: 'cash', bankName: '', accountNumber: '', balance: 25000, uncategorizedCount: 2, status: 'active' },
  { id: 'bank-4', name: 'Corporate Credit Card', type: 'credit_card', bankName: 'HDFC Bank', accountNumber: 'xxxx4412', balance: -85000, uncategorizedCount: 3, status: 'active' },
];

export const FINANCE_BANK_TRANSACTIONS = [
  { id: 'btx-1', bankAccountId: 'bank-1', date: '2025-06-08', description: 'NEFT from TechCorp', amount: 450000, type: 'credit', category: 'Invoice Payment', reconciled: true },
  { id: 'btx-2', bankAccountId: 'bank-1', date: '2025-06-06', description: 'AWS payment', amount: -145000, type: 'debit', category: '', reconciled: false },
  { id: 'btx-3', bankAccountId: 'bank-1', date: '2025-06-05', description: 'WeWork rent', amount: -120000, type: 'debit', category: 'Rent', reconciled: true },
  { id: 'btx-4', bankAccountId: 'bank-2', date: '2025-06-07', description: 'UPI — StartupHub', amount: 218300, type: 'credit', category: '', reconciled: false },
  { id: 'btx-5', bankAccountId: 'bank-1', date: '2025-06-04', description: 'LinkedIn recruitment ads', amount: -45000, type: 'debit', category: 'Marketing', reconciled: true },
  { id: 'btx-6', bankAccountId: 'bank-3', date: '2025-06-07', description: 'Office supplies — Staples', amount: -12500, type: 'debit', category: '', reconciled: false },
  { id: 'btx-7', bankAccountId: 'bank-4', date: '2025-06-06', description: 'Team lunch — Swiggy', amount: -6200, type: 'debit', category: 'Food & Meals', reconciled: false },
  { id: 'btx-8', bankAccountId: 'bank-2', date: '2025-06-03', description: 'NEFT from Global Retail', amount: 200000, type: 'credit', category: 'Invoice Payment', reconciled: true },
];

export const FINANCE_ITEMS = [
  { id: 'item-1', name: 'Consulting — Senior', sku: 'SVC-CONS-SR', type: 'service', rate: 15000, unit: 'hour', status: 'active' },
  { id: 'item-2', name: 'Consulting — Junior', sku: 'SVC-CONS-JR', type: 'service', rate: 8000, unit: 'hour', status: 'active' },
  { id: 'item-3', name: 'ALM Platform License', sku: 'LIC-ALM-ENT', type: 'service', rate: 450000, unit: 'month', status: 'active' },
  { id: 'item-4', name: 'MacBook Pro 14"', sku: 'HW-MBP-14', type: 'goods', rate: 210000, unit: 'unit', status: 'active' },
];

export const FINANCE_TIME_ENTRIES = [
  { id: 'te-1', project: 'TechCorp ALM Rollout', customer: 'TechCorp Solutions', employee: 'John Doe', date: '2025-06-08', hours: 8, billable: true, rate: 15000, amount: 120000, status: 'approved' },
  { id: 'te-2', project: 'Global Retail Integration', customer: 'Global Retail Ltd', employee: 'Alice Brown', date: '2025-06-07', hours: 6, billable: true, rate: 15000, amount: 90000, status: 'submitted' },
  { id: 'te-3', project: 'Internal — Finance Module', customer: 'VoltusWave', employee: 'Bob Smith', date: '2025-06-06', hours: 4, billable: false, rate: 0, amount: 0, status: 'approved' },
];

export const FINANCE_DOCUMENTS = [
  { id: 'doc-1', name: 'GST Registration Certificate.pdf', type: 'compliance', linkedTo: 'Company', size: '245 KB', uploadedAt: '2025-01-10' },
  { id: 'doc-2', name: 'ICICI Bank Statement — May 2025.pdf', type: 'banking', linkedTo: 'ICICI — 174905000627', size: '1.2 MB', uploadedAt: '2025-06-02' },
  { id: 'doc-3', name: 'Vendor Agreement — WeWork.pdf', type: 'vendor', linkedTo: 'WeWork Hyderabad', size: '890 KB', uploadedAt: '2025-03-15' },
];

export const FINANCE_CURRENCY_ADJUSTMENTS = [
  { id: 'ca-1', date: '2025-06-01', fromCurrency: 'USD', toCurrency: 'INR', rate: 83.25, gainLoss: -4200, reference: 'USD receivable revaluation' },
  { id: 'ca-2', date: '2025-05-01', fromCurrency: 'EUR', toCurrency: 'INR', rate: 90.10, gainLoss: 8500, reference: 'EUR vendor payment' },
];

export const FINANCE_TRANSACTION_LOCKS = [
  { id: 'tl-1', lockDate: '2025-05-31', modules: 'All modules', lockedBy: 'Finance Team', status: 'active', notes: 'May month-end close' },
];

export const FINANCE_BULK_UPDATES = [
  { id: 'bu-1', date: '2025-06-01', field: 'Tax rate', recordsUpdated: 24, updatedBy: 'Finance Team', status: 'completed' },
  { id: 'bu-2', date: '2025-05-15', field: 'Expense category', recordsUpdated: 18, updatedBy: 'Finance Team', status: 'completed' },
  { id: 'bu-3', date: '2025-06-10', field: 'Vendor GSTIN', recordsUpdated: 6, updatedBy: 'Admin', status: 'running' },
];

export const FINANCE_REPORT_CATALOG = [
  { id: 'rpt-pl', name: 'Profit and Loss', category: 'Business Overview', createdBy: 'System Generated', lastVisited: '2025-06-11T09:20:00', favorite: true, route: 'profit-loss' },
  { id: 'rpt-pl-s3', name: 'Profit and Loss (Schedule III)', category: 'Business Overview', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'profit-loss' },
  { id: 'rpt-pl-h', name: 'Horizontal Profit and Loss', category: 'Business Overview', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'profit-loss' },
  { id: 'rpt-cf', name: 'Cash Flow Statement', category: 'Business Overview', createdBy: 'System Generated', lastVisited: '2025-06-10T14:00:00', favorite: true, route: 'cash-flow' },
  { id: 'rpt-bs', name: 'Balance Sheet', category: 'Business Overview', createdBy: 'System Generated', lastVisited: '2025-06-11T08:45:00', favorite: true, route: 'balance-sheet' },
  { id: 'rpt-bs-h', name: 'Horizontal Balance Sheet', category: 'Business Overview', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'balance-sheet' },
  { id: 'rpt-bs-s3', name: 'Balance Sheet (Schedule III)', category: 'Business Overview', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'balance-sheet' },
  { id: 'rpt-bpr', name: 'Business Performance Ratios', category: 'Business Overview', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'ratios' },
  { id: 'rpt-me', name: 'Movement of Equity', category: 'Business Overview', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'equity' },
  { id: 'rpt-ar-aging', name: 'AR Aging Summary', category: 'Receivables', createdBy: 'System Generated', lastVisited: '2025-06-09T11:00:00', favorite: false, route: 'ar-aging' },
  { id: 'rpt-ar-detail', name: 'AR Aging Details', category: 'Receivables', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'ar-aging' },
  { id: 'rpt-inv-by-cust', name: 'Invoice Details by Customer', category: 'Sales', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'invoice-detail' },
  { id: 'rpt-sales-by-item', name: 'Sales by Item', category: 'Sales', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'sales-by-item' },
  { id: 'rpt-ap-aging', name: 'AP Aging Summary', category: 'Payables', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'ap-aging' },
  { id: 'rpt-bill-detail', name: 'Bill Details by Vendor', category: 'Payables', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'bill-detail' },
  { id: 'rpt-exp-by-cat', name: 'Expenses by Category', category: 'Purchases and Expenses', createdBy: 'System Generated', lastVisited: '2025-06-08T16:30:00', favorite: true, route: 'expenses-by-category' },
  { id: 'rpt-po-detail', name: 'Purchase Order Details', category: 'Purchases and Expenses', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'po-detail' },
  { id: 'rpt-vendor-bal', name: 'Vendor Balance Summary', category: 'Purchases and Expenses', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'vendor-balance' },
  { id: 'rpt-gl', name: 'General Ledger', category: 'Accountant', createdBy: 'System Generated', lastVisited: '2025-06-11T10:00:00', favorite: true, route: 'ledger' },
  { id: 'rpt-tb', name: 'Trial Balance', category: 'Accountant', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'trial-balance' },
  { id: 'rpt-journal', name: 'Journal Report', category: 'Accountant', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'journal' },
  { id: 'rpt-budget', name: 'Budget vs Actual', category: 'Business Overview', createdBy: 'System Generated', lastVisited: null, favorite: false, route: 'budget-vs-actual' },
];

/** Module key → store array name mapping */
export const FINANCE_MODULE_KEYS = {
  customers: 'customers',
  quotes: 'quotes',
  'sales-orders': 'salesOrders',
  'recurring-invoices': 'recurringInvoices',
  'delivery-challans': 'deliveryChallans',
  'payments-received': 'paymentsReceived',
  'credit-notes': 'creditNotes',
  'eway-bills': 'ewayBills',
  'recurring-expenses': 'recurringExpenses',
  'purchase-orders': 'purchaseOrders',
  bills: 'bills',
  'recurring-bills': 'recurringBills',
  'vendor-credits': 'vendorCredits',
  'bank-accounts': 'bankAccounts',
  'bank-transactions': 'bankTransactions',
  items: 'items',
  'time-entries': 'timeEntries',
  documents: 'documents',
  'currency-adjustments': 'currencyAdjustments',
  'transaction-locks': 'transactionLocks',
  'bulk-updates': 'bulkUpdates',
};
