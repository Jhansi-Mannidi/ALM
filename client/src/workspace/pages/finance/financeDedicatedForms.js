import { api } from '../../../api/client';
import { ACCOUNT_TYPES } from '../../data/financeCatalog';

const today = () => new Date().toISOString().slice(0, 10);

export const DEDICATED_FORM_CONFIG = {
  invoices: {
    title: 'Invoice',
    listTitle: 'Invoices',
    subtitle: 'Create or update a client invoice',
    listPath: '/workspace/finance/invoices',
    addLabel: 'New Invoice',
    fields: [
      { key: 'client', label: 'Client', required: true, full: true },
      { key: 'amount', label: 'Amount (INR)', type: 'number', required: true },
      { key: 'tax', label: 'Tax (INR)', type: 'number' },
      { key: 'issuedDate', label: 'Issued date', type: 'date', default: today() },
      { key: 'dueDate', label: 'Due date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], showOnCreate: false },
    ],
    emptyForm: () => ({ client: '', amount: '', tax: '', dueDate: '', issuedDate: today(), status: 'draft' }),
    mapToForm: (r) => ({
      client: r.client || '',
      amount: String(r.amount ?? ''),
      tax: String(r.tax ?? ''),
      dueDate: r.dueDate?.slice(0, 10) || '',
      issuedDate: r.issuedDate?.slice(0, 10) || today(),
      status: r.status || 'draft',
    }),
    validate: (form) => {
      if (!form.client?.trim()) return 'Client is required';
      if (!form.amount) return 'Amount is required';
      return null;
    },
    toPayload: (form) => ({
      client: form.client.trim(),
      amount: Number(form.amount),
      tax: form.tax ? Number(form.tax) : undefined,
      dueDate: form.dueDate,
      issuedDate: form.issuedDate,
      status: form.status,
    }),
    load: (id) => api.getFinanceInvoice(id),
    create: (data) => api.createFinanceInvoice(data),
    update: (id, data) => api.updateFinanceInvoice(id, data),
    editTitle: (r) => `Edit ${r.invoiceNo}`,
  },
  payments: {
    title: 'Payment',
    listTitle: 'Payments',
    subtitle: 'Record money received or paid',
    listPath: '/workspace/finance/payments',
    addLabel: 'Record Payment',
    fields: [
      { key: 'payee', label: 'Payee', required: true, full: true },
      { key: 'type', label: 'Type', type: 'select', options: [{ value: 'incoming', label: 'Incoming' }, { value: 'outgoing', label: 'Outgoing' }] },
      { key: 'amount', label: 'Amount (INR)', type: 'number', required: true },
      { key: 'date', label: 'Date', type: 'date', default: today() },
      { key: 'method', label: 'Method', default: 'Bank Transfer' },
      { key: 'reference', label: 'Reference' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'completed', 'failed', 'cancelled'], showOnCreate: false },
    ],
    emptyForm: (searchParams) => ({
      payee: '',
      type: searchParams.get('type') === 'incoming' ? 'incoming' : 'outgoing',
      amount: '',
      date: today(),
      method: 'Bank Transfer',
      reference: '',
      status: 'pending',
    }),
    mapToForm: (r) => ({
      payee: r.payee || '',
      type: r.type || 'outgoing',
      amount: String(r.amount ?? ''),
      date: r.date?.slice(0, 10) || today(),
      method: r.method || 'Bank Transfer',
      reference: r.reference || '',
      status: r.status || 'pending',
    }),
    validate: (form) => {
      if (!form.payee?.trim()) return 'Payee is required';
      if (!form.amount) return 'Amount is required';
      return null;
    },
    toPayload: (form) => ({
      payee: form.payee.trim(),
      type: form.type,
      amount: Number(form.amount),
      date: form.date,
      method: form.method.trim(),
      reference: form.reference.trim(),
      status: form.status,
    }),
    load: (id) => api.getFinancePayment(id),
    create: (data) => api.createFinancePayment(data),
    update: (id, data) => api.updateFinancePayment(id, data),
    editTitle: (r) => `Edit ${r.paymentNo}`,
  },
  vendors: {
    title: 'Contact',
    listTitle: 'Vendors & Clients',
    subtitle: 'Add a vendor or client contact',
    listPath: '/workspace/finance/vendors',
    addLabel: 'Add Contact',
    fields: [
      { key: 'name', label: 'Name', required: true, full: true },
      { key: 'type', label: 'Type', type: 'select', options: [{ value: 'client', label: 'Client' }, { value: 'vendor', label: 'Vendor' }] },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone' },
      { key: 'outstanding', label: 'Outstanding (INR)', type: 'number', default: '0' },
    ],
    emptyForm: () => ({ name: '', type: 'client', email: '', phone: '', outstanding: '0', status: 'active' }),
    mapToForm: (r) => ({
      name: r.name || '',
      type: r.type || 'client',
      email: r.email || '',
      phone: r.phone || '',
      outstanding: String(r.outstanding ?? 0),
      status: r.status || 'active',
    }),
    validate: (form) => (!form.name?.trim() ? 'Name is required' : null),
    toPayload: (form) => ({
      name: form.name.trim(),
      type: form.type,
      email: form.email.trim(),
      phone: form.phone.trim(),
      outstanding: Number(form.outstanding) || 0,
      status: form.status,
    }),
    load: (id) => api.getFinanceVendor(id),
    create: (data) => api.createFinanceVendor(data),
    update: (id, data) => api.updateFinanceVendor(id, data),
    editTitle: () => 'Edit Contact',
  },
  budgets: {
    title: 'Budget',
    listTitle: 'Budgets',
    subtitle: 'Set category budget and track spend',
    listPath: '/workspace/finance/budgets',
    addLabel: 'Add Budget',
    fields: [
      { key: 'category', label: 'Category', required: true, full: true },
      { key: 'allocated', label: 'Allocated (INR)', type: 'number', required: true },
      { key: 'spent', label: 'Spent (INR)', type: 'number', default: '0' },
      { key: 'period', label: 'Period', full: true, default: 'Jun 2025', placeholder: 'Jun 2025' },
    ],
    emptyForm: () => ({ category: '', allocated: '', spent: '0', period: 'Jun 2025' }),
    mapToForm: (r) => ({
      category: r.category || '',
      allocated: String(r.allocated ?? ''),
      spent: String(r.spent ?? 0),
      period: r.period || 'Jun 2025',
    }),
    validate: (form) => {
      if (!form.category?.trim()) return 'Category is required';
      if (!form.allocated) return 'Allocated amount is required';
      return null;
    },
    toPayload: (form) => ({
      category: form.category.trim(),
      allocated: Number(form.allocated),
      spent: Number(form.spent) || 0,
      period: form.period.trim(),
    }),
    load: (id) => api.getFinanceBudget(id),
    create: (data) => api.createFinanceBudget(data),
    update: (id, data) => api.updateFinanceBudget(id, data),
    editTitle: () => 'Edit Budget',
  },
  accounts: {
    title: 'Account',
    listTitle: 'Chart of Accounts',
    subtitle: 'Chart of accounts — ledger account',
    listPath: '/workspace/finance/accounts',
    addLabel: 'Add Account',
    fields: [
      { key: 'code', label: 'Account code', required: true },
      { key: 'name', label: 'Account name', required: true },
      { key: 'type', label: 'Type', type: 'accountType', required: true },
    ],
    emptyForm: () => ({ code: '', name: '', type: 'expense' }),
    mapToForm: (r) => ({ code: r.code || '', name: r.name || '', type: r.type || 'expense' }),
    validate: (form) => {
      if (!form.code?.trim()) return 'Account code is required';
      if (!form.name?.trim()) return 'Account name is required';
      return null;
    },
    toPayload: (form) => ({ code: form.code.trim(), name: form.name.trim(), type: form.type }),
    load: (id) => api.getFinanceAccount(id),
    create: (data) => api.createFinanceAccount(data),
    update: (id, data) => api.updateFinanceAccount(id, data),
    editTitle: (r) => `Edit ${r.code}`,
    accountTypes: ACCOUNT_TYPES,
  },
};

export function getDedicatedFormConfig(entity) {
  return DEDICATED_FORM_CONFIG[entity] || null;
}
