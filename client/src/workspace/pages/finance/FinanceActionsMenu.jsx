import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppIcon, Icons } from '../../../components/icons';

const MENU_WIDTH = 148;
const MENU_ITEM_HEIGHT = 34;
const MENU_PADDING = 8;
const VIEWPORT_PAD = 8;

function computeMenuPosition(triggerEl, itemCount, hasDivider) {
  const rect = triggerEl.getBoundingClientRect();
  const dividerHeight = hasDivider ? 9 : 0;
  const menuHeight = itemCount * MENU_ITEM_HEIGHT + MENU_PADDING + dividerHeight;

  let top = rect.bottom + 6;
  let left = rect.right - MENU_WIDTH;

  if (top + menuHeight > window.innerHeight - VIEWPORT_PAD) {
    top = Math.max(VIEWPORT_PAD, rect.top - menuHeight - 6);
  }
  if (left < VIEWPORT_PAD) left = VIEWPORT_PAD;
  if (left + MENU_WIDTH > window.innerWidth - VIEWPORT_PAD) {
    left = window.innerWidth - MENU_WIDTH - VIEWPORT_PAD;
  }

  return { top, left, width: MENU_WIDTH };
}

export default function FinanceActionsMenu({ actions = [], disabled = false }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const hasDivider = actions.some((a, i) => a.danger && i > 0 && !actions[i - 1]?.danger);

  const reposition = useCallback(() => {
    if (!triggerRef.current || !actions.length) return;
    setMenuPos(computeMenuPosition(triggerRef.current, actions.length, hasDivider));
  }, [actions.length, hasDivider]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return undefined;

    const close = () => setOpen(false);
    const onDoc = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', close, true);

    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', close, true);
    };
  }, [open, reposition]);

  if (!actions.length) return null;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setOpen((v) => !v);
  };

  const dropdown = open && menuPos
    ? createPortal(
        <div
          ref={menuRef}
          className="ws-actions-dropdown ws-actions-dropdown-portal"
          role="menu"
          style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
        >
          {actions.map((action, index) => {
            const showDivider = action.danger && index > 0 && !actions[index - 1]?.danger;
            return (
              <div key={action.id} className="ws-actions-dropdown-group">
                {showDivider && <div className="ws-actions-divider" role="separator" />}
                <button
                  type="button"
                  role="menuitem"
                  className={`ws-actions-item${action.danger ? ' danger' : ''}`}
                  disabled={action.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    action.onClick?.();
                  }}
                >
                  {action.icon && (
                    <span className="ws-actions-item-icon">
                      <AppIcon icon={action.icon} size={14} />
                    </span>
                  )}
                  <span className="ws-actions-item-label">{action.label}</span>
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div className="ws-actions-menu">
        <button
          ref={triggerRef}
          type="button"
          className={`ws-actions-trigger${open ? ' active' : ''}`}
          aria-label="Options"
          aria-expanded={open}
          aria-haspopup="menu"
          disabled={disabled}
          onClick={handleToggle}
        >
          <AppIcon icon={Icons.moreVertical} size={16} />
        </button>
      </div>
      {dropdown}
    </>
  );
}
