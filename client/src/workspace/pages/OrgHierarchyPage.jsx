import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppIcon, Icons } from '../../components/icons';
import { DEFAULT_ORG_TREE, ORG_TEMPLATES } from '../data/workspaceCatalog';

function OrgNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;

  return (
    <div className="ws-org-node" style={{ paddingLeft: depth * 16 }}>
      <div className="ws-org-node-row">
        {hasChildren ? (
          <button type="button" className="ws-org-toggle" onClick={() => setOpen((o) => !o)}>
            <AppIcon
              icon={Icons.chevronRight}
              size={12}
              className={`ws-org-chevron${open ? ' open' : ''}`}
            />
          </button>
        ) : (
          <span className="ws-org-toggle-spacer" />
        )}
        <span className="ws-org-node-name">{node.name}</span>
      </div>
      {open &&
        hasChildren &&
        node.children.map((child) => <OrgNode key={child.name} node={child} depth={depth + 1} />)}
    </div>
  );
}

export default function OrgHierarchyPage() {
  const [levels, setLevels] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const applyTemplate = (template) => {
    setSelectedTemplate(template.id);
    setLevels([...template.levels]);
  };

  return (
    <div className="ws-page ws-org-page">
      <Link to="/workspace" className="ws-back-link">
        <AppIcon icon={Icons.chevronRight} size={14} className="ws-back-chevron" />
        Back to Workspace
      </Link>

      <div className="ws-org-layout">
        <div className="ws-org-sidebar card">
          <div className="ws-org-org-name">
            <AppIcon icon={Icons.layers} size={14} />
            {DEFAULT_ORG_TREE.name}
          </div>

          <h3 className="ws-org-section-title">Hierarchy Levels</h3>
          {levels.length === 0 ? (
            <p className="ws-org-empty">
              No hierarchy configured. Select a template or add levels manually.
            </p>
          ) : (
            <ol className="ws-org-levels">
              {levels.map((level, i) => (
                <li key={`${level}-${i}`}>{level}</li>
              ))}
            </ol>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm ws-org-add-level"
            onClick={() => setLevels((prev) => [...prev, `Level ${prev.length + 1}`])}
          >
            <AppIcon icon={Icons.plus} size={13} />
            Add Level
          </button>
        </div>

        <div className="ws-org-main">
          <div className="card ws-org-tree-card">
            <div className="card-title">Organization Tree</div>
            <OrgNode node={DEFAULT_ORG_TREE} />
          </div>

          <div className="card ws-org-templates">
            <h3 className="ws-org-section-title">Hierarchy Templates</h3>
            <p className="ws-org-templates-sub">Quick Start Templates:</p>
            <div className="ws-template-list">
              {ORG_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`ws-template-btn${selectedTemplate === t.id ? ' active' : ''}`}
                  onClick={() => applyTemplate(t)}
                >
                  <strong>{t.name}</strong>
                  <span>{t.levels.join(' › ')}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card ws-org-inheritance">
            <h3 className="ws-org-section-title">Data Inheritance Rules</h3>
            <p className="ws-org-templates-sub">Data Visibility:</p>
            <p className="ws-org-inherit-example">
              Example: User assigned to &quot;UAE&quot; country can see all data within UAE branches,
              departments, and teams — but not sibling countries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
