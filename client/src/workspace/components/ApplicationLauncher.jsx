import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppIcon, Icons, resolveIcon } from '../../components/icons';
import '../workspace.css';
import { useWorkspace } from '../context/WorkspaceContext';
import { useRbac } from '../context/RbacContext';
import {
  getAppsForSolution,
  getDefaultPlatformSelection,
  getSchema,
  getSolutionsForSchema,
  getStandaloneAppsForSchema,
  getWorkspace,
} from '../data/platformCatalog';
import { platformFavoriteKey } from '../data/platformSettingsCatalog';
import PlatformSettingsPanel from './PlatformSettingsPanel';
import { WorkspaceIcon } from './WorkspaceIcons';

function matchesQuery(text, query) {
  if (!query) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

function fallbackLauncherPosition(isFreightShell) {
  const topbarH = 40;
  return {
    top: isFreightShell ? 58 : topbarH + 6,
    left: 8,
  };
}

function computeLauncherPosition(anchorEl, isFreightShell) {
  if (!anchorEl) return fallbackLauncherPosition(isFreightShell);

  const rect = anchorEl.getBoundingClientRect();
  const gap = 6;
  const left = Math.max(8, Math.round(rect.left));
  const top = Math.max(8, Math.round(rect.bottom + gap));

  return { top, left };
}

function launcherModalStyle(position, isFreightShell) {
  const { top, left } = position;
  return {
    '--launcher-top': `${top}px`,
    '--launcher-left': `${left}px`,
    '--launcher-width': `min(700px, calc(100vw - ${left}px - 12px))`,
    maxHeight: isFreightShell
      ? 'calc(100vh - 58px - 12px)'
      : 'calc(100vh - var(--topbar-h, 40px) - 12px)',
  };
}

function LayerDropdown({ label, value, placeholder, open, onToggle, onClose, children, settingsPanel }) {
  const ref = useRef(null);
  const dropdownRef = useRef(null);
  const [flipX, setFlipX] = useState(false);

  useLayoutEffect(() => {
    if (!open) {
      setFlipX(false);
      return;
    }

    const layerEl = ref.current;
    const dropdownEl = dropdownRef.current;
    if (!layerEl || !dropdownEl) return;

    const layerRect = layerEl.getBoundingClientRect();
    const dropdownWidth = dropdownEl.offsetWidth || 300;
    const modalRect = layerEl.closest('.ws-launcher-modal')?.getBoundingClientRect();
    const boundaryRight = (modalRect?.right ?? window.innerWidth) - 10;
    const boundaryLeft = (modalRect?.left ?? 0) + 10;

    const overflowRight = layerRect.left + dropdownWidth > boundaryRight;
    const overflowLeft = layerRect.right - dropdownWidth < boundaryLeft;

    setFlipX(overflowRight && !overflowLeft);
  }, [open, children, settingsPanel]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onClose]);

  return (
    <div className="ws-launcher-layer" ref={ref}>
      <button type="button" className="ws-launcher-layer-btn" onClick={onToggle} aria-expanded={open}>
        {value || <span className="ws-launcher-placeholder">{placeholder}</span>}
        <AppIcon icon={Icons.chevronDown} size={14} />
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className={`ws-launcher-dropdown${settingsPanel ? ' has-settings' : ''}${flipX ? ' is-flip-x' : ''}`}
          role="listbox"
          aria-label={label}
        >
          <div className="ws-launcher-dropdown-panel">{children}</div>
          {settingsPanel}
        </div>
      )}
    </div>
  );
}

