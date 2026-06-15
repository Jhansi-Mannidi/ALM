import { Router } from 'express';
import {
  officeInventory,
  officeRequests,
  officeVendors,
  officeFoodOrders,
  findOfficeVendor,
  officeIsLowStock,
} from '../store.js';

const router = Router();

function enrichFoodOrder(order) {
  const vendor = findOfficeVendor(order.vendorId);
  return { ...order, vendorName: vendor?.name };
}

router.get('/office/dashboard', (_req, res) => {
  const pendingRequests = officeRequests.filter((r) => r.status === 'pending').length;
  const lowStockItems = officeInventory.filter(officeIsLowStock).length;
  const vendorPaymentsDue = officeVendors.filter((v) => v.paymentStatus === 'due' || v.paymentStatus === 'overdue').length;
  const upcomingFood = officeFoodOrders.filter((f) => f.status === 'scheduled').length;

  res.json({
    stats: {
      pendingRequests,
      lowStockItems,
      vendorPaymentsDue,
      totalInventory: officeInventory.length,
      upcomingFood,
    },
    recentRequests: [...officeRequests]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
    lowStock: officeInventory.filter(officeIsLowStock).slice(0, 6),
    paymentsDue: officeVendors
      .filter((v) => v.paymentStatus === 'due' || v.paymentStatus === 'overdue')
      .sort((a, b) => (a.paymentDue || '').localeCompare(b.paymentDue || '')),
    upcomingOrders: officeFoodOrders
      .filter((f) => f.status === 'scheduled')
      .map(enrichFoodOrder)
      .sort((a, b) => a.orderDate.localeCompare(b.orderDate)),
  });
});

router.get('/office/inventory', (req, res) => {
  let list = officeInventory.map((item) => ({
    ...item,
    lowStock: officeIsLowStock(item),
  }));
  if (req.query.lowStock === 'true') list = list.filter((i) => i.lowStock);
  if (req.query.category) list = list.filter((i) => i.category === req.query.category);
  res.json(list.sort((a, b) => a.name.localeCompare(b.name)));
});

router.post('/office/inventory', (req, res) => {
  const { name, sku, category, quantity, minStock, unit, location } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const item = {
    id: `inv-${Date.now()}`,
    name: String(name).trim(),
    sku: sku || `SKU-${Date.now()}`,
    category: category || 'Stationery',
    quantity: Number(quantity) || 0,
    minStock: Number(minStock) || 10,
    unit: unit || 'units',
    location: location || 'Supply Room A',
    lastRestocked: new Date().toISOString().slice(0, 10),
  };
  officeInventory.push(item);
  res.status(201).json({ ...item, lowStock: officeIsLowStock(item) });
});

router.patch('/office/inventory/:id', (req, res) => {
  const item = officeInventory.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const { name, sku, category, quantity, minStock, unit, location, lastRestocked } = req.body || {};
  if (name != null) item.name = String(name).trim();
  if (sku != null) item.sku = sku;
  if (category != null) item.category = category;
  if (quantity != null) item.quantity = Number(quantity);
  if (minStock != null) item.minStock = Number(minStock);
  if (unit != null) item.unit = unit;
  if (location != null) item.location = location;
  if (lastRestocked != null) item.lastRestocked = lastRestocked;
  res.json({ ...item, lowStock: officeIsLowStock(item) });
});

