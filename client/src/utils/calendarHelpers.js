import { isWorkflowComplete } from './helpers';
import { todayISO } from './timeHelpers';

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WORK_WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function toISODate(year, monthIndex, day) {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function normalizeDateKey(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isToday(iso) {
  return iso === todayISO();
}

export function isTomorrow(iso) {
  return iso === addDaysISO(todayISO(), 1);
}

export function formatMonthYearShort(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function formatDayLabel(dateISO) {
  const d = new Date(`${dateISO}T12:00:00`);
  const day = d.getDate();
  if (day === 1) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return String(day);
}

export function buildWorkWeekMonthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);

  const start = new Date(first);
  const startDow = first.getDay();
  const daysFromMonday = startDow === 0 ? 6 : startDow - 1;
  start.setDate(1 - daysFromMonday);

  const end = new Date(last);
  const endDow = last.getDay();
  let daysToFriday = 0;
  if (endDow === 0) daysToFriday = -2;
  else if (endDow === 6) daysToFriday = -1;
  else daysToFriday = 5 - endDow;
  end.setDate(last.getDate() + daysToFriday);

  const weeks = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const week = [];
    for (let i = 0; i < 5; i += 1) {
      const d = new Date(cursor);
      d.setDate(cursor.getDate() + i);
      const dateISO = toISODate(d.getFullYear(), d.getMonth(), d.getDate());
      week.push({
        dateISO,
        inMonth: d.getMonth() === monthIndex,
      });
    }
    weeks.push(week);
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}

export function buildMonthWeeks(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toISODate(year, monthIndex, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function formatMonthYear(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function indexCalendarItems(project) {
  const map = new Map();
  const add = (rawDate, item) => {
    const key = normalizeDateKey(rawDate);
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  };

  for (const issue of project?.issues || []) {
    if (issue.type === 'Sub-task') continue;
    add(issue.due, {
      id: issue.id,
      title: issue.title,
      type: issue.type,
      kind: 'issue',
      status: issue.status,
      assign: issue.assign || '',
    });
  }

  for (const bug of project?.bugs || []) {
    if (isWorkflowComplete(bug.status)) continue;
    add(bug.dueTime || bug.due, {
      id: bug.id,
      title: bug.title,
      type: 'Bug',
      kind: 'bug',
      status: bug.status,
      assign: bug.assign || '',
    });
  }

  for (const [, items] of map) {
    items.sort((a, b) => a.id.localeCompare(b.id));
  }
  return map;
}

export const CALENDAR_QUICK_TYPES = [
  { id: 'task', label: 'Task', issueType: 'Task', perm: 'createTask', chip: 'chip-gray', iconKey: 'listChecks' },
  { id: 'story', label: 'Story', issueType: 'Story', perm: 'createTask', chip: 'chip-teal', iconKey: 'flag' },
  { id: 'feature', label: 'Feature', issueType: 'Feature', perm: 'createFeature', chip: 'chip-blue', iconKey: 'layers' },
  { id: 'bug', label: 'Bug', issueType: 'bug', perm: 'createBug', chip: 'chip-red', iconKey: 'bug' },
];
