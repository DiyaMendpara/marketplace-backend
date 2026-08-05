// Default roles seeded on application bootstrap. Role names are lowercase so
// they map directly to the frontend's role checks ("buyer" | "supplier" | ...).

const ALL_PERMISSIONS = [
  'user.view',
  'user.create',
  'user.edit',
  'user.delete',
  'role.view',
  'role.create',
  'role.edit',
  'role.delete',
  'product.view',
  'product.create',
  'product.edit',
  'product.delete',
  'order.view',
  'order.create',
  'order.edit',
  'order.delete',
  'dashboard.view',
];

const roles = [
  {
    name: 'super admin',
    description: 'Full, unrestricted access. System-protected.',
    permissions: ALL_PERMISSIONS,
  },
  {
    name: 'admin',
    description: 'Marketplace administrator: manage users, roles, and oversee catalog/orders.',
    permissions: [
      'user.view',
      'user.create',
      'user.edit',
      'user.delete',
      'role.view',
      'role.create',
      'role.edit',
      'role.delete',
      'product.view',
      'product.edit',
      'product.delete',
      'order.view',
      'order.edit',
      'dashboard.view',
    ],
  },
  {
    name: 'supplier',
    description: 'Manages their own products and fulfils orders.',
    permissions: [
      'product.view',
      'product.create',
      'product.edit',
      'product.delete',
      'order.view',
      'order.edit',
      'dashboard.view',
    ],
  },
  {
    name: 'buyer',
    description: 'Browses the catalog and places orders.',
    permissions: ['product.view', 'order.view', 'order.create', 'order.edit'],
  },
];

export default roles;
