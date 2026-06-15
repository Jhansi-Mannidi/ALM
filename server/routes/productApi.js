import { Router } from 'express';
import {
  pmProducts,
  pmComponents,
  pmFeatures,
  pmCustomers,
  pmThemes,
  pmInsights,
  pmIntegrations,
  pmInitiatives,
  pmOkrs,
  pmRoadmapItems,
  pmPortals,
  pmBriefs,
  pmDrivers,
  pmFormula,
  pmSegments,
  pmTags,
  pmCustomFields,
  pmDocs,
  pmWorkspaceMembers,
  pmAdoptionActivity,
  PM_PORTAL_COLUMNS,
  projects,
  findPmProduct,
  findPmFeature,
  findPmCustomer,
  pmScore,
} from '../store.js';

const router = Router();

function enrichInsight(ins) {
  const customer = findPmCustomer(ins.customerId);
  const feature = ins.featureId ? findPmFeature(ins.featureId) : null;
  const theme = pmThemes.find((t) => t.id === ins.themeId);
  return {
    ...ins,
    customerName: customer?.name,
    featureTitle: feature?.title,
    themeName: theme?.name,
  };
}

function enrichFeature(f) {
  const component = pmComponents.find((c) => c.id === f.componentId);
  const product = findPmProduct(f.productId);
  return {
    ...f,
    componentName: component?.name,
    productName: product?.name,
    score: pmScore(f),
  };
}

router.get('/product/dashboard', (_req, res) => {
  const unprocessed = pmInsights.filter((i) => i.status === 'unprocessed').length;
  const features = pmFeatures.map(enrichFeature);
  res.json({
    stats: {
      products: pmProducts.length,
      features: pmFeatures.length,
      insights: pmInsights.length,
      unprocessedInsights: unprocessed,
      customers: pmCustomers.length,
      initiatives: pmInitiatives.length,
      portals: pmPortals.filter((p) => p.published).length,
    },
    topFeatures: [...features].sort((a, b) => b.score - a.score).slice(0, 5),
    recentInsights: pmInsights
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .map(enrichInsight),
    integrationsConnected: pmIntegrations.filter((i) => i.connected).length,
  });
});

router.get('/product/products', (_req, res) => {
  const list = pmProducts.map((p) => {
    const comps = pmComponents.filter((c) => c.productId === p.id);
    const feats = pmFeatures.filter((f) => f.productId === p.id);
    const demand = feats.reduce((s, f) => s + (f.customerDemand || 0), 0);
    return { ...p, componentCount: comps.length, featureCount: feats.length, customerDemand: demand };
  });
  res.json(list);
});

router.post('/product/products', (req, res) => {
  const { name, description, almProjectId, color, status } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const product = {
    id: `prod-${Date.now()}`,
    name: String(name).trim(),
    description: String(description || '').trim(),
    almProjectId: almProjectId || null,
    color: color || '#2563EB',
    status: status || 'active',
  };
  pmProducts.push(product);
  res.status(201).json(product);
});

