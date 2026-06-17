import { useNavigate } from 'react-router-dom';
import { AppIcon, Icons } from '../../components/icons';
import { PLATFORM_SETTINGS } from '../data/platformSettingsCatalog';

export default function PlatformSettingsPanel({ layer, entity, onClose }) {
  const navigate = useNavigate();
  const config = PLATFORM_SETTINGS[layer];

  if (!config || !entity) return null;

  const handleItem = (item) => {
    if (item.route) {
      onClose?.();
      navigate(item.route);
      return;
    }
    onClose?.();
  };

  return (
    <div className="ws-platform-settings" role="dialog" aria-label={config.title}>
      <div className="ws-platform-settings-head">
        <div>
          <div className="ws-platform-settings-title">{config.title}</div>
          <div className="ws-platform-settings-entity">{entity.name}</div>
        </div>
        <button type="button" className="ws-platform-settings-close" aria-label="Close settings" onClick={onClose}>
          <AppIcon icon={Icons.x} size={14} />
        </button>
      </div>

      {entity.roleLabel && (
        <div className="ws-platform-settings-meta">
          <span className="ws-platform-settings-meta-label">Your role</span>
          <span>{entity.roleLabel}</span>
        </div>
      )}

      {entity.environment && (
        <div className="ws-platform-settings-meta">
          <span className="ws-platform-settings-meta-label">Environment</span>
          <span className={`ws-launcher-env ws-launcher-env-${entity.environmentTone}`}>{entity.environment}</span>
        </div>
      )}

      {config.sections.map((section) => (
        <div key={section.label} className="ws-platform-settings-section">
          <div className="ws-platform-settings-section-label">{section.label}</div>
          <div className="ws-platform-settings-list">
            {section.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="ws-platform-settings-item"
                onClick={() => handleItem(item)}
              >
                <div>
                  <div className="ws-platform-settings-item-label">{item.label}</div>
                  {item.description && (
                    <div className="ws-platform-settings-item-desc">{item.description}</div>
                  )}
                </div>
                <AppIcon icon={Icons.chevronRight} size={14} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
