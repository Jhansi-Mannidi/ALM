import { Outlet } from 'react-router-dom';
import ModuleAppShell from '../../components/ModuleAppShell';
import {
  EMPLOYEE_WORKSPACE_NAV,
  EMPLOYEE_PEOPLE_NAV,
  EMPLOYEE_REQUESTS_NAV,
  EMPLOYEE_EXIT_NAV,
} from '../../data/employeeCatalog';

export default function EmployeeLayout() {
  return (
    <ModuleAppShell
      moduleTitle="Employee Portal"
      moduleIcon="users"
      backTo="/workspace/solutions/business-operations"
      sections={[
        { id: 'workspace', label: 'Workspace', items: EMPLOYEE_WORKSPACE_NAV },
        { id: 'people', label: 'People', items: EMPLOYEE_PEOPLE_NAV },
        { id: 'requests', label: 'Requests', items: EMPLOYEE_REQUESTS_NAV },
        { id: 'exit', label: 'Exit', items: EMPLOYEE_EXIT_NAV },
      ]}
    >
      <Outlet />
    </ModuleAppShell>
  );
}