router.patch('/product/products/:id', (req, res) => {
  const p = findPmProduct(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  const { name, description, almProjectId, color, status } = req.body || {};
  if (name != null) p.name = String(name).trim();
  if (description != null) p.description = String(description).trim();
  if (almProjectId !== undefined) p.almProjectId = almProjectId || null;
  if (color) p.color = color;
  if (status) p.status = status;
  res.json(p);
});

router.delete('/product/products/:id', (req, res) => {
  const idx = pmProducts.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const id = req.params.id;
  pmProducts.splice(idx, 1);
  for (let i = pmComponents.length - 1; i >= 0; i -= 1) {
    if (pmComponents[i].productId === id) pmComponents.splice(i, 1);
  }
  for (let i = pmFeatures.length - 1; i >= 0; i -= 1) {
    if (pmFeatures[i].productId === id) pmFeatures.splice(i, 1);
  }
  for (let i = pmInitiatives.length - 1; i >= 0; i -= 1) {
    if (pmInitiatives[i].productId === id) pmInitiatives.splice(i, 1);
  }
  for (let i = pmOkrs.length - 1; i >= 0; i -= 1) {
    if (pmOkrs[i].productId === id) pmOkrs.splice(i, 1);
  }
  for (let i = pmRoadmapItems.length - 1; i >= 0; i -= 1) {
    if (pmRoadmapItems[i].productId === id) pmRoadmapItems.splice(i, 1);
  }
  for (let i = pmPortals.length - 1; i >= 0; i -= 1) {
    if (pmPortals[i].productId === id) pmPortals.splice(i, 1);
  }
  for (let i = pmBriefs.length - 1; i >= 0; i -= 1) {
    if (pmBriefs[i].productId === id) pmBriefs.splice(i, 1);
  }
  res.json({ ok: true });
});

router.get('/product/components', (req, res) => {
  let list = pmComponents;
  if (req.query.productId) list = list.filter((c) => c.productId === req.query.productId);
  res.json(
    list.map((c) => {
      const feats = pmFeatures.filter((f) => f.componentId === c.id);
      const demand = feats.reduce((s, f) => s + (f.customerDemand || 0), 0);
      return { ...c, featureCount: feats.length, customerDemand: demand };
    })
  );
});

router.post('/product/components', (req, res) => {
  const { productId, name, description } = req.body || {};
  if (!productId || !name?.trim()) return res.status(400).json({ error: 'Product and name required' });
  if (!findPmProduct(productId)) return res.status(400).json({ error: 'Invalid product' });
  const component = {
    id: `comp-${Date.now()}`,
    productId,
    name: String(name).trim(),
    description: String(description || '').trim(),
  };
  pmComponents.push(component);
  res.status(201).json(component);
});

router.patch('/product/components/:id', (req, res) => {
  const c = pmComponents.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Component not found' });
  const { name, description, productId } = req.body || {};
  if (name != null) c.name = String(name).trim();
  if (description != null) c.description = String(description).trim();
  if (productId && findPmProduct(productId)) {
    c.productId = productId;
    pmFeatures.filter((f) => f.componentId === c.id).forEach((f) => { f.productId = productId; });
  }
  res.json(c);
});

router.delete('/product/components/:id', (req, res) => {
  const idx = pmComponents.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Component not found' });
  const id = req.params.id;
  pmComponents.splice(idx, 1);
  for (let i = pmFeatures.length - 1; i >= 0; i -= 1) {
    if (pmFeatures[i].componentId === id) pmFeatures.splice(i, 1);
  }
  res.json({ ok: true });
});

router.get('/product/features', (req, res) => {
  let list = pmFeatures;
  if (req.query.productId) list = list.filter((f) => f.productId === req.query.productId);
  if (req.query.componentId) list = list.filter((f) => f.componentId === req.query.componentId);
  res.json(list.map(enrichFeature));
});

router.post('/product/features', (req, res) => {
  const {
    productId,
    componentId,
    title,
    description,
    impact,
    effort,
    customerDemand,
    status,
    linkedIssueId,
  } = req.body || {};
  if (!title?.trim() || !productId || !componentId) {
    return res.status(400).json({ error: 'Title, product, and component are required' });
  }
  if (!findPmProduct(productId)) return res.status(400).json({ error: 'Invalid product' });
  const component = pmComponents.find((c) => c.id === componentId && c.productId === productId);
  if (!component) return res.status(400).json({ error: 'Invalid component for this product' });

  const feature = {
    id: `feat-${Date.now()}`,
    productId,
    componentId,
    title: String(title).trim(),
    description: String(description || '').trim(),
    status: status || 'discovery',
    impact: Math.min(10, Math.max(1, Number(impact) || 5)),
    effort: Math.min(10, Math.max(1, Number(effort) || 5)),
    customerDemand: Math.max(0, Number(customerDemand) || 0),
    linkedIssueId: linkedIssueId?.trim() || null,
  };
  pmFeatures.push(feature);
  res.status(201).json(enrichFeature(feature));
});

router.patch('/product/features/:id', (req, res) => {
  const f = findPmFeature(req.params.id);
  if (!f) return res.status(404).json({ error: 'Feature not found' });
  const {
    impact, effort, status, customerDemand, title, description,
    productId, componentId, linkedIssueId,
  } = req.body || {};
  if (title != null) f.title = String(title).trim();
  if (description != null) f.description = String(description).trim();
  if (impact != null) f.impact = Math.min(10, Math.max(1, Number(impact)));
  if (effort != null) f.effort = Math.min(10, Math.max(1, Number(effort)));
  if (status) f.status = status;
  if (customerDemand != null) f.customerDemand = Math.max(0, Number(customerDemand));
  if (linkedIssueId !== undefined) f.linkedIssueId = linkedIssueId?.trim() || null;
  if (productId && findPmProduct(productId)) f.productId = productId;
  if (componentId) {
    const comp = pmComponents.find((c) => c.id === componentId && c.productId === f.productId);
    if (comp) f.componentId = componentId;
  }
  res.json(enrichFeature(f));
});

router.delete('/product/features/:id', (req, res) => {
  const idx = pmFeatures.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Feature not found' });
  const id = req.params.id;
  pmFeatures.splice(idx, 1);
  pmInsights.forEach((ins) => { if (ins.featureId === id) ins.featureId = null; });
  pmRoadmapItems.forEach((r) => { if (r.featureId === id) r.featureId = null; });
  pmInitiatives.forEach((init) => {
    init.featureIds = (init.featureIds || []).filter((fid) => fid !== id);
  });
  res.json({ ok: true });
});

router.get('/product/customers', (_req, res) => res.json(pmCustomers));

router.post('/product/customers', (req, res) => {
  const { name, segment, tier, contactEmail } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const c = {
    id: `cust-${Date.now()}`,
    name: String(name).trim(),
    segment: segment || 'Mid-market',
    tier: tier || 'Standard',
    notesCount: 0,
    contactEmail: contactEmail || '',
  };
  pmCustomers.push(c);
  res.status(201).json(c);
});

router.patch('/product/customers/:id', (req, res) => {
  const c = findPmCustomer(req.params.id);
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  const { name, segment, tier, contactEmail } = req.body || {};
  if (name != null) c.name = String(name).trim();
  if (segment != null) c.segment = segment;
  if (tier != null) c.tier = tier;
  if (contactEmail != null) c.contactEmail = contactEmail;
  res.json(c);
});

router.delete('/product/customers/:id', (req, res) => {
  const idx = pmCustomers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Customer not found' });
  pmCustomers.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/insights', (req, res) => {
  let list = pmInsights;
  if (req.query.status) list = list.filter((i) => i.status === req.query.status);
  if (req.query.customerId) list = list.filter((i) => i.customerId === req.query.customerId);
  res.json(list.map(enrichInsight).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

router.post('/product/insights', (req, res) => {
  const { customerId, title, body, source } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  const ins = {
    id: `ins-${Date.now()}`,
    customerId: customerId || pmCustomers[0]?.id,
    title: String(title).trim(),
    body: String(body || '').trim(),
    source: source || 'manual',
    status: 'unprocessed',
    themeId: null,
    featureId: null,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  pmInsights.unshift(ins);
  const cust = findPmCustomer(ins.customerId);
  if (cust) cust.notesCount = (cust.notesCount || 0) + 1;
  res.status(201).json(enrichInsight(ins));
});

router.patch('/product/insights/:id', (req, res) => {
  const ins = pmInsights.find((i) => i.id === req.params.id);
  if (!ins) return res.status(404).json({ error: 'Insight not found' });
  const { status, featureId, themeId, title, body, customerId, source } = req.body || {};
  if (title != null) ins.title = String(title).trim();
  if (body != null) ins.body = String(body).trim();
  if (customerId) ins.customerId = customerId;
  if (source) ins.source = source;
  if (status) ins.status = status;
  if (featureId !== undefined) ins.featureId = featureId;
  if (themeId !== undefined) ins.themeId = themeId;
  if (status === 'processed' && featureId) {
    const feat = findPmFeature(featureId);
    if (feat) feat.customerDemand = (feat.customerDemand || 0) + 1;
  }
  res.json(enrichInsight(ins));
});

router.delete('/product/insights/:id', (req, res) => {
  const idx = pmInsights.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Insight not found' });
  pmInsights.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/themes', (_req, res) => res.json(pmThemes));

router.get('/product/integrations', (_req, res) => res.json(pmIntegrations));

router.post('/product/integrations', (req, res) => {
  const { name, type } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const integ = {
    id: `int-${Date.now()}`,
    name: String(name).trim(),
    type: type || 'custom',
    status: 'available',
    connected: false,
    lastSync: null,
    icon: 'custom',
  };
  pmIntegrations.push(integ);
  res.status(201).json(integ);
});

router.patch('/product/integrations/:id', (req, res) => {
  const integ = pmIntegrations.find((i) => i.id === req.params.id);
  if (!integ) return res.status(404).json({ error: 'Integration not found' });
  const { connected, name, type } = req.body || {};
  if (name != null) integ.name = String(name).trim();
  if (type != null) integ.type = type;
  if (connected != null) {
    integ.connected = Boolean(connected);
    integ.status = integ.connected ? 'connected' : 'available';
    integ.lastSync = integ.connected ? new Date().toISOString() : null;
  }
  res.json(integ);
});

router.delete('/product/integrations/:id', (req, res) => {
  const idx = pmIntegrations.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Integration not found' });
  pmIntegrations.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/initiatives', (req, res) => {
  let list = pmInitiatives;
  if (req.query.productId) list = list.filter((i) => i.productId === req.query.productId);
  res.json(list);
});

router.post('/product/initiatives', (req, res) => {
  const { productId, name, description, status, startDate, endDate, featureIds } = req.body || {};
  if (!productId || !name?.trim()) return res.status(400).json({ error: 'Product and name required' });
  if (!findPmProduct(productId)) return res.status(400).json({ error: 'Invalid product' });
  const init = {
    id: `init-${Date.now()}`,
    productId,
    name: String(name).trim(),
    description: String(description || '').trim(),
    status: status || 'planning',
    startDate: startDate || new Date().toISOString().slice(0, 10),
    endDate: endDate || '',
    featureIds: Array.isArray(featureIds) ? featureIds : [],
  };
  pmInitiatives.push(init);
  res.status(201).json(init);
});

router.patch('/product/initiatives/:id', (req, res) => {
  const init = pmInitiatives.find((i) => i.id === req.params.id);
  if (!init) return res.status(404).json({ error: 'Initiative not found' });
  const { productId, name, description, status, startDate, endDate, featureIds } = req.body || {};
  if (productId && findPmProduct(productId)) init.productId = productId;
  if (name != null) init.name = String(name).trim();
  if (description != null) init.description = String(description).trim();
  if (status) init.status = status;
  if (startDate != null) init.startDate = startDate;
  if (endDate != null) init.endDate = endDate;
  if (featureIds) init.featureIds = featureIds;
  res.json(init);
});

router.delete('/product/initiatives/:id', (req, res) => {
  const idx = pmInitiatives.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Initiative not found' });
  pmInitiatives.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/okrs', (req, res) => {
  let list = pmOkrs;
  if (req.query.productId) list = list.filter((o) => o.productId === req.query.productId);
  res.json(list);
});

router.post('/product/okrs', (req, res) => {
  const { productId, objective, quarter, status, keyResults } = req.body || {};
  if (!productId || !objective?.trim()) return res.status(400).json({ error: 'Product and objective required' });
  if (!findPmProduct(productId)) return res.status(400).json({ error: 'Invalid product' });
  const okr = {
    id: `okr-${Date.now()}`,
    productId,
    objective: String(objective).trim(),
    quarter: quarter || 'Q1 2026',
    status: status || 'on-track',
    keyResults: Array.isArray(keyResults) ? keyResults : [],
  };
  pmOkrs.push(okr);
  res.status(201).json(okr);
});

router.patch('/product/okrs/:id', (req, res) => {
  const okr = pmOkrs.find((o) => o.id === req.params.id);
  if (!okr) return res.status(404).json({ error: 'OKR not found' });
  const { productId, objective, quarter, status, keyResults } = req.body || {};
  if (productId && findPmProduct(productId)) okr.productId = productId;
  if (objective != null) okr.objective = String(objective).trim();
  if (quarter != null) okr.quarter = quarter;
  if (status) okr.status = status;
  if (keyResults) okr.keyResults = keyResults;
  res.json(okr);
});

router.delete('/product/okrs/:id', (req, res) => {
  const idx = pmOkrs.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'OKR not found' });
  pmOkrs.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/prioritization', (req, res) => {
  let list = pmFeatures.map(enrichFeature);
  if (req.query.productId) list = list.filter((f) => f.productId === req.query.productId);
  list.sort((a, b) => b.score - a.score);
  res.json(list);
});

router.get('/product/roadmap', (req, res) => {
  let list = pmRoadmapItems;
  if (req.query.productId) list = list.filter((r) => r.productId === req.query.productId);
  const enriched = list.map((r) => {
    const feat = r.featureId ? findPmFeature(r.featureId) : null;
    const product = findPmProduct(r.productId);
    return { ...r, featureTitle: feat?.title, productName: product?.name, demand: feat?.customerDemand || 0 };
  });
  res.json(enriched);
});

router.post('/product/roadmap', (req, res) => {
  const { productId, featureId, title, lane, startDate, endDate, status } = req.body || {};
  if (!productId || !title?.trim()) return res.status(400).json({ error: 'Product and title required' });
  if (!findPmProduct(productId)) return res.status(400).json({ error: 'Invalid product' });
  const item = {
    id: `rm-${Date.now()}`,
    productId,
    featureId: featureId || null,
    title: String(title).trim(),
    lane: lane || 'later',
    startDate: startDate || new Date().toISOString().slice(0, 10),
    endDate: endDate || '',
    status: status || 'planned',
  };
  pmRoadmapItems.push(item);
  const feat = item.featureId ? findPmFeature(item.featureId) : null;
  const product = findPmProduct(item.productId);
  res.status(201).json({
    ...item,
    featureTitle: feat?.title,
    productName: product?.name,
    demand: feat?.customerDemand || 0,
  });
});

router.patch('/product/roadmap/:id', (req, res) => {
  const item = pmRoadmapItems.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Roadmap item not found' });
  const { productId, featureId, title, lane, startDate, endDate, status } = req.body || {};
  if (productId && findPmProduct(productId)) item.productId = productId;
  if (featureId !== undefined) item.featureId = featureId || null;
  if (title != null) item.title = String(title).trim();
  if (lane) item.lane = lane;
  if (startDate != null) item.startDate = startDate;
  if (endDate != null) item.endDate = endDate;
  if (status) item.status = status;
  const feat = item.featureId ? findPmFeature(item.featureId) : null;
  const product = findPmProduct(item.productId);
  res.json({
    ...item,
    featureTitle: feat?.title,
    productName: product?.name,
    demand: feat?.customerDemand || 0,
  });
});

router.delete('/product/roadmap/:id', (req, res) => {
  const idx = pmRoadmapItems.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Roadmap item not found' });
  pmRoadmapItems.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/releases', (req, res) => {
  const productId = req.query.productId;
  const product = productId ? findPmProduct(productId) : null;
  const projectIds = product ? [product.almProjectId] : pmProducts.map((p) => p.almProjectId);
  const releases = [];
  for (const pid of projectIds) {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) continue;
    for (const rel of proj.releases || []) {
      releases.push({
        ...rel,
        projectId: proj.id,
        projectName: proj.name,
        productId: pmProducts.find((p) => p.almProjectId === pid)?.id,
      });
    }
  }
  res.json(releases.sort((a, b) => (b.date || '').localeCompare(a.date || '')));
});

router.post('/product/releases', (req, res) => {
  const { productId, ver, date, type, changes, environment } = req.body || {};
  const product = findPmProduct(productId);
  if (!product?.almProjectId) return res.status(400).json({ error: 'Product with ALM project required' });
  const proj = projects.find((p) => p.id === product.almProjectId);
  if (!proj) return res.status(400).json({ error: 'ALM project not found' });
  const release = {
    id: `rel-${Date.now()}`,
    ver: ver || 'v1.0.0',
    date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    type: type || 'Minor',
    changes: changes || '',
    environment: environment || 'dev',
    testCasePct: 0,
    by: 'Product Manager',
  };
  if (!proj.releases) proj.releases = [];
  proj.releases.unshift(release);
  res.status(201).json({
    ...release,
    projectId: proj.id,
    projectName: proj.name,
    productId: product.id,
  });
});

router.patch('/product/releases/:projectId/:releaseId', (req, res) => {
  const proj = projects.find((p) => p.id === req.params.projectId);
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  const rel = (proj.releases || []).find((r) => r.id === req.params.releaseId);
  if (!rel) return res.status(404).json({ error: 'Release not found' });
  const { ver, date, type, changes, environment } = req.body || {};
  if (ver != null) rel.ver = ver;
  if (date != null) rel.date = date;
  if (type != null) rel.type = type;
  if (changes != null) rel.changes = changes;
  if (environment != null) rel.environment = environment;
  res.json({
    ...rel,
    projectId: proj.id,
    projectName: proj.name,
    productId: pmProducts.find((p) => p.almProjectId === proj.id)?.id,
  });
});

router.delete('/product/releases/:projectId/:releaseId', (req, res) => {
  const proj = projects.find((p) => p.id === req.params.projectId);
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  const idx = (proj.releases || []).findIndex((r) => r.id === req.params.releaseId);
  if (idx === -1) return res.status(404).json({ error: 'Release not found' });
  proj.releases.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/reports', (_req, res) => {
  const byTheme = pmThemes.map((t) => ({
    name: t.name,
    insights: pmInsights.filter((i) => i.themeId === t.id).length,
    features: t.featureIds?.length || 0,
  }));
  const byStatus = ['discovery', 'planned', 'in-progress', 'released'].map((s) => ({
    status: s,
    count: pmFeatures.filter((f) => f.status === s).length,
  }));
  const demandByProduct = pmProducts.map((p) => {
    const feats = pmFeatures.filter((f) => f.productId === p.id);
    return {
      product: p.name,
      demand: feats.reduce((sum, f) => sum + (f.customerDemand || 0), 0),
      features: feats.length,
    };
  });
  res.json({ byTheme, byStatus, demandByProduct, processedRate: Math.round(
    (pmInsights.filter((i) => i.status === 'processed').length / Math.max(pmInsights.length, 1)) * 100
  ) });
});

router.get('/product/portals', (_req, res) => res.json(pmPortals));

router.post('/product/portals', (req, res) => {
  const { name, productId, type } = req.body || {};
  if (!name?.trim() || !productId) return res.status(400).json({ error: 'Name and product required' });
  const portal = {
    id: `portal-${Date.now()}`,
    name: String(name).trim(),
    productId,
    type: type === 'public' ? 'public' : 'private',
    token: `share-${Date.now().toString(36)}`,
    published: false,
    views: 0,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  pmPortals.push(portal);
  res.status(201).json(portal);
});

router.patch('/product/portals/:id', (req, res) => {
  const portal = pmPortals.find((p) => p.id === req.params.id);
  if (!portal) return res.status(404).json({ error: 'Portal not found' });
  const { published, name, type, productId } = req.body || {};
  if (published != null) portal.published = Boolean(published);
  if (name) portal.name = String(name).trim();
  if (type) portal.type = type === 'public' ? 'public' : 'private';
  if (productId && findPmProduct(productId)) portal.productId = productId;
  portal.updatedAt = new Date().toISOString().slice(0, 10);
  res.json(portal);
});

router.delete('/product/portals/:id', (req, res) => {
  const idx = pmPortals.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Portal not found' });
  pmPortals.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/briefs', (req, res) => {
  let list = pmBriefs;
  if (req.query.productId) list = list.filter((b) => b.productId === req.query.productId);
  res.json(list);
});

router.post('/product/briefs', (req, res) => {
  const { productId, title, content } = req.body || {};
  if (!productId || !title?.trim()) return res.status(400).json({ error: 'Product and title required' });
  const brief = {
    id: `brief-${Date.now()}`,
    productId,
    title: String(title).trim(),
    content: content || '',
    status: 'draft',
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  pmBriefs.push(brief);
  res.status(201).json(brief);
});

router.patch('/product/briefs/:id', (req, res) => {
  const brief = pmBriefs.find((b) => b.id === req.params.id);
  if (!brief) return res.status(404).json({ error: 'Brief not found' });
  const { productId, title, content, status } = req.body || {};
  if (productId && findPmProduct(productId)) brief.productId = productId;
  if (title != null) brief.title = String(title).trim();
  if (content != null) brief.content = content;
  if (status) brief.status = status;
  brief.updatedAt = new Date().toISOString().slice(0, 10);
  res.json(brief);
});

router.delete('/product/briefs/:id', (req, res) => {
  const idx = pmBriefs.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Brief not found' });
  pmBriefs.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/share/:token', (req, res) => {
  const portal = pmPortals.find((p) => p.token === req.params.token && p.published);
  if (!portal) return res.status(404).json({ error: 'Portal not found' });
  portal.views = (portal.views || 0) + 1;
  const product = findPmProduct(portal.productId);
  const roadmap = pmRoadmapItems
    .filter((r) => r.productId === portal.productId)
    .map((r) => {
      const feat = r.featureId ? findPmFeature(r.featureId) : null;
      return { ...r, featureTitle: feat?.title };
    });
  res.json({
    portal: { name: portal.name, type: portal.type, token: portal.token },
    product,
    roadmap,
    initiatives: pmInitiatives.filter((i) => i.productId === portal.productId),
    portalColumns: PM_PORTAL_COLUMNS,
  });
});

router.post('/product/share/:token/ideas', (req, res) => {
  const portal = pmPortals.find((p) => p.token === req.params.token && p.published);
  if (!portal) return res.status(404).json({ error: 'Portal not found' });
  const { title, body, submitterName, submitterEmail } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  const ins = {
    id: `ins-${Date.now()}`,
    customerId: null,
    title: String(title).trim(),
    body: body || '',
    source: 'portal',
    status: 'unprocessed',
    themeId: null,
    featureId: null,
    portalId: portal.id,
    productId: portal.productId,
    submitterName: submitterName || 'Portal visitor',
    submitterEmail: submitterEmail || '',
    createdAt: new Date().toISOString().slice(0, 10),
  };
  pmInsights.push(ins);
  res.status(201).json({ ok: true, id: ins.id });
});

// ——— Data model admin ———
router.get('/product/data/drivers', (_req, res) => res.json(pmDrivers));
router.post('/product/data/drivers', (req, res) => {
  const { name, key, description, weight, scaleMin, scaleMax, inverse } = req.body || {};
  if (!name?.trim() || !key?.trim()) return res.status(400).json({ error: 'Name and key required' });
  const driver = {
    id: `drv-${Date.now()}`,
    name: String(name).trim(),
    key: String(key).trim(),
    description: description || '',
    weight: Number(weight) || 1,
    scaleMin: Number(scaleMin) || 0,
    scaleMax: Number(scaleMax) || 10,
    inverse: Boolean(inverse),
  };
  pmDrivers.push(driver);
  res.status(201).json(driver);
});
router.patch('/product/data/drivers/:id', (req, res) => {
  const driver = pmDrivers.find((d) => d.id === req.params.id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  Object.assign(driver, req.body || {});
  res.json(driver);
});
router.delete('/product/data/drivers/:id', (req, res) => {
  const idx = pmDrivers.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Driver not found' });
  pmDrivers.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/data/formula', (_req, res) => res.json(pmFormula));
router.patch('/product/data/formula', (req, res) => {
  const { name, expression, description } = req.body || {};
  if (name != null) pmFormula.name = name;
  if (expression != null) pmFormula.expression = expression;
  if (description != null) pmFormula.description = description;
  res.json(pmFormula);
});

router.get('/product/data/segments', (_req, res) => res.json(pmSegments));
router.post('/product/data/segments', (req, res) => {
  const { name, description } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const seg = { id: `seg-${Date.now()}`, name: String(name).trim(), description: description || '' };
  pmSegments.push(seg);
  res.status(201).json(seg);
});
router.patch('/product/data/segments/:id', (req, res) => {
  const seg = pmSegments.find((s) => s.id === req.params.id);
  if (!seg) return res.status(404).json({ error: 'Segment not found' });
  if (req.body?.name != null) seg.name = String(req.body.name).trim();
  if (req.body?.description != null) seg.description = req.body.description;
  res.json(seg);
});
router.delete('/product/data/segments/:id', (req, res) => {
  const idx = pmSegments.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Segment not found' });
  pmSegments.splice(idx, 1);
  res.json({ ok: true });
});

router.post('/product/themes', (req, res) => {
  const { name, featureIds } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const theme = {
    id: `theme-${Date.now()}`,
    name: String(name).trim(),
    insightCount: 0,
    featureIds: featureIds || [],
  };
  pmThemes.push(theme);
  res.status(201).json(theme);
});
router.patch('/product/themes/:id', (req, res) => {
  const theme = pmThemes.find((t) => t.id === req.params.id);
  if (!theme) return res.status(404).json({ error: 'Theme not found' });
  if (req.body?.name != null) theme.name = String(req.body.name).trim();
  if (req.body?.featureIds != null) theme.featureIds = req.body.featureIds;
  res.json(theme);
});
router.delete('/product/themes/:id', (req, res) => {
  const idx = pmThemes.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Theme not found' });
  pmThemes.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/data/tags', (_req, res) => res.json(pmTags));
router.post('/product/data/tags', (req, res) => {
  const { name, color } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const tag = { id: `tag-${Date.now()}`, name: String(name).trim(), color: color || '#64748B' };
  pmTags.push(tag);
  res.status(201).json(tag);
});
router.delete('/product/data/tags/:id', (req, res) => {
  const idx = pmTags.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Tag not found' });
  pmTags.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/product/data/custom-fields', (_req, res) => res.json(pmCustomFields));
router.post('/product/data/custom-fields', (req, res) => {
  const { entity, name, fieldKey, type, required } = req.body || {};
  if (!name?.trim() || !fieldKey?.trim()) return res.status(400).json({ error: 'Name and field key required' });
  const field = {
    id: `cf-${Date.now()}`,
    entity: entity || 'feature',
    name: String(name).trim(),
    fieldKey: String(fieldKey).trim(),
    type: type || 'text',
    required: Boolean(required),
  };
  pmCustomFields.push(field);
  res.status(201).json(field);
});
router.delete('/product/data/custom-fields/:id', (req, res) => {
  const idx = pmCustomFields.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Custom field not found' });
  pmCustomFields.splice(idx, 1);
  res.json({ ok: true });
});

// ——— Documents hub ———
router.get('/product/docs', (req, res) => {
  let list = pmDocs.map((d) => {
    const product = findPmProduct(d.productId);
    const feature = d.featureId ? findPmFeature(d.featureId) : null;
    return { ...d, productName: product?.name, featureTitle: feature?.title };
  });
  const tab = req.query.tab || 'all';
  const user = req.query.user || 'Jhansi Mannidi';
  if (tab === 'created') list = list.filter((d) => d.createdBy === user);
  else if (tab === 'shared-with-me') list = list.filter((d) => d.sharedWith?.includes(user) || d.sharedWith?.includes('u1'));
  else if (tab === 'shared-with-others') list = list.filter((d) => d.sharedWith?.length > 0);
  res.json(list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
});

router.post('/product/docs', (req, res) => {
  const { productId, title, content, status, featureId, sharedWith, createdBy } = req.body || {};
  if (!title?.trim() || !productId) return res.status(400).json({ error: 'Title and product required' });
  const doc = {
    id: `doc-${Date.now()}`,
    productId,
    title: String(title).trim(),
    content: content || '',
    status: status || 'draft',
    createdBy: createdBy || 'Jhansi Mannidi',
    ownerId: 'u1',
    sharedWith: sharedWith || [],
    featureId: featureId || null,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  pmDocs.push(doc);
  res.status(201).json(doc);
});

router.patch('/product/docs/:id', (req, res) => {
  const doc = pmDocs.find((d) => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  const fields = ['productId', 'title', 'content', 'status', 'featureId', 'sharedWith'];
  for (const f of fields) {
    if (req.body?.[f] != null) doc[f] = req.body[f];
  }
  doc.updatedAt = new Date().toISOString().slice(0, 10);
  res.json(doc);
});

router.delete('/product/docs/:id', (req, res) => {
  const idx = pmDocs.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Document not found' });
  pmDocs.splice(idx, 1);
  res.json({ ok: true });
});

// ——— Workspace adoption analytics ———
router.get('/product/adoption', (_req, res) => {
  const total = pmWorkspaceMembers.length;
  const active = pmWorkspaceMembers.filter((m) => m.status === 'active').length;
  const pending = pmWorkspaceMembers.filter((m) => m.status === 'pending').length;
  const byRole = ['maker', 'contributor', 'viewer'].map((role) => ({
    role,
    count: pmWorkspaceMembers.filter((m) => m.role === role).length,
  }));
  res.json({
    stats: {
      total,
      active,
      pending,
      activeRate: Math.round((active / Math.max(total, 1)) * 100),
      makerSeatsLeft: 'unlimited',
    },
    members: pmWorkspaceMembers,
    byRole,
    activity: pmAdoptionActivity,
  });
});

export default router;
