import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import CreateFeatureModal from './CreateFeatureModal';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { statusChipClass } from '../../data/productCatalog';

const EMPTY_PRODUCT = { name: '', description: '', almProjectId: '', color: '#2563EB', status: 'active' };
const EMPTY_COMPONENT = { productId: '', name: '', description: '' };

export default function HierarchyPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [products, setProducts] = useState([]);
  const [components, setComponents] = useState([]);
  const [features, setFeatures] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [showFeature, setShowFeature] = useState(false);
  const [productForm, setProductForm] = useState(null);
  const [componentForm, setComponentForm] = useState(null);

  const load = () => {
    Promise.all([
      api.getProductProducts(),
      api.getProductComponents(),
      api.getProductFeatures(),
    ]).then(([p, c, f]) => {
      setProducts(p);
      setComponents(c);
      setFeatures(f);
      setExpanded((prev) => ({
        ...Object.fromEntries(p.map((prod) => [prod.id, prev[prod.id] ?? true])),
      }));
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const saveProduct = async (e) => {
    e.preventDefault();
    if (productForm.id) await api.updateProductProduct(productForm.id, productForm);
    else await api.createProductProduct(productForm);
    setProductForm(null);
    load();
  };

  const deleteProduct = (p) => {
    confirmDelete({
      label: p.name,
      onConfirm: async () => {
        await api.deleteProductProduct(p.id);
        load();
      },
    });
  };

  const saveComponent = async (e) => {
    e.preventDefault();
    await api.createProductComponent(componentForm);
    setComponentForm(null);
    load();
  };

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Product Hierarchy"
        subtitle="Products → components → features linked to ALM work items"
        actions={(
          <div className="ws-pm-head-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProductForm({ ...EMPTY_PRODUCT })}>
              <AppIcon icon={Icons.plus} size={13} /> Product
            </button>
            <button type="button" className="ws-hr-btn-primary sm" onClick={() => setShowFeature(true)}>
              <AppIcon icon={Icons.plus} size={13} /> Feature
            </button>
          </div>
        )}
      />

      {productForm && (
        <form className="card ws-pm-form-card" onSubmit={saveProduct}>
          <h3 className="ws-pm-form-title">{productForm.id ? 'Edit product' : 'New product'}</h3>
          <div className="ws-pm-form-grid">
            <label className="full">Name<input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required /></label>
            <label className="full">Description<textarea rows={2} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} /></label>
            <label>ALM project ID<input value={productForm.almProjectId} onChange={(e) => setProductForm({ ...productForm, almProjectId: e.target.value })} placeholder="p1" /></label>
            <label>Color<input type="color" value={productForm.color} onChange={(e) => setProductForm({ ...productForm, color: e.target.value })} /></label>
          </div>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setProductForm(null)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">Save</button>
          </div>
        </form>
      )}

      {componentForm && (
        <form className="card ws-pm-form-card" onSubmit={saveComponent}>
          <h3 className="ws-pm-form-title">New component</h3>
          <div className="ws-pm-form-grid">
            <label>
              Product
              <select value={componentForm.productId} onChange={(e) => setComponentForm({ ...componentForm, productId: e.target.value })}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>Name<input value={componentForm.name} onChange={(e) => setComponentForm({ ...componentForm, name: e.target.value })} required /></label>
            <label className="full">Description<input value={componentForm.description} onChange={(e) => setComponentForm({ ...componentForm, description: e.target.value })} /></label>
          </div>
          <div className="ws-pm-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setComponentForm(null)}>Cancel</button>
            <button type="submit" className="ws-hr-btn-primary sm">Save</button>
          </div>
        </form>
      )}

      <div className="ws-pm-hierarchy">
        {products.map((product) => {
          const comps = components.filter((c) => c.productId === product.id);
          const open = expanded[product.id];
          return (
            <div key={product.id} className="card ws-pm-hier-product">
              <div className="ws-pm-hier-toggle-row">
                <button type="button" className="ws-pm-hier-toggle" onClick={() => toggle(product.id)}>
                  <AppIcon icon={Icons.chevronRight} size={14} className={open ? 'open' : ''} />
                  <span className="ws-pm-hier-dot" style={{ background: product.color }} />
                  <div className="ws-pm-hier-title-wrap">
                    <div className="ws-pm-cell-title">{product.name}</div>
                    <div className="ws-pm-cell-meta">{product.description}</div>
                  </div>
                  <span className="ws-pm-hier-count">{product.featureCount} features</span>
                </button>
                <PmRowActions
                  onEdit={() => setProductForm({ ...product })}
                  onDelete={() => deleteProduct(product)}
                />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setComponentForm({ ...EMPTY_COMPONENT, productId: product.id })}>
                  + Component
                </button>
              </div>

              {open && comps.map((comp) => {
                const feats = features.filter((f) => f.componentId === comp.id);
                return (
                  <div key={comp.id} className="ws-pm-hier-component">
                    <div className="ws-pm-hier-comp-head">
                      <AppIcon icon={Icons.layers} size={14} />
                      <span className="ws-pm-cell-title">{comp.name}</span>
                      <span className="ws-pm-cell-meta">{comp.description}</span>
                    </div>
                    <div className="ws-pm-hier-features">
                      {feats.map((f) => (
                        <div key={f.id} className="ws-pm-hier-feature">
                          <div>
                            <div className="ws-pm-cell-title">{f.title}</div>
                            <div className="ws-pm-cell-meta">Demand {f.customerDemand} · Score {f.score}</div>
                          </div>
                          <span className={`chip chip-xs ${statusChipClass(f.status)}`}>{f.status}</span>
                          {f.linkedIssueId && <Link to="/backlog" className="ws-pm-issue-link">{f.linkedIssueId}</Link>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <CreateFeatureModal
        open={showFeature}
        onClose={() => setShowFeature(false)}
        onCreated={load}
      />
    </div>
  );
}
