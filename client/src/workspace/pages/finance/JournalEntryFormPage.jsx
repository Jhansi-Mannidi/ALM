import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import FinancePageHeader from './FinancePageHeader';

const EMPTY = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  reference: '',
  debitAccountId: '',
  creditAccountId: '',
  amount: '',
};

export default function JournalEntryFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [entryNo, setEntryNo] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getFinanceAccounts().then(setAccounts).catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api.getFinanceJournalEntry(id)
      .then((entry) => {
        if (entry.status !== 'draft') {
          setError('Only draft entries can be edited');
        }
        const debitLine = entry.lines?.find((l) => l.debit > 0);
        const creditLine = entry.lines?.find((l) => l.credit > 0);
        setEntryNo(entry.entryNo || '');
        setForm({
          date: entry.date?.slice(0, 10) || '',
          description: entry.description || '',
          reference: entry.reference || '',
          debitAccountId: debitLine?.accountId || '',
          creditAccountId: creditLine?.accountId || '',
          amount: String(debitLine?.debit || creditLine?.credit || ''),
        });
      })
      .catch(() => setError('Journal entry not found'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!form.debitAccountId || !form.creditAccountId) {
      setError('Select debit and credit accounts');
      return;
    }
    if (!form.description.trim()) {
      setError('Description is required');
      return;
    }
    setSaving(true);
    setError('');
    const lines = [
      { accountId: form.debitAccountId, debit: amount, credit: 0 },
      { accountId: form.creditAccountId, debit: 0, credit: amount },
    ];
    try {
      if (isEdit) {
        await api.updateFinanceJournalEntry(id, {
          date: form.date,
          description: form.description.trim(),
          reference: form.reference.trim(),
          lines,
        });
      } else {
        await api.createFinanceJournalEntry({
          date: form.date,
          description: form.description.trim(),
          reference: form.reference.trim(),
          post: true,
          lines,
        });
      }
      navigate('/workspace/finance/ledger');
    } catch (err) {
      setError(err.message || 'Failed to save journal entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-expense-form-page">
      <Link to="/workspace/finance/ledger" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Journal
      </Link>

      <FinancePageHeader
        title={isEdit ? `Edit ${entryNo || 'Journal Entry'}` : 'New Journal Entry'}
        subtitle="Double-entry journal — debits must equal credits"
        breadcrumbs={[
          { label: 'Finance', path: '/workspace/finance' },
          { label: 'Manual Journals', path: '/workspace/finance/ledger' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      {loading ? (
        <p className="ws-page-subtitle">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="ws-fin-expense-form">
          {error && <div className="ws-emp-form-error mb16">{error}</div>}
          <div className="card ws-hr-panel ws-fin-expense-form-section">
            <div className="ws-hr-panel-body">
              <div className="ws-fin-je-form-grid">
                <div className="fl">
                  <label>Date *</label>
                  <input className="fi" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
                </div>
                <div className="fl">
                  <label>Reference</label>
                  <input className="fi" placeholder="e.g. INV-2025-042" value={form.reference} onChange={(e) => set('reference', e.target.value)} />
                </div>
                <div className="fl ws-fin-je-form-wide">
                  <label>Description *</label>
                  <input className="fi" placeholder="Transaction description" value={form.description} onChange={(e) => set('description', e.target.value)} required />
                </div>
                <div className="fl">
                  <label>Debit account *</label>
                  <select className="fi" value={form.debitAccountId} onChange={(e) => set('debitAccountId', e.target.value)} required>
                    <option value="">Select account</option>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                  </select>
                </div>
                <div className="fl">
                  <label>Credit account *</label>
                  <select className="fi" value={form.creditAccountId} onChange={(e) => set('creditAccountId', e.target.value)} required>
                    <option value="">Select account</option>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                  </select>
                </div>
                <div className="fl">
                  <label>Amount (INR) *</label>
                  <input className="fi" type="number" min="1" value={form.amount} onChange={(e) => set('amount', e.target.value)} required />
                </div>
              </div>
            </div>
          </div>
          <div className="ws-fin-expense-form-foot">
            <Link to="/workspace/finance/ledger" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="ws-hr-btn-primary sm" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Post Entry'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
