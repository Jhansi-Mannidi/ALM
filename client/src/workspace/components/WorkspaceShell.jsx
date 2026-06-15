import { Outlet } from 'react-router-dom';
import { ModuleNavProvider } from '../context/ModuleNavContext';
import WorkspaceHeader from './WorkspaceHeader';

export default function WorkspaceShell() {
  return (
    <ModuleNavProvider>
      <div className="ws-shell">
        <WorkspaceHeader />
        <main className="ws-main">
          <Outlet />
        </main>
      </div>
    </ModuleNavProvider>
  );
}
