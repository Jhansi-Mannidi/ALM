import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../../api/client';
import ConfirmModal from '../../../components/ConfirmModal';
import { AppIcon, Icons } from '../../../components/icons';
import { ACCOUNT_TYPES, ENTRY_STATUS_CHIPS } from '../../data/financeCatalog';
import FinanceActionsMenu from './FinanceActionsMenu';
import {
  buildLedgerWithBalance,
  entryTotals,
  formatDate,
  formatINR,
  isDebitNormalAccount,
} from './financeUtils';

const TYPE_CHIPS = {
  asset: 'chip-blue',
  liability: 'chip-amber',
  equity: 'chip-purple',
  revenue: 'chip-green',
  expense: 'chip-red',
};

export default function LedgerPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const accountId = searchParams.get('accountId') || '';
  const activeTab = searchParams.get('tab') || (accountId ? 'ledger' : 'entries');

  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [ledger, setLedger] = useState({ account: null, lines: [] });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountSearch, setAccountSearch] = useState('');
  const [actingId, setActingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getFinanceJournalEntries(),
      api.getFinanceAccounts(),
      accountId ? api.getFinanceLedger({ accountId }) : Promise.resolve({ account: null, lines: [] }),
    ])
      .then(([ents, accs, led]) => {
        setEntries(ents);
        setAccounts(accs);
        setLedger(led);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [accountId]);

  useEffect(() => {
    if (activeTab === 'ledger' && !accountId && accounts.length > 0) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', 'ledger');
      next.set('accountId', accounts[0].id);
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, accountId, accounts, searchParams, setSearchParams]);

  const setTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    if (tab === 'ledger' && !accountId && accounts.length > 0) {
      next.set('accountId', accounts[0].id);
    }
    setSearchParams(next);
  };

  const selectAccount = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'ledger');
    if (id) next.set('accountId', id);
    else next.delete('accountId');
    setSearchParams(next);
  };

  const stats = useMemo(() => {
    const posted = entries.filter((e) => e.status === 'posted');
    const draft = entries.filter((e) => e.status === 'draft');
    const volume = posted.reduce((s, e) => s + entryTotals(e.lines).debit, 0);
    return { total: entries.length, posted: posted.length, draft: draft.length, volume };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
      if (!q) return true;
      return (
        entry.entryNo?.toLowerCase().includes(q)
        || entry.description?.toLowerCase().includes(q)
        || entry.reference?.toLowerCase().includes(q)
      );
    });
  }, [entries, search, statusFilter]);

  const groupedAccounts = useMemo(() => {
    const q = accountSearch.trim().toLowerCase();
    return ACCOUNT_TYPES.map((type) => ({
      ...type,
      accounts: accounts.filter((a) => {
        if (a.type !== type.id) return false;
        if (!q) return true;
        return a.code.includes(q) || a.name.toLowerCase().includes(q);
      }),
    })).filter((g) => g.accounts.length > 0);
  }, [accounts, accountSearch]);

  const ledgerView = useMemo(() => {
    if (!ledger.account) return null;
    return buildLedgerWithBalance(ledger.lines, ledger.account.type, ledger.account.balance);
  }, [ledger]);

  const handlePost = async (id) => {
    setActingId(id);
    try {
      await api.postFinanceJournalEntry(id);
      load();
    } catch {
      /* ignore */
    } finally {
      setActingId(null);
    }
  };

  const handleDeleteEntry = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteFinanceJournalEntry(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const entryMenuActions = (entry) => {
    const actions = [
      {
        id: 'lines',
        label: expandedId === entry.id ? 'Hide line items' : 'View line items',
        icon: Icons.eye,
        onClick: () => toggleExpand(entry.id),
      },
    ];
    if (entry.status === 'draft') {
      actions.push(
        { id: 'edit', label: 'Edit', icon: Icons.pencil, onClick: () => navigate(`/workspace/finance/ledger/${entry.id}/edit`) },
        { id: 'post', label: 'Post Entry', icon: Icons.check, onClick: () => handlePost(entry.id) },
        { id: 'delete', label: 'Delete', icon: Icons.trash, danger: true, onClick: () => setDeleteTarget(entry) },
      );
    }
    return actions;
  };

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-ledger-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Journal Entries & Ledger</h1>
          <p className="ws-page-subtitle">Double-entry bookkeeping, journal register, and account-level general ledger</p>
        </div>
        <Link to="/workspace/finance/ledger/new" className="ws-hr-btn-primary sm">
          <AppIcon icon={Icons.plus} size={13} />
          New Journal Entry
        </Link>
      </div>

      <div className="ws-fin-ledger-stats">
        <div className="ws-fin-ledger-stat">
          <span className="ws-fin-ledger-stat-label">Total Entries</span>
          <strong className="ws-fin-ledger-stat-value">{stats.total}</strong>
        </div>
        <div className="ws-fin-ledger-stat">
          <span className="ws-fin-ledger-stat-label">Posted</span>
          <strong className="ws-fin-ledger-stat-value ws-fin-credit">{stats.posted}</strong>
        </div>
        <div className="ws-fin-ledger-stat">
          <span className="ws-fin-ledger-stat-label">Draft</span>
          <strong className="ws-fin-ledger-stat-value">{stats.draft}</strong>
        </div>
        <div className="ws-fin-ledger-stat">
          <span className="ws-fin-ledger-stat-label">Posted Volume</span>
          <strong className="ws-fin-ledger-stat-value">{formatINR(stats.volume)}</strong>
        </div>
      </div>

      <div className="ws-fin-ledger-tabs">
        <button
          type="button"
          className={`ws-fin-ledger-tab${activeTab === 'entries' ? ' active' : ''}`}
          onClick={() => setTab('entries')}
        >
          <AppIcon icon={Icons.fileText} size={14} />
          Journal Entries
        </button>
        <button
          type="button"
          className={`ws-fin-ledger-tab${activeTab === 'ledger' ? ' active' : ''}`}
          onClick={() => setTab('ledger')}
        >
          <AppIcon icon={Icons.fileSpreadsheet} size={14} />
          General Ledger
        </button>
      </div>

      {activeTab === 'entries' && (
        <div className="card ws-hr-panel ws-fin-ledger-panel">
          <div className="ws-fin-ledger-toolbar">
            <div className="ws-emp-search-wrap ws-fin-ledger-search">
              <AppIcon icon={Icons.search} size={15} className="ws-emp-search-icon" />
              <input
                type="search"
                className="ws-emp-search"
                placeholder="Search by entry no., description, or reference…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ws-hr-ops-filters">
              {['all', 'posted', 'draft'].map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`ws-hr-ops-filter${statusFilter === f ? ' active' : ''}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="ws-hr-panel-body ws-fin-ledger-table-wrap">
            {loading ? (
              <p className="ws-page-subtitle">Loading journal entries…</p>
            ) : filteredEntries.length === 0 ? (
              <p className="ws-page-subtitle">No journal entries match your filters.</p>
            ) : (
              <table className="ws-hr-table ws-fin-ledger-table">
                <thead>
                  <tr>
                    <th className="ws-fin-col-toggle" />
                    <th>Date</th>
                    <th>Entry #</th>
                    <th>Description</th>
                    <th>Reference</th>
                    <th className="ws-fin-col-num">Debit</th>
                    <th className="ws-fin-col-num">Credit</th>
                    <th>Status</th>
                    <th className="ws-fin-col-action" />
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => {
                    const totals = entryTotals(entry.lines);
                    const expanded = expandedId === entry.id;
                    return (
                      <Fragment key={entry.id}>
                        <tr
                          className={`ws-fin-je-row${expanded ? ' expanded' : ''}`}
                          onClick={() => toggleExpand(entry.id)}
                        >
                          <td className="ws-fin-col-toggle">
                            <button type="button" className={`ws-fin-expand-btn${expanded ? ' open' : ''}`} aria-label={expanded ? 'Collapse' : 'Expand'}>
                              <AppIcon icon={Icons.chevronRight} size={14} />
                            </button>
                          </td>
                          <td>{formatDate(entry.date)}</td>
                          <td><span className="ws-fin-entry-no">{entry.entryNo}</span></td>
                          <td className="ws-fin-desc-cell">{entry.description}</td>
                          <td>{entry.reference || '—'}</td>
                          <td className="ws-fin-col-num">{formatINR(totals.debit)}</td>
                          <td className="ws-fin-col-num">{formatINR(totals.credit)}</td>
                          <td>
                            <span className={`chip ${ENTRY_STATUS_CHIPS[entry.status] || 'chip-gray'}`}>
                              {entry.status}
                            </span>
                          </td>
                          <td className="ws-fin-col-action" onClick={(e) => e.stopPropagation()}>
                            <FinanceActionsMenu
                              actions={entryMenuActions(entry)}
                              disabled={actingId === entry.id}
                            />
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="ws-fin-je-detail-row">
                            <td colSpan={9}>
                              <table className="ws-fin-je-lines-table">
                                <thead>
                                  <tr>
                                    <th>Account</th>
                                    <th className="ws-fin-col-num">Debit</th>
                                    <th className="ws-fin-col-num">Credit</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {entry.lines?.map((line, i) => (
                                    <tr key={i}>
                                      <td>
                                        <span className="ws-fin-account-code">{line.accountCode}</span>
                                        {' '}
                                        {line.accountName}
                                      </td>
                                      <td className="ws-fin-col-num">{line.debit ? formatINR(line.debit) : '—'}</td>
                                      <td className="ws-fin-col-num">{line.credit ? formatINR(line.credit) : '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="ws-fin-ledger-layout">
          <aside className="card ws-fin-ledger-accounts">
            <div className="ws-fin-ledger-accounts-head">
              <h2 className="ws-hr-panel-title">Accounts</h2>
              <div className="ws-emp-search-wrap ws-fin-ledger-account-search">
                <AppIcon icon={Icons.search} size={15} className="ws-emp-search-icon" />
                <input
                  type="search"
                  className="ws-emp-search"
                  placeholder="Search accounts…"
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="ws-fin-ledger-accounts-body">
              {groupedAccounts.map((group) => (
                <div key={group.id} className="ws-fin-ledger-account-group">
                  <div className="ws-fin-ledger-group-label">{group.label}</div>
                  {group.accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      className={`ws-fin-ledger-account-btn${accountId === acc.id ? ' active' : ''}`}
                      onClick={() => selectAccount(acc.id)}
                    >
                      <span className="ws-fin-ledger-account-meta">
                        <span className="ws-fin-account-code">{acc.code}</span>
                        <span className="ws-fin-ledger-account-name">{acc.name}</span>
                      </span>
                      <span className="ws-fin-ledger-account-bal">{formatINR(acc.balance)}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          <div className="card ws-hr-panel ws-fin-ledger-main">
            {loading ? (
              <div className="ws-hr-panel-body">
                <p className="ws-page-subtitle">Loading ledger…</p>
              </div>
            ) : !ledger.account ? (
              <div className="ws-hr-panel-body ws-fin-ledger-empty">
                <AppIcon icon={Icons.fileSpreadsheet} size={32} />
                <p>Select an account to view its general ledger</p>
              </div>
            ) : (
              <>
                <div className="ws-fin-ledger-account-header">
                  <div>
                    <div className="ws-fin-ledger-account-title">
                      <span className="ws-fin-account-code">{ledger.account.code}</span>
                      {ledger.account.name}
                    </div>
                    <div className="ws-fin-ledger-account-sub">
                      <span className={`chip ${TYPE_CHIPS[ledger.account.type] || 'chip-gray'}`}>
                        {ledger.account.type}
                      </span>
                      <span className="ws-page-subtitle">
                        {isDebitNormalAccount(ledger.account.type) ? 'Debit-normal' : 'Credit-normal'} account
                      </span>
                    </div>
                  </div>
                  <div className="ws-fin-ledger-balance-block">
                    <span className="ws-fin-ledger-balance-label">Current Balance</span>
                    <strong className="ws-fin-ledger-balance-value">{formatINR(ledger.account.balance)}</strong>
                  </div>
                </div>

                <div className="ws-hr-panel-body ws-fin-ledger-table-wrap">
                  {ledgerView && ledgerView.lines.length > 0 ? (
                    <table className="ws-hr-table ws-fin-ledger-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Entry #</th>
                          <th>Reference</th>
                          <th>Description</th>
                          <th className="ws-fin-col-num">Debit</th>
                          <th className="ws-fin-col-num">Credit</th>
                          <th className="ws-fin-col-num">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="ws-fin-ledger-opening">
                          <td colSpan={6}>Opening balance</td>
                          <td className="ws-fin-col-num"><strong>{formatINR(ledgerView.openingBalance)}</strong></td>
                        </tr>
                        {ledgerView.lines.map((line) => (
                          <tr key={line.id}>
                            <td>{formatDate(line.date)}</td>
                            <td><span className="ws-fin-entry-no">{line.entryNo}</span></td>
                            <td>{line.reference || '—'}</td>
                            <td className="ws-fin-desc-cell">{line.description}</td>
                            <td className="ws-fin-col-num">{line.debit ? formatINR(line.debit) : '—'}</td>
                            <td className="ws-fin-col-num">{line.credit ? formatINR(line.credit) : '—'}</td>
                            <td className="ws-fin-col-num ws-fin-ledger-running">{formatINR(line.runningBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="ws-fin-ledger-footer">
                          <td colSpan={4}><strong>Period totals</strong></td>
                          <td className="ws-fin-col-num">
                            <strong>{formatINR(ledger.lines.reduce((s, l) => s + (l.debit || 0), 0))}</strong>
                          </td>
                          <td className="ws-fin-col-num">
                            <strong>{formatINR(ledger.lines.reduce((s, l) => s + (l.credit || 0), 0))}</strong>
                          </td>
                          <td className="ws-fin-col-num">
                            <strong>{formatINR(ledgerView.closingBalance)}</strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <p className="ws-page-subtitle">No posted transactions for this account yet.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete journal entry?"
        message={deleteTarget ? `Delete draft entry ${deleteTarget.entryNo}?` : ''}
        busy={deleting}
        onConfirm={handleDeleteEntry}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
