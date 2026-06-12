import { useEffect, useState } from 'react';
import { api } from '../../../api/client';

export default function FinanceSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ companyName: '', currency: 'INR', fiscalYearStart: '', taxRate: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getFinanceSettings().then((s) => {
      setSettings(s);
      setForm({
        companyName: s.companyName || '',
        currency: s.currency || 'INR',
        fiscalYearStart: s.fiscalYearStart || '',
        taxRate: String(s.taxRate ?? ''),
      });
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const updated = await api.updateFinanceSettings({
        ...form,
        taxRate: Number(form.taxRate),
      });
      setSettings(updated);
      setSaved(true);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  if (!settings) {
    return (
      <div className="ws-hr-page ws-fin-page">
        <p className="ws-page-subtitle">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="ws-hr-page ws-fin-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Finance Settings</h1>
          <p className="ws-page-subtitle">Company and fiscal configuration</p>
        </div>
      </div>

      <div className="card ws-hr-panel ws-emp-ticket-form-card">
        <form onSubmit={handleSave} className="ws-hr-panel-body">
          <div className="ws-emp-form-grid">
            <div className="fl ws-emp-form-field full">
              <label>Company name</label>
              <input className="fi" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </div>
            <div className="fl">
              <label>Currency</label>
              <input className="fi" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
            <div className="fl">
              <label>Fiscal year start (MM-DD)</label>
              <input className="fi" placeholder="04-01" value={form.fiscalYearStart} onChange={(e) => setForm({ ...form, fiscalYearStart: e.target.value })} />
            </div>
            <div className="fl">
              <label>Default tax rate (%)</label>
              <input className="fi" type="number" min="0" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} />
            </div>
          </div>
          <div className="fx g8 mt16">
            <button type="submit" className="ws-hr-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</button>
            {saved && <span className="chip chip-green">Saved</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
