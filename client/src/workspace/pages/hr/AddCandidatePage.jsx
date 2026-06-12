import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

const SOURCES = ['LinkedIn', 'Referral', 'Careers Page', 'Behance', 'Other'];
const INTERVIEW_TYPES = ['Video Call', 'In Person', 'Phone'];
const DURATIONS = ['30 min', '45 min', '60 min', '90 min'];
const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const RESUME_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  jobId: '',
  source: 'LinkedIn',
  reference: '',
  experience: '',
  currentRole: '',
  notes: '',
  stage: 'applied',
  scheduleInterview: false,
  interviewStage: 'screening',
  scheduledAt: '',
  duration: '60 min',
  type: 'Video Call',
  location: 'Google Meet',
  interviewerIds: [],
};

function formatDatetimeLocal(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AddCandidatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ ...EMPTY_FORM, jobId: searchParams.get('jobId') || '' });
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [resume, setResume] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getHrJobs(), api.getHrEmployees()])
      .then(([j, e]) => {
        setJobs(j);
        setEmployees(e);
        if (!form.jobId && j.length) {
          setForm((f) => ({ ...f, jobId: j[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = /\.(pdf|doc|docx)$/i.test(file.name) || file.type.includes('pdf') || file.type.includes('word');
    if (!allowed) {
      setError('Resume must be a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setError('Resume must be under 10 MB');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setResume({
        fileName: file.name,
        url: reader.result,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearResume = () => setResume(null);

  const toggleInterviewer = (id) => {
    setForm((f) => ({
      ...f,
      interviewerIds: f.interviewerIds.includes(id)
        ? f.interviewerIds.filter((x) => x !== id)
        : [...f.interviewerIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        jobId: form.jobId,
        source: form.source,
        reference: form.reference,
        experience: form.experience,
        currentRole: form.currentRole,
        resume: resume || undefined,
        notes: form.notes,
        stage: form.stage,
      };

      if (form.scheduleInterview && form.scheduledAt && form.interviewerIds.length) {
        payload.interview = {
          stage: form.interviewStage,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          duration: form.duration,
          type: form.type,
          location: form.location,
          interviewerIds: form.interviewerIds,
        };
        payload.assignedInterviewers = form.interviewerIds;
      }

      const created = await api.createHrCandidate(payload);
      navigate(`/workspace/hr/recruitment/candidates/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to add candidate');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ws-hr-page">
      <Link to="/workspace/hr/recruitment/candidates" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Candidates
      </Link>

      <div className="ws-admin-head mb16">
        <div>
          <h1 className="ws-page-title">Add Candidate</h1>
          <p className="ws-page-subtitle">Add a new applicant and optionally schedule their first interview</p>
        </div>
      </div>

      <div className="card ws-emp-add-form-card">
        <form onSubmit={handleSubmit} className="ws-emp-add-form">
          {error && <div className="ws-emp-form-error">{error}</div>}

          <h2 className="ws-emp-form-section-title">Candidate Details</h2>
          <div className="ws-emp-form-grid">
            <div className="ws-emp-form-field full">
              <label className="fl">Full Name *</label>
              <input className="fi" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Arjun Mehta" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Email *</label>
              <input className="fi" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Phone</label>
              <input className="fi" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Position *</label>
              <select className="fi" required value={form.jobId} onChange={(e) => set('jobId', e.target.value)}>
                <option value="">Select opening</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Experience</label>
              <input className="fi" value={form.experience} onChange={(e) => set('experience', e.target.value)} placeholder="e.g. 5 years" />
            </div>
            <div className="ws-emp-form-field full">
              <label className="fl">Current Role</label>
              <input className="fi" value={form.currentRole} onChange={(e) => set('currentRole', e.target.value)} placeholder="e.g. Senior Developer at TechCorp" />
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Source</label>
              <select className="fi" value={form.source} onChange={(e) => set('source', e.target.value)}>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Reference</label>
              <input
                className="fi"
                value={form.reference}
                onChange={(e) => set('reference', e.target.value)}
                placeholder={form.source === 'Referral' ? 'Who referred this candidate?' : 'Referrer name (optional)'}
              />
            </div>
            <div className="ws-emp-form-field full">
              <label className="fl">Resume</label>
              <div className="ws-cand-resume-upload">
                {resume ? (
                  <div className="ws-cand-resume-file">
                    <div className="ws-cand-resume-file-info">
                      <AppIcon icon={Icons.fileText} size={18} />
                      <div>
                        <span className="ws-cand-resume-name">{resume.fileName}</span>
                        <span className="ws-cand-resume-size">{(resume.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <div className="ws-cand-resume-file-actions">
                      <label className="btn btn-ghost btn-sm ws-emp-file-label">
                        Replace
                        <input type="file" accept={RESUME_ACCEPT} className="ws-emp-file-input" onChange={handleResumeChange} />
                      </label>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={clearResume}>
                        <AppIcon icon={Icons.trash} size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="ws-cand-resume-dropzone ws-emp-file-label">
                    <AppIcon icon={Icons.upload} size={22} />
                    <span className="ws-cand-resume-drop-title">Upload resume</span>
                    <span className="ws-emp-field-hint">PDF or Word · max 10 MB</span>
                    <input type="file" accept={RESUME_ACCEPT} className="ws-emp-file-input" onChange={handleResumeChange} />
                  </label>
                )}
              </div>
            </div>
            <div className="ws-emp-form-field">
              <label className="fl">Pipeline Stage</label>
              <select className="fi" value={form.stage} onChange={(e) => set('stage', e.target.value)}>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
              </select>
            </div>
            <div className="ws-emp-form-field full">
              <label className="fl">Notes</label>
              <textarea className="fi" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Internal notes about the candidate" />
            </div>
          </div>

          <div className="ws-cand-interview-section">
            <label className="ws-cand-schedule-toggle">
              <input
                type="checkbox"
                checked={form.scheduleInterview}
                onChange={(e) => set('scheduleInterview', e.target.checked)}
              />
              <span>
                <strong>Schedule interview</strong>
                <span className="ws-emp-field-hint">Assign interviewers and set date &amp; time</span>
              </span>
            </label>

            {form.scheduleInterview && (
              <div className="ws-cand-interview-form">
                <div className="ws-emp-form-grid">
                  <div className="ws-emp-form-field">
                    <label className="fl">Interview Stage</label>
                    <select className="fi" value={form.interviewStage} onChange={(e) => set('interviewStage', e.target.value)}>
                      <option value="screening">Screening</option>
                      <option value="technical">Technical Interview</option>
                      <option value="culture">Culture Fit</option>
                    </select>
                  </div>
                  <div className="ws-emp-form-field">
                    <label className="fl">Date &amp; Time *</label>
                    <input
                      className="fi"
                      type="datetime-local"
                      required={form.scheduleInterview}
                      value={form.scheduledAt}
                      min={formatDatetimeLocal(new Date())}
                      onChange={(e) => set('scheduledAt', e.target.value)}
                    />
                  </div>
                  <div className="ws-emp-form-field">
                    <label className="fl">Duration</label>
                    <select className="fi" value={form.duration} onChange={(e) => set('duration', e.target.value)}>
                      {DURATIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ws-emp-form-field">
                    <label className="fl">Type</label>
                    <select className="fi" value={form.type} onChange={(e) => set('type', e.target.value)}>
                      {INTERVIEW_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ws-emp-form-field full">
                    <label className="fl">Location / Link</label>
                    <input className="fi" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Google Meet, Zoom, or office room" />
                  </div>
                  <div className="ws-emp-form-field full">
                    <label className="fl">Interviewers *</label>
                    <div className="ws-cand-interviewer-picks">
                      {employees.map((emp) => (
                        <label key={emp.id} className={`ws-cand-interviewer-pick${form.interviewerIds.includes(emp.id) ? ' selected' : ''}`}>
                          <input
                            type="checkbox"
                            checked={form.interviewerIds.includes(emp.id)}
                            onChange={() => toggleInterviewer(emp.id)}
                          />
                          <span className="ws-hr-avatar sm">{emp.ini}</span>
                          <span>
                            <span className="ws-cand-interviewer-name">{emp.name}</span>
                            <span className="ws-cand-interviewer-role">{emp.role}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="ws-emp-form-actions">
            <Link to="/workspace/hr/recruitment/candidates" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="ws-hr-btn-primary" disabled={saving}>
              {saving ? 'Adding…' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
