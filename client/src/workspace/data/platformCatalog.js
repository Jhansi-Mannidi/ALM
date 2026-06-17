import { STANDALONE_APPS, getSolution, getAppById } from './workspaceCatalog';
import { FREIGHT_ERP_APPS } from './freightCatalog';

export const WORKSPACES = [
  {
    id: 'voltuswave',
    name: 'VoltusWave',
    icon: 'building',
    roleLabel: 'Workspace Admin',
    schemas: [
      {
        id: 'alm-production',
        name: 'ALM Production',
        icon: 'layoutGrid',
        roleLabel: 'Schema Admin',
        environment: 'Production',
        environmentTone: 'production',
        solutionIds: ['business-operations', 'product-development', 'system-administration'],
        standaloneAppIds: STANDALONE_APPS.map((a) => a.id),
      },
      {
        id: 'alm-development',
        name: 'ALM Development',
        icon: 'layoutGrid',
        roleLabel: 'Schema Admin',
        environment: 'Development',
        environmentTone: 'development',
        solutionIds: ['business-operations', 'product-development', 'system-administration'],
        standaloneAppIds: STANDALONE_APPS.map((a) => a.id),
      },
    ],
  },
  {
    id: 'voltusfreight',
    name: 'Voltusfreight',
    icon: 'building',
    roleLabel: 'Workspace Admin',
    schemas: [
      {
        id: 'freight-dev',
        name: 'Freight DEV',
        icon: 'layoutGrid',
        roleLabel: 'Schema Admin',
        environment: 'Development',
        environmentTone: 'development',
        solutionIds: ['freight-crm'],
        standaloneAppIds: [],
      },
    ],
  },
];

export function getWorkspace(workspaceId) {
  return WORKSPACES.find((w) => w.id === workspaceId);
}

export function getSchema(workspaceId, schemaId) {
  return getWorkspace(workspaceId)?.schemas.find((s) => s.id === schemaId);
}

export function getPlatformSolution(solutionId) {
  return getSolution(solutionId);
}

export function getSolutionsForSchema(workspaceId, schemaId) {
  const schema = getSchema(workspaceId, schemaId);
  if (!schema) return [];
  return schema.solutionIds.map((id) => getSolution(id)).filter(Boolean);
}

export function getStandaloneAppsForSchema(workspaceId, schemaId) {
  const schema = getSchema(workspaceId, schemaId);
  if (!schema) return [];
  return schema.standaloneAppIds.map((id) => getAppById(id)).filter(Boolean);
}

export function getAppsForSolution(solutionId) {
  if (solutionId === 'freight-crm') {
    return FREIGHT_ERP_APPS.map((app) => ({ ...app, solutionId: 'freight-crm' }));
  }
  return getSolution(solutionId)?.apps ?? [];
}

export function getDefaultPlatformSelection(accessibleWorkspaces) {
  const workspace = accessibleWorkspaces[0] ?? WORKSPACES[0];
  const schema = workspace?.schemas[0];
  const solutions = schema ? getSolutionsForSchema(workspace.id, schema.id) : [];
  return {
    workspaceId: workspace?.id ?? null,
    schemaId: schema?.id ?? null,
    solutionId: solutions[0]?.id ?? null,
  };
}
