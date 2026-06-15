import {
  USERS,
  ROLE_USERS,
  PROJECTS as SEED_PROJECTS,
  NOTIFS as SEED_NOTIFS,
  DEFAULT_CEREMONIES,
} from './data/seed.js';
import {
  INTERVIEW_STAGES as SEED_INTERVIEW_STAGES,
  HR_EMPLOYEES as SEED_HR_EMPLOYEES,
  JOB_OPENINGS as SEED_JOB_OPENINGS,
  CANDIDATES as SEED_CANDIDATES,
  INTERVIEWS as SEED_INTERVIEWS,
  FEEDBACK_FORMS as SEED_FEEDBACK_FORMS,
  ONBOARDING_NEW_HIRES as SEED_ONBOARDING,
  HR_DASHBOARD_STATS as SEED_HR_STATS,
  PENDING_APPROVALS as SEED_PENDING_APPROVALS,
  EMPLOYEE_HIKES as SEED_EMPLOYEE_HIKES,
  ASSET_TICKETS as SEED_ASSET_TICKETS,
  AI_TOOLS as SEED_AI_TOOLS,
  AI_SUBSCRIPTION_REQUESTS as SEED_AI_SUBSCRIPTION_REQUESTS,
  AI_ACTIVE_SUBSCRIPTIONS as SEED_AI_ACTIVE_SUBSCRIPTIONS,
  HIKE_WORKFLOWS as SEED_HIKE_WORKFLOWS,
  HIKE_REVIEW_CYCLE,
  EXIT_REQUESTS as SEED_EXIT_REQUESTS,
} from './data/hrSeed.js';
import {
  FINANCE_SETTINGS as SEED_FINANCE_SETTINGS,
  CHART_OF_ACCOUNTS as SEED_CHART_OF_ACCOUNTS,
  JOURNAL_ENTRIES as SEED_JOURNAL_ENTRIES,
  FINANCE_INVOICES as SEED_FINANCE_INVOICES,
  FINANCE_EXPENSES as SEED_FINANCE_EXPENSES,
  FINANCE_PAYMENTS as SEED_FINANCE_PAYMENTS,
  FINANCE_VENDORS as SEED_FINANCE_VENDORS,
  FINANCE_BUDGETS as SEED_FINANCE_BUDGETS,
  FINANCE_DASHBOARD as SEED_FINANCE_DASHBOARD,
} from './data/financeSeed.js';
import {
  FINANCE_CUSTOMERS as SEED_FINANCE_CUSTOMERS,
  FINANCE_QUOTES as SEED_FINANCE_QUOTES,
  FINANCE_SALES_ORDERS as SEED_FINANCE_SALES_ORDERS,
  FINANCE_RECURRING_INVOICES as SEED_FINANCE_RECURRING_INVOICES,
  FINANCE_DELIVERY_CHALLANS as SEED_FINANCE_DELIVERY_CHALLANS,
  FINANCE_PAYMENTS_RECEIVED as SEED_FINANCE_PAYMENTS_RECEIVED,
  FINANCE_CREDIT_NOTES as SEED_FINANCE_CREDIT_NOTES,
  FINANCE_EWAY_BILLS as SEED_FINANCE_EWAY_BILLS,
  FINANCE_RECURRING_EXPENSES as SEED_FINANCE_RECURRING_EXPENSES,
  FINANCE_PURCHASE_ORDERS as SEED_FINANCE_PURCHASE_ORDERS,
  FINANCE_BILLS as SEED_FINANCE_BILLS,
  FINANCE_RECURRING_BILLS as SEED_FINANCE_RECURRING_BILLS,
  FINANCE_VENDOR_CREDITS as SEED_FINANCE_VENDOR_CREDITS,
  FINANCE_BANK_ACCOUNTS as SEED_FINANCE_BANK_ACCOUNTS,
  FINANCE_BANK_TRANSACTIONS as SEED_FINANCE_BANK_TRANSACTIONS,
  FINANCE_ITEMS as SEED_FINANCE_ITEMS,
  FINANCE_TIME_ENTRIES as SEED_FINANCE_TIME_ENTRIES,
  FINANCE_DOCUMENTS as SEED_FINANCE_DOCUMENTS,
  FINANCE_CURRENCY_ADJUSTMENTS as SEED_FINANCE_CURRENCY_ADJUSTMENTS,
  FINANCE_TRANSACTION_LOCKS as SEED_FINANCE_TRANSACTION_LOCKS,
  FINANCE_BULK_UPDATES as SEED_FINANCE_BULK_UPDATES,
  FINANCE_REPORT_CATALOG as SEED_FINANCE_REPORT_CATALOG,
} from './data/financeModulesSeed.js';
import {
  PM_PRODUCTS as SEED_PM_PRODUCTS,
  PM_COMPONENTS as SEED_PM_COMPONENTS,
  PM_FEATURES as SEED_PM_FEATURES,
  PM_CUSTOMERS as SEED_PM_CUSTOMERS,
  PM_THEMES as SEED_PM_THEMES,
  PM_INSIGHTS as SEED_PM_INSIGHTS,
  PM_INTEGRATIONS as SEED_PM_INTEGRATIONS,
  PM_INITIATIVES as SEED_PM_INITIATIVES,
  PM_OKRS as SEED_PM_OKRS,
  PM_ROADMAP_ITEMS as SEED_PM_ROADMAP_ITEMS,
  PM_PORTALS as SEED_PM_PORTALS,
  PM_BRIEFS as SEED_PM_BRIEFS,
  pmScore as legacyPmScore,
} from './data/productSeed.js';
import {
  PM_DRIVERS as SEED_PM_DRIVERS,
  PM_FORMULA as SEED_PM_FORMULA,
  PM_SEGMENTS as SEED_PM_SEGMENTS,
  PM_TAGS as SEED_PM_TAGS,
  PM_CUSTOM_FIELDS as SEED_PM_CUSTOM_FIELDS,
  PM_DOCS as SEED_PM_DOCS,
  PM_WORKSPACE_MEMBERS as SEED_PM_WORKSPACE_MEMBERS,
  PM_ADOPTION_ACTIVITY as SEED_PM_ADOPTION_ACTIVITY,
  PM_PORTAL_COLUMNS,
} from './data/productDataSeed.js';
import {
  OFFICE_INVENTORY as SEED_OFFICE_INVENTORY,
  OFFICE_REQUESTS as SEED_OFFICE_REQUESTS,
  OFFICE_VENDORS as SEED_OFFICE_VENDORS,
  OFFICE_FOOD_ORDERS as SEED_OFFICE_FOOD_ORDERS,
  officeIsLowStock,
} from './data/officeSeed.js';
import { migrateProjectWorkflowStatuses } from './utils/workflowStatuses.js';

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

