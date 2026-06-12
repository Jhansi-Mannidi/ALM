import { useEffect, useState } from 'react';
import MotionModal from '../motion/MotionModal';
import { AppIcon, CEREMONY_ICONS, Icons } from './icons';
import { CEREMONY_ICON_OPTIONS, CEREMONY_STATUS_CHIPS } from '../utils/helpers';
import { addDaysISO } from '../utils/calendarHelpers';
import { todayISO } from '../utils/timeHelpers';

const EMPTY = {
  title: '',
  description: '',
  icon: 'planning',
  startDate: '',
  endDate: '',
  dailyTime: '',
  duration: '',
  statusLabel: '',
  statusChip: 'chip-blue',
};

export default function CeremonyModal({ open, ceremony, saving, onClose, onSave }) {
  const isEdit = !!ceremony?.id;
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (ceremony) {
      setForm({
        title: ceremony.title || '',
        description: ceremony.description || '',
        icon: ceremony.icon || 'planning',
        startDate: ceremony.startDate || '',
        endDate: ceremony.endDate || ceremony.startDate || '',
        dailyTime: ceremony.dailyTime || '',
        duration: ceremony.duration || '',
        statusLabel: ceremony.statusLabel || '',
        statusChip: ceremony.statusChip || 'chip-blue',
      });
    } else {
      const start = todayISO();
      setForm({ ...EMPTY, startDate: start, endDate: addDaysISO(start, 7) });
    }
  }, [open, ceremony]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onStartDateChange = (value) => {
    set({ startDate: value });
    if (value > form.endDate) set({ endDate: value });
  };

  const onEndDateChange = (value) => {
    set({ endDate: value });
    if (value < form.startDate) set({ startDate: value });
  };

  const close = () => {
    if (saving) return;
    onClose();
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) return;
    onSave(form);
  };

  const isDailyRange = form.startDate && form.endDate && form.startDate !== form.endDate;

  return (
    <MotionModal open={open} onClose={close} modalClassName="ceremony-modal" style={{ width: 480 }}>
        <div className="modal-hd">
          <span className="modal-title">{isEdit ? 'Edit ceremony' : 'Add ceremony'}</span>
          <button type="button" className="modal-x" onClick={close} aria-label="Close" disabled={saving}>
            <AppIcon icon={Icons.x} size={16} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="fl">
              <label className="flbl" htmlFor="ceremony-title">
                Title <span className="cw-required">*</span>
              </label>
              <input
                id="ceremony-title"
                className="fi"
                value={form.title}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="Sprint Planning"
                required
                disabled={saving}
              />
            </div>
            <div className="fl">
              <label className="flbl" htmlFor="ceremony-desc">
                Description
              </label>
              <textarea
                id="ceremony-desc"
                className="fa"
                rows={3}
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="What this ceremony covers…"
                disabled={saving}
              />
            </div>
            <div className="fl">
              <span className="flbl">Icon</span>
              <div className="ceremony-icon-pick">
                {CEREMONY_ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`ceremony-icon-opt${form.icon === opt.id ? ' active' : ''}`}
                    title={opt.label}
                    onClick={() => set({ icon: opt.id })}
                    disabled={saving}
                  >
                    <AppIcon icon={CEREMONY_ICONS[opt.id]} size={18} />
                  </button>
                ))}
              </div>
            </div>
            <div className="fl">
              <span className="flbl">Date range</span>
              <div className="fx g8 ceremony-date-range">
                <div className="ceremony-date-field">
                  <label className="time-spent-date-label" htmlFor="ceremony-start">
                    Start date
                  </label>
                  <input
                    id="ceremony-start"
                    type="date"
                    className="fi"
                    value={form.startDate}
                    max={form.endDate || undefined}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>
                <span className="time-spent-date-sep">to</span>
                <div className="ceremony-date-field">
                  <label className="time-spent-date-label" htmlFor="ceremony-end">
                    End date
                  </label>
                  <input
                    id="ceremony-end"
                    type="date"
                    className="fi"
                    value={form.endDate}
                    min={form.startDate || undefined}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="cw-field-hint">
                {isDailyRange
                  ? 'Runs every day between the start and end dates.'
                  : 'Same start and end date = one-day ceremony.'}
              </div>
            </div>
            <div className="f2">
              <div className="fl">
                <label className="flbl" htmlFor="ceremony-time">
                  Daily time
                </label>
                <input
                  id="ceremony-time"
                  type="time"
                  className="fi"
                  value={form.dailyTime}
                  onChange={(e) => set({ dailyTime: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="fl">
                <label className="flbl" htmlFor="ceremony-duration">
                  Duration
                </label>
                <input
                  id="ceremony-duration"
                  className="fi"
                  value={form.duration}
                  onChange={(e) => set({ duration: e.target.value })}
                  placeholder="2 hrs"
                  disabled={saving}
                />
              </div>
            </div>
            <div className="f2">
              <div className="fl">
                <label className="flbl" htmlFor="ceremony-status">
                  Status label
                </label>
                <input
                  id="ceremony-status"
                  className="fi"
                  value={form.statusLabel}
                  onChange={(e) => set({ statusLabel: e.target.value })}
                  placeholder="Today 9:30"
                  disabled={saving}
                />
              </div>
              <div className="fl">
                <label className="flbl" htmlFor="ceremony-chip">
                  Status badge
                </label>
                <select
                  id="ceremony-chip"
                  className="fs"
                  value={form.statusChip}
                  onChange={(e) => set({ statusChip: e.target.value })}
                  disabled={saving}
                >
                  {CEREMONY_STATUS_CHIPS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={close} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || !form.title.trim() || !form.startDate || !form.endDate}
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add ceremony'}
            </button>
          </div>
        </form>
    </MotionModal>
  );
}
