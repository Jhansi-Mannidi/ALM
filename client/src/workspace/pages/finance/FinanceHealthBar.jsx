import { Link } from 'react-router-dom';
import { AppIcon, Icons } from '../../../components/icons';

const CHECK_LINKS = {
  draft: '/workspace/finance/ledger',
  ar: '/workspace/finance/invoices',
  exp: '/workspace/finance/expenses',
  bank: '/workspace/finance/banking',
  tb: '/workspace/finance/reports/statements?focus=trial-balance',
};

export default function FinanceHealthBar({ health }) {
  if (!health) return null;

  const { score, checks } = health;
  const level = score >= 80 ? 'good' : score >= 50 ? 'warn' : 'alert';

  return (
    <div className={`card ws-fin-health-bar ws-fin-health-${level} mb16`}>
      <div className="ws-fin-health-score">
        <span className="ws-fin-health-score-label">Books health</span>
        <strong className="ws-fin-health-score-value">{score}%</strong>
      </div>
      <div className="ws-fin-health-checks">
        {checks.map((check) => (
          <Link
            key={check.id}
            to={CHECK_LINKS[check.id] || '/workspace/finance'}
            className={`ws-fin-health-check${check.ok ? ' ok' : ' attention'}`}
            title={check.detail}
          >
            <AppIcon icon={check.ok ? Icons.check : Icons.circleAlert} size={14} />
            <span className="ws-fin-health-check-label">{check.label}</span>
            <span className="ws-fin-health-check-detail">{check.detail}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
