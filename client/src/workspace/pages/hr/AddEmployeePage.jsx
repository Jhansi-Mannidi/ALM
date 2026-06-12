import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { AddEmployeeForm } from './EmployeeModals';

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHrEmployees()
      .then(setManagers)
      .catch(() => setManagers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (created) => {
    navigate(`/workspace/hr/employees/${created.id}`);
  };

  return (
    <div className="ws-hr-page ws-emp-add-page">
      <Link to="/workspace/hr/employees" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Employee Directory
      </Link>

      <div className="ws-admin-head mb16">
        <div>
          <h1 className="ws-page-title">Add Employee</h1>
          <p className="ws-page-subtitle">Create a new employee profile with employment and document details</p>
        </div>
      </div>

      <div className="card ws-emp-add-form-card">
        {loading ? (
          <p className="ws-page-subtitle">Loading form…</p>
        ) : (
          <AddEmployeeForm
            managers={managers}
            onCancel={() => navigate('/workspace/hr/employees')}
            onCreated={handleCreated}
          />
        )}
      </div>
    </div>
  );
}
