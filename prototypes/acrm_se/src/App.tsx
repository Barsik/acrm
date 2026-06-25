import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSelect } from './pages/RoleSelect';
import { CEOPage } from './pages/CEO';
import { BlockHeadPage } from './pages/BlockHead';
import { MarketLeadPage } from './pages/MarketLead';
import { ManagerPage } from './pages/Manager';
import { OperationsPage } from './pages/Operations';
import { HoldingsListPage } from './pages/HoldingsListPage';
import { ClientsPage } from './pages/ClientsPage';
import { HoldingPage } from './pages/HoldingPage';
import { CompanyPage } from './pages/CompanyPage';
import { PersonPage } from './pages/PersonPage';
import { PersonsListPage } from './pages/PersonsListPage';
import { AlertsPage } from './pages/AlertsPage';
import { TasksPage } from './pages/TasksPage';
import { ActivityMonitorPage } from './pages/ActivityMonitorPage';
import { ProductsPage } from './pages/ProductsPage';
import { MarketsPage } from './pages/MarketsPage';
import { FunnelPage } from './pages/FunnelPage';
import { StrategyPage } from './pages/StrategyPage';
import { CohortsPage } from './pages/CohortsPage';
import { EventsPage } from './pages/EventsPage';
import { NewsPage } from './pages/NewsPage';
import { AgreementsPage } from './pages/AgreementsPage';
import { SettingsPage } from './pages/SettingsPage';

const roleHomePath: Record<string, string> = {
  ceo: '/ceo',
  block_head: '/block-head',
  market_lead: '/market-lead',
  manager: '/manager',
  operations: '/operations',
};

const RootRedirect = () => {
  const { role } = useApp();
  if (role) return <Navigate to={roleHomePath[role] || '/role-select'} replace />;
  return <Navigate to="/role-select" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/role-select" element={<RoleSelect />} />
    <Route path="/ceo" element={<CEOPage />} />
    <Route path="/block-head" element={<BlockHeadPage />} />
    <Route path="/market-lead" element={<MarketLeadPage />} />
    <Route path="/manager" element={<ManagerPage />} />
    <Route path="/operations" element={<OperationsPage />} />
    <Route path="/holdings" element={<HoldingsListPage />} />
    <Route path="/clients" element={<ClientsPage />} />
    <Route path="/holdings/:id" element={<HoldingPage />} />
    <Route path="/companies/:id" element={<CompanyPage />} />
    <Route path="/persons" element={<PersonsListPage />} />
    <Route path="/persons/:id" element={<PersonPage />} />
    <Route path="/alerts" element={<AlertsPage />} />
    <Route path="/tasks" element={<TasksPage />} />
    <Route path="/activity" element={<ActivityMonitorPage />} />
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/markets" element={<MarketsPage />} />
    <Route path="/funnel" element={<FunnelPage />} />
    <Route path="/strategy" element={<StrategyPage />} />
    <Route path="/cohorts" element={<CohortsPage />} />
    <Route path="/events" element={<EventsPage />} />
    <Route path="/news" element={<NewsPage />} />
    <Route path="/agreements" element={<AgreementsPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*" element={<Navigate to="/role-select" replace />} />
  </Routes>
);

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
