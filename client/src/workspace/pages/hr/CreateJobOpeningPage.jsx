import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

const DEPARTMENTS = ['Engineering', 'Product', 'Marketing', 'HR & Admin', 'Sales', 'Design', 'Finance', 'Operations'];
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const LOCATIONS = ['Hyderabad', 'Bangalore', 'Mumbai', 'Remote'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'];
const STATUS_OPTIONS = [
  { value: 'open', label: 'Open — publish immediately' },
  { value: 'draft', label: 'Draft — save without publishing' },
];

const EMPTY_FORM = {
  title: '',
  department: 'Engineering',
  type: 'Full-time',
  location: 'Hyderabad',
  hiringManagerId: '',
  experienceLevel: 'Mid Level',
  salary: '',
  postedAt: new Date().toISOString().slice(0, 10),
  status: 'open',
  description: '',
  requirements: '',
};

export default function CreateJobOpeningPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [managers, setManagers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getHrEmployees().then((emps) => {
      setManagers(emps);
      if (emps.length) {
        setForm((f) => ({ ...f, hiringManagerId: emps[0].id }));
      }
    }).catch(() => setManagers([]));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await api.createHrJob(form);
      navigate(`/workspace/hr/recruitment/jobs/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create job opening');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ws-hr-page">
      <Link to="/workspace/hr/recruitment" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Recruitment
      </Link>

      <div className="ws-admin-head mb16">
        <div>
          <h1 className="ws-page-title">Create Job Opening</h1>
          <p className="ws-page-subtitle">Define the role, requirements, and posting details</p>
        </div>
      </div>

      <div className="card ws-emp-add-form-card">
        <form onSubmit={handleSubmit} className="ws-emp-add-form">
          {error && <div className="ws-emp-form-error">{error}</div>}

          <h2 className="ws-emp-form-section-title">Role Information</h2>
          <div className="ws-emp-form-grid">
            <div className="ws-emp-form-field full">
              <label className="fl">Job Title *</label>
              <input
                className="fi"
                required
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Department *</label>
              <select className="fi" required value={form.department} onChange={(e) => set('department', e.target.value)}>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Employment Type</label>
              <select className="fi" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Location *</label>
              <select className="fi" required value={form.location} onChange={(e) => set('location', e.target.value)}>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Experience Level</label>
              <select className="fi" value={form.experienceLevel} onChange={(e) => set('experienceLevel', e.target.value)}>
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Hiring Manager</label>
              <select className="fi" value={form.hiringManagerId} onChange={(e) => set('hiringManagerId', e.target.value)}>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="ws-emp-form-section-title">Job Description</h2>
          <div className="ws-emp-form-grid">
            <div className="ws-emp-form-field full">
              <label className="fl">Description</label>
              <textarea
                className="fi"
                rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe the role, team, and key responsibilities..."
              />
            </div>
            <div className="ws-emp-form-field full">
              <label className="fl">Requirements</label>
              <textarea
                className="fi"
                rows={4}
                value={form.requirements}
                onChange={(e) => set('requirements', e.target.value)}
                placeholder="List skills, qualifications, and experience needed..."
              />
            </div>
          </div>

          <h2 className="ws-emp-form-section-title">Compensation &amp; Posting</h2>
          <div className="ws-emp-form-grid">
            <div className="ws-emp-form-field">
              <label className="fl">Salary Range</label>
              <input
                className="fi"
                value={form.salary}
                onChange={(e) => set('salary', e.target.value)}
                placeholder="e.g. ₹18–24 LPA"
              />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Posting Date</label>
              <input
                className="fi"
                type="date"
                value={form.postedAt}
                onChange={(e) => set('postedAt', e.target.value)}
              />
            </div>
            <div className="ws-emp-form-field full">
              <label className="fl">Status</label>
              <div className="ws-job-status-options">
                {STATUS_OPTIONS.map((opt) => (
                  <label key={opt.value} className={`ws-job-status-option${form.status === opt.value ? ' selected' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={form.status === opt.value}
                      onChange={(e) => set('status', e.target.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="ws-emp-form-foot">
            <Link to="/workspace/hr/recruitment" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="ws-hr-btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create Job Opening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
