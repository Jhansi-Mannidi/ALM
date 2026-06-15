import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import OfficePageHeader from './OfficePageHeader';
import OfficeRowActions from './OfficeRowActions';
import { useOfficeDeleteConfirm } from './OfficeDeleteConfirmContext';
import { OFFICE_REQUEST_TYPES, OFFICE_REQUEST_STATUSES, officeStatusChip } from '../../data/officeCatalog';

const EMPTY = {
  title: '', type: 'supplies', requester: '', department: '', priority: 'medium', notes: '', status: 'pending',
};

const STATUS_COLUMNS = [
  { id: 'pending', label: 'Pending', color: '#D97706' },
  { id: 'approved', label: 'Approved', color: '#2563EB' },
  { id: 'fulfilled', label: 'Fulfilled', color: '#059669' },
  { id: 'rejected', label: 'Rejected', color: '#DC2626' },
];

export default function RequestsPage() {
  const confirmDelete = useOfficeDeleteConfirm();
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('kanban');

  const load = () => api.getOfficeRequests().then(setRequests).catch(() => {});

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (req) => {
    setEditingId(req.id);
    setForm({
      title: req.title,
      type: req.type,
      requester: req.requester,
      department: req.department,
      priority: req.priority,
      notes: req.notes || '',
      status: req.status,
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.updateOfficeRequest(editingId, form);
    else await api.createOfficeRequest(form);
    setShowForm(false);
    load();
  };

  const remove = (req) => {
    confirmDelete({
      label: req.title,
      onConfirm: async () => {
        await api.deleteOfficeRequest(req.id);
        load();
      },
    });
  };

  const updateStatus = async (req, status) => {
    await api.updateOfficeRequest(req.id, { status });
    load();
  };

  return (
    <div className="ws-hr-page ws-office-page">
      <OfficePageHeader
        title="Office Requests"
        subtitle="Supplies, maintenance, food & equipment requests"
        actions={(
          <div className="ws-office-head-group">
            <div className="ws-office-view-toggle">
              <button type="button" className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>Board</button>
              <button type="button" className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
            </div>
            <button type="button" className="ws-hr-btn-primary sm ws-office-btn-primary" onClick={openCreate}>
              <AppIcon icon={Icons.plus} size={13} />
              New request
            </button>
          </div>
        )}
      />

      {showForm && (
        <form className="card ws-office-form-card" onSubmit={submit}>
          <h3 className="ws-office-form-title">{editingId ? 'Edit request' : 'New request'}</h3>
          <div className="ws-office-form-grid">
            <label className="span-2">Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {OFFICE_REQUEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label>Requester<input value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })} /></label>
            <label>Department<input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></label>
            {editingId && (
              <label>
                Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {OFFICE_REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            )}
            <label className="span-2">Notes<textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          </div>
          <div className="ws-office-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm ws-office-btn-primary">{editingId ? 'Save' : 'Submit'}</button>
          </div>
        </form>
      )}

      {view === 'kanban' ? (
        <div className="ws-office-kanban">
          {STATUS_COLUMNS.map((col) => {
            const colItems = requests.filter((r) => r.status === col.id);
            return (
              <div key={col.id} className="ws-office-kanban-col">
                <div className="ws-office-kanban-head" style={{ borderTopColor: col.color }}>
                  <span>{col.label}</span>
                  <span className="ws-office-kanban-count">{colItems.length}</span>
                </div>
                <div className="ws-office-kanban-cards">
                  {colItems.map((req) => (
                    <div key={req.id} className="card ws-office-req-card">
                      <div className="ws-office-req-head">
                        <span className={`chip chip-xs ${officeStatusChip(req.priority)}`}>{req.priority}</span>
                        <OfficeRowActions onEdit={() => openEdit(req)} onDelete={() => remove(req)} />
                      </div>
                      <h4 className="ws-office-cell-title">{req.title}</h4>
                      <p className="ws-office-cell-meta">{req.requester} · {req.department}</p>
                      <div className="ws-office-req-foot">
                        <span className="chip chip-xs chip-gray">{req.type}</span>
                        <span className="ws-office-cell-meta">{req.createdAt}</span>
                      </div>
                      {col.id === 'pending' && (
                        <button type="button" className="btn btn-ghost btn-sm ws-office-approve-btn" onClick={() => updateStatus(req, 'approved')}>
                          Approve
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ws-office-table-wrap card">
          <table className="ws-office-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Type</th>
                <th>Requester</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="ws-office-cell-title">{req.title}</td>
                  <td><span className="chip chip-xs chip-gray">{req.type}</span></td>
                  <td>{req.requester}</td>
                  <td><span className={`chip chip-xs ${officeStatusChip(req.priority)}`}>{req.priority}</span></td>
                  <td><span className={`chip chip-xs ${officeStatusChip(req.status)}`}>{req.status}</span></td>
                  <td className="ws-office-cell-meta">{req.createdAt}</td>
                  <td><OfficeRowActions onEdit={() => openEdit(req)} onDelete={() => remove(req)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
