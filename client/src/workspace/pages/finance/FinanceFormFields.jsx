import { EXPENSE_CATEGORIES } from '../../data/financeCatalog';

export function buildEmptyForm(fields) {
  const form = {};
  for (const f of fields) {
    if (f.type === 'date') form[f.key] = new Date().toISOString().slice(0, 10);
    else if (f.type === 'select' && f.options?.length) form[f.key] = f.options[0];
    else if (f.default != null) form[f.key] = f.default;
    else form[f.key] = '';
  }
  return form;
}

export function rowToForm(fields, row) {
  const next = {};
  for (const f of fields) {
    let val = row[f.key];
    if (f.type === 'date' && val) val = String(val).slice(0, 10);
    if (f.key === 'billable' || f.key === 'reconciled') val = String(val);
    if (f.key === 'amount' && typeof val === 'number') val = String(Math.abs(val));
    if (f.type === 'number' && typeof val === 'number') val = String(val);
    next[f.key] = val ?? '';
  }
  return next;
}

export default function FinanceFormFields({
  fields,
  form,
  setForm,
  bankAccounts = [],
  accountTypes = [],
}) {
  return (
    <div className="ws-emp-form-grid ws-fin-expense-fields">
      {fields.map((f) => {
        if (f.showOnEdit === false && !form._isEdit) return null;
        if (f.showOnCreate === false && form._isEdit) return null;

        return (
          <div key={f.key} className={`fl${f.full ? ' ws-emp-form-field full' : ''}`}>
            <label>{f.label}{f.required ? ' *' : ''}</label>
            {f.type === 'textarea' ? (
              <textarea
                className="fi"
                rows={f.rows || 3}
                value={form[f.key] ?? ''}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
              />
            ) : f.type === 'select' ? (
              <select className="fi" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                {f.options.map((o) => {
                  const val = typeof o === 'object' ? o.value : o;
                  const label = typeof o === 'object' ? o.label : o;
                  return <option key={val} value={val}>{label}</option>;
                })}
              </select>
            ) : f.type === 'expenseCategory' ? (
              <select className="fi" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            ) : f.type === 'accountType' ? (
              <select className="fi" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                {accountTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            ) : f.key === 'bankAccountId' && bankAccounts.length ? (
              <select className="fi" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                <option value="">Select account</option>
                {bankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            ) : (
              <input
                className="fi"
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'email' ? 'email' : 'text'}
                min={f.type === 'number' ? f.min ?? '0' : undefined}
                step={f.type === 'number' ? f.step ?? '1' : undefined}
                placeholder={f.placeholder}
                value={form[f.key] ?? ''}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            )}
            {f.hint && <p className="ws-fin-field-hint">{f.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}
