import { Outlet } from 'react-router-dom';
import ModuleAppShell from '../../components/ModuleAppShell';
import { PM_NAV_SECTIONS } from '../../data/productCatalog';
import { PmDeleteConfirmProvider } from './PmDeleteConfirmContext';

export default function ProductLayout() {
  return (
    <PmDeleteConfirmProvider>
      <ModuleAppShell
        moduleTitle="Product Management"
        sections={PM_NAV_SECTIONS}
      >
        <Outlet />
      </ModuleAppShell>
    </PmDeleteConfirmProvider>
  );
}
