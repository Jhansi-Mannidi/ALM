export const FREIGHT_LOCATIONS = [
  'Ras Al Khaimah, UAE',
  'Dubai, UAE',
  'Mumbai, India',
  'Singapore',
];

export const FREIGHT_MODULE_RAIL = [
  { id: 'leads', label: 'Leads', icon: 'users', path: '/workspace/freight/leads', color: '#7C3AED' },
  { id: 'sales', label: 'Sales', icon: 'cart', path: '/workspace/freight/sales', color: '#059669' },
  { id: 'accounting', label: 'Accounting', icon: 'dollar', path: '/workspace/freight/accounting', color: '#2563EB' },
  { id: 'tracking', label: 'Track & Trace', icon: 'truck', path: '/workspace/freight/tracking', color: '#0891B2' },
];

export const FREIGHT_LEADS_NAV = [
  { id: 'all', label: 'All Leads', path: '/workspace/freight/leads', icon: 'layoutGrid', end: true },
  { id: 'suspects', label: 'Suspects', path: '/workspace/freight/leads/suspects', icon: 'users' },
  { id: 'prospects', label: 'Prospects', path: '/workspace/freight/leads/prospects', icon: 'userPlus' },
  { id: 'opportunities', label: 'Opportunity', path: '/workspace/freight/leads/opportunities', icon: 'trendingUp' },
  { id: 'customers', label: 'Customer', path: '/workspace/freight/leads/customers', icon: 'users' },
];

export const LEAD_STATES = ['Suspect', 'Prospect', 'Opportunity', 'Customer'];

export function leadStateChip(state) {
  const map = {
    Suspect: 'chip-blue',
    Prospect: 'chip-purple',
    Opportunity: 'chip-amber',
    Customer: 'chip-green',
  };
  return map[state] ?? 'chip-gray';
}

export function leadFilterFromPath(pathname) {
  if (pathname.endsWith('/suspects')) return 'suspects';
  if (pathname.endsWith('/prospects')) return 'prospects';
  if (pathname.endsWith('/opportunities')) return 'opportunities';
  if (pathname.endsWith('/customers')) return 'customers';
  return 'all';
}

export const FREIGHT_ERP_APPS = [
  { id: 'freight-leads', name: 'Leads', description: 'Leads Management', icon: 'users', color: '#7C3AED', route: '/workspace/freight/leads' },
  { id: 'freight-sales', name: 'Sales', description: 'Sales Activities', icon: 'cart', color: '#059669', route: '/workspace/freight/sales' },
  { id: 'freight-accounting', name: 'Accounting', description: 'Financial Records', icon: 'dollar', color: '#2563EB' },
  { id: 'freight-tracking', name: 'Track & Trace', description: 'Shipment Tracking', icon: 'truck', color: '#0891B2' },
  { id: 'freight-quotations', name: 'Quotations', description: 'Quote Management', icon: 'fileText', color: '#EA580C' },
  { id: 'freight-bookings', name: 'Bookings', description: 'Freight Bookings', icon: 'clipboard', color: '#DB2777' },
  { id: 'freight-shipments', name: 'Shipments', description: 'Shipment Operations', icon: 'package', color: '#4F46E5' },
  { id: 'freight-customs', name: 'Customs', description: 'Customs Clearance', icon: 'shield', color: '#0D9488' },
  { id: 'freight-warehousing', name: 'Warehousing', description: 'Warehouse Ops', icon: 'building', color: '#CA8A04' },
  { id: 'freight-fleet', name: 'Fleet', description: 'Fleet Management', icon: 'truck', color: '#DC2626' },
  { id: 'freight-rates', name: 'Rate Cards', description: 'Pricing & Tariffs', icon: 'layers', color: '#9333EA' },
  { id: 'freight-documents', name: 'Documents', description: 'Document Center', icon: 'fileSpreadsheet', color: '#0284C7' },
  { id: 'freight-partners', name: 'Partners', description: 'Agent Network', icon: 'globe', color: '#16A34A' },
  { id: 'freight-analytics', name: 'Analytics', description: 'Business Intelligence', icon: 'barChart3', color: '#6366F1' },
  { id: 'freight-compliance', name: 'Compliance', description: 'Regulatory Compliance', icon: 'shieldCheck', color: '#B45309' },
  { id: 'freight-billing', name: 'Billing', description: 'Invoicing & Billing', icon: 'fileText', color: '#BE185D' },
  { id: 'freight-crm', name: 'CRM Hub', description: 'Customer 360', icon: 'users', color: '#7C3AED' },
  { id: 'freight-settings', name: 'Settings', description: 'Solution Settings', icon: 'settings', color: '#64748B' },
];

