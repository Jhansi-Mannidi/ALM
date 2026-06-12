import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import ConfirmModal from '../../../components/ConfirmModal';
import { AppIcon, Icons } from '../../../components/icons';
import { INVOICE_STATUS_CHIPS } from '../../data/financeCatalog';
import FinanceActionsMenu from './FinanceActionsMenu';
import { formatDate, formatINR } from './financeUtils';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api.getFinanceInvoices().then(setInvoices).catch(() => setInvoices([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setActingId(id);
    try {
      await api.updateFinanceInvoice(id, { status });
      load();
    } catch { /* ignore */ } finally { setActingId(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteFinanceInvoice(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  const menuActions = (inv) => {
    const actions = [
      { id: 'edit', label: 'Edit', icon: Icons.pencil, onClick: () => navigate(`/workspace/finance/invoices/${inv.id}/edit`) },
    ];
    if (inv.status === 'draft') {
      actions.push({ id: 'send', label: 'Send Invoice', icon: Icons.send, onClick: () => updateStatus(inv.id, 'sent') });
    }
    if (inv.status === 'sent') {
      actions.push({ id: 'paid', label: 'Mark Paid', icon: Icons.check, onClick: () => updateStatus(inv.id, 'paid') });
    }
    if (inv.status === 'draft') {
      actions.push({ id: 'delete', label: 'Delete', icon: Icons.trash, danger: true, onClick: () => setDeleteTarget(inv) });
    }
    return actions;
  };

  return (
    <div className="ws-hr-page ws-fin-page ws-fin-budgets-page ws-hr-ops-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Invoices</h1>
          <p className="ws-page-subtitle">Manage client invoices and receivables</p>
        </div>
        <Link to="/workspace/finance/invoices/new" className="ws-hr-btn-primary sm">
          <AppIcon icon={Icons.plus} size={13} />
          New Invoice
        </Link>
      </div>

      <div className="card ws-hr-panel">
        <div className="ws-hr-panel-body">
          {loading ? <p className="ws-page-subtitle">Loading…</p> : (
            <div className="ws-hr-table-wrap">
              <table className="ws-hr-table">
                <thead>
                  <tr>
                    <th className="ws-fin-col-text">Invoice</th>
                    <th className="ws-fin-col-text">Client</th>
                    <th className="ws-fin-col-num">Amount</th>
                    <th className="ws-fin-col-num">Total</th>
                    <th className="ws-fin-col-date">Due</th>
                    <th className="ws-fin-col-status">Status</th>
                    <th className="ws-fin-col-action" />
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="ws-fin-col-text"><span className="ws-fin-entry-no">{inv.invoiceNo}</span></td>
                      <td className="ws-fin-col-text">{inv.client}</td>
                      <td className="ws-fin-col-num">{formatINR(inv.amount)}</td>
                      <td className="ws-fin-col-num">{formatINR(inv.total)}</td>
                      <td className="ws-fin-col-date">{formatDate(inv.dueDate)}</td>
                      <td className="ws-fin-col-status"><span className={`chip ${INVOICE_STATUS_CHIPS[inv.status] || 'chip-gray'}`}>{inv.status}</span></td>
                      <td className="ws-fin-col-action">
                        <FinanceActionsMenu actions={menuActions(inv)} disabled={actingId === inv.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete invoice?"
        message={deleteTarget ? `Delete draft invoice ${deleteTarget.invoiceNo}?` : ''}
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
