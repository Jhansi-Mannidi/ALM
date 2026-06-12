import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import ConfirmModal from '../../../components/ConfirmModal';
import { AppIcon, Icons } from '../../../components/icons';
import { EmployeeAvatar } from './EmployeeModals';

const STATUS_LABELS = {
  active: { label: 'Active', chip: 'ws-emp-status-active' },
  'on-leave': { label: 'On Leave', chip: 'ws-emp-status-leave' },
  inactive: { label: 'Inactive', chip: 'ws-emp-status-inactive' },
};

function formatJoined(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function uniqueValues(employees, key) {
  return [...new Set(employees.map((e) => e[key]).filter(Boolean))].sort();
}

function EmployeeCard({ employee, onView, onDelete, deleting }) {
  const status = STATUS_LABELS[employee.status] || STATUS_LABELS.active;

  return (
    <article className="ws-emp-card">
      <div className="ws-emp-card-top">
        <button
          type="button"
          className="ws-emp-delete-btn"
          aria-label={`Delete ${employee.name}`}
          title="Delete employee"
          disabled={deleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(employee);
          }}
        >
          <AppIcon icon={Icons.trash} size={14} />
        </button>
        <span className={`ws-emp-status ${status.chip}`}>{status.label}</span>
      </div>

      <button type="button" className="ws-emp-card-clickable" onClick={() => onView(employee.id)}>
        <div className="ws-emp-card-body">
          <EmployeeAvatar employee={employee} />
          <h3 className="ws-emp-name">{employee.name}</h3>
          <p className="ws-emp-role">{employee.role}</p>

          <div className="ws-emp-contact">
            <div className="ws-emp-contact-row">
              <AppIcon icon={Icons.mail} size={14} />
              <span>{employee.email}</span>
            </div>
            <div className="ws-emp-contact-row">
              <AppIcon icon={Icons.phone} size={14} />
              <span>{employee.phone}</span>
            </div>
          </div>

          <div className="ws-emp-meta">
            <span className="chip chip-gray">{employee.department}</span>
            <div className="ws-emp-meta-row">
              <AppIcon icon={Icons.mapPin} size={13} />
              <span>{employee.location}</span>
            </div>
            <div className="ws-emp-meta-row">
              <AppIcon icon={Icons.calendarDays} size={13} />
              <span>Joined: {formatJoined(employee.joinedAt)}</span>
            </div>
          </div>
        </div>
      </button>

      <div className="ws-emp-card-foot">
        <button type="button" className="ws-hr-btn-primary" onClick={() => onView(employee.id)}>
          View Profile
        </button>
      </div>
    </article>
  );
}

