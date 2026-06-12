import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

const DEPARTMENTS = ['Engineering', 'Product', 'Marketing', 'HR & Admin', 'Sales', 'Design', 'Finance', 'Operations'];
const LOCATIONS = ['Hyderabad', 'Bangalore', 'Mumbai', 'Remote'];

const EMPTY_FORM = {
  name: '',
  role: '',
  department: 'Engineering',
  email: '',
  phone: '',
  location: 'Hyderabad',
  joiningDate: '',
  reportingToId: '',
  onboardingBuddyId: '',
  notes: '',
};

export default function AddNewHirePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [managers, setManagers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getHrEmployees().then(setManagers).catch(() => setManagers([]));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await api.createHrOnboardingHire(form);
      navigate(`/workspace/hr/onboarding/${created.id}/prerequisites`);
    } catch (err) {
      setError(err.message || 'Failed to add new hire');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ws-hr-page ws-onb-page">
      <Link to="/workspace/hr/onboarding" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Onboarding
      </Link>

      <div className="ws-admin-head mb16">
        <div>
          <h1 className="ws-page-title">Add New Hire</h1>
          <p className="ws-page-subtitle">Register an upcoming joiner and start pre-onboarding tasks</p>
        </div>
      </div>

      <div className="card ws-emp-add-form-card">
        <form onSubmit={handleSubmit} className="ws-emp-add-form">
          {error && <div className="ws-emp-form-error">{error}</div>}

          <div className="ws-emp-form-grid">
            <div className="ws-emp-form-field full">
              <label className="fl">Full Name *</label>
              <input className="fi" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Alex Kumar" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Designation *</label>
              <input className="fi" required value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Department *</label>
              <select className="fi" value={form.department} onChange={(e) => set('department', e.target.value)}>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Email</label>
              <input className="fi" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@voltuswave.io" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Phone</label>
              <input className="fi" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Location</label>
              <select className="fi" value={form.location} onChange={(e) => set('location', e.target.value)}>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Joining Date *</label>
              <input className="fi" type="date" required value={form.joiningDate} onChange={(e) => set('joiningDate', e.target.value)} />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Reporting To</label>
              <select className="fi" value={form.reportingToId} onChange={(e) => set('reportingToId', e.target.value)}>
                <option value="">Select manager</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Onboarding Buddy</label>
              <select className="fi" value={form.onboardingBuddyId} onChange={(e) => set('onboardingBuddyId', e.target.value)}>
                <option value="">Optional</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field full">
              <label className="fl">Notes</label>
              <textarea className="fi" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Offer details, referral info, or onboarding notes..." />
            </div>
          </div>

          <div className="ws-emp-form-foot">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/workspace/hr/onboarding')}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary" disabled={saving}>
              {saving ? 'Adding…' : 'Add New Hire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
