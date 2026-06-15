/** Office Manager workspace navigation */

export const OFFICE_NAV_SECTIONS = [
  {
    id: 'home',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/workspace/office', icon: 'layoutDashboard', end: true },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'inventory', label: 'Inventory', path: '/workspace/office/inventory', icon: 'package' },
      { id: 'requests', label: 'Requests', path: '/workspace/office/requests', icon: 'inbox' },
    ],
  },
  {
    id: 'vendors-food',
    label: 'Vendors & Food',
    items: [
      { id: 'vendors', label: 'Vendors', path: '/workspace/office/vendors', icon: 'truck' },
      { id: 'food', label: 'Food Orders', path: '/workspace/office/food', icon: 'utensils' },
    ],
  },
];

export const OFFICE_INVENTORY_CATEGORIES = ['Stationery', 'Kitchen', 'Cleaning', 'IT Supplies', 'Furniture'];

export const OFFICE_REQUEST_TYPES = ['supplies', 'maintenance', 'food', 'equipment'];

export const OFFICE_REQUEST_STATUSES = ['pending', 'approved', 'fulfilled', 'rejected'];

export const OFFICE_MEAL_TYPES = ['breakfast', 'lunch', 'snacks'];

export const OFFICE_FOOD_STATUSES = ['scheduled', 'delivered', 'cancelled'];

export function officeStatusChip(status) {
  const map = {
    pending: 'chip-amber',
    approved: 'chip-blue',
    fulfilled: 'chip-green',
    rejected: 'chip-red',
    due: 'chip-amber',
    paid: 'chip-green',
    overdue: 'chip-red',
    scheduled: 'chip-blue',
    delivered: 'chip-green',
    cancelled: 'chip-gray',
    high: 'chip-red',
    medium: 'chip-amber',
    low: 'chip-gray',
  };
  return map[status] || 'chip-gray';
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
