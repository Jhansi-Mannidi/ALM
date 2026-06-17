import { Outlet } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { ModuleNavProvider } from '../context/ModuleNavContext';
import PlatformSelectionInit from './PlatformSelectionInit';

export default function WorkspaceShell() {
  return (
    <ModuleNavProvider>
      <div className="ws-shell">
        <PlatformSelectionInit />
        <Topbar />
        <main className="ws-main">
          <Outlet />
        </main>
      </div>
    </ModuleNavProvider>
  );
}