function EmployeeListRow({ employee, onView, onDelete, deleting }) {
  const status = STATUS_LABELS[employee.status] || STATUS_LABELS.active;

  return (
    <div className="ws-emp-list-row">
      <button type="button" className="ws-emp-list-person ws-emp-list-person-btn" onClick={() => onView(employee.id)}>
        <EmployeeAvatar employee={employee} className="sm" />
        <div>
          <div className="ws-emp-name">{employee.name}</div>
          <div className="ws-emp-role">{employee.role}</div>
        </div>
      </button>
      <span className="ws-emp-list-cell">{employee.employeeId}</span>
      <span className="ws-emp-list-cell">{employee.department}</span>
      <span className="ws-emp-list-cell">{employee.location}</span>
      <span className={`ws-emp-status ${status.chip}`}>{status.label}</span>
      <div className="ws-emp-list-actions">
        <button
          type="button"
          className="ws-emp-delete-btn"
          aria-label={`Delete ${employee.name}`}
          title="Delete employee"
          disabled={deleting}
          onClick={() => onDelete(employee)}
        >
          <AppIcon icon={Icons.trash} size={14} />
        </button>
        <button type="button" className="ws-hr-btn-primary sm" onClick={() => onView(employee.id)}>
          View Profile
        </button>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [status, setStatus] = useState('');
  const [view, setView] = useState('grid');
  const [deletingId, setDeletingId] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const loadEmployees = useCallback(() => {
    api.getHrEmployees().then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const departments = useMemo(() => uniqueValues(employees, 'department'), [employees]);
  const locations = useMemo(() => uniqueValues(employees, 'location'), [employees]);
  const types = useMemo(() => uniqueValues(employees, 'employmentType'), [employees]);

  const filtered = useMemo(() => {
    let list = [...employees];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeId?.toLowerCase().includes(q) ||
          e.phone?.includes(q)
      );
    }
    if (department) list = list.filter((e) => e.department === department);
    if (location) list = list.filter((e) => e.location === location);
    if (employmentType) list = list.filter((e) => e.employmentType === employmentType);
    if (status) list = list.filter((e) => e.status === status);

    list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [employees, search, department, location, employmentType, status]);

  const viewEmployee = (id) => navigate(`/workspace/hr/employees/${id}`);

  const handleDeleteRequest = (employee) => {
    setDeleteError('');
    setEmployeeToDelete(employee);
  };

  const closeDeleteModal = () => {
    if (deletingId) return;
    setEmployeeToDelete(null);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    setDeletingId(employeeToDelete.id);
    setDeleteError('');
    try {
      await api.deleteHrEmployee(employeeToDelete.id);
      setEmployeeToDelete(null);
      loadEmployees();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete employee');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="ws-hr-page ws-emp-directory">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Employee Directory</h1>
          <p className="ws-page-subtitle">Manage and view all employees</p>
        </div>
        <button type="button" className="ws-hr-btn-primary" onClick={() => navigate('/workspace/hr/employees/new')}>
          <AppIcon icon={Icons.plus} size={14} />
          Add Employee
        </button>
      </div>

      <div className="ws-emp-filters card">
        <div className="ws-emp-filters-row">
          <div className="ws-emp-search-wrap">
            <AppIcon icon={Icons.search} size={15} className="ws-emp-search-icon" />
            <input
              type="search"
              className="ws-emp-search"
              placeholder="Search by name, email, employee ID, phone..."
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

        <div className="ws-emp-filters-row secondary">
          <select className="ws-emp-select" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select className="ws-emp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="ws-emp-view-toggle">
            <button
              type="button"
              className={`ws-emp-view-btn${view === 'grid' ? ' active' : ''}`}
              aria-label="Grid view"
              onClick={() => setView('grid')}
            >
              <AppIcon icon={Icons.layoutGrid} size={13} />
            </button>
            <button
              type="button"
              className={`ws-emp-view-btn${view === 'list' ? ' active' : ''}`}
              aria-label="List view"
              onClick={() => setView('list')}
            >
              <AppIcon icon={Icons.list} size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="ws-emp-results-meta">
        Showing <strong>{filtered.length}</strong> of {employees.length} employees
      </div>

      {view === 'grid' ? (
        <div className="ws-emp-grid">
          {filtered.map((e) => (
            <EmployeeCard
              key={e.id}
              employee={e}
              onView={viewEmployee}
              onDelete={handleDeleteRequest}
              deleting={deletingId === e.id}
            />
          ))}
        </div>
      ) : (
        <div className="card ws-emp-list">
          <div className="ws-emp-list-head">
            <span>Employee</span>
            <span>ID</span>
            <span>Department</span>
            <span>Location</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filtered.map((e) => (
            <EmployeeListRow
              key={e.id}
              employee={e}
              onView={viewEmployee}
              onDelete={handleDeleteRequest}
              deleting={deletingId === e.id}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && employees.length > 0 && (
        <div className="ws-emp-empty card">
          <AppIcon icon={Icons.users} size={32} />
          <p>No employees match your filters.</p>
        </div>
      )}

      <ConfirmModal
        open={Boolean(employeeToDelete)}
        title="Delete employee?"
        message={
          employeeToDelete
            ? `Are you sure you want to delete ${employeeToDelete.name}?`
            : ''
        }
        detail={
          employeeToDelete
            ? [
                `${employeeToDelete.employeeId} · ${employeeToDelete.role} · ${employeeToDelete.department}. This action cannot be undone.`,
                deleteError,
              ]
                .filter(Boolean)
                .join(' ')
            : ''
        }
        confirmLabel="Delete employee"
        cancelLabel="Cancel"
        variant="danger"
        busy={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onClose={closeDeleteModal}
      />

    </div>
  );
}