export const users = clone(USERS);
const seedReportsTo = new Map(USERS.map((u) => [u.id, u.reportsTo ?? '']));
for (const u of users) {
  if (!u.reportsTo && seedReportsTo.get(u.id)) {
    u.reportsTo = seedReportsTo.get(u.id);
  }
}
export const roleUsers = clone(ROLE_USERS);
export let projects = clone(SEED_PROJECTS);
export let notifications = clone(SEED_NOTIFS);

for (const p of projects) {
  migrateProjectWorkflowStatuses(p);
  migrateProjectReleases(p);
}

function migrateProjectReleases(project) {
  const statusToEnv = { Stable: 'prod', Beta: 'qa', Deprecated: 'prod', 'Rolling Out': 'uat' };
  for (const release of project.releases || []) {
    if (!release.environment && release.status) {
      release.environment = statusToEnv[release.status] || 'prod';
    }
    if (!release.environment) release.environment = 'prod';
    if (release.testCasePct == null) release.testCasePct = 85;
    delete release.status;
  }
}

function seedDemoTimeLogs() {
  const today = new Date().toISOString().slice(0, 10);
  const p1 = projects.find((p) => p.id === 'p1');
  if (!p1) return;
  if (!p1.timeLogs) p1.timeLogs = [];
  if (p1.timeLogs.some((l) => l.date === today)) return;

  const at = (hours, minutes) => {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  p1.timeLogs.push(
    {
      id: 'tl-demo-1',
      userId: 'u3',
      targetType: 'issue',
      targetId: 'PHXN-279',
      startedAt: at(9, 0),
      endedAt: at(10, 15),
      date: today,
      durationMinutes: 75,
    },
    {
      id: 'tl-demo-2',
      userId: 'u3',
      targetType: 'issue',
      targetId: 'PHXN-275b',
      startedAt: at(11, 0),
      endedAt: at(12, 30),
      date: today,
      durationMinutes: 90,
    },
    {
      id: 'tl-demo-3',
      userId: 'u2',
      targetType: 'issue',
      targetId: 'PHXN-275',
      startedAt: at(9, 30),
      endedAt: at(11, 0),
      date: today,
      durationMinutes: 90,
    },
    {
      id: 'tl-demo-4',
      userId: 'u9',
      targetType: 'issue',
      targetId: 'PHXN-284',
      startedAt: at(10, 0),
      endedAt: at(11, 30),
      date: today,
      durationMinutes: 90,
    },
    {
      id: 'tl-demo-5',
      userId: 'u4',
      targetType: 'issue',
      targetId: 'PHXN-241',
      startedAt: at(14, 0),
      endedAt: at(16, 0),
      date: today,
      durationMinutes: 120,
    },
    {
      id: 'tl-demo-6',
      userId: 'u9',
      targetType: 'bug',
      targetId: 'BUG-041',
      startedAt: at(13, 0),
      endedAt: at(13, 45),
      date: today,
      durationMinutes: 45,
    },
  );
}

function seedWeekHistoricalTimeLogs() {
  const p1 = projects.find((p) => p.id === 'p1');
  if (!p1) return;
  if (!p1.timeLogs) p1.timeLogs = [];
  if (p1.timeLogs.some((l) => String(l.id).startsWith('tl-week-'))) return;

  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const dateISO = (offsetFromMonday) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + offsetFromMonday);
    return d.toISOString().slice(0, 10);
  };

  const at = (dateStr, hours, minutes) => {
    const d = new Date(`${dateStr}T12:00:00`);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  const mon = dateISO(0);
  const tue = dateISO(1);
  const wed = dateISO(2);
  const thu = dateISO(3);

  p1.timeLogs.push(
    {
      id: 'tl-week-1',
      userId: 'u2',
      targetType: 'issue',
      targetId: 'PHXN-275',
      startedAt: at(mon, 9, 0),
      endedAt: at(mon, 11, 30),
      date: mon,
      durationMinutes: 150,
    },
    {
      id: 'tl-week-2',
      userId: 'u3',
      targetType: 'issue',
      targetId: 'PHXN-279',
      startedAt: at(mon, 10, 0),
      endedAt: at(mon, 12, 0),
      date: mon,
      durationMinutes: 120,
    },
    {
      id: 'tl-week-3',
      userId: 'u4',
      targetType: 'issue',
      targetId: 'PHXN-241',
      startedAt: at(tue, 9, 30),
      endedAt: at(tue, 12, 0),
      date: tue,
      durationMinutes: 150,
    },
    {
      id: 'tl-week-4',
      userId: 'u9',
      targetType: 'bug',
      targetId: 'BUG-041',
      startedAt: at(tue, 14, 0),
      endedAt: at(tue, 15, 30),
      date: tue,
      durationMinutes: 90,
    },
    {
      id: 'tl-week-5',
      userId: 'u2',
      targetType: 'issue',
      targetId: 'PHXN-284',
      startedAt: at(wed, 8, 30),
      endedAt: at(wed, 10, 0),
      date: wed,
      durationMinutes: 90,
    },
    {
      id: 'tl-week-6',
      userId: 'u3',
      targetType: 'issue',
      targetId: 'PHXN-275b',
      startedAt: at(wed, 13, 0),
      endedAt: at(wed, 16, 0),
      date: wed,
      durationMinutes: 180,
    },
    {
      id: 'tl-week-7',
      userId: 'u4',
      targetType: 'issue',
      targetId: 'PHXN-241',
      startedAt: at(thu, 10, 0),
      endedAt: at(thu, 11, 45),
      date: thu,
      durationMinutes: 105,
    },
  );
}

