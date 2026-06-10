import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { AppIcon, Icons, NOTIFICATION_ICONS } from '../components/icons';
import PageHeader from '../components/PageHeader';

export default function NotificationsPage() {
  const { notifications, toast, refreshNotifications } = useApp();

  const clearNotifs = async () => {
    try {
      await api.clearNotifications();
      await refreshNotifications();
      toast('All read', 'ok');
    } catch (e) {
      toast(e.message, 'err');
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Recent activity and alerts"
        actions={
          <button type="button" className="btn btn-ghost btn-sm ph-btn-compact fx g4" onClick={clearNotifs}>
            <AppIcon icon={Icons.checkCheck} size={14} />
            Mark all read
          </button>
        }
      />

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 11,
                padding: '11px 16px',
                borderBottom: '1px solid var(--g100)',
                background: n.read ? 'var(--card)' : 'var(--blue-l)',
              }}
            >
              <div className="t-icon-lg notif-icon-wrap" style={{ flexShrink: 0 }}>
                <AppIcon icon={NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.default} size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="act-text" dangerouslySetInnerHTML={{ __html: n.text }} />
                <div className="act-time">{n.time}</div>
              </div>
              {!n.read && (
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--blue)',
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
