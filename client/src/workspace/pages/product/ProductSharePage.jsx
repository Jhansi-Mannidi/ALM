import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { statusChipClass } from '../../data/productCatalog';

export default function ProductSharePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [ideaForm, setIdeaForm] = useState({ title: '', body: '', submitterName: '', submitterEmail: '' });
  const [ideaSent, setIdeaSent] = useState(false);
  const [ideaBusy, setIdeaBusy] = useState(false);

  useEffect(() => {
    api.getProductShare(token)
      .then(setData)
      .catch(() => setError(true));
  }, [token]);

  const submitIdea = async (e) => {
    e.preventDefault();
    if (!ideaForm.title.trim()) return;
    setIdeaBusy(true);
    try {
      await api.submitPortalIdea(token, ideaForm);
      setIdeaSent(true);
      setIdeaForm({ title: '', body: '', submitterName: '', submitterEmail: '' });
    } catch {
      /* ignore */
    } finally {
      setIdeaBusy(false);
    }
  };

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

  const { portal, product, roadmap, initiatives, portalColumns } = data;

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
          <h2>Roadmap</h2>
          <div className="ws-pm-roadmap-board ws-pm-share-board">
            {(portalColumns || []).map((col) => (
              <div key={col.id} className="ws-pm-roadmap-col">
                <div className="ws-pm-roadmap-col-head">{col.label}</div>
                {roadmap.filter((r) => col.statuses.includes(r.status)).map((item) => (
                  <div key={item.id} className="ws-pm-roadmap-card">
                    <div className="ws-pm-cell-title">{item.featureTitle || item.title}</div>
                    {item.startDate && (
                      <div className="ws-pm-roadmap-dates">{item.startDate} – {item.endDate}</div>
                    )}
                    <span className={`chip chip-xs ws-pm-roadmap-status ${statusChipClass(item.status)}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {initiatives?.length > 0 && (
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
        )}

        <section className="ws-pm-share-section ws-pm-share-idea">
          <h2>Submit an idea</h2>
          <p className="ws-pm-cell-meta">Share feedback or request a feature — it flows into our product insights inbox.</p>
          {ideaSent ? (
            <div className="ws-pm-share-idea-success">
              <AppIcon icon={Icons.checkCircle} size={18} />
              Thank you! Your idea has been submitted.
            </div>
          ) : (
            <form className="ws-pm-share-idea-form card" onSubmit={submitIdea}>
              <label>Title<input value={ideaForm.title} onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })} required placeholder="What would you like to see?" /></label>
              <label>Details<textarea rows={3} value={ideaForm.body} onChange={(e) => setIdeaForm({ ...ideaForm, body: e.target.value })} placeholder="Tell us more…" /></label>
              <div className="ws-pm-form-grid">
                <label>Your name<input value={ideaForm.submitterName} onChange={(e) => setIdeaForm({ ...ideaForm, submitterName: e.target.value })} /></label>
                <label>Email<input type="email" value={ideaForm.submitterEmail} onChange={(e) => setIdeaForm({ ...ideaForm, submitterEmail: e.target.value })} /></label>
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={ideaBusy}>
                {ideaBusy ? 'Submitting…' : 'Submit idea'}
              </button>
            </form>
          )}
        </section>
      </main>

      <footer className="ws-pm-share-foot">Powered by VoltusWave Product Management</footer>
    </div>
  );
}