function LayerOptionRow({
  iconName,
  title,
  subtitle,
  badge,
  active,
  favorite,
  onSelect,
  onToggleFavorite,
  onOpenSettings,
}) {
  return (
    <div className={`ws-launcher-option-row${active ? ' active' : ''}`}>
      <button type="button" className="ws-launcher-option-main" onClick={onSelect}>
        <WorkspaceIcon name={iconName} size={16} className="ws-launcher-option-icon" />
        <span className="ws-launcher-option-text">
          <span className="ws-launcher-option-title">{title}</span>
          {subtitle && <span className="ws-launcher-option-sub">{subtitle}</span>}
        </span>
      </button>
      <div className="ws-launcher-option-actions">
        <div className="ws-launcher-option-badge">{badge}</div>
        <button
          type="button"
          className="ws-launcher-option-gear"
          aria-label={`${title} settings`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenSettings();
          }}
        >
          <AppIcon icon={Icons.settings} size={14} />
        </button>
        <button
          type="button"
          className={`ws-launcher-option-star${favorite ? ' active' : ''}`}
          aria-label={favorite ? 'Remove favorite' : 'Add favorite'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <AppIcon icon={Icons.star} size={14} />
        </button>
      </div>
    </div>
  );
}

export default function ApplicationLauncher() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAlmShell = !location.pathname.startsWith('/workspace');
  const isFreightShell = location.pathname.startsWith('/workspace/freight');
  const {
    launcherOpen,
    setLauncherOpen,
    launcherAnchorRef,
    platformSelection,
    setPlatformSelection,
    trackRecent,
    toggleFavorite,
    isFavorite,
    togglePlatformFavorite,
    isPlatformFavorite,
  } = useWorkspace();
  const {
    accessibleWorkspaces,
    canAccessSchema,
    canAccessSolution,
    canAccessApp,
  } = useRbac();

  const [openLayer, setOpenLayer] = useState(null);
  const [localSearch, setLocalSearch] = useState('');
  const [layerSearch, setLayerSearch] = useState({ workspace: '', schema: '', solution: '' });
  const [settingsTarget, setSettingsTarget] = useState(null);
  const [launcherPosition, setLauncherPosition] = useState(() => fallbackLauncherPosition(false));

  const updateLauncherPosition = useCallback(() => {
    setLauncherPosition(computeLauncherPosition(launcherAnchorRef?.current, isFreightShell));
  }, [launcherAnchorRef, isFreightShell]);

  useLayoutEffect(() => {
    if (!launcherOpen) return undefined;
    updateLauncherPosition();
    window.addEventListener('resize', updateLauncherPosition);
    window.addEventListener('scroll', updateLauncherPosition, true);
    return () => {
      window.removeEventListener('resize', updateLauncherPosition);
      window.removeEventListener('scroll', updateLauncherPosition, true);
    };
  }, [launcherOpen, updateLauncherPosition]);

  useEffect(() => {
    if (!launcherOpen) return;
    if (!platformSelection?.workspaceId && accessibleWorkspaces.length > 0) {
      setPlatformSelection(getDefaultPlatformSelection(accessibleWorkspaces));
    }
  }, [launcherOpen, platformSelection, accessibleWorkspaces, setPlatformSelection]);

  useEffect(() => {
    if (!launcherOpen) {
      setSettingsTarget(null);
      setOpenLayer(null);
      return undefined;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') setLauncherOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [launcherOpen, setLauncherOpen]);

  const workspace = getWorkspace(platformSelection?.workspaceId);
  const schema = getSchema(platformSelection?.workspaceId, platformSelection?.schemaId);
  const solutions = useMemo(() => {
    if (!platformSelection?.workspaceId || !platformSelection?.schemaId) return [];
    return getSolutionsForSchema(platformSelection.workspaceId, platformSelection.schemaId).filter((s) =>
      canAccessSolution(s.id)
    );
  }, [platformSelection, canAccessSolution]);

  const selectedSolution = solutions.find((s) => s.id === platformSelection?.solutionId);

  const apps = useMemo(() => {
    if (!selectedSolution) return [];
    const q = localSearch.trim();
    return getAppsForSolution(selectedSolution.id)
      .filter((app) => canAccessApp(app.id))
      .filter(
        (app) =>
          matchesQuery(app.name, q) ||
          matchesQuery(app.description || '', q) ||
          matchesQuery(selectedSolution.name, q)
      );
  }, [selectedSolution, canAccessApp, localSearch]);

  const standaloneApps = useMemo(() => {
    if (!platformSelection?.workspaceId || !platformSelection?.schemaId || selectedSolution) return [];
    const q = localSearch.trim();
    return getStandaloneAppsForSchema(platformSelection.workspaceId, platformSelection.schemaId)
      .filter((app) => canAccessApp(app.id))
      .filter((app) => matchesQuery(app.name, q) || matchesQuery(app.description || '', q));
  }, [platformSelection, selectedSolution, canAccessApp, localSearch]);

  const accessibleSchemas = useMemo(() => {
    if (!workspace) return [];
    return workspace.schemas.filter((s) => canAccessSchema(workspace.id, s.id));
  }, [workspace, canAccessSchema]);

  const filteredWorkspaces = useMemo(() => {
    const q = layerSearch.workspace.trim();
    return accessibleWorkspaces.filter(
      (w) => matchesQuery(w.name, q) || matchesQuery(w.roleLabel || '', q)
    );
  }, [accessibleWorkspaces, layerSearch.workspace]);

  const filteredSchemas = useMemo(() => {
    const q = layerSearch.schema.trim();
    return accessibleSchemas.filter(
      (s) =>
        matchesQuery(s.name, q) ||
        matchesQuery(s.roleLabel || '', q) ||
        matchesQuery(s.environment || '', q)
    );
  }, [accessibleSchemas, layerSearch.schema]);

  const filteredSolutions = useMemo(() => {
    const q = layerSearch.solution.trim();
    return solutions.filter(
      (s) =>
        matchesQuery(s.name, q) ||
        matchesQuery(s.roleLabel || 'Solution Admin', q) ||
        matchesQuery(s.description || '', q)
    );
  }, [solutions, layerSearch.solution]);

  const closeLayer = () => {
    setOpenLayer(null);
    setSettingsTarget(null);
  };

  const openSettings = (layer, entity) => {
    setSettingsTarget({ layer, entity });
  };

  const openApp = (app) => {
    trackRecent(app.id);
    setLauncherOpen(false);
    if (app.externalRoute) {
      navigate(app.externalRoute);
      return;
    }
    if (app.route) {
      navigate(app.route);
      return;
    }
    const slug = app.id?.replace('freight-', '');
    if (slug && ['sales', 'accounting', 'tracking', 'leads'].includes(slug)) {
      navigate(`/workspace/freight/${slug === 'leads' ? 'leads' : slug}`);
    }
  };

  const renderSettingsPanel = (layer) =>
    settingsTarget?.layer === layer ? (
      <div className="ws-platform-settings-anchor">
        <PlatformSettingsPanel
          layer={settingsTarget.layer}
          entity={settingsTarget.entity}
          onClose={() => setSettingsTarget(null)}
        />
      </div>
    ) : null;

  if (!launcherOpen) return null;

  const overlayClass = `ws-launcher-overlay ws-launcher-overlay--anchored${isAlmShell ? ' is-alm' : ' is-workspace'}${isFreightShell ? ' is-freight' : ''}`;
  const modalStyle = launcherModalStyle(launcherPosition, isFreightShell);

  return createPortal(
    <div className={overlayClass} role="presentation">
      <button type="button" className="ws-launcher-backdrop" aria-label="Close application launcher" onClick={() => setLauncherOpen(false)} />
      <div className="ws-launcher-modal" style={modalStyle} role="dialog" aria-modal="true" aria-labelledby="ws-launcher-title">
        <div className="ws-launcher-head">
          <div className="ws-launcher-head-brand">
            <div className="ws-launcher-logo">
              <span>V</span>
            </div>
            <div>
              <h2 id="ws-launcher-title" className="ws-launcher-title">Application Launcher</h2>
              <p className="ws-launcher-sub">Select your workspace, schema, and solution</p>
            </div>
          </div>
          <div className="ws-launcher-head-actions">
            <div className="ws-launcher-search-wrap">
              <AppIcon icon={Icons.search} size={15} />
              <input
                type="search"
                className="ws-launcher-search"
                placeholder="Search apps..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
            <button type="button" className="ws-launcher-close" aria-label="Close" onClick={() => setLauncherOpen(false)}>
              <AppIcon icon={Icons.x} size={18} />
            </button>
          </div>
        </div>

        <div className="ws-launcher-path">
          <LayerDropdown
            label="Workspace"
            placeholder="Select workspace..."
            value={
              workspace ? (
                <span className="ws-launcher-chip">
                  <WorkspaceIcon name={workspace.icon} size={16} />
                  {workspace.name}
                </span>
              ) : null
            }
            open={openLayer === 'workspace'}
            onToggle={() => {
              setSettingsTarget(null);
              setOpenLayer((v) => (v === 'workspace' ? null : 'workspace'));
            }}
            onClose={closeLayer}
            settingsPanel={renderSettingsPanel('workspace')}
          >
            <div className="ws-launcher-dropdown-search-wrap">
              <AppIcon icon={Icons.search} size={14} />
              <input
                type="search"
                className="ws-launcher-dropdown-search"
                placeholder="Search workspace..."
                value={layerSearch.workspace}
                onChange={(e) => setLayerSearch((prev) => ({ ...prev, workspace: e.target.value }))}
              />
            </div>
            <div className="ws-launcher-dropdown-label">Workspaces ({filteredWorkspaces.length})</div>
            {filteredWorkspaces.map((w) => (
              <LayerOptionRow
                key={w.id}
                iconName={w.icon}
                title={w.name}
                subtitle={w.roleLabel}
                active={platformSelection?.workspaceId === w.id}
                favorite={isPlatformFavorite(platformFavoriteKey('workspace', w.id))}
                onSelect={() => {
                  const firstSchema = w.schemas.find((s) => canAccessSchema(w.id, s.id));
                  const nextSolutions = firstSchema
                    ? getSolutionsForSchema(w.id, firstSchema.id).filter((s) => canAccessSolution(s.id))
                    : [];
                  setPlatformSelection({
                    workspaceId: w.id,
                    schemaId: firstSchema?.id ?? null,
                    solutionId: nextSolutions[0]?.id ?? null,
                  });
                  closeLayer();
                }}
                onToggleFavorite={() => togglePlatformFavorite(platformFavoriteKey('workspace', w.id))}
                onOpenSettings={() => openSettings('workspace', w)}
              />
            ))}
          </LayerDropdown>

          <span className="ws-launcher-sep">/</span>

          <LayerDropdown
            label="Schema"
            placeholder="Select schema..."
            value={
              schema ? (
                <span className="ws-launcher-chip">
                  <WorkspaceIcon name={schema.icon} size={16} />
                  {schema.name}
                  {schema.environment && (
                    <span className={`ws-launcher-env ws-launcher-env-${schema.environmentTone}`}>
                      {schema.environment}
                    </span>
                  )}
                </span>
              ) : null
            }
            open={openLayer === 'schema'}
            onToggle={() => {
              setSettingsTarget(null);
              setOpenLayer((v) => (v === 'schema' ? null : 'schema'));
            }}
            onClose={closeLayer}
            settingsPanel={renderSettingsPanel('schema')}
          >
            <div className="ws-launcher-dropdown-search-wrap">
              <AppIcon icon={Icons.search} size={14} />
              <input
                type="search"
                className="ws-launcher-dropdown-search"
                placeholder="Search schema..."
                value={layerSearch.schema}
                onChange={(e) => setLayerSearch((prev) => ({ ...prev, schema: e.target.value }))}
              />
            </div>
            <div className="ws-launcher-dropdown-label">Schemas ({filteredSchemas.length})</div>
            {filteredSchemas.map((s) => (
              <LayerOptionRow
                key={s.id}
                iconName={s.icon}
                title={s.name}
                subtitle={s.roleLabel}
                badge={
                  s.environment ? (
                    <span className={`ws-launcher-env ws-launcher-env-${s.environmentTone}`}>{s.environment}</span>
                  ) : null
                }
                active={platformSelection?.schemaId === s.id}
                favorite={isPlatformFavorite(platformFavoriteKey('schema', s.id))}
                onSelect={() => {
                  const nextSolutions = getSolutionsForSchema(workspace.id, s.id).filter((sol) =>
                    canAccessSolution(sol.id)
                  );
                  setPlatformSelection({
                    workspaceId: workspace.id,
                    schemaId: s.id,
                    solutionId: nextSolutions[0]?.id ?? null,
                  });
                  closeLayer();
                }}
                onToggleFavorite={() => togglePlatformFavorite(platformFavoriteKey('schema', s.id))}
                onOpenSettings={() => openSettings('schema', s)}
              />
            ))}
          </LayerDropdown>

          <span className="ws-launcher-sep">/</span>

          <LayerDropdown
            label="Solution"
            placeholder="Select solution..."
            value={
              selectedSolution ? (
                <span className="ws-launcher-chip">
                  <WorkspaceIcon name={selectedSolution.icon} size={16} />
                  {selectedSolution.name}
                </span>
              ) : null
            }
            open={openLayer === 'solution'}
            onToggle={() => {
              setSettingsTarget(null);
              setOpenLayer((v) => (v === 'solution' ? null : 'solution'));
            }}
            onClose={closeLayer}
            settingsPanel={renderSettingsPanel('solution')}
          >
            <div className="ws-launcher-dropdown-search-wrap">
              <AppIcon icon={Icons.search} size={14} />
              <input
                type="search"
                className="ws-launcher-dropdown-search"
                placeholder="Search solution..."
                value={layerSearch.solution}
                onChange={(e) => setLayerSearch((prev) => ({ ...prev, solution: e.target.value }))}
              />
            </div>
            <div className="ws-launcher-dropdown-label">Solutions ({filteredSolutions.length})</div>
            {filteredSolutions.map((s) => (
              <LayerOptionRow
                key={s.id}
                iconName={s.icon}
                title={s.name}
                subtitle={s.roleLabel || 'Solution Admin'}
                active={platformSelection?.solutionId === s.id}
                favorite={isPlatformFavorite(platformFavoriteKey('solution', s.id))}
                onSelect={() => {
                  setPlatformSelection((prev) => ({ ...prev, solutionId: s.id }));
                  closeLayer();
                }}
                onToggleFavorite={() => togglePlatformFavorite(platformFavoriteKey('solution', s.id))}
                onOpenSettings={() => openSettings('solution', s)}
              />
            ))}
          </LayerDropdown>
        </div>

        <div className="ws-launcher-body">
          {!platformSelection?.solutionId ? (
            <div className="ws-launcher-empty">
              <div className="ws-launcher-empty-icon">
                <AppIcon icon={Icons.layoutGrid} size={36} />
              </div>
              <h3>Get Started</h3>
              <p>Select a workspace, schema, and solution above</p>
            </div>
          ) : apps.length === 0 && standaloneApps.length === 0 ? (
            <div className="ws-launcher-empty">
              <div className="ws-launcher-empty-icon">
                <AppIcon icon={Icons.layoutGrid} size={36} />
              </div>
              <h3>No apps available</h3>
              <p>You don&apos;t have permission to open apps in this solution.</p>
            </div>
          ) : (
            <>
              <div className="ws-launcher-apps-head">
                <h3>Applications</h3>
                <span>{[...apps, ...standaloneApps].length} apps</span>
              </div>
              <div className="ws-launcher-apps ws-launcher-apps-grid">
                {[...apps, ...standaloneApps].map((app) => (
                  <div
                    key={app.id}
                    className="ws-launcher-app ws-launcher-app-card"
                    style={{ '--app-color': app.color || '#2563EB' }}
                  >
                    <button type="button" className="ws-launcher-app-open" onClick={() => openApp(app)}>
                      {app.notificationCount > 0 && (
                        <span className="ws-launcher-app-badge">{app.notificationCount}</span>
                      )}
                      <div className="ws-launcher-app-icon ws-launcher-app-icon-colored">
                        <AppIcon icon={resolveIcon(app.icon)} size={22} />
                      </div>
                      <div className="ws-launcher-app-name">{app.name}</div>
                      <div className="ws-launcher-app-desc">{app.description}</div>
                    </button>
                    <button
                      type="button"
                      className={`ws-launcher-app-star${isFavorite(app.id) ? ' active' : ''}`}
                      aria-label={isFavorite(app.id) ? 'Remove favorite' : 'Add favorite'}
                      onClick={() => toggleFavorite(app.id)}
                    >
                      <AppIcon icon={Icons.star} size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
