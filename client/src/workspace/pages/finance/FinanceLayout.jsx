import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { api } from '../../../api/client';
import ModuleAppShell from '../../components/ModuleAppShell';
import { FINANCE_NAV_SECTIONS } from '../../data/financeCatalog';
import { fiscalYearLabel } from './financeUtils';

export default function FinanceLayout() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.getFinanceSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <ModuleAppShell
      moduleTitle="Finance & Operations"
      moduleIcon="dollar"
      backTo="/workspace/solutions/business-operations"
      sections={FINANCE_NAV_SECTIONS}
      panelFooter={
        settings ? (
          <div className="ws-fin-org-context" title="Organization context">
            <div className="ws-fin-org-name">{settings.companyName}</div>
            <div className="ws-fin-org-meta">
              {fiscalYearLabel(settings.fiscalYearStart)} · {settings.currency} · GST {settings.taxRate}%
            </div>
          </div>
        ) : null
      }
    >
      <Outlet />
    </ModuleAppShell>
  );
}
