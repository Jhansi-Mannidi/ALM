/** Office Manager module seed — inventory, requests, vendors & food */

export const OFFICE_INVENTORY = [
  { id: 'inv-01', name: 'A4 Copy Paper (500 sheets)', sku: 'STA-001', category: 'Stationery', quantity: 8, minStock: 20, unit: 'reams', location: 'Supply Room A', lastRestocked: '2024-05-28' },
  { id: 'inv-02', name: 'Ballpoint Pens (Blue)', sku: 'STA-002', category: 'Stationery', quantity: 45, minStock: 30, unit: 'boxes', location: 'Supply Room A', lastRestocked: '2024-06-01' },
  { id: 'inv-03', name: 'Sticky Notes (3x3)', sku: 'STA-003', category: 'Stationery', quantity: 5, minStock: 15, unit: 'packs', location: 'Supply Room A', lastRestocked: '2024-05-15' },
  { id: 'inv-04', name: 'Printer Toner (HP LaserJet)', sku: 'IT-001', category: 'IT Supplies', quantity: 2, minStock: 4, unit: 'cartridges', location: 'IT Store', lastRestocked: '2024-05-20' },
  { id: 'inv-05', name: 'HDMI Cables (2m)', sku: 'IT-002', category: 'IT Supplies', quantity: 12, minStock: 10, unit: 'units', location: 'IT Store', lastRestocked: '2024-06-05' },
  { id: 'inv-06', name: 'USB-C Hubs', sku: 'IT-003', category: 'IT Supplies', quantity: 3, minStock: 8, unit: 'units', location: 'IT Store', lastRestocked: '2024-04-22' },
  { id: 'inv-07', name: 'Coffee Beans (Arabica)', sku: 'KIT-001', category: 'Kitchen', quantity: 4, minStock: 10, unit: 'kg', location: 'Pantry', lastRestocked: '2024-06-08' },
  { id: 'inv-08', name: 'Paper Cups (12oz)', sku: 'KIT-002', category: 'Kitchen', quantity: 6, minStock: 20, unit: 'sleeves', location: 'Pantry', lastRestocked: '2024-05-30' },
  { id: 'inv-09', name: 'Green Tea Bags', sku: 'KIT-003', category: 'Kitchen', quantity: 2, minStock: 8, unit: 'boxes', location: 'Pantry', lastRestocked: '2024-05-10' },
  { id: 'inv-10', name: 'Hand Sanitizer (500ml)', sku: 'CLN-001', category: 'Cleaning', quantity: 18, minStock: 12, unit: 'bottles', location: 'Janitor Closet', lastRestocked: '2024-06-02' },
  { id: 'inv-11', name: 'Surface Wipes', sku: 'CLN-002', category: 'Cleaning', quantity: 7, minStock: 15, unit: 'canisters', location: 'Janitor Closet', lastRestocked: '2024-05-25' },
  { id: 'inv-12', name: 'Trash Bags (Large)', sku: 'CLN-003', category: 'Cleaning', quantity: 3, minStock: 10, unit: 'rolls', location: 'Janitor Closet', lastRestocked: '2024-05-18' },
  { id: 'inv-13', name: 'Ergonomic Chair Wheels', sku: 'FUR-001', category: 'Furniture', quantity: 10, minStock: 6, unit: 'sets', location: 'Furniture Bay', lastRestocked: '2024-06-04' },
  { id: 'inv-14', name: 'Monitor Arms', sku: 'FUR-002', category: 'Furniture', quantity: 5, minStock: 4, unit: 'units', location: 'Furniture Bay', lastRestocked: '2024-05-12' },
  { id: 'inv-15', name: 'Whiteboard Markers', sku: 'STA-004', category: 'Stationery', quantity: 14, minStock: 12, unit: 'sets', location: 'Supply Room A', lastRestocked: '2024-06-06' },
  { id: 'inv-16', name: 'Ethernet Cables (Cat6)', sku: 'IT-004', category: 'IT Supplies', quantity: 1, minStock: 6, unit: 'units', location: 'IT Store', lastRestocked: '2024-04-30' },
  { id: 'inv-17', name: 'Bottled Water (20L)', sku: 'KIT-004', category: 'Kitchen', quantity: 4, minStock: 8, unit: 'cans', location: 'Pantry', lastRestocked: '2024-06-07' },
  { id: 'inv-18', name: 'Air Freshener Refills', sku: 'CLN-004', category: 'Cleaning', quantity: 2, minStock: 6, unit: 'refills', location: 'Janitor Closet', lastRestocked: '2024-05-05' },
  { id: 'inv-19', name: 'File Folders (A4)', sku: 'STA-005', category: 'Stationery', quantity: 28, minStock: 25, unit: 'packs', location: 'Supply Room A', lastRestocked: '2024-06-03' },
  { id: 'inv-20', name: 'Desk Cable Organizers', sku: 'FUR-003', category: 'Furniture', quantity: 14, minStock: 8, unit: 'units', location: 'Furniture Bay', lastRestocked: '2024-06-09' },
];

