import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { AppIcon, IconButton, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';
import { can, isWorkflowComplete, uById, WORKFLOW_STATUSES, workflowStatusChip } from '../utils/helpers';

export default function MaintPage() {
  const { role, project, users, toast, setModal, setAssignCtx, refreshProjects } = useApp();
  const [statusMenu, setStatusMenu] = useState(null);
  const [statusSaving, setStatusSaving] = useState(null);

  useEffect(() => {
    const close = (e) => {
      if (e.target.closest('.maint-status-menu') || e.target.closest('.maint-status-trigger')) return;
      setStatusMenu(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!statusMenu) return undefined;
    const onScroll = () => setStatusMenu(null);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [statusMenu]);

  if (!project) return null;

  const openTickets = project.tickets.filter((t) => !isWorkflowComplete(t.status));
  const p1 = openTickets.filter((t) => t.prio === 'P1').length;
  const p2 = openTickets.filter((t) => t.prio === 'P2').length;

  const openAssign = (ticket) => {
    setAssignCtx({ issueId: null, ticketId: ticket.id, userId: ticket.assign || null });
    setModal('assign');
  };

  const openStatusMenu = (ticket, event) => {
    if (statusMenu?.ticket?.id === ticket.id) {
      setStatusMenu(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const menuHeight = WORKFLOW_STATUSES.length * 40 + 40;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight;
    setStatusMenu({ ticket, rect, openUp });
  };

  const updateStatus = async (ticket, status) => {
    if (ticket.status === status) {
      setStatusMenu(null);
      return;
    }
    setStatusSaving(ticket.id);
    try {
      await api.updateTicket(project.id, ticket.id, { status });
      await refreshProjects();
      toast(`Status updated to ${status}`, 'ok');
      setStatusMenu(null);
    } catch (e) {
      toast(e.message || 'Could not update status', 'err');
    } finally {
      setStatusSaving(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Maintenance"
        subtitle="Support tickets and system health"
        actions={
          <button type="button" className="btn btn-primary btn-sm ph-btn-compact fx g4" onClick={() => setModal('ticket')}>
            <AppIcon icon={Icons.plus} size={14} />
            Log Ticket
          </button>
        }
      />

      <div className="g4 mb16">
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--red)' }} />
          <div className="stat-label">P1 Open</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>
            {p1}
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--amber)' }} />
          <div className="stat-label">P2 Open</div>
          <div className="stat-value">{p2}</div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--green)' }} />
          <div className="stat-label">Prod/Month</div>
          <div className="stat-value">34</div>
          <div className="stat-sub">
            <span className="up">↑ 22%</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--blue)' }} />
          <div className="stat-label">Uptime (30d)</div>
          <div className="stat-value">99.94%</div>
        </div>
      </div>

      <div className="tbl-wrap">
        <div className="card-hd" style={{ padding: '11px 14px' }}>
          <div className="card-title">Support Tickets</div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Issue</th>
              <th>Assignee</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Age</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {project.tickets.map((t) => {
              const assignee = t.assign ? uById(users, t.assign) : null;
              const menuOpen = statusMenu?.ticket?.id === t.id;
              return (
                <tr key={t.id}>
                  <td>
                    <span className="iid">{t.id}</span>
                  </td>
                  <td>
                    <div className="t-cell-sm" style={{ fontWeight: 500 }}>
                      {t.title}
                    </div>
                    {t.description && (
                      <div className="maint-ticket-desc t-muted-xs" title={t.description}>
                        {t.description}
                      </div>
                    )}
                  </td>
                  <td>
                    {assignee ? (
                      <div className="fx g6">
                        <span className={`av av-xs ${assignee.c}`}>{assignee.ini}</span>
                        <span className="text-sm" style={{ fontWeight: 600 }}>
                          {assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="t-muted-xs">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`chip ${t.prio === 'P1' ? 'chip-red' : t.prio === 'P2' ? 'chip-amber' : 'chip-blue'}`}
                    >
                      {t.prio}
                    </span>
                  </td>
                  <td>
                    <span className={`chip ${workflowStatusChip(t.status)}`}>{t.status}</span>
                  </td>
                  <td className="t-muted-xs">{t.age}</td>
                  <td>
                    <div className="fx g4 maint-ticket-actions">
                      {can(role, 'assign') && (
                        <IconButton
                          icon={Icons.userPlus}
                          label="Assign ticket"
                          onClick={() => openAssign(t)}
                        />
                      )}
                      {can(role, 'assign') && (
                        <div className="maint-status-trigger">
                          <IconButton
                            icon={Icons.checkCircle}
                            label="Change status"
                            variant={menuOpen ? 'success' : 'default'}
                            onClick={(e) => openStatusMenu(t, e)}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {statusMenu &&
        createPortal(
          <div
            className="maint-status-menu maint-status-menu--portal"
            role="menu"
            style={{
              position: 'fixed',
              top: statusMenu.openUp ? statusMenu.rect.top - 8 : statusMenu.rect.bottom + 6,
              left: Math.min(
                Math.max(8, statusMenu.rect.right - 168),
                window.innerWidth - 176,
              ),
              transform: statusMenu.openUp ? 'translateY(-100%)' : undefined,
            }}
          >
            <div className="maint-status-menu-title">Set status</div>
            {WORKFLOW_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                role="menuitem"
                className={`maint-status-menu-item${statusMenu.ticket.status === status ? ' active' : ''}`}
                disabled={statusSaving === statusMenu.ticket.id}
                onClick={() => updateStatus(statusMenu.ticket, status)}
              >
                <span className={`chip ${workflowStatusChip(status)}`}>{status}</span>
                {statusMenu.ticket.status === status && (
                  <AppIcon icon={Icons.check} size={14} className="maint-status-check" />
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
