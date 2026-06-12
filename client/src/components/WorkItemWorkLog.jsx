import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { AppIcon, Icons } from './icons';
import TimeTrackerButton from './TimeTrackerButton';
import { roleLabel, uById } from '../utils/helpers';
import {
  formatDuration,
  formatLongDate,
  formatTimeRange,
  getWorkLogsForTarget,
  liveElapsedMinutes,
  sumAllMinutesForTarget,
  sumMinutesForTarget,
  todayISO,
} from '../utils/timeHelpers';

function defaultStartTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function defaultEndTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function WorkItemWorkLog({
  project,
  projects,
  targetType,
  targetId,
  users,
  user,
  onRefresh,
  toast,
}) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [busy, setBusy] = useState(false);

  const logs = useMemo(
    () => getWorkLogsForTarget(project, targetType, targetId),
    [project, targetType, targetId],
  );

  const enrichedLogs = useMemo(
    () =>
      logs.map((log) => ({
        ...log,
        member: uById(users, log.userId),
        displayMinutes: log.endedAt ? log.durationMinutes : liveElapsedMinutes(log),
      })),
    [logs, users],
  );

  const myTodayMinutes = useMemo(() => {
    if (!user?.id) return 0;
    const base = sumMinutesForTarget(project, user.id, targetId, todayISO());
    const active = logs.find((l) => l.userId === user.id && !l.endedAt && l.date === todayISO());
    return base + (active ? liveElapsedMinutes(active) : 0);
  }, [project, user?.id, targetId, logs]);

  const myTotalMinutes = user?.id ? sumAllMinutesForTarget(project, targetType, targetId, user.id) : 0;
  const taskTotalMinutes = sumAllMinutesForTarget(project, targetType, targetId);

  const openForm = () => {
    setDate(todayISO());
    setStartTime(defaultStartTime());
    setEndTime(defaultEndTime());
    setShowForm(true);
  };

  const submitManualLog = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setBusy(true);
    try {
      await api.createTimeLog(project.id, {
        userId: user.id,
        targetType,
        targetId,
        date,
        startTime,
        endTime,
      });
      await onRefresh?.();
      toast?.('Work logged', 'ok');
      setShowForm(false);
    } catch (err) {
      toast?.(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <div className="cw-section wi-worklog">
      <div className="wi-worklog-hd">
        <div>
          <div className="cw-section-title">Time tracking</div>
          <p className="cw-field-hint" style={{ marginTop: 4, marginBottom: 0 }}>
            Log start and end time on this work item. Entries appear in the project timesheet.
          </p>
        </div>
        <Link to="/time" className="btn btn-ghost btn-sm fx g4">
          <AppIcon icon={Icons.timer} size={14} />
          View timesheet
        </Link>
      </div>

      <div className="wi-worklog-summary">
        <div className="wi-worklog-stat">
          <span className="wi-worklog-stat-label">Your time today</span>
          <span className="wi-worklog-stat-value">{formatDuration(myTodayMinutes)}</span>
        </div>
        <div className="wi-worklog-stat">
          <span className="wi-worklog-stat-label">Your total on this item</span>
          <span className="wi-worklog-stat-value">{formatDuration(myTotalMinutes)}</span>
        </div>
        <div className="wi-worklog-stat">
          <span className="wi-worklog-stat-label">All logged on this item</span>
          <span className="wi-worklog-stat-value">{formatDuration(taskTotalMinutes)}</span>
        </div>
        <div className="wi-worklog-actions">
          <TimeTrackerButton
            projectId={project.id}
            targetType={targetType}
            targetId={targetId}
            userId={user.id}
            projects={projects}
            loggedMinutes={sumMinutesForTarget(project, user.id, targetId, todayISO())}
            onChange={onRefresh}
            toast={toast}
          />
          <button type="button" className="btn btn-ghost btn-sm fx g4" onClick={openForm}>
            <AppIcon icon={Icons.clock} size={14} />
            Log work
          </button>
        </div>
      </div>

      {showForm && (
        <form className="wi-worklog-form" onSubmit={submitManualLog}>
          <div className="wi-worklog-form-title">Log work</div>
          <div className="wi-worklog-form-grid">
            <div className="fl">
              <label htmlFor="wl-date">Date</label>
              <input
                id="wl-date"
                type="date"
                className="fi"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="fl">
              <label htmlFor="wl-start">Start time</label>
              <input
                id="wl-start"
                type="time"
                className="fi"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="fl">
              <label htmlFor="wl-end">End time</label>
              <input
                id="wl-end"
                type="time"
                className="fi"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="wi-worklog-form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              Save work log
            </button>
          </div>
        </form>
      )}

      <div className="tbl-wrap wi-worklog-table-wrap">
        <div className="tbl-section-hd tbl-section-hd--flex">
          Work log
          <span className="chip chip-blue">{enrichedLogs.length}</span>
        </div>
        {enrichedLogs.length === 0 ? (
          <p className="wi-worklog-empty">No time logged on this item yet.</p>
        ) : (
          <table className="tbl wi-worklog-tbl">
            <thead>
              <tr>
                <th>Member</th>
                <th>Date</th>
                <th>Start – End</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrichedLogs.map((log) => (
                <tr key={log.id} className={!log.endedAt ? 'time-spent-active-row' : ''}>
                  <td>
                    {log.member ? (
                      <span className="fx g5">
                        <span className={`av av-xs ${log.member.c}`}>{log.member.ini}</span>
                        <span className="text-sm" style={{ fontWeight: 600 }}>
                          {log.member.name}
                        </span>
                        <span className="t-muted-xs">({roleLabel(log.member.role)})</span>
                      </span>
                    ) : (
                      log.userId
                    )}
                  </td>
                  <td className="t-muted-xs">{formatLongDate(log.date)}</td>
                  <td className="t-muted-xs">{formatTimeRange(log.startedAt, log.endedAt)}</td>
                  <td className="time-spent-duration">{formatDuration(log.displayMinutes)}</td>
                  <td>
                    {log.endedAt ? (
                      <span className="chip chip-green">Logged</span>
                    ) : (
                      <span className="chip chip-amber">Running</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
