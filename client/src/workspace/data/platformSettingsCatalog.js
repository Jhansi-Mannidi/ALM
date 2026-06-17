export const PLATFORM_SETTINGS = {
  workspace: {
    title: 'Workspace Settings',
    sections: [
      {
        label: 'General',
        items: [
          { id: 'details', label: 'Workspace details', description: 'Name, icon, and description' },
          { id: 'default-schema', label: 'Default schema', description: 'Schema opened on sign-in' },
        ],
      },
      {
        label: 'Access',
        items: [
          { id: 'users', label: 'Users & roles', route: '/workspace/admin/rbac/users' },
          { id: 'permissions', label: 'Permissions', route: '/workspace/admin/rbac/permissions' },
        ],
      },
    ],
  },
  schema: {
    title: 'Schema Settings',
    sections: [
      {
        label: 'General',
        items: [
          { id: 'details', label: 'Schema details', description: 'Name, environment, and region' },
          { id: 'solutions', label: 'Linked solutions', description: 'Solutions available in this schema' },
        ],
      },
      {
        label: 'Access',
        items: [
          { id: 'schema-perms', label: 'Schema permissions', route: '/workspace/admin/rbac/roles' },
          { id: 'audit', label: 'Audit log', route: '/workspace/admin/rbac/audit' },
        ],
      },
    ],
  },
  solution: {
    title: 'Solution Settings',
    sections: [
      {
        label: 'General',
        items: [
          { id: 'details', label: 'Solution details', description: 'Name, description, and apps' },
          { id: 'apps', label: 'Manage applications', description: 'Configure apps in this solution' },
        ],
      },
      {
        label: 'Access',
        items: [
          { id: 'solution-perms', label: 'Solution permissions', route: '/workspace/admin/rbac/roles' },
          { id: 'adoption', label: 'Adoption reports', route: '/workspace/admin/rbac/adoption' },
        ],
      },
    ],
  },
};

export function platformFavoriteKey(layer, id) {
  return `${layer}:${id}`;
}

export function parsePlatformFavoriteKey(key) {
  const [layer, ...rest] = key.split(':');
  return { layer, id: rest.join(':') };
}
