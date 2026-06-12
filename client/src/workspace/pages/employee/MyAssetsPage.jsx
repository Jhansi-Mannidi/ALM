import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatINR(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function assetIcon(category) {
  const c = (category || '').toLowerCase();
  if (c.includes('laptop') || c.includes('monitor')) return Icons.monitor;
  if (c.includes('phone') || c.includes('tablet')) return Icons.phone;
  return Icons.keyRound;
}

export default function MyAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getEmployeeAssets()
      .then(setAssets)
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, []);

  const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);

  return (
    <div className="ws-hr-page ws-emp-portal-page">
      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">My assets</h1>
          <p className="ws-page-subtitle">Company equipment assigned to you</p>
        </div>
        <Link to="/workspace/employee/asset-tickets/new" className="ws-hr-btn-primary">
          <AppIcon icon={Icons.plus} size={14} />
          Raise Ticket
        </Link>
      </div>

      {!loading && assets.length > 0 && (
        <div className="ws-hr-ops-summary">
          <AppIcon icon={Icons.monitor} size={14} />
          <span>
            <strong>{assets.length}</strong> assets assigned
            {totalValue > 0 && (
              <>
                {' '}
                · Total value {formatINR(totalValue)}
              </>
            )}
          </span>
        </div>
      )}

      {loading ? (
        <p className="ws-page-subtitle">Loading assets…</p>
      ) : assets.length === 0 ? (
        <div className="card ws-hr-panel">
          <div className="ws-hr-ops-empty">
            <AppIcon icon={Icons.monitor} size={28} />
            <p>No assets assigned yet</p>
            <Link to="/workspace/employee/asset-tickets/new" className="ws-hr-btn-primary btn-sm">
              Request an asset
            </Link>
          </div>
        </div>
      ) : (
        <div className="ws-emp-asset-grid">
          {assets.map((asset) => (
            <article key={asset.id} className="card ws-emp-asset-card">
              <div className="ws-emp-asset-image-wrap">
                {asset.image?.url ? (
                  <img src={asset.image.url} alt={asset.name} className="ws-emp-asset-image" />
                ) : (
                  <div className="ws-emp-asset-image-placeholder">
                    <AppIcon icon={assetIcon(asset.category)} size={32} />
                  </div>
                )}
              </div>
              <div className="ws-emp-asset-card-body">
                <div className="ws-emp-asset-card-head">
                  <h3 className="ws-emp-asset-name">{asset.name}</h3>
                  <span className={`chip ${asset.status === 'Assigned' ? 'chip-blue' : 'chip-gray'}`}>
                    {asset.status}
                  </span>
                </div>
                <span className="chip chip-gray">{asset.category}</span>
                <div className="ws-emp-asset-meta">
                  <div className="ws-cand-detail-row">
                    <span className="ws-cand-detail-label">Asset tag</span>
                    <span className="ws-cand-detail-value">{asset.assetTag}</span>
                  </div>
                  <div className="ws-cand-detail-row">
                    <span className="ws-cand-detail-label">Serial</span>
                    <span className="ws-cand-detail-value">{asset.serial}</span>
                  </div>
                  <div className="ws-cand-detail-row">
                    <span className="ws-cand-detail-label">Assigned</span>
                    <span className="ws-cand-detail-value">{formatDate(asset.assignedAt)}</span>
                  </div>
                </div>
                <Link
                  to={`/workspace/employee/asset-tickets/new?assetId=${asset.id}&assetName=${encodeURIComponent(asset.name)}`}
                  className="ws-hr-btn-outline btn-sm mt12"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Report issue
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
