import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { EXPENSE_CATEGORIES } from '../../data/financeCatalog';
import FinancePageHeader from './FinancePageHeader';

const MAX_BILL_SIZE = 5 * 1024 * 1024;
const ACCEPTED_BILLS = '.pdf,.jpg,.jpeg,.png,.webp';

const EMPTY = {
  title: '',
  description: '',
  category: 'operations',
  vendor: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  submittedBy: 'Finance Team',
  status: 'pending',
};

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileMeta(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: `bill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fileName: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file.slice(0, 1));
  });
}

export default function ExpenseFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [bills, setBills] = useState([]);
  const [billError, setBillError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api.getFinanceExpense(id)
      .then((exp) => {
        setForm({
          title: exp.title || exp.description || '',
          description: exp.description || '',
          category: exp.category || 'operations',
          vendor: exp.vendor || '',
          amount: String(exp.amount ?? ''),
          date: exp.date?.slice(0, 10) || '',
          submittedBy: exp.submittedBy || 'Finance Team',
          status: exp.status || 'pending',
        });
        setBills(exp.bills || []);
      })
      .catch(() => setError('Expense not found'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleBillFiles = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;

    setBillError('');
    const next = [...bills];

    for (const file of files) {
      if (file.size > MAX_BILL_SIZE) {
        setBillError(`"${file.name}" exceeds 5 MB limit`);
        continue;
      }
      try {
        const meta = await readFileMeta(file);
        next.push(meta);
      } catch {
        setBillError(`Could not add "${file.name}"`);
      }
    }

    setBills(next);
  };

  const removeBill = (billId) => {
    setBills((prev) => prev.filter((b) => b.id !== billId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.amount) {
      setError('Amount is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        vendor: form.vendor.trim(),
        amount: Number(form.amount),
        date: form.date,
        submittedBy: form.submittedBy.trim(),
        bills,
      };
      if (isEdit) {
        await api.updateFinanceExpense(id, { ...payload, status: form.status });
      } else {
        await api.createFinanceExpense(payload);
      }
      navigate('/workspace/finance/expenses');
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ws-hr-page ws-fin-page ws-fin-expense-form-page">
        <p className="ws-page-subtitle">Loading expense…</p>
      </div>
    );
  }

  const selectedCategory = EXPENSE_CATEGORIES.find((c) => c.id === form.category);

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-expense-form-page">
      <Link to="/workspace/finance/expenses" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Expenses
      </Link>

      <FinancePageHeader
        title={isEdit ? 'Edit Expense' : 'Add Expense'}
        subtitle={isEdit ? 'Update expense claim details and supporting bills' : 'Record a new expense with title, notes, and bill attachments'}
        breadcrumbs={[
          { label: 'Finance', path: '/workspace/finance' },
          { label: 'Expenses', path: '/workspace/finance/expenses' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      <form onSubmit={handleSubmit} className="ws-fin-expense-form">
        {error && <div className="ws-emp-form-error mb16">{error}</div>}

        <div className="ws-fin-expense-form-grid">
        <div className="card ws-hr-panel ws-fin-expense-form-section">
          <div className="ws-hr-panel-head ws-fin-panel-head-compact">
            <h2 className="ws-hr-panel-title">Expense details</h2>
          </div>
          <div className="ws-hr-panel-body">
            <div className="ws-emp-form-grid ws-fin-expense-fields">
              <div className="fl ws-emp-form-field full">
                <label>Title *</label>
                <input
                  className="fi"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. June office rent — WeWork"
                  required
                />
              </div>
              <div className="fl ws-emp-form-field full">
                <label>Description</label>
                <textarea
                  className="fi"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Additional notes, line items, or approval context…"
                />
              </div>
              <div className="fl ws-emp-form-field full">
                <label>Expense category *</label>
                <select className="fi" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
                {selectedCategory?.description && (
                  <p className="ws-fin-field-hint">{selectedCategory.description}</p>
                )}
              </div>
              <div className="fl">
                <label>Vendor / Payee</label>
                <input
                  className="fi"
                  value={form.vendor}
                  onChange={(e) => set('vendor', e.target.value)}
                  placeholder="Who was paid"
                />
              </div>
              <div className="fl">
                <label>Amount (INR) *</label>
                <input
                  className="fi"
                  type="number"
                  min="0"
                  step="1"
                  value={form.amount}
                  onChange={(e) => set('amount', e.target.value)}
                  required
                />
              </div>
              <div className="fl">
                <label>Date</label>
                <input className="fi" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
              </div>
              <div className="fl">
                <label>Submitted by</label>
                <input
                  className="fi"
                  value={form.submittedBy}
                  onChange={(e) => set('submittedBy', e.target.value)}
                />
              </div>
              {isEdit && (
                <div className="fl">
                  <label>Status</label>
                  <select className="fi" value={form.status} onChange={(e) => set('status', e.target.value)}>
                    {['pending', 'approved', 'rejected', 'paid'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card ws-hr-panel ws-fin-expense-form-section ws-fin-expense-bills-panel">
          <div className="ws-hr-panel-head ws-fin-panel-head-compact">
            <h2 className="ws-hr-panel-title">Bills & receipts</h2>
          </div>
          <div className="ws-hr-panel-body ws-fin-bill-upload-section">
            <p className="ws-fin-field-hint mb12">
              Attach invoices, receipts, or payment proofs (PDF, JPG, PNG). Max 5 MB per file.
            </p>

            {billError && <div className="ws-emp-form-error mb12">{billError}</div>}

            {bills.length > 0 && (
              <ul className="ws-fin-bill-list">
                {bills.map((bill) => (
                  <li key={bill.id} className="ws-fin-bill-item">
                    <AppIcon icon={Icons.fileText} size={16} className="ws-fin-bill-icon" />
                    <div className="ws-fin-bill-meta">
                      <span className="ws-fin-bill-name">{bill.fileName}</span>
                      <span className="ws-fin-bill-size">{formatFileSize(bill.size)}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm ws-fin-bill-remove"
                      onClick={() => removeBill(bill.id)}
                      aria-label={`Remove ${bill.fileName}`}
                    >
                      <AppIcon icon={Icons.trash} size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label className="ws-fin-bill-dropzone">
              <AppIcon icon={Icons.upload} size={20} />
              <span className="ws-fin-bill-dropzone-title">Upload bills</span>
              <span className="ws-fin-bill-dropzone-hint">Click to browse or drop files here</span>
              <input
                type="file"
                accept={ACCEPTED_BILLS}
                multiple
                className="ws-emp-file-input"
                onChange={handleBillFiles}
              />
            </label>
          </div>
        </div>
        </div>

        <div className="ws-fin-expense-form-foot">
          <Link to="/workspace/finance/expenses" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="ws-hr-btn-primary sm" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
