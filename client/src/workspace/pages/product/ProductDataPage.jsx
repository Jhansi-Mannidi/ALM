import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { AppIcon, Icons } from '../../../components/icons';
import ProductPageHeader from './ProductPageHeader';
import PmRowActions from './PmRowActions';
import { usePmDeleteConfirm } from './PmDeleteConfirmContext';
import { PM_DATA_TABS } from '../../data/productCatalog';

const TAB_LABELS = {
  drivers: 'Drivers',
  formula: 'Formula',
  segments: 'Segments',
  themes: 'Themes',
  tags: 'Tags',
  'custom-fields': 'Custom Fields',
};

export default function ProductDataPage() {
  const confirmDelete = usePmDeleteConfirm();
  const [tab, setTab] = useState('drivers');
  const [drivers, setDrivers] = useState([]);
  const [formula, setFormula] = useState(null);
  const [segments, setSegments] = useState([]);
  const [themes, setThemes] = useState([]);
  const [tags, setTags] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [formulaForm, setFormulaForm] = useState({ expression: '', description: '' });
  const [segmentForm, setSegmentForm] = useState({ name: '', description: '' });
  const [themeForm, setThemeForm] = useState({ name: '' });
  const [tagForm, setTagForm] = useState({ name: '', color: '#2563EB' });
  const [fieldForm, setFieldForm] = useState({ entity: 'feature', name: '', fieldKey: '', type: 'text' });

  const load = () => {
    Promise.all([
      api.getProductDrivers(),
      api.getProductFormula(),
      api.getProductSegments(),
      api.getProductThemes(),
      api.getProductTags(),
      api.getProductCustomFields(),
    ]).then(([d, f, s, t, tg, cf]) => {
      setDrivers(d);
      setFormula(f);
      setFormulaForm({ expression: f.expression, description: f.description });
      setSegments(s);
      setThemes(t);
      setTags(tg);
      setCustomFields(cf);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const saveFormula = async (e) => {
    e.preventDefault();
    await api.updateProductFormula(formulaForm);
    load();
  };

  const addSegment = async (e) => {
    e.preventDefault();
    await api.createProductSegment(segmentForm);
    setSegmentForm({ name: '', description: '' });
    load();
  };

  const addTheme = async (e) => {
    e.preventDefault();
    await api.createProductTheme(themeForm);
    setThemeForm({ name: '' });
    load();
  };

  const addTag = async (e) => {
    e.preventDefault();
    await api.createProductTag(tagForm);
    setTagForm({ name: '', color: '#2563EB' });
    load();
  };

  const addField = async (e) => {
    e.preventDefault();
    await api.createProductCustomField(fieldForm);
    setFieldForm({ entity: 'feature', name: '', fieldKey: '', type: 'text' });
    load();
  };

  const remove = (label, fn) => {
    confirmDelete({ label, onConfirm: async () => { await fn(); load(); } });
  };

  return (
    <div className="ws-hr-page ws-pm-page">
      <ProductPageHeader
        title="Data Model"
        subtitle="Configure drivers, scoring formula, segments, themes, tags, and custom fields"
        actions={(
          <Link to="/workspace/product/hierarchy" className="btn btn-ghost btn-sm">
            <AppIcon icon={Icons.layers} size={13} />
            Product hierarchy
          </Link>
        )}
      />

      <div className="ws-pm-data-tabs">
        {PM_DATA_TABS.map((id) => (
          <button key={id} type="button" className={`ws-pm-filter-pill${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>
            {TAB_LABELS[id]}
          </button>
        ))}
      </div>

      {tab === 'drivers' && (
        <div className="card ws-pm-form-card">
          <h3 className="ws-pm-form-title">Prioritization drivers</h3>
          <p className="ws-pm-cell-meta ws-pm-data-note">Drivers define the factors used when scoring features on the Prioritization page.</p>
          <div className="ws-pm-table-wrap">
            <table className="ws-pm-table">
              <thead>
                <tr><th>Driver</th><th>Key</th><th>Scale</th><th>Description</th></tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id}>
                    <td className="ws-pm-cell-title">{d.name}{d.inverse ? ' ↓' : ''}</td>
                    <td><code>{d.key}</code></td>
                    <td>{d.scaleMin}–{d.scaleMax}</td>
                    <td className="ws-pm-cell-meta">{d.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'formula' && formula && (
        <form className="card ws-pm-form-card" onSubmit={saveFormula}>
          <h3 className="ws-pm-form-title">{formula.name}</h3>
          <p className="ws-pm-cell-meta ws-pm-data-note">Use variables: impact, effort, customerDemand, reach</p>
          <label className="ws-pm-data-field">
            Expression
            <input value={formulaForm.expression} onChange={(e) => setFormulaForm({ ...formulaForm, expression: e.target.value })} required />
          </label>
          <label className="ws-pm-data-field">
            Description
            <textarea rows={2} value={formulaForm.description} onChange={(e) => setFormulaForm({ ...formulaForm, description: e.target.value })} />
          </label>
          <div className="ws-pm-form-actions">
            <button type="submit" className="ws-hr-btn-primary sm">Save formula</button>
          </div>
        </form>
      )}

      {tab === 'segments' && (
        <>
          <form className="card ws-pm-form-card" onSubmit={addSegment}>
            <h3 className="ws-pm-form-title">Add segment</h3>
            <div className="ws-pm-form-grid">
              <label>Name<input value={segmentForm.name} onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })} required /></label>
              <label>Description<input value={segmentForm.description} onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })} /></label>
            </div>
            <div className="ws-pm-form-actions">
              <button type="submit" className="ws-hr-btn-primary sm">Add segment</button>
            </div>
          </form>
          <div className="ws-pm-table-wrap card">
            <table className="ws-pm-table">
              <thead><tr><th>Segment</th><th>Description</th><th /></tr></thead>
              <tbody>
                {segments.map((s) => (
                  <tr key={s.id}>
                    <td className="ws-pm-cell-title">{s.name}</td>
                    <td>{s.description}</td>
                    <td><PmRowActions onDelete={() => remove(s.name, () => api.deleteProductSegment(s.id))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'themes' && (
        <>
          <form className="card ws-pm-form-card" onSubmit={addTheme}>
            <h3 className="ws-pm-form-title">Add theme</h3>
            <label>Name<input value={themeForm.name} onChange={(e) => setThemeForm({ name: e.target.value })} required /></label>
            <div className="ws-pm-form-actions"><button type="submit" className="ws-hr-btn-primary sm">Add theme</button></div>
          </form>
          <div className="ws-pm-table-wrap card">
            <table className="ws-pm-table">
              <thead><tr><th>Theme</th><th>Insights</th><th>Features</th><th /></tr></thead>
              <tbody>
                {themes.map((t) => (
                  <tr key={t.id}>
                    <td className="ws-pm-cell-title">{t.name}</td>
                    <td>{t.insightCount}</td>
                    <td>{t.featureIds?.length || 0}</td>
                    <td><PmRowActions onDelete={() => remove(t.name, () => api.deleteProductTheme(t.id))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'tags' && (
        <>
          <form className="card ws-pm-form-card" onSubmit={addTag}>
            <div className="ws-pm-form-grid">
              <label>Tag name<input value={tagForm.name} onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })} required /></label>
              <label>Color<input type="color" value={tagForm.color} onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })} /></label>
            </div>
            <div className="ws-pm-form-actions"><button type="submit" className="ws-hr-btn-primary sm">Add tag</button></div>
          </form>
          <div className="ws-pm-tag-grid">
            {tags.map((t) => (
              <div key={t.id} className="ws-pm-tag-chip" style={{ borderColor: t.color, color: t.color }}>
                {t.name}
                <button type="button" className="ws-pm-tag-remove" onClick={() => remove(t.name, () => api.deleteProductTag(t.id))}>×</button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'custom-fields' && (
        <>
          <form className="card ws-pm-form-card" onSubmit={addField}>
            <div className="ws-pm-form-grid">
              <label>Entity<select value={fieldForm.entity} onChange={(e) => setFieldForm({ ...fieldForm, entity: e.target.value })}><option value="feature">Feature</option><option value="customer">Customer</option></select></label>
              <label>Label<input value={fieldForm.name} onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })} required /></label>
              <label>Field key<input value={fieldForm.fieldKey} onChange={(e) => setFieldForm({ ...fieldForm, fieldKey: e.target.value })} required /></label>
              <label>Type<select value={fieldForm.type} onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value })}><option value="text">Text</option><option value="number">Number</option><option value="currency">Currency</option></select></label>
            </div>
            <div className="ws-pm-form-actions"><button type="submit" className="ws-hr-btn-primary sm">Add field</button></div>
          </form>
          <div className="ws-pm-table-wrap card">
            <table className="ws-pm-table">
              <thead><tr><th>Entity</th><th>Label</th><th>Key</th><th>Type</th><th /></tr></thead>
              <tbody>
                {customFields.map((f) => (
                  <tr key={f.id}>
                    <td><span className="chip chip-xs chip-gray">{f.entity}</span></td>
                    <td>{f.name}</td>
                    <td><code>{f.fieldKey}</code></td>
                    <td>{f.type}</td>
                    <td><PmRowActions onDelete={() => remove(f.name, () => api.deleteProductCustomField(f.id))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
