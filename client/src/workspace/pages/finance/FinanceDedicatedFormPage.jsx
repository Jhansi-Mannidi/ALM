import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppIcon, Icons } from '../../../components/icons';
import FinanceFormFields from './FinanceFormFields';
import FinancePageHeader from './FinancePageHeader';
import { getDedicatedFormConfig } from './financeDedicatedForms';

export default function FinanceDedicatedFormPage({ entity }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const config = getDedicatedFormConfig(entity);

  const [form, setForm] = useState({});
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!config) return;
    if (!isEdit) {
      setForm({ ...(config.emptyForm(searchParams)), _isEdit: false });
      return;
    }
    setLoading(true);
    config.load(id)
      .then((row) => {
        setRecord(row);
        setForm({ ...config.mapToForm(row), _isEdit: true });
      })
      .catch(() => setError('Record not found'))
      .finally(() => setLoading(false));
  }, [config, entity, id, isEdit, searchParams]);

  if (!config) {
    return (
      <div className="ws-hr-page ws-fin-page">
        <p className="ws-page-subtitle">Unknown form.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = config.validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = config.toPayload(form);
      if (isEdit) await config.update(id, payload);
      else await config.create(payload);
      navigate(config.listPath);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = isEdit
    ? (record ? config.editTitle(record) : `Edit ${config.title}`)
    : config.addLabel;

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-expense-form-page">
      <Link to={config.listPath} className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to {config.listTitle || config.title}
      </Link>

      <FinancePageHeader
        title={pageTitle}
        subtitle={config.subtitle}
        breadcrumbs={[
          { label: 'Finance', path: '/workspace/finance' },
          { label: config.title, path: config.listPath },
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
                accountTypes={config.accountTypes}
              />
            </div>
          </div>
          <div className="ws-fin-expense-form-foot">
            <Link to={config.listPath} className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="ws-hr-btn-primary sm" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : config.addLabel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