function ensureCeremonies() {
  for (const p of projects) {
    if (!p.ceremonies?.length) {
      p.ceremonies = clone(DEFAULT_CEREMONIES);
    }
  }
}

function patchCeremonyDateFields() {
  const today = new Date();
  const iso = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  for (const p of projects) {
    for (const c of p.ceremonies || []) {
      if (c.startDate) continue;
      if (c.icon === 'standup') {
        c.startDate = iso(0);
        c.endDate = iso(11);
        c.dailyTime = c.dailyTime || '09:30';
      } else {
        c.startDate = iso(0);
        c.endDate = iso(0);
        c.dailyTime = c.dailyTime || '';
      }
    }
  }
}

seedDemoTimeLogs();
seedWeekHistoricalTimeLogs();
ensureCeremonies();
patchCeremonyDateFields();

function seedCalendarDueDates() {
  const today = new Date();
  const iso = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const p1 = projects.find((p) => p.id === 'p1');
  if (!p1?.issues?.length) return;
  const offsets = [0, 1, 1, 2, 3, 5, 7, 10];
  p1.issues.slice(0, offsets.length).forEach((issue, i) => {
    issue.due = iso(offsets[i]);
  });
  const bug = (p1.bugs || []).find((b) => b.id === 'BUG-041');
  if (bug) bug.dueTime = `${iso(2)}T17:00:00`;
}

