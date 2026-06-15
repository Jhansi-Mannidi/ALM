import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { PM_LANES, statusChipClass } from '../../data/productCatalog';

export default function ProductSharePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getProductShare(token)
      .then(setData)
      .catch(() => setError(true));
  }, [token]);

  if (error) {
    return (
      <div className="ws-pm-share-page">
        <div className="ws-pm-share-card">
          <h1>Portal not found</h1>
          <p>This share link is invalid or has been unpublished.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ws-pm-share-page">
        <div className="ws-pm-share-card"><p>Loading roadmap…</p></div>
      </div>
    );
  }

  const { portal, product, roadmap, initiatives } = data;

  return (
    <div className="ws-pm-share-page">
      <header className="ws-pm-share-header">
        <div className="ws-pm-share-brand">
          <span className="ws-pm-share-dot" style={{ background: product?.color || '#2563EB' }} />
          <div>
            <h1>{portal.name}</h1>
            <p>{product?.name} · {portal.type} stakeholder view</p>
          </div>
        </div>
      </header>

      <main className="ws-pm-share-main">
        {product?.description && (
          <section className="ws-pm-share-section">
            <h2>About</h2>
            <p>{product.description}</p>
          </section>
        )}

        <section className="ws-pm-share-section">
          <h2>Initiatives</h2>
          <div className="ws-pm-share-init-grid">
            {initiatives.map((init) => (
              <div key={init.id} className="ws-pm-share-init">
                <h3>{init.name}</h3>
                <p>{init.description}</p>
                <span className={`chip chip-xs ${statusChipClass(init.status)}`}>{init.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="ws-pm-share-section">
          <h2>Roadmap</h2>
          <div className="ws-pm-roadmap-board ws-pm-share-board">
            {PM_LANES.map((lane) => (
              <div key={lane.id} className="ws-pm-roadmap-col">
                <div className="ws-pm-roadmap-col-head" style={{ borderColor: lane.color }}>{lane.label}</div>
                {roadmap.filter((r) => r.lane === lane.id).map((item) => (
                  <div key={item.id} className="ws-pm-roadmap-card">
                    <div className="ws-pm-cell-title">{item.featureTitle || item.title}</div>
                    <div className="ws-pm-roadmap-dates">{item.startDate} – {item.endDate}</div>
                    <span className={`chip chip-xs ws-pm-roadmap-status ${statusChipClass(item.status)}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="ws-pm-share-foot">Powered by VoltusWave Product Management</footer>
    </div>
  );
}
