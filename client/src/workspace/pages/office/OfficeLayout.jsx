import { Outlet } from 'react-router-dom';
import ModuleAppShell from '../../components/ModuleAppShell';
import { OFFICE_NAV_SECTIONS } from '../../data/officeCatalog';
import { OfficeDeleteConfirmProvider } from './OfficeDeleteConfirmContext';

export default function OfficeLayout() {
  return (
    <OfficeDeleteConfirmProvider>
      <ModuleAppShell
        moduleTitle="Office Manager"
        moduleIcon="building"
        backTo="/workspace/solutions/business-operations"
        sections={OFFICE_NAV_SECTIONS}
      >
        <Outlet />
      </ModuleAppShell>
    </OfficeDeleteConfirmProvider>
  );
}
