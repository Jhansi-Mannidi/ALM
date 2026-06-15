import { useEffect, useMemo, useState } from 'react';
import MotionModal from '../../../motion/MotionModal';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import { PM_FEATURE_STATUSES } from '../../data/productCatalog';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';

const EMPTY_FORM = {
  productId: '',
  componentId: '',
  title: '',
  description: '',
  impact: 5,
  effort: 5,
  customerDemand: 0,
  status: 'discovery',
  linkedIssueId: '',
};

export default function CreateFeatureModal({
  open,
  onClose,
  onCreated,
  defaultProductId = '',
  feature = null,
}) {
  const confirmDelete = usePmDeleteConfirm();
  const isEdit = Boolean(feature?.id);
  const [products, setProducts] = useState([]);
  const [components, setComponents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setError('');
    Promise.all([api.getProductProducts(), api.getProductComponents()])
      .then(([prods, comps]) => {
        setProducts(prods);
        setComponents(comps);
        if (feature) {
          setForm({
            productId: feature.productId || '',
            componentId: feature.componentId || '',
            title: feature.title || '',
            description: feature.description || '',
            impact: feature.impact ?? 5,
            effort: feature.effort ?? 5,
            customerDemand: feature.customerDemand ?? 0,
            status: feature.status || 'discovery',
            linkedIssueId: feature.linkedIssueId || '',
          });
        } else {
          const productId = defaultProductId || prods[0]?.id || '';
          const firstComp = comps.find((c) => c.productId === productId)?.id || '';
          setForm({ ...EMPTY_FORM, productId, componentId: firstComp });
        }
      })
      .catch(() => {});
  }, [open, defaultProductId, feature]);

  const productComponents = useMemo(
    () => components.filter((c) => c.productId === form.productId),
    [components, form.productId],
  );

  const update = (patch) => {
    setForm((f) => {
      const next = { ...f, ...patch };
      if (patch.productId && patch.productId !== f.productId) {
        const comp = components.find((c) => c.productId === patch.productId);
        next.componentId = comp?.id || '';
      }
      return next;
    });
  };

  const liveScore = Math.round(
    (Number(form.impact) * Number(form.customerDemand)) / Math.max(1, Number(form.effort)),
  );

  const payload = () => ({
    productId: form.productId,
    componentId: form.componentId,
    title: form.title.trim(),
    description: form.description.trim(),
    impact: form.impact,
    effort: form.effort,
    customerDemand: form.customerDemand,
    status: form.status,
    linkedIssueId: form.linkedIssueId.trim() || undefined,
  });

  const save = async () => {
    if (!form.title.trim()) {
      setError('Feature title is required.');
      return;
    }
    if (!form.productId || !form.componentId) {
      setError('Select a product and component.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const result = isEdit
        ? await api.updateProductFeature(feature.id, payload())
        : await api.createProductFeature(payload());
      onCreated?.(result);
      onClose?.();
    } catch (err) {
      setError(err.message || `Could not ${isEdit ? 'update' : 'create'} feature.`);
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    if (!isEdit) return;
    confirmDelete({
      label: feature.title,
      onConfirm: async () => {
        setSaving(true);
        try {
          await api.deleteProductFeature(feature.id);
          onCreated?.();
          onClose?.();
        } catch (err) {
          setError(err.message || 'Could not delete feature.');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  return (
    <MotionModal open={open} onClose={onClose} modalClassName="ws-pm-feature-modal">
      <div className="modal-hd">
        <div>
          <span className="ws-pm-modal-kicker">{isEdit ? 'Edit feature' : 'New feature'}</span>
          <span className="modal-title">{isEdit ? 'Edit Feature' : 'Create Feature'}</span>
          <p className="ws-pm-modal-sub">Add to product hierarchy and prioritization scoring.</p>
        </div>
        <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
          <AppIcon icon={Icons.x} size={16} />
        </button>
      </div>

      <div className="modal-body ws-pm-feature-modal-body">
        <div className="ws-pm-form-grid">
          <label>
            Product
            <select value={form.productId} onChange={(e) => update({ productId: e.target.value })} required>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>
            Component
            <select value={form.componentId} onChange={(e) => update({ componentId: e.target.value })} required>
              {productComponents.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="full">
            Feature title
            <input
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. Enterprise SSO (SAML/OIDC)"
              required
            />
          </label>
          <label className="full">
            Description
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="What problem does this solve?"
            />
          </label>
          <label>
            Impact (1–10)
            <input type="number" min={1} max={10} value={form.impact} onChange={(e) => update({ impact: e.target.value })} />
          </label>
          <label>
            Effort (1–10)
            <input type="number" min={1} max={10} value={form.effort} onChange={(e) => update({ effort: e.target.value })} />
          </label>
          <label>
            Customer demand
            <input type="number" min={0} value={form.customerDemand} onChange={(e) => update({ customerDemand: e.target.value })} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => update({ status: e.target.value })}>
              {PM_FEATURE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="full">
            ALM issue ID (optional)
            <input value={form.linkedIssueId} onChange={(e) => update({ linkedIssueId: e.target.value })} placeholder="PHXN-300" />
          </label>
        </div>

        <div className="ws-pm-feature-preview">
          <span className="ws-pm-feature-preview-label">Estimated priority score</span>
          <span className="ws-pm-score">{liveScore}</span>
          <span className="ws-pm-cell-meta">(impact × demand) ÷ effort</span>
        </div>

        {error && <p className="ws-pm-form-error">{error}</p>}
      </div>

      <div className="modal-ft ws-pm-feature-modal-ft">
        {isEdit && (
          <button type="button" className="btn btn-ghost ws-pm-delete-btn" onClick={remove} disabled={saving}>
            <AppIcon icon={Icons.trash} size={13} />
            Delete
          </button>
        )}
        <div className="ws-pm-feature-modal-ft-right">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className="ws-hr-btn-primary sm" onClick={save} disabled={saving}>
            <AppIcon icon={isEdit ? Icons.check : Icons.plus} size={13} />
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create feature'}
          </button>
        </div>
      </div>
    </MotionModal>
  );
}
