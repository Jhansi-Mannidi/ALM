import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { APP_ROLES, ROLE_LOGIN_USERS, roleTitle } from '../utils/helpers';
import { AppIcon, Icons } from './icons';

export const ROLES = APP_ROLES.map((role) => ({
  ...role,
  ...ROLE_LOGIN_USERS[role.id],
  desc: role.title,
}));

function RolePickerItem({ item, active, onSelect }) {
  return (
    <button
      type="button"
      className={`role-picker-item${active ? ' active' : ''}`}
      onClick={() => onSelect(item.id)}
    >
      <div className={`av av-sm ${item.c}`}>{item.ini}</div>
      <div className="role-picker-item-text">
        <div className="role-picker-item-name">{item.name}</div>
        <div className="role-picker-item-role">{item.title}</div>
      </div>
      {active && <AppIcon icon={Icons.check} size={14} className="role-picker-item-check" />}
    </button>
  );
}

export default function RoleAccessDropdown({ variant = 'sidebar' }) {
  const { role, user, switchRole } = useApp();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const current = ROLES.find((r) => r.id === role) || ROLES[0];
  const displayName = user?.name || current.name;
  const displayIni = user?.ini || current.ini;
  const displayColor = user?.c || current.c;
  const displayTitle = roleTitle(role);

  useEffect(() => {
    if (!open) return undefined;

    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selectRole = async (id) => {
    setOpen(false);
    if (id && id !== role) {
      await switchRole(id);
    }
  };

  if (variant === 'page') {
    return (
      <div className={`role-picker role-picker--page${open ? ' open' : ''}`} ref={rootRef}>
        <button
          type="button"
          className="role-picker-trigger"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <div className={`av av-sm ${displayColor}`}>{displayIni}</div>
          <div className="role-picker-trigger-text">
            <div className="role-picker-trigger-name">{displayName}</div>
            <div className="role-picker-trigger-role">{displayTitle}</div>
          </div>
          <AppIcon
            icon={Icons.chevronRight}
            size={14}
            className={`role-picker-chevron${open ? ' open' : ''}`}
          />
        </button>
        {open && (
          <div className="role-picker-menu" role="listbox">
            {ROLES.map((item) => (
              <RolePickerItem
                key={item.id}
                item={item}
                active={item.id === role}
                onSelect={selectRole}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`role-picker role-picker--sidebar${open ? ' open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="role-picker-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className={`av av-sm ${displayColor}`}>{displayIni}</div>
        <div className="role-picker-trigger-text">
          <div className="role-picker-trigger-name">{displayName}</div>
          <div className="role-picker-trigger-role">{displayTitle}</div>
        </div>
        <AppIcon
          icon={Icons.chevronRight}
          size={14}
          className={`role-picker-chevron${open ? ' open' : ''}`}
        />
      </button>
      {open && (
        <div className="role-picker-menu" role="listbox">
          {ROLES.map((item) => (
            <RolePickerItem
              key={item.id}
              item={item}
              active={item.id === role}
              onSelect={selectRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}