export const DEMO_LEADS = [
  { id: 'L001', organization: 'SGS Logistics', createdBy: 'Anil Kumar', createdIni: 'AK', contact: 'Ravi Menon', contactIni: 'RM', industry: 'Air Lines', state: 'Suspect', email: 'ravi@sgslogistics.com', phone: '+971 50 123 4567' },
  { id: 'L002', organization: 'Gulf Freight Co.', createdBy: 'Jhansi Mannidi', createdIni: 'JM', contact: 'Sarah Al Mansoori', contactIni: 'SA', industry: 'Automobiles', state: 'Customer', email: 'sarah@gulffreight.ae', phone: '+971 55 234 5678' },
  { id: 'L003', organization: 'Oceanic Cargo LLC', createdBy: 'Sasi Paul', createdIni: 'SP', contact: 'Mohammed Hassan', contactIni: 'MH', industry: 'Marine', state: 'Prospect', email: 'm.hassan@oceaniccargo.com', phone: '+971 52 345 6789' },
  { id: 'L004', organization: 'Emirates Trade Hub', createdBy: 'Priya Sharma', createdIni: 'PS', contact: 'Fatima Noor', contactIni: 'FN', industry: 'Trading', state: 'Suspect', email: 'fatima@emiratestrade.ae', phone: '+971 54 456 7890' },
  { id: 'L005', organization: 'RAK Port Services', createdBy: 'Michael Chen', createdIni: 'MC', contact: 'Omar Khalid', contactIni: 'OK', industry: 'Logistics', state: 'Opportunity', email: 'omar@rakport.ae', phone: '+971 56 567 8901' },
  { id: 'L006', organization: 'Blue Horizon Shipping', createdBy: 'Alice Brown', createdIni: 'AB', contact: 'Lisa Wong', contactIni: 'LW', industry: 'Freight Forwarding', state: 'Customer', email: 'lisa@bluehorizon.com', phone: '+971 50 678 9012' },
  { id: 'L007', organization: 'Desert Star Logistics', createdBy: 'Ram Reddy', createdIni: 'RR', contact: 'Khalid Ibrahim', contactIni: 'KI', industry: 'Warehousing', state: 'Suspect', email: 'khalid@desertstar.ae', phone: '+971 55 789 0123' },
  { id: 'L008', organization: 'Trans Gulf Lines', createdBy: 'Anil Kumar', createdIni: 'AK', contact: 'Nadia Farouk', contactIni: 'NF', industry: 'Air Lines', state: 'Prospect', email: 'nadia@transgulf.ae', phone: '+971 52 890 1234' },
  { id: 'L009', organization: 'Prime Movers FZE', createdBy: 'Jhansi Mannidi', createdIni: 'JM', contact: 'Vikram Patel', contactIni: 'VP', industry: 'Road Transport', state: 'Customer', email: 'vikram@primemovers.ae', phone: '+971 54 901 2345' },
  { id: 'L010', organization: 'Harbour Link Cargo', createdBy: 'Sasi Paul', createdIni: 'SP', contact: 'Amira Saleh', contactIni: 'AS', industry: 'Marine', state: 'Suspect', email: 'amira@harbourlink.ae', phone: '+971 56 012 3456' },
  { id: 'L011', organization: 'SkyBridge Freight', createdBy: 'Priya Sharma', createdIni: 'PS', contact: 'James Cooper', contactIni: 'JC', industry: 'Air Lines', state: 'Customer', email: 'james@skybridge.com', phone: '+971 50 123 7890' },
  { id: 'L012', organization: 'Al Noor Trading', createdBy: 'Michael Chen', createdIni: 'MC', contact: 'Hassan Ali', contactIni: 'HA', industry: 'Trading', state: 'Prospect', email: 'hassan@alnoor.ae', phone: '+971 55 234 8901' },
  { id: 'L013', organization: 'Coastal Express', createdBy: 'Alice Brown', createdIni: 'AB', contact: 'Meera Nair', contactIni: 'MN', industry: 'Courier', state: 'Suspect', email: 'meera@coastalexpress.ae', phone: '+971 52 345 9012' },
  { id: 'L014', organization: 'Global Reach Logistics', createdBy: 'Ram Reddy', createdIni: 'RR', contact: 'David Miller', contactIni: 'DM', industry: 'Freight Forwarding', state: 'Opportunity', email: 'david@globalreach.com', phone: '+971 54 456 0123' },
  { id: 'L015', organization: 'Falcon Cargo Services', createdBy: 'Anil Kumar', createdIni: 'AK', contact: 'Zainab Rahman', contactIni: 'ZR', industry: 'Air Lines', state: 'Customer', email: 'zainab@falconcargo.ae', phone: '+971 56 567 1234' },
  { id: 'L016', organization: 'Metro Freight Solutions', createdBy: 'Jhansi Mannidi', createdIni: 'JM', contact: 'Tom Bradley', contactIni: 'TB', industry: 'Automobiles', state: 'Suspect', email: 'tom@metrofreight.ae', phone: '+971 50 678 2345' },
  { id: 'L017', organization: 'Sunrise Shipping', createdBy: 'Sasi Paul', createdIni: 'SP', contact: 'Layla Hassan', contactIni: 'LH', industry: 'Marine', state: 'Prospect', email: 'layla@sunriseship.ae', phone: '+971 55 789 3456' },
  { id: 'L018', organization: 'Vertex Supply Chain', createdBy: 'Priya Sharma', createdIni: 'PS', contact: 'Chris Evans', contactIni: 'CE', industry: 'Logistics', state: 'Customer', email: 'chris@vertexsc.com', phone: '+971 52 890 4567' },
  { id: 'L019', organization: 'Northern Star Trading', createdBy: 'Michael Chen', createdIni: 'MC', contact: 'Aisha Malik', contactIni: 'AM', industry: 'Trading', state: 'Suspect', email: 'aisha@northernstar.ae', phone: '+971 54 901 5678' },
  { id: 'L020', organization: 'Swift Cargo UAE', createdBy: 'Alice Brown', createdIni: 'AB', contact: 'Peter Schmidt', contactIni: 'PS', industry: 'Freight Forwarding', state: 'Customer', email: 'peter@swiftcargo.ae', phone: '+971 56 012 6789' },
];

export const LEAD_STATS = {
  all: 447,
  suspects: 121,
  prospects: 46,
  opportunities: 2,
  customers: 278,
  newCustomers: 4,
};

export function filterLeads(leads, filter, query = '') {
  let rows = leads;
  if (filter === 'suspects') rows = rows.filter((l) => l.state === 'Suspect');
  else if (filter === 'prospects') rows = rows.filter((l) => l.state === 'Prospect');
  else if (filter === 'opportunities') rows = rows.filter((l) => l.state === 'Opportunity');
  else if (filter === 'customers') rows = rows.filter((l) => l.state === 'Customer');

  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (l) =>
      l.organization.toLowerCase().includes(q) ||
      l.contact.toLowerCase().includes(q) ||
      l.industry.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q)
  );
}
