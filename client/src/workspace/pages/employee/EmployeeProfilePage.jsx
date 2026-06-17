import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { useApp } from '../../../context/AppContext';
import PageHeader from '../../../components/PageHeader';
import { AppIcon, Icons } from '../../../components/icons';
import { EmployeeAvatar } from '../hr/EmployeeModals';

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function buildDraft(employee) {
  return {
    phone: employee.phone || '',
    location: employee.location || '',
    bio: employee.bio || '',
    skills: (employee.skills || []).join(', '),
  };
}

function CopyButton({ value, label = 'Copy' }) {
  const { toast } = useApp();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast('Copied to clipboard', 'ok');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Could not copy', 'err');
    }
  };

  return (
    <button
      type="button"
      className={`ws-emp-copy-btn${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      title={label}
      aria-label={label}
    >
      <AppIcon icon={copied ? Icons.checkCircle : Icons.copy} size={14} />
    </button>
  );
}

function DetailRow({ icon, label, value, copyValue }) {
  return (
    <div className="ws-cand-detail-row ws-emp-profile-row">
      {icon && (
        <span className="ws-cand-detail-icon">
          <AppIcon icon={icon} size={14} />
        </span>
      )}
      <span className="ws-cand-detail-label">{label}</span>
      <span className="ws-cand-detail-value ws-emp-profile-value">
        <span>{value}</span>
        {copyValue && <CopyButton value={copyValue} label={`Copy ${label.toLowerCase()}`} />}
      </span>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { toast } = useApp();
  const [employee, setEmployee] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ phone: '', location: '', bio: '', skills: '' });
  const [error, setError] = useState('');

  const load = () => {
    api
      .getEmployeePortal()
      .then((d) => {
        setEmployee(d.employee);
        setDraft(buildDraft(d.employee));
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = () => {
    if (!employee) return;
    setDraft(buildDraft(employee));
    setError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    if (employee) setDraft(buildDraft(employee));
    setError('');
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateEmployeeProfile({
        phone: draft.phone.trim(),
        location: draft.location.trim(),
        bio: draft.bio.trim(),
        skills: draft.skills,
      });
      setEmployee(updated);
      setDraft(buildDraft(updated));
      setEditing(false);
      toast('Profile updated', 'ok');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!employee) {
    return (
      <div className="ws-hr-page ws-emp-portal-page">
        <p className="ws-page-subtitle">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="ws-hr-page ws-emp-portal-page">
      <PageHeader
        title="My Profile"
        subtitle="Your employment and contact information"
        actions={
          editing ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="ws-hr-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </>
          ) : (
            <button type="button" className="ws-hr-btn-primary" onClick={startEdit}>
              <AppIcon icon={Icons.pencil} size={14} />
              Edit profile
            </button>
          )
        }
      />

      <div className="card ws-emp-profile-hero">
        <div className="ws-emp-profile-hero-inner">
          <EmployeeAvatar employee={employee} className="xl" />
          <div className="fx1">
            <h2 className="ws-page-title">{employee.name}</h2>
            <p className="ws-page-subtitle">{employee.role}</p>
            <div className="ws-emp-detail-badges mt8">
              <span className="chip chip-gray">{employee.department}</span>
              <span className="chip chip-gray">{employee.employmentType}</span>
              <span className="chip chip-gray">{employee.employeeId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ws-hr-grid-2">
        <div className="card ws-hr-panel ws-hr-panel--structured">
          <div className="ws-hr-panel-head">
            <h2 className="ws-hr-panel-title">Contact</h2>
          </div>
          <div className="ws-hr-panel-body">
            <DetailRow
              icon={Icons.mail}
              label="Email"
              value={employee.email}
              copyValue={employee.email}
            />
            {editing ? (
              <>
                <div className="fl ws-emp-profile-field">
                  <label>Phone</label>
                  <div className="ws-emp-profile-input-row">
                    <input
                      className="fi"
                      type="tel"
                      value={draft.phone}
                      onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                    {draft.phone && <CopyButton value={draft.phone} label="Copy phone" />}
                  </div>
                </div>
                <div className="fl ws-emp-profile-field">
                  <label>Location</label>
                  <input
                    className="fi"
                    type="text"
                    value={draft.location}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                    placeholder="City"
                  />
                </div>
              </>
            ) : (
              <>
                <DetailRow
                  icon={Icons.phone}
                  label="Phone"
                  value={employee.phone || '—'}
                  copyValue={employee.phone || undefined}
                />
                <DetailRow icon={Icons.mapPin} label="Location" value={employee.location} />
              </>
            )}
          </div>
        </div>

        <div className="card ws-hr-panel ws-hr-panel--structured">
          <div className="ws-hr-panel-head">
            <h2 className="ws-hr-panel-title">Employment</h2>
          </div>
          <div className="ws-hr-panel-body">
            <DetailRow label="Employee ID" value={employee.employeeId} />
            <DetailRow label="Department" value={employee.department} />
            <DetailRow label="Joined" value={formatDate(employee.joinedAt)} />
            <DetailRow label="Tenure" value={employee.tenure || '—'} />
            <DetailRow label="Reports To" value={employee.reportsTo?.name || '—'} />
          </div>
        </div>

        <div className="card ws-hr-panel ws-hr-panel--structured" style={{ gridColumn: '1 / -1' }}>
          <div className="ws-hr-panel-head">
            <h2 className="ws-hr-panel-title">About</h2>
          </div>
          <div className="ws-hr-panel-body">
            {editing ? (
              <>
                <div className="fl ws-emp-profile-field">
                  <label>Bio</label>
                  <textarea
                    className="fi"
                    rows={4}
                    value={draft.bio}
                    onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                    placeholder="Short professional summary"
                  />
                </div>
                <div className="fl ws-emp-profile-field">
                  <label>Skills</label>
                  <input
                    className="fi"
                    type="text"
                    value={draft.skills}
                    onChange={(e) => setDraft({ ...draft, skills: e.target.value })}
                    placeholder="Comma-separated, e.g. React, Node.js, PostgreSQL"
                  />
                </div>
              </>
            ) : (
              <>
                <p className="ws-hr-ops-reason-text">{employee.bio || '—'}</p>
                {employee.skills?.length > 0 && (
                  <div className="ws-emp-detail-badges mt12">
                    {employee.skills.map((skill) => (
                      <span key={skill} className="chip chip-gray">{skill}</span>
                    ))}
                  </div>
                )}
              </>
            )}
            {error && <div className="ws-emp-form-error mt12">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
