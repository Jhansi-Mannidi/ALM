import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { REPORT_CATEGORIES } from '../../data/financeCatalog';
import FinanceActionsMenu from './FinanceActionsMenu';

function formatVisited(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function reportLink(report) {
  if (report.route === 'ledger') return '/workspace/finance/ledger?tab=ledger';
  if ([
    'profit-loss', 'balance-sheet', 'cash-flow', 'trial-balance',
    'ar-aging', 'ap-aging', 'expenses-by-category', 'budget-vs-actual',
    'ratios', 'equity',
  ].includes(report.route)) {
    return `/workspace/finance/reports/statements?focus=${report.route}`;
  }
  return `/workspace/finance/reports/statements`;
}

export default function FinanceReportsHubPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getFinanceReportCatalog(category === 'All' ? {} : { category })
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
  }, [reports, search]);

  const toggleFavorite = async (report) => {
    await api.updateFinanceReportCatalog(report.id, { favorite: !report.favorite });
    load();
  };

  const markVisited = async (report) => {
    await api.updateFinanceReportCatalog(report.id, { favorite: report.favorite });
  };

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-budgets-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Reports</h1>
          <p className="ws-page-subtitle">Business overview, sales, receivables, payables, and accountant reports</p>
        </div>
        <Link to="/workspace/finance/reports/statements" className="ws-hr-btn-primary">
          <AppIcon icon={Icons.fileSpreadsheet} size={14} />
          Financial Statements
        </Link>
      </div>

      <div className="ws-fin-expense-filters">
        <div className="ws-hr-ops-filters ws-fin-expense-cat-filters">
          {REPORT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`ws-hr-ops-filter${category === c ? ' active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-fin-ledger-toolbar">
          <div className="ws-emp-search-wrap ws-fin-ledger-search">
            <AppIcon icon={Icons.search} size={15} className="ws-emp-search-icon" />
            <input
              type="search"
              className="ws-emp-search"
              placeholder="Search reports…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="chip chip-gray ws-fin-toolbar-meta">{filtered.length} reports</span>
        </div>
        <div className="ws-hr-panel-body ws-fin-ledger-table-wrap">
          {loading ? (
            <p className="ws-page-subtitle">Loading reports…</p>
          ) : (
            <table className="ws-hr-table ws-fin-reports-table">
              <thead>
                <tr>
                  <th className="ws-fin-col-toggle" />
                  <th className="ws-fin-col-text">Report Name</th>
                  <th className="ws-fin-col-status">Report Category</th>
                  <th className="ws-fin-col-text">Created By</th>
                  <th className="ws-fin-col-date">Last Visited</th>
                  <th className="ws-fin-col-action" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((report) => (
                  <tr key={report.id}>
                    <td className="ws-fin-col-toggle">
                      <button
                        type="button"
                        className={`ws-fin-fav-btn${report.favorite ? ' active' : ''}`}
                        aria-label={report.favorite ? 'Remove favorite' : 'Add favorite'}
                        onClick={() => toggleFavorite(report)}
                      >
                        <AppIcon icon={Icons.star} size={14} />
                      </button>
                    </td>
                    <td>
                      <Link
                        to={reportLink(report)}
                        className="ws-fin-report-link"
                        onClick={() => markVisited(report)}
                      >
                        {report.name}
                      </Link>
                    </td>
                    <td><span className="chip chip-gray">{report.category}</span></td>
                    <td>{report.createdBy}</td>
                    <td>{formatVisited(report.lastVisited)}</td>
                    <td className="ws-fin-col-action">
                      <FinanceActionsMenu
                        actions={[
                          { id: 'open', label: 'Open Report', icon: Icons.externalLink, onClick: () => { markVisited(report); navigate(reportLink(report)); } },
                          { id: 'fav', label: report.favorite ? 'Unfavorite' : 'Favorite', icon: Icons.star, onClick: () => toggleFavorite(report) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
