import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';
import { AppIcon, Icons } from './icons';
import { CALENDAR_QUICK_TYPES } from '../utils/calendarHelpers';
import { uById } from '../utils/helpers';

const TYPE_ICONS = {
  listChecks: Icons.listChecks,
  flag: Icons.flag,
  layers: Icons.layers,
  bug: Icons.bug,
};

export default function CalendarQuickCreate({
  dateISO,
  project,
  users,
  user,
  permissions,
  onCreated,
  onClose,
  toast,
}) {
  const inputRef = useRef(null);
  const rootRef = useRef(null);
  const [title, setTitle] = useState('');
  const [typeOpen, setTypeOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const allowedTypes = useMemo(
    () => CALENDAR_QUICK_TYPES.filter((t) => permissions?.[t.perm]),
    [permissions],
  );
  const [typeId, setTypeId] = useState(allowedTypes[0]?.id || 'task');
  const activeType = allowedTypes.find((t) => t.id === typeId) || allowedTypes[0];

  const projectMembers = useMemo(
    () => (project?.members || []).map((id) => uById(users, id)).filter(Boolean),
    [project, users],
  );
  const [assigneeId, setAssigneeId] = useState(user?.id || projectMembers[0]?.id || '');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const assignee = uById(users, assigneeId);

  const submit = async () => {
    if (!title.trim()) {
      toast('Enter what needs to be done', 'warn');
      inputRef.current?.focus();
      return;
    }
    if (!activeType) {
      toast('You do not have permission to create this work type', 'err');
      return;
    }
    setSaving(true);
    try {
      if (activeType.issueType === 'bug') {
        await api.createBug(project.id, {
          title: title.trim(),
          assign: assigneeId,
          reporter: user?.id || '',
          dueTime: `${dateISO}T12:00:00`,
        });
      } else {
        await api.createIssue(project.id, {
          title: title.trim(),
          type: activeType.issueType,
          assign: assigneeId,
          reporter: user?.id || '',
          due: dateISO,
          status: 'Dev Progress',
          sprint: project.curSprint || 'Current Sprint',
        });
      }
      await onCreated?.();
      toast('Work item created', 'ok');
      onClose();
    } catch (e) {
      toast(e.message || 'Could not create work item', 'err');
    } finally {
      setSaving(false);
    }
  };

  const onFormKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      ref={rootRef}
      className="cal-quick-create"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={onFormKeyDown}
      role="dialog"
      aria-label="Quick create work item"
    >
      <input
        ref={inputRef}
        className="cal-quick-create-input"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={saving}
      />
      <div className="cal-quick-create-foot">
        <div className="cal-quick-create-type-wrap">
          <button
            type="button"
            className="cal-quick-create-type"
            onClick={() => {
              setTypeOpen((o) => !o);
              setAssigneeOpen(false);
            }}
            disabled={saving || allowedTypes.length === 0}
          >
            {activeType && (
              <>
                <AppIcon icon={TYPE_ICONS[activeType.iconKey] || Icons.listChecks} size={14} />
                <span>{activeType.label}</span>
              </>
            )}
            <AppIcon icon={Icons.chevronRight} size={12} className="cal-quick-create-chevron" />
          </button>
          {typeOpen && (
            <div className="cal-quick-create-menu">
              {allowedTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`cal-quick-create-menu-item${t.id === typeId ? ' active' : ''}`}
                  onClick={() => {
                    setTypeId(t.id);
                    setTypeOpen(false);
                  }}
                >
                  <AppIcon icon={TYPE_ICONS[t.iconKey] || Icons.listChecks} size={14} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="cal-quick-create-assign-wrap">
          <button
            type="button"
            className="cal-quick-create-assign"
            title={assignee ? assignee.name : 'Assignee'}
            onClick={() => {
              setAssigneeOpen((o) => !o);
              setTypeOpen(false);
            }}
            disabled={saving}
          >
            {assignee ? (
              <span className={`av av-xs ${assignee.c}`}>{assignee.ini}</span>
            ) : (
              <AppIcon icon={Icons.users} size={14} />
            )}
          </button>
          {assigneeOpen && (
            <div className="cal-quick-create-menu cal-quick-create-menu--assign">
              {projectMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`cal-quick-create-menu-item${m.id === assigneeId ? ' active' : ''}`}
                  onClick={() => {
                    setAssigneeId(m.id);
                    setAssigneeOpen(false);
                  }}
                >
                  <span className={`av av-xs ${m.c}`}>{m.ini}</span>
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="cal-quick-create-submit"
          onClick={submit}
          disabled={saving || !title.trim()}
        >
          Create
          <span className="cal-quick-create-enter" aria-hidden="true">↵</span>
        </button>
      </div>
    </div>
  );
}
