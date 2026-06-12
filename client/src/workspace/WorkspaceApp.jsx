import { Navigate, Route, Routes } from 'react-router-dom';
import AnimatedOutlet from '../motion/AnimatedOutlet';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { RbacProvider } from './context/RbacContext';
import WorkspaceShell from './components/WorkspaceShell';
import WorkspaceHomePage from './pages/WorkspaceHomePage';
import SolutionPage from './pages/SolutionPage';
import WorkspaceAppPage from './pages/WorkspaceAppPage';
import RbacLayout from './pages/admin/RbacLayout';
import RbacDashboardPage from './pages/admin/RbacDashboardPage';
import RolesPage from './pages/admin/RolesPage';
import RolePermissionsPage from './pages/admin/RolePermissionsPage';
import PermissionsPage from './pages/admin/PermissionsPage';
import RbacUsersPage from './pages/admin/RbacUsersPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import HrLayout from './pages/hr/HrLayout';
import HrDashboardPage from './pages/hr/HrDashboardPage';
import OnboardingPage from './pages/hr/OnboardingPage';
import AddNewHirePage from './pages/hr/AddNewHirePage';
import OnboardingDetailPage from './pages/hr/OnboardingDetailPage';
import OnboardingPrerequisitesPage from './pages/hr/OnboardingPrerequisitesPage';
import OnboardingChecklistPage from './pages/hr/OnboardingChecklistPage';
import RecruitmentPage from './pages/hr/RecruitmentPage';
import CreateJobOpeningPage from './pages/hr/CreateJobOpeningPage';
import JobDetailPage from './pages/hr/JobDetailPage';
import CandidatesPage from './pages/hr/CandidatesPage';
import AddCandidatePage from './pages/hr/AddCandidatePage';
import CandidateDetailPage from './pages/hr/CandidateDetailPage';
import FeedbackListPage from './pages/hr/FeedbackListPage';
import EmployeesPage from './pages/hr/EmployeesPage';
import AddEmployeePage from './pages/hr/AddEmployeePage';
import EmployeeDetailPage from './pages/hr/EmployeeDetailPage';
import PendingApprovalsPage from './pages/hr/PendingApprovalsPage';
import EmployeeHikePage from './pages/hr/EmployeeHikePage';
import EmployeeHikeDetailPage from './pages/hr/EmployeeHikeDetailPage';
import EmployeeLayout from './pages/employee/EmployeeLayout';
import EmployeeDashboardPage from './pages/employee/EmployeeDashboardPage';
import EmployeeProfilePage from './pages/employee/EmployeeProfilePage';
import MyAssetsPage from './pages/employee/MyAssetsPage';
import AssetTicketsPage from './pages/employee/AssetTicketsPage';
import RaiseAssetTicketPage from './pages/employee/RaiseAssetTicketPage';
import MyDocumentsPage from './pages/employee/MyDocumentsPage';
import ColleaguesPage from './pages/employee/ColleaguesPage';
import MyDatesPage from './pages/employee/MyDatesPage';
import ExitRequestPage from './pages/employee/ExitRequestPage';
import HrExitPage from './pages/hr/HrExitPage';
import HrAssetTicketsPage from './pages/hr/HrAssetTicketsPage';
import HrAiSubscriptionsPage from './pages/hr/HrAiSubscriptionsPage';
import AiSubscriptionsPage from './pages/employee/AiSubscriptionsPage';
import RequestAiSubscriptionPage from './pages/employee/RequestAiSubscriptionPage';
import FinanceLayout from './pages/finance/FinanceLayout';
import FinanceDashboardPage from './pages/finance/FinanceDashboardPage';
import ChartOfAccountsPage from './pages/finance/ChartOfAccountsPage';
import LedgerPage from './pages/finance/LedgerPage';
import InvoicesPage from './pages/finance/InvoicesPage';
import ExpensesPage from './pages/finance/ExpensesPage';
import ExpenseFormPage from './pages/finance/ExpenseFormPage';
import PaymentsPage from './pages/finance/PaymentsPage';
import VendorsPage from './pages/finance/VendorsPage';
import BudgetsPage from './pages/finance/BudgetsPage';
import FinanceReportsHubPage from './pages/finance/FinanceReportsHubPage';
import FinanceReportsPage from './pages/finance/FinanceReportsPage';
import FinanceSettingsPage from './pages/finance/FinanceSettingsPage';
import FinanceModulePage from './pages/finance/FinanceModulePage';
import FinanceModuleFormPage from './pages/finance/FinanceModuleFormPage';
import FinanceDedicatedFormPage from './pages/finance/FinanceDedicatedFormPage';
import JournalEntryFormPage from './pages/finance/JournalEntryFormPage';
import BankingPage from './pages/finance/BankingPage';
import OrgHierarchyPage from './pages/OrgHierarchyPage';
import './workspace.css';

