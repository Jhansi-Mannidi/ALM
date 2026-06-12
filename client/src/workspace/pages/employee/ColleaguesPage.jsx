import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ColleaguesPage() {
  const [colleagues, setColleagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .getEmployeeColleagues()
      .then(setColleagues)
      .catch(() => setColleagues([]))
      .finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = colleagues.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q),
  );

  return (
    <div className="ws-hr-page ws-emp-portal-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Colleagues</h1>
          <p className="ws-page-subtitle">Directory of active team members</p>
        </div>
      </div>

      <div className="ws-emp-search-bar">
        <AppIcon icon={Icons.search} size={16} />
        <input
          className="fi"
          placeholder="Search by name, role, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-body">
          {loading ? (
            <p className="ws-page-subtitle">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="ws-hr-ops-empty">
              <AppIcon icon={Icons.users} size={28} />
              <p>No colleagues found</p>
            </div>
          ) : (
            <div className="ws-hr-table-wrap">
              <table className="ws-hr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="ws-hr-hike-emp">
                          <div className="ws-hr-avatar sm">{c.ini}</div>
                          <span className="ws-hr-action-name">{c.name}</span>
                        </div>
                      </td>
                      <td>{c.role}</td>
                      <td>{c.department}</td>
                      <td>{c.location || '—'}</td>
                      <td>{formatDate(c.joinedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
