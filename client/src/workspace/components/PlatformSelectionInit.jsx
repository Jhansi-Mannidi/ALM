import { useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useRbac } from '../context/RbacContext';
import { getDefaultPlatformSelection } from '../data/platformCatalog';

export default function PlatformSelectionInit() {
  const { platformSelection, setPlatformSelection } = useWorkspace();
  const { accessibleWorkspaces } = useRbac();

  useEffect(() => {
    if (platformSelection?.workspaceId || accessibleWorkspaces.length === 0) return;
    setPlatformSelection(getDefaultPlatformSelection(accessibleWorkspaces));
  }, [platformSelection?.workspaceId, accessibleWorkspaces, setPlatformSelection]);

  return null;
}
