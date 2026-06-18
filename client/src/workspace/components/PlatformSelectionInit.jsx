import { useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useRbac } from '../context/RbacContext';
import { getDefaultPlatformSelection, getPreferredSolutionId, getSolutionsForSchema } from '../data/platformCatalog';

export default function PlatformSelectionInit() {
  const { platformSelection, setPlatformSelection } = useWorkspace();
  const { accessibleWorkspaces } = useRbac();

  useEffect(() => {
    if (accessibleWorkspaces.length === 0) return;

    if (!platformSelection?.workspaceId) {
      setPlatformSelection(getDefaultPlatformSelection(accessibleWorkspaces));
      return;
    }

    const solutions = getSolutionsForSchema(platformSelection.workspaceId, platformSelection.schemaId);
    const preferredSolutionId = getPreferredSolutionId(solutions);
    if (platformSelection.solutionId === 'system-administration' && preferredSolutionId) {
      setPlatformSelection((prev) => ({ ...prev, solutionId: preferredSolutionId }));
    }
  }, [platformSelection, accessibleWorkspaces, setPlatformSelection]);

  return null;
}
