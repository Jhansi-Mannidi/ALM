import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import OfficePageHeader from './OfficePageHeader';
import { officeStatusChip, formatCurrency } from '../../data/officeCatalog';

const QUICK_LINKS = [
  { label: 'Inventory', desc: 'Track stock levels & supplies', path: '/workspace/office/inventory', icon: Icons.package, stat: 'lowStock' },
  { label: 'Requests', desc: 'Approve office & facility requests', path: '/workspace/office/requests', icon: Icons.inbox, stat: 'pendingRequests' },
  { label: 'Vendors', desc: 'Contracts & payment tracking', path: '/workspace/office/vendors', icon: Icons.truck, stat: 'vendorPaymentsDue' },
  { label: 'Food Orders', desc: 'Catering & pantry scheduling', path: '/workspace/office/food', icon: Icons.utensils, stat: 'upcomingFood' },
];

export default function OfficeDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getOfficeDashboard().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="ws-hr-page ws-office-page">
        <OfficePageHeader title="Office Dashboard" subtitle="Loading…" />
      </div>
    );
  }

  const { stats, recentRequests, lowStock, paymentsDue, upcomingOrders } = data;

  return (
    <div className="ws-hr-page ws-office-page ws-office-dash">
      <OfficePageHeader
        title="Office Dashboard"
        subtitle="Inventory, requests, vendors & food — all in one place"
        actions={(
          <Link to="/workspace/office/requests" className="ws-hr-btn-primary sm ws-office-btn-primary">
            <AppIcon icon={Icons.inbox} size={13} />
            Review requests
          </Link>
        )}
      />

      <section className="ws-office-hero-stats">
        <div className="ws-office-hero-stat ws-office-stat-amber">
          <div className="ws-office-hero-icon"><AppIcon icon={Icons.inbox} size={20} /></div>
          <div className="ws-office-hero-value">{stats.pendingRequests}</div>
          <div className="ws-office-hero-label">Pending requests</div>
        </div>
        <div className="ws-office-hero-stat ws-office-stat-red">
          <div className="ws-office-hero-icon"><AppIcon icon={Icons.package} size={20} /></div>
          <div className="ws-office-hero-value">{stats.lowStockItems}</div>
          <div className="ws-office-hero-label">Low stock items</div>
        </div>
        <div className="ws-office-hero-stat ws-office-stat-violet">
          <div className="ws-office-hero-icon"><AppIcon icon={Icons.truck} size={20} /></div>
          <div className="ws-office-hero-value">{stats.vendorPaymentsDue}</div>
          <div className="ws-office-hero-label">Payments due</div>
        </div>
        <div className="ws-office-hero-stat ws-office-stat-green">
          <div className="ws-office-hero-icon"><AppIcon icon={Icons.utensils} size={20} /></div>
          <div className="ws-office-hero-value">{stats.upcomingFood}</div>
          <div className="ws-office-hero-label">Upcoming food orders</div>
        </div>
      </section>

      <section className="ws-office-quick-grid">
        {QUICK_LINKS.map((link) => (
          <Link key={link.label} to={link.path} className="ws-office-quick-card">
            <div className="ws-office-quick-icon">
              <AppIcon icon={link.icon} size={18} />
            </div>
            <div className="ws-office-quick-body">
              <div className="ws-office-quick-title">{link.label}</div>
              <div className="ws-office-quick-desc">{link.desc}</div>
            </div>
            <span className="ws-office-quick-badge">{stats[link.stat]}</span>
          </Link>
        ))}
      </section>

      <section className="ws-hr-dash-section">
        <div className="ws-hr-grid-2">
          <div className="card ws-hr-panel ws-office-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Recent Requests</h2>
              <Link to="/workspace/office/requests" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-hr-action-list">
                {recentRequests.map((req) => (
                  <div key={req.id} className="ws-hr-action-item">
                    <div className="ws-hr-action-body">
                      <div className="ws-hr-action-name">{req.title}</div>
                      <div className="ws-hr-action-desc">{req.requester} · {req.department}</div>
                    </div>
                    <span className={`chip chip-xs ${officeStatusChip(req.status)}`}>{req.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card ws-hr-panel ws-office-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Low Stock Alert</h2>
              <Link to="/workspace/office/inventory?lowStock=true" className="btn btn-ghost btn-sm">Inventory</Link>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-office-stock-list">
                {lowStock.map((item) => (
                  <div key={item.id} className="ws-office-stock-item">
                    <div className="ws-office-stock-info">
                      <div className="ws-office-cell-title">{item.name}</div>
                      <div className="ws-office-cell-meta">{item.category} · {item.location}</div>
                    </div>
                    <div className="ws-office-stock-qty">
                      <span className="ws-office-stock-low">{item.quantity}</span>
                      <span className="ws-office-cell-meta">/ {item.minStock} {item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ws-hr-dash-section">
        <div className="ws-hr-grid-2">
          <div className="card ws-hr-panel ws-office-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Vendor Payments Due</h2>
              <Link to="/workspace/office/vendors" className="btn btn-ghost btn-sm">Vendors</Link>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-hr-action-list">
                {paymentsDue.map((v) => (
                  <div key={v.id} className="ws-hr-action-item">
                    <div className="ws-hr-action-body">
                      <div className="ws-hr-action-name">{v.name}</div>
                      <div className="ws-hr-action-desc">Due {v.paymentDue} · {v.category}</div>
                    </div>
                    <div className="ws-office-pay-cell">
                      <span className="ws-office-pay-amount">{formatCurrency(v.amountDue)}</span>
                      <span className={`chip chip-xs ${officeStatusChip(v.paymentStatus)}`}>{v.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card ws-hr-panel ws-office-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Upcoming Food Orders</h2>
              <Link to="/workspace/office/food" className="btn btn-ghost btn-sm">Food orders</Link>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-hr-action-list">
                {upcomingOrders.map((order) => (
                  <div key={order.id} className="ws-hr-action-item">
                    <div className="ws-hr-action-body">
                      <div className="ws-hr-action-name">{order.menuItem}</div>
                      <div className="ws-hr-action-desc">{order.vendorName} · {order.orderDate}</div>
                    </div>
                    <span className={`chip chip-xs ${officeStatusChip(order.mealType)}`}>{order.mealType}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
