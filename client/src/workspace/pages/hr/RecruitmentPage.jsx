import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function uniqueValues(jobs, key) {
  return [...new Set(jobs.map((j) => j[key]).filter(Boolean))].sort();
}

export default function RecruitmentPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    api.getHrJobs().then(setJobs).catch(() => {});
  }, []);

  const departments = useMemo(() => uniqueValues(jobs, 'department'), [jobs]);
  const locations = useMemo(() => uniqueValues(jobs, 'location'), [jobs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((job) => {
      if (department && job.department !== department) return false;
      if (location && job.location !== location) return false;
      if (!q) return true;
      return (
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.type.toLowerCase().includes(q)
      );
    });
  }, [jobs, search, department, location]);

  return (
    <div className="ws-hr-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Recruitment</h1>
          <p className="ws-page-subtitle">Manage job openings and candidates</p>
        </div>
        <button
          type="button"
          className="ws-hr-btn-primary"
          onClick={() => navigate('/workspace/hr/recruitment/jobs/new')}
        >
          <AppIcon icon={Icons.plus} size={14} />
          Create Job Opening
        </button>
      </div>

      <div className="ws-emp-filters card">
        <div className="ws-emp-filters-row">
          <div className="ws-emp-search-wrap">
            <AppIcon icon={Icons.search} size={15} className="ws-emp-search-icon" />
            <input
              type="search"
              className="ws-emp-search"
              placeholder="Search by title, department, location, or type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="ws-emp-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select className="ws-emp-select" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ws-emp-results-meta">
        Showing <strong>{filtered.length}</strong> of {jobs.length} job openings
      </div>

      <div className="ws-hr-job-list">
        {filtered.length === 0 ? (
          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-body">
              <div className="ws-hr-ops-empty">
                <AppIcon icon={Icons.search} size={28} />
                <p>No job openings match your search</p>
              </div>
            </div>
          </div>
        ) : (
        filtered.map((job) => (
          <div key={job.id} className="card ws-hr-job-card">
            <div className="ws-hr-job-head">
              <div>
                <h3 className="ws-hr-job-title">{job.title}</h3>
                <div className="ws-hr-job-tags">
                  <span className="chip chip-gray">{job.department}</span>
                  <span className="chip chip-blue">{job.type}</span>
                  <span className="chip chip-gray">{job.location}</span>
                </div>
              </div>
              <Link to={`/workspace/hr/recruitment/jobs/${job.id}`} className="btn btn-ghost btn-sm">
                View Details
              </Link>
            </div>

            <div className="ws-hr-job-stats">
              <div className="ws-hr-job-stat">
                <span className="ws-hr-job-stat-label">Posted</span>
                <span>{formatDate(job.postedAt)}</span>
              </div>
              <div className="ws-hr-job-stat">
                <span className="ws-hr-job-stat-label">Applications</span>
                <span className="ws-hr-job-stat-value">{job.applications}</span>
              </div>
              <div className="ws-hr-job-stat">
                <span className="ws-hr-job-stat-label">Shortlisted</span>
                <span className="ws-hr-job-stat-value">{job.shortlisted}</span>
              </div>
              <div className="ws-hr-job-stat">
                <span className="ws-hr-job-stat-label">Interviews</span>
                <span className="ws-hr-job-stat-value">{job.interviews}</span>
              </div>
            </div>

            <div className="ws-hr-job-actions">
              <Link to={`/workspace/hr/recruitment/candidates?jobId=${job.id}`} className="ws-hr-btn-primary">
                View Candidates
              </Link>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
