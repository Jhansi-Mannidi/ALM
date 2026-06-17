import { Outlet } from 'react-router-dom';
import ModuleAppShell from '../../components/ModuleAppShell';
import { HR_WORKSPACE_NAV, HR_RECRUITMENT_NAV, HR_OPERATIONS_NAV } from '../../data/hrCatalog';

export default function HrLayout() {
  return (
    <ModuleAppShell
      moduleTitle="HR & People"
      moduleIcon="users"
      backTo="/workspace/solutions/business-operations"
      sections={[
        { id: 'workspace', label: 'Workspace', items: HR_WORKSPACE_NAV },
        { id: 'recruitment', label: 'Recruitment', items: HR_RECRUITMENT_NAV },
        { id: 'actions', label: 'Actions', items: HR_OPERATIONS_NAV },
      ]}
    >
      <Outlet />
    </ModuleAppShell>
  );
}
