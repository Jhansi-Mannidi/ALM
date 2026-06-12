import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppIcon, Icons } from '../../../components/icons';

const MENU_MIN_WIDTH = 168;
const MENU_ITEM_HEIGHT = 36;
const MENU_PADDING = 12;
const VIEWPORT_PAD = 8;

function computeMenuPosition(triggerEl, itemCount) {
  const rect = triggerEl.getBoundingClientRect();
  const menuHeight = itemCount * MENU_ITEM_HEIGHT + MENU_PADDING;
  const menuWidth = MENU_MIN_WIDTH;

  let top = rect.bottom + 4;
  let left = rect.right - menuWidth;

  if (top + menuHeight > window.innerHeight - VIEWPORT_PAD) {
    top = Math.max(VIEWPORT_PAD, rect.top - menuHeight - 4);
  }
  if (left < VIEWPORT_PAD) left = VIEWPORT_PAD;
  if (left + menuWidth > window.innerWidth - VIEWPORT_PAD) {
    left = window.innerWidth - menuWidth - VIEWPORT_PAD;
  }

  return { top, left, minWidth: menuWidth };
}

export default function FinanceActionsMenu({ actions = [], disabled = false }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const reposition = useCallback(() => {
    if (!triggerRef.current || !actions.length) return;
    setMenuPos(computeMenuPosition(triggerRef.current, actions.length));
  }, [actions.length]);

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
          className="ws-fin-actions-dropdown ws-fin-actions-dropdown-portal"
          role="menu"
          style={{ top: menuPos.top, left: menuPos.left, minWidth: menuPos.minWidth }}
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              className={`ws-fin-actions-item${action.danger ? ' danger' : ''}`}
              disabled={action.disabled}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                action.onClick?.();
              }}
            >
              {action.icon && <AppIcon icon={action.icon} size={14} />}
              {action.label}
            </button>
          ))}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div className="ws-fin-actions-menu">
        <button
          ref={triggerRef}
          type="button"
          className={`ws-fin-actions-trigger${open ? ' active' : ''}`}
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