export default function WorkspaceApp() {
  return (
    <WorkspaceProvider>
      <RbacProvider>
      <Routes>
        <Route path="/workspace" element={<WorkspaceShell />}>
          <Route element={<AnimatedOutlet className="ws-page-motion" />}>
            <Route index element={<WorkspaceHomePage />} />
            <Route path="solutions/:solutionId" element={<SolutionPage />} />
            <Route path="solutions/:solutionId/apps/:appId" element={<WorkspaceAppPage />} />
            <Route path="admin/rbac" element={<RbacLayout />}>
              <Route index element={<RbacDashboardPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="roles/:roleId" element={<RolePermissionsPage />} />
              <Route path="permissions" element={<PermissionsPage />} />
              <Route path="users" element={<RbacUsersPage />} />
              <Route path="audit" element={<AuditLogsPage />} />
            </Route>
            <Route path="org-units/hierarchy" element={<OrgHierarchyPage />} />
            <Route path="employee" element={<EmployeeLayout />}>
              <Route index element={<EmployeeDashboardPage />} />
              <Route path="profile" element={<EmployeeProfilePage />} />
              <Route path="assets" element={<MyAssetsPage />} />
              <Route path="asset-tickets/new" element={<RaiseAssetTicketPage />} />
              <Route path="asset-tickets" element={<AssetTicketsPage />} />
              <Route path="ai-subscriptions/new" element={<RequestAiSubscriptionPage />} />
              <Route path="ai-subscriptions" element={<AiSubscriptionsPage />} />
              <Route path="documents" element={<MyDocumentsPage />} />
              <Route path="colleagues" element={<ColleaguesPage />} />
              <Route path="dates" element={<MyDatesPage />} />
              <Route path="exit" element={<ExitRequestPage />} />
            </Route>
            <Route path="hr" element={<HrLayout />}>
              <Route index element={<HrDashboardPage />} />
              <Route path="employees/new" element={<AddEmployeePage />} />
              <Route path="employees/:employeeId" element={<EmployeeDetailPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="approvals" element={<PendingApprovalsPage />} />
              <Route path="hikes/:employeeId" element={<EmployeeHikeDetailPage />} />
              <Route path="hikes" element={<EmployeeHikePage />} />
              <Route path="exit" element={<HrExitPage />} />
              <Route path="asset-tickets" element={<HrAssetTicketsPage />} />
              <Route path="ai-subscriptions" element={<HrAiSubscriptionsPage />} />
              <Route path="onboarding/new" element={<AddNewHirePage />} />
              <Route path="onboarding/:hireId/checklist" element={<OnboardingChecklistPage />} />
              <Route path="onboarding/:hireId/prerequisites" element={<OnboardingPrerequisitesPage />} />
              <Route path="onboarding/:hireId" element={<OnboardingDetailPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="recruitment/jobs/new" element={<CreateJobOpeningPage />} />
              <Route path="recruitment/jobs/:jobId" element={<JobDetailPage />} />
              <Route path="recruitment" element={<RecruitmentPage />} />
              <Route path="recruitment/candidates/new" element={<AddCandidatePage />} />
              <Route path="recruitment/candidates/:candidateId" element={<CandidateDetailPage />} />
              <Route path="recruitment/candidates" element={<CandidatesPage />} />
              <Route path="recruitment/feedback" element={<FeedbackListPage />} />
            </Route>
            <Route path="finance" element={<FinanceLayout />}>
              <Route index element={<FinanceDashboardPage />} />
              <Route path="m/:moduleKey/new" element={<FinanceModuleFormPage />} />
              <Route path="m/:moduleKey/:id/edit" element={<FinanceModuleFormPage />} />
              <Route path="m/:moduleKey" element={<FinanceModulePage />} />
              <Route path="banking" element={<BankingPage />} />
              <Route path="accounts/new" element={<FinanceDedicatedFormPage entity="accounts" />} />
              <Route path="accounts/:id/edit" element={<FinanceDedicatedFormPage entity="accounts" />} />
              <Route path="accounts" element={<ChartOfAccountsPage />} />
              <Route path="ledger/new" element={<JournalEntryFormPage />} />
              <Route path="ledger/:id/edit" element={<JournalEntryFormPage />} />
              <Route path="ledger" element={<LedgerPage />} />
              <Route path="invoices/new" element={<FinanceDedicatedFormPage entity="invoices" />} />
              <Route path="invoices/:id/edit" element={<FinanceDedicatedFormPage entity="invoices" />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="expenses/new" element={<ExpenseFormPage />} />
              <Route path="expenses/:id/edit" element={<ExpenseFormPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="payments/new" element={<FinanceDedicatedFormPage entity="payments" />} />
              <Route path="payments/:id/edit" element={<FinanceDedicatedFormPage entity="payments" />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="vendors/new" element={<FinanceDedicatedFormPage entity="vendors" />} />
              <Route path="vendors/:id/edit" element={<FinanceDedicatedFormPage entity="vendors" />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="budgets/new" element={<FinanceDedicatedFormPage entity="budgets" />} />
              <Route path="budgets/:id/edit" element={<FinanceDedicatedFormPage entity="budgets" />} />
              <Route path="budgets" element={<BudgetsPage />} />
              <Route path="reports" element={<FinanceReportsHubPage />} />
              <Route path="reports/statements" element={<FinanceReportsPage />} />
              <Route path="settings" element={<FinanceSettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/workspace" replace />} />
          </Route>
        </Route>
      </Routes>
      </RbacProvider>
    </WorkspaceProvider>
  );
}
