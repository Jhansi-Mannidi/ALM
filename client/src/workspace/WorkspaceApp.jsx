import { Navigate, Route, Routes } from 'react-router-dom';
import AnimatedOutlet from '../motion/AnimatedOutlet';
import WorkspaceShell from './components/WorkspaceShell';
import WorkspaceHomePage from './pages/WorkspaceHomePage';
import SolutionPage from './pages/SolutionPage';
import WorkspaceAppPage from './pages/WorkspaceAppPage';
import RbacLayout from './pages/admin/RbacLayout';
import RbacStartPage from './pages/admin/RbacStartPage';
import RbacDashboardPage from './pages/admin/RbacDashboardPage';
import RolesPage from './pages/admin/RolesPage';
import RolePermissionsPage from './pages/admin/RolePermissionsPage';
import PermissionsPage from './pages/admin/PermissionsPage';
import RbacUsersPage from './pages/admin/RbacUsersPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import AdoptionReportsPage from './pages/admin/AdoptionReportsPage';
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
import ProductLayout from './pages/product/ProductLayout';
import ProductDashboardPage from './pages/product/ProductDashboardPage';
import InsightsPage from './pages/product/InsightsPage';
import CustomersPage from './pages/product/CustomersPage';
import IntegrationsPage from './pages/product/IntegrationsPage';
import HierarchyPage from './pages/product/HierarchyPage';
import InitiativesPage from './pages/product/InitiativesPage';
import OkrsPage from './pages/product/OkrsPage';
import PrioritizationPage from './pages/product/PrioritizationPage';
import RoadmapPage from './pages/product/RoadmapPage';
import ProductReleasesPage from './pages/product/ProductReleasesPage';
import ProductReportsPage from './pages/product/ProductReportsPage';
import ProductDataPage from './pages/product/ProductDataPage';
import ProductDocsPage from './pages/product/ProductDocsPage';
import PortalsPage from './pages/product/PortalsPage';
import BriefsPage from './pages/product/BriefsPage';
import ProductSharePage from './pages/product/ProductSharePage';
import OfficeLayout from './pages/office/OfficeLayout';
import OfficeDashboardPage from './pages/office/OfficeDashboardPage';
import InventoryPage from './pages/office/InventoryPage';
import RequestsPage from './pages/office/RequestsPage';
import OfficeVendorsPage from './pages/office/VendorsPage';
import FoodPage from './pages/office/FoodPage';
import FreightLeadsPage from './pages/freight/FreightLeadsPage';
import FreightLayout from './pages/freight/FreightLayout';
import FreightPlaceholderPage from './pages/freight/FreightPlaceholderPage';
import './workspace.css';
import './workspace-theme.css';

const STABLE_MODULE_ROUTE_PREFIXES = [
  '/workspace/admin/rbac',
  '/workspace/employee',
  '/workspace/hr',
  '/workspace/finance',
  '/workspace/product',
  '/workspace/office',
  '/workspace/freight',
];

function getWorkspaceAnimationKey(location) {
  const modulePrefix = STABLE_MODULE_ROUTE_PREFIXES.find((prefix) => (
    location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
  ));

  return modulePrefix ?? location.pathname;
}

export default function WorkspaceApp() {
  return (
      <Routes>
        <Route path="/workspace" element={<WorkspaceShell />}>
          <Route element={<AnimatedOutlet className="ws-page-motion" getKey={getWorkspaceAnimationKey} />}>
            <Route index element={<div className="ws-empty-landing" aria-hidden="true" />} />
            <Route path="home" element={<WorkspaceHomePage />} />
            <Route path="solutions/:solutionId" element={<SolutionPage />} />
            <Route path="solutions/:solutionId/apps/:appId" element={<WorkspaceAppPage />} />
            <Route path="admin/rbac" element={<RbacLayout />}>
              <Route index element={<RbacStartPage />} />
              <Route path="dashboard" element={<RbacDashboardPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="roles/:roleId" element={<RolePermissionsPage />} />
              <Route path="permissions" element={<PermissionsPage />} />
              <Route path="users" element={<RbacUsersPage />} />
              <Route path="audit" element={<AuditLogsPage />} />
              <Route path="adoption" element={<AdoptionReportsPage />} />
            </Route>
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
            <Route path="product/share/:token" element={<ProductSharePage />} />
            <Route path="product" element={<ProductLayout />}>
              <Route index element={<ProductDashboardPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="hierarchy" element={<HierarchyPage />} />
              <Route path="initiatives" element={<InitiativesPage />} />
              <Route path="okrs" element={<OkrsPage />} />
              <Route path="prioritization" element={<PrioritizationPage />} />
              <Route path="roadmap" element={<RoadmapPage />} />
              <Route path="releases" element={<ProductReleasesPage />} />
              <Route path="reports" element={<ProductReportsPage />} />
              <Route path="data" element={<ProductDataPage />} />
              <Route path="docs" element={<ProductDocsPage />} />
              <Route path="portals" element={<PortalsPage />} />
              <Route path="briefs" element={<BriefsPage />} />
            </Route>
            <Route path="office" element={<OfficeLayout />}>
              <Route index element={<OfficeDashboardPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="vendors" element={<OfficeVendorsPage />} />
              <Route path="food" element={<FoodPage />} />
            </Route>
            <Route path="freight" element={<FreightLayout />}>
              <Route path="leads" element={<FreightLeadsPage />} />
              <Route path="leads/suspects" element={<FreightLeadsPage />} />
              <Route path="leads/prospects" element={<FreightLeadsPage />} />
              <Route path="leads/opportunities" element={<FreightLeadsPage />} />
              <Route path="leads/customers" element={<FreightLeadsPage />} />
              <Route path="sales" element={<FreightPlaceholderPage title="Sales" />} />
              <Route path="accounting" element={<FreightPlaceholderPage title="Accounting" />} />
              <Route path="tracking" element={<FreightPlaceholderPage title="Track & Trace" />} />
            </Route>
            <Route path="*" element={<Navigate to="/workspace" replace />} />
          </Route>
        </Route>
      </Routes>
  );
}
