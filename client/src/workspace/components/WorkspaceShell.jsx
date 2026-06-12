import { Outlet } from 'react-router-dom';
import WorkspaceHeader from './WorkspaceHeader';

export default function WorkspaceShell() {
  return (
    <div className="ws-shell">
      <WorkspaceHeader />
      <main className="ws-main">
        <Outlet />
      </main>
    </div>
  );
}
