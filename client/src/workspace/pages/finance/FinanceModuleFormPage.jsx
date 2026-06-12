import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { EXPENSE_CATEGORIES } from '../../data/financeCatalog';
import { getModuleConfig } from '../../data/financeModuleConfig';
import FinanceFormFields, { buildEmptyForm, rowToForm } from './FinanceFormFields';
import FinancePageHeader from './FinancePageHeader';

export default function FinanceModuleFormPage() {
  const { moduleKey, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const config = getModuleConfig(moduleKey);

  const [form, setForm] = useState({});
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const listPath = useMemo(() => {
    if (searchParams.get('from') === 'banking') return '/workspace/finance/banking';
    return `/workspace/finance/m/${moduleKey}`;
  }, [moduleKey, searchParams]);

  useEffect(() => {
    if (!config) return;
    if (!isEdit) {
      const empty = buildEmptyForm(config.fields);
      const bankAccountId = searchParams.get('bankAccountId');
      if (bankAccountId) empty.bankAccountId = bankAccountId;
      setForm({ ...empty, _isEdit: false });
      return;
    }
    setLoading(true);
    api.getFinanceModuleRecord(moduleKey, id)
      .then((row) => setForm({ ...rowToForm(config.fields, row), _isEdit: true }))
      .catch(() => setError('Record not found'))
      .finally(() => setLoading(false));
  }, [config, moduleKey, id, isEdit]);

  useEffect(() => {
    if (moduleKey === 'bank-transactions' || searchParams.get('from') === 'banking') {
      api.getFinanceModule('bank-accounts').then(setBankAccounts).catch(() => setBankAccounts([]));
    }
  }, [moduleKey, searchParams]);

  if (!config) {
    return (
      <div className="ws-hr-page ws-fin-page">
        <p className="ws-page-subtitle">Unknown finance module.</p>
      </div>
    );
  }

  const categoryHint = config.fields.find((f) => f.key === 'category' && f.type === 'expenseCategory');
  const selectedCategory = categoryHint
    ? EXPENSE_CATEGORIES.find((c) => c.id === form.category)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missing = config.fields.filter((f) => f.required && !String(form[f.key] ?? '').trim());
    if (missing.length) {
      setError(`${missing[0].label} is required`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      delete payload._isEdit;
      for (const f of config.fields) {
        if (f.type === 'number' && payload[f.key] !== '') payload[f.key] = Number(payload[f.key]);
      }
      if (isEdit) await api.updateFinanceModule(moduleKey, id, payload);
      else await api.createFinanceModule(moduleKey, payload);
      navigate(listPath);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = isEdit ? `Edit — ${config.title}` : config.addLabel;

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-expense-form-page">
      <Link to={listPath} className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to {config.title}
      </Link>

      <FinancePageHeader
        title={pageTitle}
        subtitle={config.subtitle}
        breadcrumbs={[
          { label: 'Finance', path: '/workspace/finance' },
          { label: config.title, path: listPath },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      {loading ? (
        <p className="ws-page-subtitle">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="ws-fin-expense-form">
          {error && <div className="ws-emp-form-error mb16">{error}</div>}
          <div className="card ws-hr-panel ws-fin-expense-form-section">
            <div className="ws-hr-panel-head ws-fin-panel-head-compact">
              <h2 className="ws-hr-panel-title">{config.title} details</h2>
            </div>
            <div className="ws-hr-panel-body">
              <FinanceFormFields
                fields={config.fields}
                form={form}
                setForm={setForm}
                bankAccounts={bankAccounts}
              />
              {selectedCategory?.description && (
                <p className="ws-fin-field-hint mt8">{selectedCategory.description}</p>
              )}
            </div>
          </div>
          <div className="ws-fin-expense-form-foot">
            <Link to={listPath} className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="ws-hr-btn-primary sm" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : config.addLabel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
