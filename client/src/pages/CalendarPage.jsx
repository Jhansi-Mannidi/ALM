import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CalendarQuickCreate from '../components/CalendarQuickCreate';
import { AppIcon, Icons } from '../components/icons';
import { useApp } from '../context/AppContext';
import {
  WORK_WEEKDAY_LABELS,
  buildWorkWeekMonthGrid,
  formatDayLabel,
  formatMonthYearShort,
  indexCalendarItems,
  isToday,
  toISODate,
} from '../utils/calendarHelpers';
import { todayISO } from '../utils/timeHelpers';

const MAX_VISIBLE_ITEMS = 4;

const FILTER_OPTIONS = [
  { id: 'all', label: 'All work items' },
  { id: 'mine', label: 'My items' },
  { id: 'task', label: 'Tasks' },
  { id: 'story', label: 'Stories' },
  { id: 'feature', label: 'Features' },
  { id: 'bug', label: 'Bugs' },
];

function itemChipClass(item) {
  if (item.kind === 'bug' || item.type === 'Bug') return 'cal-item-chip cal-item-chip--bug';
  if (item.type === 'Feature') return 'cal-item-chip cal-item-chip--feature';
  if (item.type === 'Story') return 'cal-item-chip cal-item-chip--story';
  return 'cal-item-chip';
}

function matchesFilter(item, filterId, userId) {
  if (filterId === 'all') return true;
  if (filterId === 'mine') return item.assign === userId;
  if (filterId === 'bug') return item.kind === 'bug' || item.type === 'Bug';
  if (filterId === 'task') return item.type === 'Task';
  if (filterId === 'story') return item.type === 'Story';
  if (filterId === 'feature') return item.type === 'Feature';
  return true;
}

function matchesSearch(item, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return item.id.toLowerCase().includes(q) || item.title.toLowerCase().includes(q);
}

