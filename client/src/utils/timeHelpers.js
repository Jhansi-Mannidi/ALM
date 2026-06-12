export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Week starts Monday (Jira-style work week). */
export function startOfWeekISO(iso, weekStartsOn = 1) {
  const d = new Date(`${iso}T12:00:00`);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

export function getWeekDates(anchorISO) {
  const monday = startOfWeekISO(anchorISO);
  return Array.from({ length: 7 }, (_, i) => addDaysISO(monday, i));
}

export function getDateRange(startISO, endISO, maxDays = 62) {
  if (!startISO || !endISO) return [];
  const from = startISO <= endISO ? startISO : endISO;
  const to = startISO <= endISO ? endISO : startISO;
  const dates = [];
  let cur = from;
  while (cur <= to && dates.length < maxDays) {
    dates.push(cur);
    cur = addDaysISO(cur, 1);
  }
  return dates;
}

export function isDateInRange(iso, startISO, endISO) {
  const from = startISO <= endISO ? startISO : endISO;
  const to = startISO <= endISO ? endISO : startISO;
  return iso >= from && iso <= to;
}

export function isTodayISO(iso) {
  return iso === todayISO();
}

export function isSameWeek(isoA, isoB) {
  return startOfWeekISO(isoA) === startOfWeekISO(isoB);
}

export function formatDayColumn(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return {
    iso,
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    dayNum: d.getDate(),
    isWeekend: d.getDay() === 0 || d.getDay() === 6,
  };
}

export function formatWeekRangeLabel(weekDates) {
  if (!weekDates?.length) return '';
  return formatDateRangeLabel(weekDates[0], weekDates[weekDates.length - 1]);
}

export function formatLongDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function sumLogMinutes(log) {
  if (!log) return 0;
  if (!log.endedAt) return liveElapsedMinutes(log);
  return log.durationMinutes || 0;
}

export function minutesOnDate(logs, date) {
  return (logs || [])
    .filter((l) => l.date === date)
    .reduce((sum, l) => sum + sumLogMinutes(l), 0);
}

export function getTimesheetMemberIds(project, users, logs, viewTeam, currentUserId) {
  if (!viewTeam) return currentUserId ? [currentUserId] : [];
  const fromProject = project?.members ?? [];
  const fromLogs = [...new Set((logs || []).map((l) => l.userId))];
  return [...new Set([...fromProject, ...fromLogs])].filter((id) => users.some((u) => u.id === id));
}

/** Project timesheet: only members assigned to this project. */
export function getProjectMemberIds(project, users, viewTeam, currentUserId) {
  if (!viewTeam) return currentUserId ? [currentUserId] : [];
  return (project?.members ?? []).filter((id) => users.some((u) => u.id === id));
}

/** Organization timesheet: all employees in the workspace. */
export function getOrganizationMemberIds(users, viewTeam, currentUserId) {
  if (!viewTeam) return currentUserId ? [currentUserId] : [];
  return (users || []).map((u) => u.id);
}

export function aggregateTimeLogs(projects) {
  return (projects || []).flatMap((p) =>
    (p.timeLogs || []).map((log) => ({
      ...log,
      projectId: p.id,
      projectName: p.name,
      projectCode: p.code,
    })),
  );
}

export function resolveLogTargetTitle(projects, project, log) {
  const sourceProject = log.projectId
    ? projects.find((p) => p.id === log.projectId)
    : project;
  const title = resolveTargetTitle(sourceProject, log);
  if (log.projectCode) return `${log.projectCode} · ${title}`;
  return title;
}

export function sumAllProjectLogsOnDate(projects, date) {
  return aggregateTimeLogs(projects)
    .filter((l) => l.date === date)
    .reduce((sum, l) => sum + sumLogMinutes(l), 0);
}

export function buildTimesheetRows(logs, memberIds, users, weekDates) {
  return memberIds
    .map((userId) => {
      const member = users.find((u) => u.id === userId);
      const userLogs = (logs || []).filter((l) => l.userId === userId);
      const byDay = {};
      let totalMinutes = 0;
      for (const date of weekDates) {
        const mins = minutesOnDate(userLogs, date);
        byDay[date] = mins;
        totalMinutes += mins;
      }
      return { userId, member, byDay, totalMinutes };
    })
    .sort((a, b) => {
      const nameA = a.member?.name || a.userId;
      const nameB = b.member?.name || b.userId;
      if (b.totalMinutes !== a.totalMinutes) return b.totalMinutes - a.totalMinutes;
      return nameA.localeCompare(nameB);
    });
}

export function getDayColumnTotals(rows, weekDates) {
  const totals = {};
  for (const date of weekDates) {
    totals[date] = rows.reduce((sum, row) => sum + (row.byDay[date] || 0), 0);
  }
  return totals;
}

export function formatCellDuration(minutes) {
  if (!minutes) return '';
  return formatDuration(minutes);
}

export function filterLogsByDateRange(logs, startDate, endDate) {
  const start = startDate || todayISO();
  const end = endDate || start;
  const from = start <= end ? start : end;
  const to = start <= end ? end : start;
  return (logs || []).filter((l) => l.date >= from && l.date <= to);
}

export function formatDateRangeLabel(startDate, endDate) {
  if (!startDate && !endDate) return todayISO();
  const start = startDate || endDate;
  const end = endDate || startDate;
  if (start === end) {
    return new Date(`${start}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const from = start <= end ? start : end;
  const to = start <= end ? end : start;
  const startD = new Date(`${from}T12:00:00`);
  const endD = new Date(`${to}T12:00:00`);
  const sameMonth = startD.getMonth() === endD.getMonth() && startD.getFullYear() === endD.getFullYear();
  if (sameMonth) {
    return `${startD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endD.getDate()}, ${endD.getFullYear()}`;
  }
  const startStr = startD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endStr = endD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

export function formatDuration(totalMinutes) {
  const mins = Math.max(0, Math.round(Number(totalMinutes) || 0));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatTimeRange(startedAt, endedAt) {
  if (!startedAt) return '—';
  const fmt = (iso) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (!endedAt) return `${fmt(startedAt)} → running`;
  return `${fmt(startedAt)} – ${fmt(endedAt)}`;
}

export function findActiveTimer(projects, userId) {
  if (!userId) return null;
  for (const project of projects) {
    const log = (project.timeLogs || []).find((l) => l.userId === userId && !l.endedAt);
    if (log) return { project, log };
  }
  return null;
}

export function sumMinutesForTarget(project, userId, targetId, date = todayISO()) {
  return (project.timeLogs || [])
    .filter(
      (l) =>
        l.userId === userId &&
        l.targetId === targetId &&
        l.date === date &&
        l.endedAt &&
        l.durationMinutes,
    )
    .reduce((sum, l) => sum + l.durationMinutes, 0);
}

export function getWorkLogsForTarget(project, targetType, targetId) {
  return (project?.timeLogs || [])
    .filter((l) => l.targetType === targetType && l.targetId === targetId)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
}

export function sumAllMinutesForTarget(project, targetType, targetId, userId = null) {
  return getWorkLogsForTarget(project, targetType, targetId)
    .filter((l) => !userId || l.userId === userId)
    .reduce((sum, l) => sum + sumLogMinutes(l), 0);
}

export function liveElapsedMinutes(log) {
  if (!log?.startedAt) return 0;
  const end = log.endedAt ? new Date(log.endedAt) : new Date();
  return Math.max(0, Math.round((end - new Date(log.startedAt)) / 60000));
}

export function canViewTeamTime(role) {
  return ['admin', 'manager', 'teamlead', 'scrummaster'].includes(role);
}

export function resolveTargetTitle(project, log) {
  if (!project || !log) return log?.targetId || '—';
  if (log.targetType === 'bug') {
    const bug = (project.bugs || []).find((b) => b.id === log.targetId);
    return bug ? `${bug.id} — ${bug.title}` : log.targetId;
  }
  const issue = (project.issues || []).find((i) => i.id === log.targetId);
  return issue ? `${issue.id} — ${issue.title}` : log.targetId;
}

export function groupLogsByUser(logs, users, project) {
  const byUser = new Map();
  for (const log of logs) {
    if (!byUser.has(log.userId)) byUser.set(log.userId, []);
    byUser.get(log.userId).push(log);
  }
  return [...byUser.entries()]
    .map(([userId, entries]) => {
      const member = users.find((u) => u.id === userId);
      const completed = entries.filter((l) => l.endedAt);
      const active = entries.find((l) => !l.endedAt);
      const totalMinutes =
        completed.reduce((s, l) => s + (l.durationMinutes || 0), 0) +
        (active ? liveElapsedMinutes(active) : 0);
      return {
        userId,
        member,
        entries: entries
          .slice()
          .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
          .map((l) => ({
            ...l,
            targetTitle: resolveTargetTitle(project, l),
            displayMinutes: l.endedAt ? l.durationMinutes : liveElapsedMinutes(l),
          })),
        totalMinutes,
        active,
      };
    })
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
}
