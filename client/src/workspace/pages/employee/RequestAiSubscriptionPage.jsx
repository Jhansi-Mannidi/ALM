import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

export default function RequestAiSubscriptionPage() {
  const navigate = useNavigate();
  const [tools, setTools] = useState([]);
  const [existing, setExisting] = useState({ subscriptions: [], requests: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ toolId: '', reason: '' });

  useEffect(() => {
    api.getEmployeeAiTools().then(setTools).catch(() => {});
    api.getEmployeeAiSubscriptions().then(setExisting).catch(() => {});
  }, []);

  const unavailableIds = useMemo(() => {
    const ids = new Set();
    for (const s of existing.subscriptions) {
      if (s.status === 'active') ids.add(s.toolId);
    }
    for (const r of existing.requests) {
      if (r.status === 'pending') ids.add(r.toolId);
    }
    return ids;
  }, [existing]);

  const selectedTool = tools.find((t) => t.id === form.toolId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.toolId || !form.reason.trim()) {
      setError('Select an AI tool and provide a business justification');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.createEmployeeAiSubscriptionRequest({
        toolId: form.toolId,
        reason: form.reason.trim(),
        plan: selectedTool?.plan,
      });
      navigate('/workspace/employee/ai-subscriptions');
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ws-hr-page ws-emp-portal-page">
      <Link to="/workspace/employee/ai-subscriptions" className="ws-back-link mb16">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to AI subscriptions
      </Link>

      <div className="ws-admin-head">
        <div>
          <h1 className="ws-page-title">Request AI subscription</h1>
          <p className="ws-page-subtitle">
            Ask HR to provision Cursor, Claude, ChatGPT, Gemini, v0, or other approved AI tools
          </p>
        </div>
      </div>

      <div className="card ws-hr-panel ws-emp-ticket-form-card">
        <form onSubmit={handleSubmit} className="ws-hr-panel-body ws-emp-ticket-form">
          <div className="ws-emp-form-grid">
            <div className="fl ws-emp-form-field full">
              <label>AI tool *</label>
              <select
                className="fi"
                value={form.toolId}
                onChange={(e) => setForm({ ...form, toolId: e.target.value })}
                required
              >
                <option value="">Select a tool…</option>
                {tools.map((tool) => (
                  <option key={tool.id} value={tool.id} disabled={unavailableIds.has(tool.id)}>
                    {tool.name} ({tool.vendor}) — {tool.plan}
                    {unavailableIds.has(tool.id) ? ' — already active or pending' : ` — ${formatINR(tool.monthlyCostInr)}/mo`}
                  </option>
                ))}
              </select>
            </div>

            {selectedTool && (
              <div className="fl ws-emp-form-field full">
                <div className="ws-ai-tool-preview card">
                  <div className="ws-hr-ops-row-head">
                    <span className="ws-hr-action-name">{selectedTool.name}</span>
                    <span className="chip chip-gray">{selectedTool.vendor}</span>
                    <span className="chip chip-blue">{selectedTool.plan}</span>
                    <span className="chip chip-amber">{selectedTool.category}</span>
                  </div>
                  <p className="ws-page-subtitle mt8" style={{ fontSize: 'var(--text-sm)' }}>
                    Estimated cost: <strong>{formatINR(selectedTool.monthlyCostInr)}</strong> per {selectedTool.billingCycle}
                  </p>
                </div>
              </div>
            )}

            <div className="fl ws-emp-form-field full">
              <label>Business justification *</label>
              <textarea
                className="fi"
                rows={5}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Explain how you will use this tool for your role (e.g. coding, design, research, API integration)…"
                required
              />
            </div>
          </div>

          {error && <p className="ws-emp-form-error">{error}</p>}

          <div className="ws-emp-ticket-form-actions">
            <Link to="/workspace/employee/ai-subscriptions" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="ws-hr-btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit to HR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
