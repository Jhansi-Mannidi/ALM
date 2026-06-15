import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import { statusChipClass } from '../../data/productCatalog';

const LAYERS = [
  { label: 'Sharing', desc: 'Portals, Docs, stakeholder views', path: '/workspace/product/portals', ok: true },
  { label: 'Output', desc: 'Roadmaps, Releases, Reports', path: '/workspace/product/roadmap', ok: true },
  { label: 'Decision', desc: 'Prioritization, scoring, demand', path: '/workspace/product/prioritization', ok: true },
  { label: 'Structure', desc: 'Product hierarchy, initiatives, OKRs', path: '/workspace/product/hierarchy', ok: true },
  { label: 'Data Input', desc: 'Insights, Customers, Integrations', path: '/workspace/product/insights', ok: true },
];

export default function ProductDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getProductDashboard().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="ws-hr-page ws-pm-page">
        <ProductPageHeader title="Product Dashboard" subtitle="Loading…" />
      </div>
    );
  }

  const { stats, topFeatures, recentInsights, integrationsConnected } = data;

  return (
    <div className="ws-hr-page ws-pm-page ws-pm-dash">
      <ProductPageHeader
        title="Product Dashboard"
        subtitle="Discovery → prioritization → roadmap → stakeholder sharing"
        actions={(
          <Link to="/workspace/product/roadmap" className="ws-hr-btn-primary sm">
            <AppIcon icon={Icons.kanban} size={13} />
            Open Roadmap
          </Link>
        )}
      />

      <section className="ws-pm-layer-stack">
        {LAYERS.map((layer) => (
          <Link key={layer.label} to={layer.path} className="ws-pm-layer-card">
            <div className="ws-pm-layer-label">{layer.label}</div>
            <div className="ws-pm-layer-desc">{layer.desc}</div>
            <span className="chip chip-green chip-xs">Active</span>
          </Link>
        ))}
      </section>

      <section className="ws-hr-dash-section">
        <div className="ws-hr-stats ws-pm-stats">
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stats.products}</div>
            <div className="ws-hr-stat-label">Products</div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stats.features}</div>
            <div className="ws-hr-stat-label">Features</div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{stats.unprocessedInsights}</div>
            <div className="ws-hr-stat-label">Unprocessed Insights</div>
            <div className="ws-hr-stat-foot">
              <Link to="/workspace/product/insights" className="ws-hr-stat-link">
                Triage inbox
                <AppIcon icon={Icons.arrowRight} size={12} />
              </Link>
            </div>
          </div>
          <div className="ws-hr-stat-card">
            <div className="ws-hr-stat-value">{integrationsConnected}</div>
            <div className="ws-hr-stat-label">Integrations Connected</div>
          </div>
        </div>
      </section>

      <section className="ws-hr-dash-section">
        <div className="ws-hr-grid-2">
          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Top Prioritized Features</h2>
              <Link to="/workspace/product/prioritization" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-pm-table-wrap">
                <table className="ws-pm-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Score</th>
                      <th>Demand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFeatures.map((f) => (
                      <tr key={f.id}>
                        <td>
                          <div className="ws-pm-cell-title">{f.title}</div>
                          <div className="ws-pm-cell-meta">{f.productName}</div>
                        </td>
                        <td><span className="ws-pm-score">{f.score}</span></td>
                        <td>{f.customerDemand}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card ws-hr-panel">
            <div className="ws-hr-panel-head">
              <h2 className="ws-hr-panel-title">Recent Insights</h2>
              <Link to="/workspace/product/insights" className="btn btn-ghost btn-sm">Inbox</Link>
            </div>
            <div className="ws-hr-panel-body">
              <div className="ws-hr-action-list">
                {recentInsights.map((ins) => (
                  <div key={ins.id} className="ws-hr-action-item">
                    <div className="ws-hr-action-body">
                      <div className="ws-hr-action-name">{ins.title}</div>
                      <div className="ws-hr-action-desc">{ins.customerName} · {ins.source}</div>
                    </div>
                    <span className={`chip chip-xs ${statusChipClass(ins.status)}`}>{ins.status}</span>
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