seedCalendarDueDates();

export function findProject(id) {
  return projects.find((p) => p.id === id);
}

export function findUser(id) {
  return users.find((u) => u.id === id);
}

export const interviewStages = clone(SEED_INTERVIEW_STAGES);
export const hrEmployees = clone(SEED_HR_EMPLOYEES);
export let jobOpenings = clone(SEED_JOB_OPENINGS);
export let candidates = clone(SEED_CANDIDATES);
export let interviews = clone(SEED_INTERVIEWS);
export let feedbackForms = clone(SEED_FEEDBACK_FORMS);
export let onboardingNewHires = clone(SEED_ONBOARDING);
export const hrDashboardStats = clone(SEED_HR_STATS);
export let pendingApprovals = clone(SEED_PENDING_APPROVALS);
export let employeeHikes = clone(SEED_EMPLOYEE_HIKES);
export let assetTickets = clone(SEED_ASSET_TICKETS);
export const aiTools = clone(SEED_AI_TOOLS);
export let aiSubscriptionRequests = clone(SEED_AI_SUBSCRIPTION_REQUESTS);
export let aiActiveSubscriptions = clone(SEED_AI_ACTIVE_SUBSCRIPTIONS);
export let hikeWorkflows = clone(SEED_HIKE_WORKFLOWS);
export let exitRequests = clone(SEED_EXIT_REQUESTS);
export let financeSettings = clone(SEED_FINANCE_SETTINGS);
export let chartOfAccounts = clone(SEED_CHART_OF_ACCOUNTS);
export let journalEntries = clone(SEED_JOURNAL_ENTRIES);
export let financeInvoices = clone(SEED_FINANCE_INVOICES);
export let financeExpenses = clone(SEED_FINANCE_EXPENSES);
export let financePayments = clone(SEED_FINANCE_PAYMENTS);
export let financeVendors = clone(SEED_FINANCE_VENDORS);
export let financeBudgets = clone(SEED_FINANCE_BUDGETS);
export const financeDashboard = clone(SEED_FINANCE_DASHBOARD);
export let financeCustomers = clone(SEED_FINANCE_CUSTOMERS);
export let financeQuotes = clone(SEED_FINANCE_QUOTES);
export let financeSalesOrders = clone(SEED_FINANCE_SALES_ORDERS);
export let financeRecurringInvoices = clone(SEED_FINANCE_RECURRING_INVOICES);
export let financeDeliveryChallans = clone(SEED_FINANCE_DELIVERY_CHALLANS);
export let financePaymentsReceived = clone(SEED_FINANCE_PAYMENTS_RECEIVED);
export let financeCreditNotes = clone(SEED_FINANCE_CREDIT_NOTES);
export let financeEwayBills = clone(SEED_FINANCE_EWAY_BILLS);
export let financeRecurringExpenses = clone(SEED_FINANCE_RECURRING_EXPENSES);
export let financePurchaseOrders = clone(SEED_FINANCE_PURCHASE_ORDERS);
export let financeBills = clone(SEED_FINANCE_BILLS);
export let financeRecurringBills = clone(SEED_FINANCE_RECURRING_BILLS);
export let financeVendorCredits = clone(SEED_FINANCE_VENDOR_CREDITS);
export let financeBankAccounts = clone(SEED_FINANCE_BANK_ACCOUNTS);
export let financeBankTransactions = clone(SEED_FINANCE_BANK_TRANSACTIONS);
export let financeItems = clone(SEED_FINANCE_ITEMS);
export let financeTimeEntries = clone(SEED_FINANCE_TIME_ENTRIES);
export let financeDocuments = clone(SEED_FINANCE_DOCUMENTS);
export let financeCurrencyAdjustments = clone(SEED_FINANCE_CURRENCY_ADJUSTMENTS);
export let financeTransactionLocks = clone(SEED_FINANCE_TRANSACTION_LOCKS);
export let financeBulkUpdates = clone(SEED_FINANCE_BULK_UPDATES);
export let financeReportCatalog = clone(SEED_FINANCE_REPORT_CATALOG);
export { HIKE_REVIEW_CYCLE };

