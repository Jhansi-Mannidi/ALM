import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppIcon, Icons } from '../../../components/icons';
import {
  DEMO_LEADS,
  LEAD_STATS,
  filterLeads,
  leadStateChip,
} from '../../data/freightCatalog';

const PAGE_SIZE = 20;

const STAT_CARDS = [
  { key: 'all', label: 'All leads', value: LEAD_STATS.all, tone: 'blue', icon: Icons.layoutGrid },
  { key: 'suspects', label: 'Suspects', value: LEAD_STATS.suspects, tone: 'purple', icon: Icons.users },
  { key: 'prospects', label: 'Prospects', value: LEAD_STATS.prospects, tone: 'orange', icon: Icons.userPlus },
  { key: 'opportunities', label: 'Opportunities', value: LEAD_STATS.opportunities, tone: 'teal', icon: Icons.trendingUp },
  { key: 'customers', label: 'Customers', value: LEAD_STATS.customers, tone: 'green', icon: Icons.users },
  { key: 'newCustomers', label: 'New Customers', value: LEAD_STATS.newCustomers, tone: 'red', icon: Icons.plus, badge: '1 Jan 24 - 17 Jun 24' },
];

export default function FreightLeadsPage() {
  const { leadFilter = 'all' } = useOutletContext() || {};
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => filterLeads(DEMO_LEADS, leadFilter, search),
    [leadFilter, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalDisplay = leadFilter === 'all' ? LEAD_STATS.all : filtered.length;

  return (
    <div className="ws-freight-leads-page">
      <section className="ws-freight-kpi-row" aria-label="Lead metrics">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className={`ws-freight-kpi ws-freight-kpi-${card.tone}`}>
            <div className="ws-freight-kpi-top">
              <span className="ws-freight-kpi-label">{card.label}</span>
              <AppIcon icon={card.icon} size={16} />
            </div>
            <div className="ws-freight-kpi-value">{card.value}</div>
            {card.badge && <span className="ws-freight-kpi-badge">{card.badge}</span>}
          </div>
        ))}
      </section>

      <section className="ws-freight-table-panel card">
        <div className="ws-freight-table-toolbar">
          <h2 className="ws-freight-table-title">Leads</h2>
          <div className="ws-freight-table-tools">
            <button type="button" className="ws-freight-tool-btn">Columns</button>
            <button type="button" className="ws-freight-tool-btn">Select</button>
            <button type="button" className="ws-freight-tool-btn icon-only" aria-label="Refresh">
              <AppIcon icon={Icons.refreshCw} size={15} />
            </button>
            <div className="ws-freight-table-search">
              <AppIcon icon={Icons.search} size={14} />
              <input
                type="search"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button type="button" className="ws-freight-tool-btn">Export</button>
            <button type="button" className="ws-freight-tool-btn icon-only" aria-label="Filter">
              <AppIcon icon={Icons.sliders} size={15} />
            </button>
            <div className="ws-view-toggle ws-freight-view-toggle">
              <button type="button" className="ws-view-btn active" aria-label="List view">
                <AppIcon icon={Icons.list} size={14} />
              </button>
              <button type="button" className="ws-view-btn" aria-label="Grid view">
                <AppIcon icon={Icons.layoutGrid} size={14} />
              </button>
            </div>
            <button type="button" className="ws-freight-btn-primary">
              <AppIcon icon={Icons.plus} size={14} />
              New Lead
            </button>
          </div>
        </div>

        <div className="ws-freight-table-wrap">
          <table className="ws-freight-table">
            <thead>
              <tr>
                <th>S.NO.</th>
                <th>Actions</th>
                <th>Organization</th>
                <th>Created By</th>
                <th>Contact</th>
                <th>Industry</th>
                <th>Lead State</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, idx) => (
                <tr key={row.id}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>
                    <div className="ws-freight-row-actions">
                      <button type="button" className="ws-freight-row-btn" aria-label="View">
                        <AppIcon icon={Icons.users} size={14} />
                      </button>
                      <button type="button" className="ws-freight-row-btn" aria-label="Message">
                        <AppIcon icon={Icons.messageSquare} size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="ws-freight-org">
                    {row.organization}
                    <AppIcon icon={Icons.externalLink} size={12} />
                  </td>
                  <td>
                    <span className="ws-freight-person">
                      <span className="ws-freight-person-avatar">{row.createdIni}</span>
                      {row.createdBy}
                    </span>
                  </td>
                  <td>
                    <span className="ws-freight-person">
                      <span className="ws-freight-person-avatar">{row.contactIni}</span>
                      {row.contact}
                    </span>
                  </td>
                  <td>{row.industry}</td>
                  <td>
                    <span className={`chip chip-xs ${leadStateChip(row.state)}`}>{row.state}</span>
                  </td>
                  <td>
                    <a href={`mailto:${row.email}`} className="ws-freight-email">{row.email}</a>
                  </td>
                  <td>
                    <span className="ws-freight-phone">
                      <AppIcon icon={Icons.phone} size={12} />
                      {row.phone}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ws-freight-table-foot">
          <div className="ws-freight-page-size">
            Show
            <select defaultValue="20" aria-label="Entries per page">
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            entries
          </div>
          <div className="ws-freight-page-info">
            Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {totalDisplay} entries
          </div>
          <div className="ws-freight-pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
              <AppIcon icon={Icons.chevronLeft} size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={page === n ? 'active' : ''}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
              <AppIcon icon={Icons.chevronRight} size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
