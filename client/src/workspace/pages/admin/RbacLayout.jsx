import { Outlet } from 'react-router-dom';
import ModuleAppShell from '../../components/ModuleAppShell';
import { RBAC_NAV } from '../../data/rbacCatalog';

export default function RbacLayout() {
  return (
    <ModuleAppShell
      moduleTitle="Roles & Permissions"
      moduleIcon="shield"
      backTo="/workspace/home"
      sections={[{ id: 'admin', label: 'Administration', items: RBAC_NAV }]}
    >
      <Outlet />
    </ModuleAppShell>
  );
}
