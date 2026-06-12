import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { AppIcon, Icons } from './icons';
import { findActiveTimer, formatDuration, liveElapsedMinutes, todayISO } from '../utils/timeHelpers';

export default function TimeTrackerButton({
  projectId,
  targetType,
  targetId,
  userId,
  projects,
  loggedMinutes = 0,
  onChange,
  toast,
  compact = false,
}) {
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  const active = findActiveTimer(projects, userId);
  const isActiveHere =
    active?.log.targetId === targetId &&
    active?.log.targetType === targetType &&
    active?.project.id === projectId;
  const isActiveElsewhere = active && !isActiveHere;

  useEffect(() => {
    if (!isActiveHere) return undefined;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [isActiveHere]);

  const displayMinutes = isActiveHere
    ? loggedMinutes + liveElapsedMinutes(active.log)
    : loggedMinutes;

  const start = async () => {
    if (isActiveElsewhere) {
      toast(
        `Stop timer on ${active.log.targetId} before starting a new one.`,
        'warn',
      );
      return;
    }
    setBusy(true);
    try {
      await api.startTimeLog(projectId, { userId, targetType, targetId });
      await onChange?.();
      toast('Timer started', 'ok');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    setBusy(true);
    try {
      await api.stopTimeLog(projectId, { userId });
      await onChange?.();
      toast('Time logged', 'ok');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  void tick;

  return (
    <div className={`time-tracker${compact ? ' time-tracker-compact' : ''}`}>
      <span className="time-tracker-total" title={`Logged today (${todayISO()})`}>
        {formatDuration(displayMinutes)}
      </span>
      {isActiveHere ? (
        <button
          type="button"
          className="btn btn-red btn-sm fx g4 time-tracker-btn"
          onClick={stop}
          disabled={busy}
        >
          <AppIcon icon={Icons.square} size={12} />
          Stop
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-primary btn-sm fx g4 time-tracker-btn"
          onClick={start}
          disabled={busy || isActiveElsewhere}
          title={isActiveElsewhere ? `Timer running on ${active.log.targetId}` : 'Start timer'}
        >
          <AppIcon icon={Icons.play} size={12} />
          Start
        </button>
      )}
    </div>
  );
}
