import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import CreateFeatureModal from './CreateFeatureModal';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { statusChipClass } from '../../data/productCatalog';

export default function PrioritizationPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [features, setFeatures] = useState([]);
  const [products, setProducts] = useState([]);
  const [productFilter, setProductFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editFeature, setEditFeature] = useState(null);

  const load = () => {
    const params = productFilter === 'all' ? {} : { productId: productFilter };
    api.getProductPrioritization(params).then(setFeatures).catch(() => {});
  };

  useEffect(() => {
    api.getProductProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [productFilter]);

  const updateFeature = async (id, field, value) => {
    await api.updateProductFeature(id, { [field]: Number(value) });
    load();
  };

  const openEdit = (f) => {
    setEditFeature(f);
    setShowCreate(true);
  };

  const remove = (f) => {
    confirmDelete({
      label: f.title,
      onConfirm: async () => {
        await api.deleteProductFeature(f.id);
        load();
      },
    });
  };

  const defaultProductId = productFilter === 'all' ? '' : productFilter;

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Prioritization"
        subtitle="Score = (impact × demand) ÷ effort — rank what to build next"
        actions={(
          <button type="button" className="ws-hr-btn-primary sm" onClick={() => { setEditFeature(null); setShowCreate(true); }}>
            <AppIcon icon={Icons.plus} size={13} />
            Create feature
          </button>
        )}
      />

      <div className="ws-pm-filter-bar">
        <button type="button" className={`ws-pm-filter-pill${productFilter === 'all' ? ' active' : ''}`} onClick={() => setProductFilter('all')}>All products</button>
        {products.map((p) => (
          <button key={p.id} type="button" className={`ws-pm-filter-pill${productFilter === p.id ? ' active' : ''}`} onClick={() => setProductFilter(p.id)}>{p.name}</button>
        ))}
      </div>

      <div className="ws-pm-prio-layout">
        <div className="card ws-pm-prio-chart">
          <h3 className="ws-pm-form-title">Impact vs Effort</h3>
          <div className="ws-pm-scatter">
            {features.map((f) => (
              <div
                key={f.id}
                className="ws-pm-scatter-dot"
                style={{
                  left: `${(f.effort / 10) * 100}%`,
                  bottom: `${(f.impact / 10) * 100}%`,
                  width: `${8 + Math.min(f.customerDemand, 20)}px`,
                  height: `${8 + Math.min(f.customerDemand, 20)}px`,
                }}
                title={`${f.title} (score ${f.score})`}
              />
            ))}
          </div>
          <div className="ws-pm-scatter-axes">
            <span>Low effort</span>
            <span>High effort</span>
          </div>
        </div>

        <div className="ws-pm-table-wrap card">
          <table className="ws-pm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Feature</th>
                <th>Impact</th>
                <th>Effort</th>
                <th>Demand</th>
                <th>Score</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {features.length === 0 ? (
                <tr>
                  <td colSpan={8} className="ws-pm-empty-cell">No features yet. Click <strong>Create feature</strong> to add one.</td>
                </tr>
              ) : (
                features.map((f, i) => (
                  <tr key={f.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="ws-pm-cell-title">{f.title}</div>
                      <div className="ws-pm-cell-meta">{f.productName}</div>
                    </td>
                    <td>
                      <input type="number" min={1} max={10} className="ws-pm-num-input" value={f.impact} onChange={(e) => updateFeature(f.id, 'impact', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" min={1} max={10} className="ws-pm-num-input" value={f.effort} onChange={(e) => updateFeature(f.id, 'effort', e.target.value)} />
                    </td>
                    <td>{f.customerDemand}</td>
                    <td><span className="ws-pm-score">{f.score}</span></td>
                    <td><span className={`chip chip-xs ${statusChipClass(f.status)}`}>{f.status}</span></td>
                    <td><PmRowActions onEdit={() => openEdit(f)} onDelete={() => remove(f)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateFeatureModal
        open={showCreate}
        onClose={() => { setShowCreate(false); setEditFeature(null); }}
        onCreated={load}
        defaultProductId={defaultProductId}
        feature={editFeature}
      />
    </div>
  );
}
