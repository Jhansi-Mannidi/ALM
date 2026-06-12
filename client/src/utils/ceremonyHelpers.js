export function formatDailyTime(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  if (Number.isNaN(h)) return time24;
  const d = new Date();
  d.setHours(h, m || 0, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatShortDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatCeremonySchedule(ceremony) {
  const { startDate, endDate, dailyTime, schedule } = ceremony || {};
  if (startDate && endDate) {
    const timePart = dailyTime ? ` · ${formatDailyTime(dailyTime)}` : '';
    if (startDate === endDate) {
      return `${formatShortDate(startDate)}${timePart}`;
    }
    return `Daily · ${formatShortDate(startDate)} – ${formatShortDate(endDate)}${timePart}`;
  }
  return schedule || '';
}

export function ceremonyDateStatus(ceremony) {
  const { startDate, endDate } = ceremony || {};
  if (!startDate || !endDate) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (today < startDate) return { label: 'Upcoming', chip: 'chip-amber' };
  if (today > endDate) return { label: 'Completed', chip: 'chip-green' };
  if (startDate === endDate && today === startDate) return { label: 'Today', chip: 'chip-blue' };
  if (today >= startDate && today <= endDate) return { label: 'Active', chip: 'chip-blue' };
  return null;
}
