import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import { AppIcon, Icons } from '../components/icons';
import {
  addDaysISO,
  aggregateTimeLogs,
  buildTimesheetRows,
  canViewTeamTime,
  filterLogsByDateRange,
  findActiveTimer,
  formatCellDuration,
  formatDateRangeLabel,
  formatDayColumn,
  formatDuration,
  formatLongDate,
  formatTimeRange,
  getDateRange,
  getDayColumnTotals,
  getOrganizationMemberIds,
  getProjectMemberIds,
  isDateInRange,
  isTodayISO,
  liveElapsedMinutes,
  minutesOnDate,
  resolveTargetTitle,
  startOfWeekISO,
  sumAllProjectLogsOnDate,
  todayISO,
} from '../utils/timeHelpers';
import { roleLabel, uById } from '../utils/helpers';

function initialWeekRange(today) {
  const start = startOfWeekISO(today);
  return { start, end: addDaysISO(start, 6) };
}

export default function TimesheetView({ mode = 'project' }) {
  const isOrganization = mode === 'organization';
  const { project, projects, users, user, role } = useApp();
  const today = todayISO();
  const defaultRange = useMemo(() => initialWeekRange(today), [today]);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [selectedDay, setSelectedDay] = useState(today);
  const [memberFilter, setMemberFilter] = useState('all');

  const viewTeam = canViewTeamTime(role);
  const rangeDates = useMemo(() => getDateRange(startDate, endDate), [startDate, endDate]);
  const rangeLabel = formatDateRangeLabel(startDate, endDate);
  const inCurrentWeek = isDateInRange(today, startDate, endDate);

  const sourceLogs = useMemo(() => {
    if (isOrganization) return aggregateTimeLogs(projects);
    return project?.timeLogs ?? [];
  }, [isOrganization, projects, project]);

  const rangeLogs = useMemo(
    () => filterLogsByDateRange(sourceLogs, startDate, endDate),
    [sourceLogs, startDate, endDate],
  );

  const allMemberIds = useMemo(() => {
    if (isOrganization) return getOrganizationMemberIds(users, viewTeam, user?.id);
    return getProjectMemberIds(project, users, viewTeam, user?.id);
  }, [isOrganization, project, users, viewTeam, user?.id]);

  const memberOptions = useMemo(
    () =>
      allMemberIds
        .map((id) => uById(users, id))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [allMemberIds, users],
  );

  const filteredMemberIds = useMemo(() => {
    if (!viewTeam || memberFilter === 'all') return allMemberIds;
    return allMemberIds.filter((id) => id === memberFilter);
  }, [allMemberIds, memberFilter, viewTeam]);

  const timesheetRows = useMemo(
    () => buildTimesheetRows(rangeLogs, filteredMemberIds, users, rangeDates),
    [rangeLogs, filteredMemberIds, users, rangeDates],
  );

  const dayTotals = useMemo(
    () => getDayColumnTotals(timesheetRows, rangeDates),
    [timesheetRows, rangeDates],
  );

  const filteredRangeLogs = useMemo(() => {
    let logs = rangeLogs;
    if (!viewTeam) logs = logs.filter((l) => l.userId === user?.id);
    else if (memberFilter !== 'all') logs = logs.filter((l) => l.userId === memberFilter);
    return logs;
  }, [rangeLogs, viewTeam, memberFilter, user?.id]);

  const workLogEntries = useMemo(
    () =>
      filteredRangeLogs
        .slice()
        .sort((a, b) => {
          if (b.date !== a.date) return b.date.localeCompare(a.date);
          return new Date(b.startedAt) - new Date(a.startedAt);
        })
        .map((log) => {
          const logProject = log.projectId ? projects.find((p) => p.id === log.projectId) : project;
          return {
            ...log,
            member: uById(users, log.userId),
            targetTitle: resolveTargetTitle(logProject, log),
            displayMinutes: log.endedAt ? log.durationMinutes : liveElapsedMinutes(log),
          };
        }),
    [filteredRangeLogs, users, projects, project],
  );

  const todayTotal = useMemo(() => {
    if (isOrganization) return sumAllProjectLogsOnDate(projects, today);
    return minutesOnDate(project?.timeLogs, today);
  }, [isOrganization, projects, project, today]);

  if (!isOrganization && !project) return null;

  const rangeTotal = timesheetRows.reduce((sum, row) => sum + row.totalMinutes, 0);
  const membersLogged = timesheetRows.filter((row) => row.totalMinutes > 0).length;
  const workEntries = filteredRangeLogs.filter((l) => l.endedAt).length;
  const activeTimers = filteredRangeLogs.filter((l) => !l.endedAt).length;
  const rangeCapped = rangeDates.length >= 62;

  const activeTimer = findActiveTimer(projects, user?.id);
  const activeOnProject = !isOrganization && activeTimer?.project?.id === project?.id ? activeTimer.log : null;
  const activeAnywhere = isOrganization ? activeTimer?.log : null;

  const applyWeek = (anchorISO) => {
    const weekStart = startOfWeekISO(anchorISO);
    const weekEnd = addDaysISO(weekStart, 6);
    setStartDate(weekStart);
    setEndDate(weekEnd);
    if (!isDateInRange(selectedDay, weekStart, weekEnd)) setSelectedDay(anchorISO);
  };

  const goPrevWeek = () => applyWeek(addDaysISO(startOfWeekISO(startDate), -7));
  const goNextWeek = () => applyWeek(addDaysISO(startOfWeekISO(startDate), 7));
  const goThisWeek = () => {
    applyWeek(today);
    setSelectedDay(today);
  };

  const onStartDateChange = (value) => {
    setStartDate(value);
    if (value > endDate) setEndDate(value);
    if (!isDateInRange(selectedDay, value, value > endDate ? value : endDate)) {
      setSelectedDay(value);
    }
  };

  const onEndDateChange = (value) => {
    setEndDate(value);
    if (value < startDate) setStartDate(value);
    if (!isDateInRange(selectedDay, value < startDate ? value : startDate, value)) {
      setSelectedDay(value);
    }
  };

  const selectDay = (iso) => {
    setSelectedDay(iso);
  };

  const resetFilters = () => {
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
    setMemberFilter('all');
    setSelectedDay(today);
  };

  const pageTitle = isOrganization ? 'Time Tracking' : 'Timesheet';
  const pageSubtitle = isOrganization
    ? viewTeam
      ? `All employee worklogs across ${projects.length} projects`
      : 'Your logged time across all projects'
    : viewTeam
      ? `Team worklogs for ${project.name}`
      : `Your logged time on ${project.name}`;

  const memberFilterLabel = isOrganization ? 'Employee' : 'Team member';
  const memberColLabel = isOrganization ? 'Employee' : 'Team member';
  const allMembersLabel = isOrganization ? 'All employees' : 'All team members';

  return (
    <div className="time-page">
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        actions={
          <div className="time-week-nav">
            <div className="time-week-nav-btns">
              <button type="button" className="btn btn-ghost btn-sm" onClick={goPrevWeek} aria-label="Previous week">
                <AppIcon icon={Icons.chevronLeft} size={16} />
              </button>
              <button
                type="button"
                className={`btn btn-sm ${inCurrentWeek ? 'btn-primary' : 'btn-ghost'}`}
                onClick={goThisWeek}
              >
                This week
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={goNextWeek} aria-label="Next week">
                <AppIcon icon={Icons.chevronRight} size={16} />
              </button>
            </div>
            <div className="time-week-nav-label">{rangeLabel}</div>
          </div>
        }
      />

      {isOrganization ? (
        <p className="time-scope-note">
          Organization-wide view across all projects. Open a project and go to the <strong>Time</strong> tab to see
          only that project&apos;s team.
        </p>
      ) : (
        <p className="time-scope-note">
          Showing time for <strong>{project.name}</strong> team members only.{' '}
          {viewTeam && (
            <Link to="/time-tracking" className="task-link">
              View all employees
            </Link>
          )}
        </p>
      )}

      <div className="time-filters">
        <div className="time-filters-row">
          <div className="time-spent-date-field">
            <label className="time-spent-date-label" htmlFor="time-filter-start">
              <AppIcon icon={Icons.calendarDays} size={14} />
              Start date
            </label>
            <input
              id="time-filter-start"
              type="date"
              className="fi time-spent-date-input"
              value={startDate}
              max={endDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <span className="time-spent-date-sep">to</span>
          <div className="time-spent-date-field">
            <label className="time-spent-date-label" htmlFor="time-filter-end">
              End date
            </label>
            <input
              id="time-filter-end"
              type="date"
              className="fi time-spent-date-input"
              value={endDate}
              min={startDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
          {viewTeam && (
            <div className="time-spent-date-field time-filter-member">
              <label className="time-spent-date-label" htmlFor="time-filter-member">
                <AppIcon icon={Icons.users} size={14} />
                {memberFilterLabel}
              </label>
              <select
                id="time-filter-member"
                className="fi time-filter-member-select"
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
              >
                <option value="all">{allMembersLabel}</option>
                {memberOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({roleLabel(m.role)})
                  </option>
                ))}
              </select>
            </div>
          )}
          <button type="button" className="btn btn-ghost btn-sm time-filter-reset" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
        {rangeCapped && (
          <p className="time-filter-note">Showing the first 62 days of the selected range.</p>
        )}
      </div>

      <div className="time-today-strip">
        <div className="time-today-strip-main">
          <span className="time-today-badge">Today</span>
          <div>
            <div className="time-today-date">{formatLongDate(today)}</div>
            <div className="time-today-sub">
              {viewTeam ? (isOrganization ? 'All employees logged today' : 'Team logged today') : 'You logged today'} ·{' '}
              <strong>{formatDuration(todayTotal)}</strong>
            </div>
          </div>
        </div>
        {activeOnProject && (
          <div className="time-today-active">
            <span className="chip chip-amber">Running</span>
            <span className="time-today-active-label">
              {formatDuration(liveElapsedMinutes(activeOnProject))} on{' '}
              {resolveTargetTitle(project, activeOnProject)}
            </span>
          </div>
        )}
        {activeAnywhere && activeTimer && (
          <div className="time-today-active">
            <span className="chip chip-amber">Running</span>
            <span className="time-today-active-label">
              {formatDuration(liveElapsedMinutes(activeAnywhere))} on{' '}
              {activeTimer.project.code} · {resolveTargetTitle(activeTimer.project, activeAnywhere)}
            </span>
          </div>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => selectDay(today)}>
          View today&apos;s entries
        </button>
      </div>

      <div className="time-kpis g5 mb16">
        <div className="time-kpi">
          <div className="time-kpi-label">Period total</div>
          <div className="time-kpi-value">{formatDuration(rangeTotal)}</div>
        </div>
        <div className="time-kpi">
          <div className="time-kpi-label">Today</div>
          <div className="time-kpi-value">{formatDuration(todayTotal)}</div>
        </div>
        <div className="time-kpi">
          <div className="time-kpi-label">{isOrganization ? 'Employees logged' : 'Members logged'}</div>
          <div className="time-kpi-value">{membersLogged}</div>
        </div>
        <div className="time-kpi">
          <div className="time-kpi-label">Work entries</div>
          <div className="time-kpi-value">{workEntries}</div>
        </div>
        <div className="time-kpi">
          <div className="time-kpi-label">Active timers</div>
          <div className="time-kpi-value">{activeTimers}</div>
        </div>
      </div>

      {!viewTeam && (
        <p className="time-spent-note">
          You are viewing your own timesheet. Managers and leads can see the full team on this page.
        </p>
      )}

      <div className="tbl-wrap time-sheet-wrap">
        <div className="tbl-section-hd tbl-section-hd--flex">
          Timesheet
          {!isOrganization && project && <span className="chip chip-navy">{project.code}</span>}
          <span className="chip chip-blue">{timesheetRows.length}</span>
          {memberFilter !== 'all' && memberOptions.find((m) => m.id === memberFilter) && (
            <span className="chip chip-navy">{memberOptions.find((m) => m.id === memberFilter).name}</span>
          )}
        </div>
        <div className="time-sheet-scroll">
          <table className="time-sheet">
            <thead>
              <tr>
                <th className="time-sheet-member-col">{memberColLabel}</th>
                {rangeDates.map((iso) => {
                  const col = formatDayColumn(iso);
                  const isToday = isTodayISO(iso);
                  const isSelected = selectedDay === iso;
                  return (
                    <th
                      key={iso}
                      className={[
                        'time-sheet-day-col',
                        col.isWeekend ? 'is-weekend' : '',
                        isToday ? 'is-today' : '',
                        isSelected ? 'is-selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <button type="button" className="time-sheet-day-btn" onClick={() => selectDay(iso)}>
                        <span className="time-sheet-day-name">{col.weekday}</span>
                        <span className="time-sheet-day-num">{col.dayNum}</span>
                      </button>
                    </th>
                  );
                })}
                <th className="time-sheet-total-col">Total</th>
              </tr>
            </thead>
            <tbody>
              {timesheetRows.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(rangeDates.length + 2, 3)} className="time-sheet-empty">
                    No {isOrganization ? 'employees' : 'team members'} match the selected filters.
                  </td>
                </tr>
              ) : (
                timesheetRows.map((row) => (
                  <tr key={row.userId}>
                    <td className="time-sheet-member-cell">
                      {row.member ? (
                        <div className="fx g6">
                          <span className={`av av-xs ${row.member.c}`}>{row.member.ini}</span>
                          <div>
                            <div className="text-sm" style={{ fontWeight: 700 }}>
                              {row.member.name}
                            </div>
                            <div className="t-muted-xs">{roleLabel(row.member.role)}</div>
                          </div>
                        </div>
                      ) : (
                        row.userId
                      )}
                    </td>
                    {rangeDates.map((iso) => {
                      const mins = row.byDay[iso] || 0;
                      const isToday = isTodayISO(iso);
                      const isSelected = selectedDay === iso;
                      const col = formatDayColumn(iso);
                      return (
                        <td
                          key={iso}
                          className={[
                            'time-sheet-cell',
                            col.isWeekend ? 'is-weekend' : '',
                            isToday ? 'is-today' : '',
                            isSelected ? 'is-selected' : '',
                            mins ? 'has-time' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <button
                            type="button"
                            className="time-sheet-cell-btn"
                            onClick={() => selectDay(iso)}
                            title={mins ? formatDuration(mins) : 'No time logged'}
                          >
                            {formatCellDuration(mins) || '—'}
                          </button>
                        </td>
                      );
                    })}
                    <td className="time-sheet-row-total">{formatDuration(row.totalMinutes) || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
            {timesheetRows.length > 0 && (
              <tfoot>
                <tr className="time-sheet-foot">
                  <td>Daily total</td>
                  {rangeDates.map((iso) => {
                    const mins = dayTotals[iso] || 0;
                    const isToday = isTodayISO(iso);
                    const isSelected = selectedDay === iso;
                    const col = formatDayColumn(iso);
                    return (
                      <td
                        key={iso}
                        className={[
                          'time-sheet-foot-cell',
                          col.isWeekend ? 'is-weekend' : '',
                          isToday ? 'is-today' : '',
                          isSelected ? 'is-selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {formatCellDuration(mins) || '—'}
                      </td>
                    );
                  })}
                  <td className="time-sheet-foot-total">{formatDuration(rangeTotal)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <div className="tbl-wrap time-day-panel">
        <div className="tbl-section-hd tbl-section-hd--flex">
          Work log · {rangeLabel}
          {memberFilter !== 'all' && memberOptions.find((m) => m.id === memberFilter) && (
            <span className="chip chip-navy">{memberOptions.find((m) => m.id === memberFilter).name}</span>
          )}
          <span className="chip chip-blue">{workLogEntries.length} entries</span>
        </div>
        <table className="tbl time-spent-tbl">
          <thead>
            <tr>
              <th>Member</th>
              <th>Date</th>
              {isOrganization && <th>Project</th>}
              <th>Work item</th>
              <th>Start – End</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {workLogEntries.length === 0 ? (
              <tr>
                <td colSpan={isOrganization ? 7 : 6} className="time-sheet-empty">
                  No time logged between {rangeLabel} for the selected filters.
                </td>
              </tr>
            ) : (
              workLogEntries.map((entry) => (
                <tr
                  key={`${entry.projectId || 'p'}-${entry.id}`}
                  className={[
                    !entry.endedAt ? 'time-spent-active-row' : '',
                    entry.date === selectedDay ? 'time-worklog-selected-day' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <td className="time-spent-member-cell">
                    {entry.member ? (
                      <div className="fx g6">
                        <span className={`av av-xs ${entry.member.c}`}>{entry.member.ini}</span>
                        <div>
                          <div className="text-sm" style={{ fontWeight: 700 }}>
                            {entry.member.name}
                          </div>
                          <div className="t-muted-xs">{roleLabel(entry.member.role)}</div>
                        </div>
                      </div>
                    ) : (
                      entry.userId
                    )}
                  </td>
                  <td className="t-muted-xs">
                    {formatLongDate(entry.date)}
                    {isTodayISO(entry.date) && (
                      <span className="chip chip-blue" style={{ marginLeft: 6 }}>
                        Today
                      </span>
                    )}
                  </td>
                  {isOrganization && (
                    <td className="t-muted-xs">
                      <span className="chip chip-navy">{entry.projectCode || '—'}</span>
                      <div className="t-cell-sm" style={{ marginTop: 4 }}>
                        {entry.projectName}
                      </div>
                    </td>
                  )}
                  <td>
                    <span className={`chip ${entry.targetType === 'bug' ? 'chip-red' : 'chip-navy'}`}>
                      {entry.targetType === 'bug' ? 'Bug' : 'Task'}
                    </span>
                    <div className="t-cell-sm" style={{ marginTop: 4 }}>
                      {entry.targetTitle}
                    </div>
                  </td>
                  <td className="t-muted-xs">{formatTimeRange(entry.startedAt, entry.endedAt)}</td>
                  <td className="time-spent-duration">{formatDuration(entry.displayMinutes)}</td>
                  <td>
                    {entry.endedAt ? (
                      <span className="chip chip-green">Logged</span>
                    ) : (
                      <span className="chip chip-amber">Running</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
