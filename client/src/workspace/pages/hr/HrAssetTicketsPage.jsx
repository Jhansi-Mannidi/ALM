import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import {
  ASSET_TICKET_TYPE_LABELS,
  TICKET_STATUS_CHIPS,
  TICKET_PRIORITY_CHIPS,
} from '../../data/employeeCatalog';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
];

const ASSIGN_OPTIONS = ['IT Support', 'Facilities', 'HR Admin'];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ResolveModal({ ticket, onClose, onSubmit, submitting }) {
  const [resolution, setResolution] = useState(ticket.resolution || '');
  const [hrNotes, setHrNotes] = useState(ticket.hrNotes || '');
  const [closeAfter, setCloseAfter] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolution.trim()) return;
    onSubmit({
      status: closeAfter ? 'closed' : 'resolved',
      resolution: resolution.trim(),
      hrNotes: hrNotes.trim(),
    });
  };

  return (
    <div className="modal-ov open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <h3 className="modal-title">Resolve ticket — {ticket.ticketNo}</h3>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <p className="ws-page-subtitle" style={{ marginBottom: 12 }}>
            {ticket.subject}
          </p>
          <label className="fl">
            Resolution summary
            <textarea
              className="fi"
              rows={3}
              placeholder="Describe what was done (e.g. replaced unit, repaired device)…"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              required
            />
          </label>
          <label className="fl">
            Internal notes (optional)
            <textarea
              className="fi"
              rows={2}
              placeholder="Notes visible to HR only…"
              value={hrNotes}
              onChange={(e) => setHrNotes(e.target.value)}
            />
          </label>
          <label className="ws-hr-check-row">
            <input
              type="checkbox"
              checked={closeAfter}
              onChange={(e) => setCloseAfter(e.target.checked)}
            />
            Close ticket immediately after resolving
          </label>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ws-hr-btn-primary" disabled={submitting || !resolution.trim()}>
              {closeAfter ? 'Resolve & close' : 'Mark resolved'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HrAssetTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [resolveTicket, setResolveTicket] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .getHrAssetTickets({ status: filter })
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleUpdate = async (id, data) => {
    setActingId(id);
    try {
      await api.updateHrAssetTicket(id, data);
      setResolveTicket(null);
      load();
    } catch {
      /* ignore */
    } finally {
      setActingId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      tickets.filter(
        (t) =>
          !q ||
          t.ticketNo.toLowerCase().includes(q) ||
          t.employee.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (ASSET_TICKET_TYPE_LABELS[t.type] || t.type).toLowerCase().includes(q),
      ),
    [tickets, q],
  );

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in-progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="ws-hr-page ws-hr-ops-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Employee asset tickets</h1>
          <p className="ws-page-subtitle">Triage requests, assign owners, and close the loop</p>
        </div>
      </div>

      {filter === 'all' && tickets.length > 0 && (
        <div className="ws-hr-stats ws-hr-ops-stats">
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{openCount}</div>
            <div className="ws-hr-stat-label">Open</div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{inProgressCount}</div>
            <div className="ws-hr-stat-label">In progress</div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{resolvedCount}</div>
            <div className="ws-hr-stat-label">Awaiting close</div>
          </div>
        </div>
      )}

      <div className="ws-emp-filters card">
        <div className="ws-emp-filters-row">
          <div className="ws-emp-search-wrap">
            <AppIcon icon={Icons.search} size={15} className="ws-emp-search-icon" />
            <input
              type="search"
              className="ws-emp-search"
              placeholder="Search ticket, employee, or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="ws-hr-ops-filters">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`ws-hr-ops-filter${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-body">
          {loading ? (
            <p className="ws-page-subtitle">Loading tickets…</p>
          ) : filtered.length === 0 ? (
            <div className="ws-hr-ops-empty">
              <AppIcon icon={Icons.wrench} size={28} />
              <p>No asset tickets match your filters</p>
            </div>
          ) : (
            <div className="ws-hr-ops-list">
              {filtered.map((ticket) => (
                <div key={ticket.id} className="ws-hr-ops-row">
                  <div className="ws-hr-avatar sm">{ticket.ini}</div>
                  <div className="ws-hr-ops-row-main">
                    <div className="ws-hr-ops-row-head">
                      <span className="ws-hr-action-name">{ticket.ticketNo}</span>
                      <span className="chip chip-gray">{ticket.employee}</span>
                      <span className="chip chip-gray">
                        {ASSET_TICKET_TYPE_LABELS[ticket.type] || ticket.type}
                      </span>
                      <span className={`chip ${TICKET_PRIORITY_CHIPS[ticket.priority] || 'chip-gray'}`}>
                        {ticket.priority}
                      </span>
                      <span className={`chip ${TICKET_STATUS_CHIPS[ticket.status] || 'chip-gray'}`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="ws-hr-action-desc">{ticket.subject}</div>
                    <div className="ws-hr-ops-details">{ticket.description}</div>
                    <div className="ws-hr-ops-meta">
                      <span>{ticket.category}</span>
                      {ticket.relatedAssetName && <span>Asset: {ticket.relatedAssetName}</span>}
                      <span>Created {formatDate(ticket.createdAt)}</span>
                      {ticket.assignedTo && <span>Assigned to {ticket.assignedTo}</span>}
                      {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                        <span>Updated {formatDate(ticket.updatedAt)}</span>
                      )}
                      {ticket.resolvedAt && <span>Resolved {formatDate(ticket.resolvedAt)}</span>}
                    </div>
                    {ticket.resolution && (
                      <p className="ws-hr-ops-resolve-note">Resolution: {ticket.resolution}</p>
                    )}
                    {ticket.hrNotes && (
                      <p className="ws-hr-ops-reject-note">HR note: {ticket.hrNotes}</p>
                    )}
                  </div>
                  <div className="ws-hr-ops-row-actions ws-hr-ticket-actions">
                    {ticket.status === 'open' && (
                      <>
                        <select
                          className="ws-emp-select ws-hr-ticket-assign"
                          defaultValue=""
                          disabled={actingId === ticket.id}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) handleUpdate(ticket.id, { assignedTo: val, status: 'in-progress' });
                            e.target.value = '';
                          }}
                          aria-label="Assign ticket"
                        >
                          <option value="">Assign to…</option>
                          {ASSIGN_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="ws-hr-btn-primary btn-sm"
                          disabled={actingId === ticket.id}
                          onClick={() => handleUpdate(ticket.id, { status: 'in-progress' })}
                        >
                          Start work
                        </button>
                      </>
                    )}
                    {ticket.status === 'in-progress' && (
                      <>
                        <select
                          className="ws-emp-select ws-hr-ticket-assign"
                          value={ticket.assignedTo || ''}
                          disabled={actingId === ticket.id}
                          onChange={(e) => handleUpdate(ticket.id, { assignedTo: e.target.value })}
                          aria-label="Reassign ticket"
                        >
                          <option value="">Unassigned</option>
                          {ASSIGN_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="ws-hr-btn-primary btn-sm"
                          disabled={actingId === ticket.id}
                          onClick={() => setResolveTicket(ticket)}
                        >
                          Mark resolved
                        </button>
                      </>
                    )}
                    {ticket.status === 'resolved' && (
                      <>
                        <button
                          type="button"
                          className="ws-hr-btn-primary btn-sm"
                          disabled={actingId === ticket.id}
                          onClick={() => handleUpdate(ticket.id, { status: 'closed' })}
                        >
                          Close ticket
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={actingId === ticket.id}
                          onClick={() => handleUpdate(ticket.id, { status: 'in-progress' })}
                        >
                          Reopen
                        </button>
                      </>
                    )}
                    {ticket.status === 'closed' && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={actingId === ticket.id}
                        onClick={() => handleUpdate(ticket.id, { status: 'open' })}
                      >
                        Reopen
                      </button>
                    )}
                    <Link
                      to={`/workspace/hr/employees/${ticket.employeeId}`}
                      className="btn btn-ghost btn-sm"
                    >
                      Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {resolveTicket && (
        <ResolveModal
          ticket={resolveTicket}
          submitting={actingId === resolveTicket.id}
          onClose={() => setResolveTicket(null)}
          onSubmit={(data) => handleUpdate(resolveTicket.id, data)}
        />
      )}
    </div>
  );
}
