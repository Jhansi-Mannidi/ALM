import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { AppIcon, IconButton, Icons } from '../components/icons';
import PageHeader from '../components/PageHeader';
import { can, uById } from '../utils/helpers';

export default function TestingPage() {
  const { role, user, project, users, toast, refreshProjects, setModal } = useApp();
  if (!project) return null;

  const tc = project.testCases || [];
  const pass = tc.filter((t) => t.result === 'Pass').length;
  const fail = tc.filter((t) => t.result === 'Fail').length;
  const skip = tc.filter((t) => t.result === 'Skip').length;

  const runTC = async (id) => {
    try {
      await api.updateTestCase(project.id, id, { result: 'Pass', exec: 'Just now' });
      await refreshProjects();
      toast(`${id} — Pass ✓`, 'ok');
    } catch (e) {
      toast(e.message, 'err');
    }
  };

  const typeChip = (type) =>
    type === 'Automated'
      ? 'chip-blue'
      : type === 'Manual'
        ? 'chip-amber'
        : type === 'Performance'
          ? 'chip-purple'
          : 'chip-teal';

  return (
    <>
      <PageHeader
        title="Testing & QA"
        subtitle="Test suites, scenarios and execution"
        actions={
          <button type="button" className="btn btn-primary btn-sm ph-btn-compact fx g4" onClick={() => setModal('tc')}>
            <AppIcon icon={Icons.plus} size={14} />
            Add Test Case
          </button>
        }
      />

      <div className="g5 mb16">
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--g600)' }} />
          <div className="stat-label">Total</div>
          <div className="stat-value">{tc.length}</div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--green)' }} />
          <div className="stat-label">Passed</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>
            {pass}
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--red)' }} />
          <div className="stat-label">Failed</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>
            {fail}
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--g400)' }} />
          <div className="stat-label">Skipped</div>
          <div className="stat-value" style={{ color: 'var(--g500)' }}>
            {skip}
          </div>
        </div>
        <div className="stat">
          <div className="stat-bar" style={{ background: 'var(--blue)' }} />
          <div className="stat-label">Pass Rate</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>
            {tc.length ? Math.round((pass / tc.length) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>TC ID</th>
              <th>Suite</th>
              <th>Scenario</th>
              <th>Type</th>
              <th>Result</th>
              <th>Assignee</th>
              <th>Executed</th>
              <th>Linked</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tc.map((t) => {
              const u = uById(users, t.assign);
              return (
                <tr key={t.id}>
                  <td>
                    <span className="iid">{t.id}</span>
                  </td>
                  <td className="t-body-xs">{t.suite}</td>
                  <td className="t-cell-sm" style={{ fontWeight: 500 }}>{t.scene}</td>
                  <td>
                    <span className={`chip ${typeChip(t.type)}`}>
                      {t.type}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 800,
                        color: t.result === 'Pass' ? 'var(--green)' : t.result === 'Fail' ? 'var(--red)' : 'var(--g400)',
                      }}
                    >
                      {t.result === 'Pass' ? (
                        <span className="fx g4" style={{ alignItems: 'center' }}>
                          <AppIcon icon={Icons.checkCircle} size={14} />
                          Pass
                        </span>
                      ) : t.result === 'Fail' ? (
                        <span className="fx g4" style={{ alignItems: 'center' }}>
                          <AppIcon icon={Icons.x} size={14} />
                          Fail
                        </span>
                      ) : (
                        <span className="fx g4" style={{ alignItems: 'center', color: 'var(--g400)' }}>
                          <AppIcon icon={Icons.circle} size={14} />
                          Skip
                        </span>
                      )}
                    </span>
                  </td>
                  <td>
                    {u ? (
                      <div className="fx g5">
                        <div className={`av av-xs ${u.c}`}>{u.ini}</div>
                        <span className="text-sm">{u.name.split(' ')[0]}</span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="t-muted-xs">{t.exec}</td>
                  <td>
                    <span className="iid">{t.linked || '—'}</span>
                  </td>
                  <td>
                    {t.result !== 'Pass' && (user?.id === t.assign || can(role, 'assign')) && (
                      <IconButton icon={Icons.play} label="Run test case" onClick={() => runTC(t.id)} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