export const OFFICE_VENDORS = [
  { id: 'ven-01', name: 'Staples Business', category: 'Stationery', contact: 'Raj Mehta', email: 'raj@staples.in', phone: '+91 40 2345 6789', paymentDue: '2024-06-15', amountDue: 18500, paymentStatus: 'due', contractEnd: '2025-03-31' },
  { id: 'ven-02', name: 'FreshBite Catering', category: 'Food & Beverage', contact: 'Anita Desai', email: 'orders@freshbite.in', phone: '+91 40 9876 5432', paymentDue: '2024-06-12', amountDue: 42000, paymentStatus: 'due', contractEnd: '2024-12-31' },
  { id: 'ven-03', name: 'CleanPro Services', category: 'Facilities', contact: 'Vikram Singh', email: 'billing@cleanpro.in', phone: '+91 40 1122 3344', paymentDue: '2024-06-10', amountDue: 12800, paymentStatus: 'overdue', contractEnd: '2025-06-30' },
  { id: 'ven-04', name: 'TechSupply India', category: 'IT Equipment', contact: 'Neha Kapoor', email: 'sales@techsupply.in', phone: '+91 40 5566 7788', paymentDue: null, amountDue: 0, paymentStatus: 'paid', contractEnd: '2025-01-15' },
  { id: 'ven-05', name: 'AquaPure Water', category: 'Food & Beverage', contact: 'Suresh Reddy', email: 'accounts@aquapure.in', phone: '+91 40 9988 7766', paymentDue: null, amountDue: 0, paymentStatus: 'paid', contractEnd: '2024-09-30' },
  { id: 'ven-06', name: 'OfficeFurn Co.', category: 'Furniture', contact: 'Priya Nair', email: 'priya@officefurn.in', phone: '+91 40 3344 5566', paymentDue: null, amountDue: 0, paymentStatus: 'paid', contractEnd: '2025-08-01' },
];

export const OFFICE_REQUESTS = [
  { id: 'req-01', title: 'Restock printer toner cartridges', type: 'supplies', requester: 'Arjun Patel', department: 'Engineering', status: 'pending', priority: 'high', createdAt: '2024-06-10', notes: 'Floor 3 printers running low' },
  { id: 'req-02', title: 'AC maintenance — Conference Room B', type: 'maintenance', requester: 'Meera Joshi', department: 'Operations', status: 'pending', priority: 'medium', createdAt: '2024-06-09', notes: 'Not cooling properly since Monday' },
  { id: 'req-03', title: 'Extra lunch boxes for client visit', type: 'food', requester: 'Karthik Rao', department: 'Sales', status: 'pending', priority: 'high', createdAt: '2024-06-11', notes: '15 guests on June 14' },
  { id: 'req-04', title: 'Standing desks for new hires', type: 'equipment', requester: 'HR Team', department: 'Human Resources', status: 'pending', priority: 'medium', createdAt: '2024-06-08', notes: '3 desks needed by June 20' },
  { id: 'req-05', title: 'Pantry coffee & tea restock', type: 'supplies', requester: 'Office Admin', department: 'Administration', status: 'pending', priority: 'low', createdAt: '2024-06-07', notes: 'Monthly pantry refresh' },
  { id: 'req-06', title: 'Replace broken monitor arm', type: 'equipment', requester: 'Sneha Iyer', department: 'Design', status: 'approved', priority: 'medium', createdAt: '2024-06-05', notes: 'Arm hinge broken' },
  { id: 'req-07', title: 'Weekly snack delivery', type: 'food', requester: 'Culture Team', department: 'People Ops', status: 'fulfilled', priority: 'low', createdAt: '2024-06-01', notes: 'Delivered June 3' },
  { id: 'req-08', title: 'Deep cleaning — 5th floor', type: 'maintenance', requester: 'Facilities', department: 'Operations', status: 'fulfilled', priority: 'medium', createdAt: '2024-05-28', notes: 'Completed May 30' },
];

export const OFFICE_FOOD_ORDERS = [
  { id: 'food-01', vendorId: 'ven-02', menuItem: 'South Indian Lunch Thali', quantity: 80, orderDate: '2024-06-12', mealType: 'lunch', status: 'scheduled', attendees: 80, notes: 'All-hands meeting day' },
  { id: 'food-02', vendorId: 'ven-02', menuItem: 'Continental Breakfast Spread', quantity: 25, orderDate: '2024-06-13', mealType: 'breakfast', status: 'scheduled', attendees: 25, notes: 'Client workshop' },
  { id: 'food-03', vendorId: 'ven-02', menuItem: 'Snack Boxes (Assorted)', quantity: 50, orderDate: '2024-06-11', mealType: 'snacks', status: 'delivered', attendees: 50, notes: 'Friday snack hour' },
  { id: 'food-04', vendorId: 'ven-05', menuItem: 'Water Can Delivery (20L x 10)', quantity: 10, orderDate: '2024-06-10', mealType: 'snacks', status: 'delivered', attendees: 0, notes: 'Pantry refill' },
  { id: 'food-05', vendorId: 'ven-02', menuItem: 'North Indian Lunch', quantity: 120, orderDate: '2024-06-14', mealType: 'lunch', status: 'scheduled', attendees: 120, notes: 'Sales kickoff event' },
  { id: 'food-06', vendorId: 'ven-02', menuItem: 'Evening High-Tea', quantity: 30, orderDate: '2024-06-09', mealType: 'snacks', status: 'cancelled', attendees: 30, notes: 'Event postponed' },
];

export function officeIsLowStock(item) {
  return item.quantity <= item.minStock;
}