router.delete('/office/inventory/:id', (req, res) => {
  const idx = officeInventory.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Item not found' });
  officeInventory.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/office/requests', (req, res) => {
  let list = [...officeRequests];
  if (req.query.status) list = list.filter((r) => r.status === req.query.status);
  if (req.query.type) list = list.filter((r) => r.type === req.query.type);
  res.json(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

router.post('/office/requests', (req, res) => {
  const { title, type, requester, department, priority, notes, status } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  const reqItem = {
    id: `req-${Date.now()}`,
    title: String(title).trim(),
    type: type || 'supplies',
    requester: requester || 'Office Admin',
    department: department || 'Administration',
    status: status || 'pending',
    priority: priority || 'medium',
    createdAt: new Date().toISOString().slice(0, 10),
    notes: notes || '',
  };
  officeRequests.push(reqItem);
  res.status(201).json(reqItem);
});

router.patch('/office/requests/:id', (req, res) => {
  const item = officeRequests.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Request not found' });
  const { title, type, requester, department, status, priority, notes } = req.body || {};
  if (title != null) item.title = String(title).trim();
  if (type != null) item.type = type;
  if (requester != null) item.requester = requester;
  if (department != null) item.department = department;
  if (status != null) item.status = status;
  if (priority != null) item.priority = priority;
  if (notes != null) item.notes = notes;
  res.json(item);
});

router.delete('/office/requests/:id', (req, res) => {
  const idx = officeRequests.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Request not found' });
  officeRequests.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/office/vendors', (_req, res) => {
  res.json([...officeVendors].sort((a, b) => a.name.localeCompare(b.name)));
});

router.post('/office/vendors', (req, res) => {
  const { name, category, contact, email, phone, paymentDue, amountDue, paymentStatus, contractEnd } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const vendor = {
    id: `ven-${Date.now()}`,
    name: String(name).trim(),
    category: category || 'General',
    contact: contact || '',
    email: email || '',
    phone: phone || '',
    paymentDue: paymentDue || null,
    amountDue: Number(amountDue) || 0,
    paymentStatus: paymentStatus || 'paid',
    contractEnd: contractEnd || null,
  };
  officeVendors.push(vendor);
  res.status(201).json(vendor);
});

router.patch('/office/vendors/:id', (req, res) => {
  const vendor = findOfficeVendor(req.params.id);
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
  const fields = ['name', 'category', 'contact', 'email', 'phone', 'paymentDue', 'paymentStatus', 'contractEnd'];
  for (const f of fields) {
    if (req.body?.[f] != null) vendor[f] = req.body[f];
  }
  if (req.body?.amountDue != null) vendor.amountDue = Number(req.body.amountDue);
  res.json(vendor);
});

router.delete('/office/vendors/:id', (req, res) => {
  const idx = officeVendors.findIndex((v) => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Vendor not found' });
  officeVendors.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/office/food', (req, res) => {
  let list = officeFoodOrders.map(enrichFoodOrder);
  if (req.query.status) list = list.filter((f) => f.status === req.query.status);
  if (req.query.mealType) list = list.filter((f) => f.mealType === req.query.mealType);
  res.json(list.sort((a, b) => b.orderDate.localeCompare(a.orderDate)));
});

router.post('/office/food', (req, res) => {
  const { vendorId, menuItem, quantity, orderDate, mealType, status, attendees, notes } = req.body || {};
  if (!menuItem?.trim()) return res.status(400).json({ error: 'Menu item required' });
  const order = {
    id: `food-${Date.now()}`,
    vendorId: vendorId || officeVendors[0]?.id,
    menuItem: String(menuItem).trim(),
    quantity: Number(quantity) || 1,
    orderDate: orderDate || new Date().toISOString().slice(0, 10),
    mealType: mealType || 'lunch',
    status: status || 'scheduled',
    attendees: Number(attendees) || 0,
    notes: notes || '',
  };
  officeFoodOrders.push(order);
  res.status(201).json(enrichFoodOrder(order));
});

router.patch('/office/food/:id', (req, res) => {
  const order = officeFoodOrders.find((f) => f.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const fields = ['vendorId', 'menuItem', 'orderDate', 'mealType', 'status', 'notes'];
  for (const f of fields) {
    if (req.body?.[f] != null) order[f] = req.body[f];
  }
  if (req.body?.quantity != null) order.quantity = Number(req.body.quantity);
  if (req.body?.attendees != null) order.attendees = Number(req.body.attendees);
  res.json(enrichFoodOrder(order));
});

router.delete('/office/food/:id', (req, res) => {
  const idx = officeFoodOrders.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  officeFoodOrders.splice(idx, 1);
  res.json({ ok: true });
});

export default router;