export default function CalendarPage() {
  const { project, users, user, permissions, refreshProjects, toast } = useApp();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [quickCreateDate, setQuickCreateDate] = useState(null);
  const [search, setSearch] = useState('');
  const [filterId, setFilterId] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showWeekends, setShowWeekends] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const weeks = useMemo(() => buildWorkWeekMonthGrid(year, month), [year, month]);
  const itemsByDate = useMemo(() => (project ? indexCalendarItems(project) : new Map()), [project]);

  const filterItems = (items) =>
    items.filter((item) => matchesFilter(item, filterId, user?.id) && matchesSearch(item, search));

  useEffect(() => {
    if (!quickCreateDate) return undefined;
    const close = (e) => {
      if (e.target.closest('.cal-board')) return;
      setQuickCreateDate(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [quickCreateDate]);

  useEffect(() => {
    const closeMenus = (e) => {
      if (e.target.closest('.cal-toolbar-menu-wrap')) return;
      setFilterOpen(false);
      setViewOpen(false);
      setSettingsOpen(false);
    };
    document.addEventListener('mousedown', closeMenus);
    return () => document.removeEventListener('mousedown', closeMenus);
  }, []);

  if (!project) return null;

  const activeFilter = FILTER_OPTIONS.find((f) => f.id === filterId) || FILTER_OPTIONS[0];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => setViewDate(new Date());

  const openQuickCreate = (dateISO, e) => {
    e?.stopPropagation();
    if (!permissions.createIssue && !permissions.createBug) {
      toast('You do not have permission to create work items', 'warn');
      return;
    }
    setQuickCreateDate(dateISO);
  };

  const weekdayLabels = showWeekends
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : WORK_WEEKDAY_LABELS;

  return (
    <div className="cal-page">
      <div className="cal-toolbar">
        <div className="cal-toolbar-left">
          <div className="cal-search">
            <AppIcon icon={Icons.search} size={15} className="cal-search-icon" />
            <input
              type="search"
              className="cal-search-input"
              placeholder="Search calendar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search calendar"
            />
          </div>
          <div className="cal-toolbar-menu-wrap">
            <button
              type="button"
              className="cal-toolbar-btn cal-toolbar-filter"
              onClick={(e) => {
                e.stopPropagation();
                setFilterOpen((o) => !o);
                setViewOpen(false);
                setSettingsOpen(false);
              }}
            >
              {activeFilter.label}
              <AppIcon icon={Icons.chevronRight} size={12} className="cal-toolbar-chevron" />
            </button>
            {filterOpen && (
              <div className="cal-toolbar-menu" onClick={(e) => e.stopPropagation()}>
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`cal-toolbar-menu-item${opt.id === filterId ? ' active' : ''}`}
                    onClick={() => {
                      setFilterId(opt.id);
                      setFilterOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="cal-toolbar-right">
          <button type="button" className="cal-toolbar-text-btn" onClick={goToday}>
            Today
          </button>
          <div className="cal-toolbar-nav">
            <button type="button" className="cal-toolbar-icon-btn" onClick={prevMonth} aria-label="Previous month">
              ‹
            </button>
            <span className="cal-toolbar-month">{formatMonthYearShort(year, month)}</span>
            <button type="button" className="cal-toolbar-icon-btn" onClick={nextMonth} aria-label="Next month">
              ›
            </button>
          </div>
          <div className="cal-toolbar-menu-wrap">
            <button
              type="button"
              className="cal-toolbar-btn"
              onClick={(e) => {
                e.stopPropagation();
                setViewOpen((o) => !o);
                setFilterOpen(false);
                setSettingsOpen(false);
              }}
            >
              Month
              <AppIcon icon={Icons.chevronRight} size={12} className="cal-toolbar-chevron" />
            </button>
            {viewOpen && (
              <div className="cal-toolbar-menu" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="cal-toolbar-menu-item active">
                  Month
                </button>
                <button type="button" className="cal-toolbar-menu-item" disabled title="Coming soon">
                  Week
                </button>
                <button type="button" className="cal-toolbar-menu-item" disabled title="Coming soon">
                  Day
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className="cal-toolbar-icon-btn"
            title="Quick create today"
            onClick={() => openQuickCreate(todayISO())}
          >
            <AppIcon icon={Icons.calendarPlus} size={17} />
          </button>
          <div className="cal-toolbar-menu-wrap">
            <button
              type="button"
              className="cal-toolbar-icon-btn"
              title="Display options"
              onClick={(e) => {
                e.stopPropagation();
                setSettingsOpen((o) => !o);
                setFilterOpen(false);
                setViewOpen(false);
              }}
            >
              <AppIcon icon={Icons.sliders} size={17} />
            </button>
            {settingsOpen && (
              <div className="cal-toolbar-menu cal-toolbar-menu--settings" onClick={(e) => e.stopPropagation()}>
                <label className="cal-settings-row">
                  <span>Show weekends</span>
                  <input
                    type="checkbox"
                    checked={showWeekends}
                    onChange={(e) => setShowWeekends(e.target.checked)}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cal-board card">
        <div
          className="cal-weekdays"
          style={{ gridTemplateColumns: `repeat(${weekdayLabels.length}, minmax(0, 1fr))` }}
        >
          {weekdayLabels.map((label) => (
            <div key={label} className="cal-weekday">
              {label}
            </div>
          ))}
        </div>
        <div className="cal-grid-scroll">
          <div
            className="cal-grid"
            style={{ gridTemplateColumns: `repeat(${weekdayLabels.length}, minmax(0, 1fr))` }}
          >
            {weeks.flatMap((week) => {
              const days = showWeekends ? expandWeekToSevenDays(week, year, month) : week;
              return days.map((cell) => {
                const { dateISO, inMonth } = cell;
                const items = filterItems(itemsByDate.get(dateISO) || []);
                const visible = items.slice(0, MAX_VISIBLE_ITEMS);
                const overflow = items.length - visible.length;
                const selected = quickCreateDate === dateISO;
                const today = isToday(dateISO);

                return (
                  <div
                    key={dateISO}
                    className={`cal-cell${selected ? ' cal-cell--selected' : ''}${!inMonth ? ' cal-cell--outside' : ''}`}
                  >
                    <div
                      className="cal-cell-inner"
                      role="button"
                      tabIndex={0}
                      onClick={() => openQuickCreate(dateISO)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openQuickCreate(dateISO);
                        }
                      }}
                    >
                      <div className="cal-cell-hd">
                        <span className={`cal-day-num${today ? ' cal-day-num--today' : ''}${!inMonth ? ' cal-day-num--outside' : ''}`}>
                          {formatDayLabel(dateISO)}
                        </span>
                        <button
                          type="button"
                          className="cal-cell-add"
                          title="Quick create"
                          onClick={(e) => openQuickCreate(dateISO, e)}
                        >
                          <AppIcon icon={Icons.plus} size={14} />
                        </button>
                      </div>

                      <div className="cal-cell-items">
                        {visible.map((item) => (
                          <Link
                            key={item.id}
                            to={item.kind === 'bug' ? '/bugs' : `/tasks/${item.id}`}
                            className={itemChipClass(item)}
                            onClick={(e) => e.stopPropagation()}
                            title={`${item.id} — ${item.title}`}
                          >
                            {item.title}
                          </Link>
                        ))}
                        {overflow > 0 && <span className="cal-item-more">+{overflow} more</span>}
                      </div>

                      {selected && (
                        <CalendarQuickCreate
                          dateISO={dateISO}
                          project={project}
                          users={users}
                          user={user}
                          permissions={permissions}
                          onCreated={refreshProjects}
                          onClose={() => setQuickCreateDate(null)}
                          toast={toast}
                        />
                      )}
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function expandWeekToSevenDays(week, year, monthIndex) {
  const monday = new Date(`${week[0].dateISO}T12:00:00`);
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      dateISO: toISODate(d.getFullYear(), d.getMonth(), d.getDate()),
      inMonth: d.getFullYear() === year && d.getMonth() === monthIndex,
    });
  }
  return days;
}
