import { useApp } from '../context/AppContext';

const ICONS = { ok: '✓', err: '✗', warn: '⚠' };

export default function ToastContainer() {
  const { toasts = [] } = useApp();
  return (
    <div className="toast-wrap">
      {(toasts ?? []).map((t) => (
        <div key={t.id} className={`toast${t.type ? ' ' + t.type : ''}`}>
          <span>{ICONS[t.type] || 'ℹ'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
