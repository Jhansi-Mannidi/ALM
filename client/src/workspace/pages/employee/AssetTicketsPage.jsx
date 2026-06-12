import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import {
  ASSET_TICKET_TYPE_LABELS,
  TICKET_STATUS_CHIPS,
  TICKET_PRIORITY_CHIPS,
} from '../../data/employeeCatalog';

const STATUS_FILTERS = [
  { id: 'open', label: 'Open' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'all', label: 'All' },
];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AssetTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getEmployeeAssetTickets({ status: filter })
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="ws-hr-page ws-emp-portal-page ws-hr-ops-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Asset tickets</h1>
          <p className="ws-page-subtitle">Track requests for new assets, replacements, and repairs</p>
        </div>
        <Link to="/workspace/employee/asset-tickets/new" className="ws-hr-btn-primary">
          <AppIcon icon={Icons.plus} size={14} />
          Raise Ticket
        </Link>
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
          ) : tickets.length === 0 ? (
            <div className="ws-hr-ops-empty">
              <AppIcon icon={Icons.wrench} size={28} />
              <p>No tickets found</p>
              <Link to="/workspace/employee/asset-tickets/new" className="ws-hr-btn-primary btn-sm">
                Raise a ticket
              </Link>
            </div>
          ) : (
            <div className="ws-hr-ops-list">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ws-hr-ops-row">
                  <div className="ws-hr-ops-row-main">
                    <div className="ws-hr-ops-row-head">
                      <span className="ws-hr-action-name">{ticket.ticketNo}</span>
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
                    </div>
                    {ticket.resolution && (
                      <p className="ws-hr-ops-reject-note" style={{ color: 'var(--green, #059669)' }}>
                        Resolution: {ticket.resolution}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
