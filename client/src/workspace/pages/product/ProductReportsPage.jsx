import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import ProductPageHeader from './ProductPageHeader';

export default function ProductReportsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getProductReports().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="ws-hr-page ws-pm-page">
        <ProductPageHeader title="Reports" subtitle="Loading…" />
      </div>
    );
  }

  const { byTheme, byStatus, demandByProduct, processedRate } = data;

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Reports"
        subtitle="Insight processing, demand by product, and feature pipeline"
      />

      <div className="ws-hr-stats ws-pm-stats">
        <div className="ws-hr-stat-card">
          <div className="ws-hr-stat-value">{processedRate}%</div>
          <div className="ws-hr-stat-label">Insights Processed</div>
        </div>
      </div>

      <div className="ws-hr-grid-2 ws-pm-reports-grid">
        <div className="card ws-hr-panel">
          <div className="ws-hr-panel-head">
            <h2 className="ws-hr-panel-title">Demand by Product</h2>
          </div>
          <div className="ws-hr-panel-body">
            {demandByProduct.map((row) => (
              <div key={row.product} className="ws-pm-report-row">
                <span>{row.product}</span>
                <div className="ws-pm-report-bar-wrap">
                  <div className="ws-pm-report-bar" style={{ width: `${Math.min(100, row.demand * 2)}%` }} />
                </div>
                <span className="ws-pm-report-val">{row.demand}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card ws-hr-panel">
          <div className="ws-hr-panel-head">
            <h2 className="ws-hr-panel-title">Features by Status</h2>
          </div>
          <div className="ws-hr-panel-body">
            {byStatus.map((row) => (
              <div key={row.status} className="ws-pm-report-row">
                <span>{row.status}</span>
                <div className="ws-pm-report-bar-wrap">
                  <div className="ws-pm-report-bar status" style={{ width: `${row.count * 20}%` }} />
                </div>
                <span className="ws-pm-report-val">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card ws-hr-panel ws-pm-report-full">
          <div className="ws-hr-panel-head">
            <h2 className="ws-hr-panel-title">Insights by Theme</h2>
          </div>
          <div className="ws-hr-panel-body">
            <div className="ws-pm-table-wrap">
              <table className="ws-pm-table">
                <thead>
                  <tr>
                    <th>Theme</th>
                    <th>Insights</th>
                    <th>Features</th>
                  </tr>
                </thead>
                <tbody>
                  {byTheme.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.insights}</td>
                      <td>{row.features}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