export let pmProducts = clone(SEED_PM_PRODUCTS);
export let pmComponents = clone(SEED_PM_COMPONENTS);
export let pmFeatures = clone(SEED_PM_FEATURES);
export let pmCustomers = clone(SEED_PM_CUSTOMERS);
export let pmThemes = clone(SEED_PM_THEMES);
export let pmInsights = clone(SEED_PM_INSIGHTS);
export let pmIntegrations = clone(SEED_PM_INTEGRATIONS);
export let pmInitiatives = clone(SEED_PM_INITIATIVES);
export let pmOkrs = clone(SEED_PM_OKRS);
export let pmRoadmapItems = clone(SEED_PM_ROADMAP_ITEMS);
export let pmPortals = clone(SEED_PM_PORTALS);
export let pmBriefs = clone(SEED_PM_BRIEFS);

export let pmDrivers = clone(SEED_PM_DRIVERS);
export let pmFormula = clone(SEED_PM_FORMULA);
export let pmSegments = clone(SEED_PM_SEGMENTS);
export let pmTags = clone(SEED_PM_TAGS);
export let pmCustomFields = clone(SEED_PM_CUSTOM_FIELDS);
export let pmDocs = clone(SEED_PM_DOCS);
export let pmWorkspaceMembers = clone(SEED_PM_WORKSPACE_MEMBERS);
export let pmAdoptionActivity = clone(SEED_PM_ADOPTION_ACTIVITY);
export { PM_PORTAL_COLUMNS };

export function pmScore(feature) {
  const impact = Number(feature.impact) || 0;
  const effort = Math.max(1, Number(feature.effort) || 1);
  const demand = Number(feature.customerDemand) || 0;
  const reach = Number(feature.reach) || 1;
  try {
    const expr = pmFormula?.expression || '(impact * customerDemand) / effort';
    const fn = new Function('impact', 'effort', 'customerDemand', 'reach', `return ${expr}`);
    const result = fn(impact, effort, demand, reach);
    return Math.round(Number.isFinite(result) ? result : legacyPmScore(feature));
  } catch {
    return legacyPmScore(feature);
  }
}

export let officeInventory = clone(SEED_OFFICE_INVENTORY);
export let officeRequests = clone(SEED_OFFICE_REQUESTS);
export let officeVendors = clone(SEED_OFFICE_VENDORS);
export let officeFoodOrders = clone(SEED_OFFICE_FOOD_ORDERS);
export { officeIsLowStock };

export function findOfficeVendor(id) {
  return officeVendors.find((v) => v.id === id);
}

export function findPmProduct(id) {
  return pmProducts.find((p) => p.id === id);
}

export function findPmFeature(id) {
  return pmFeatures.find((f) => f.id === id);
}

export function findPmCustomer(id) {
  return pmCustomers.find((c) => c.id === id);
}

export function findHrEmployee(id) {
  return hrEmployees.find((e) => e.id === id);
}

export function findOnboardingHire(id) {
  return onboardingNewHires.find((h) => h.id === id);
}

export function findJob(id) {
  return jobOpenings.find((j) => j.id === id);
}

export function findCandidate(id) {
  return candidates.find((c) => c.id === id);
}

export function findInterview(id) {
  return interviews.find((i) => i.id === id);
}
