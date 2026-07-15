import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { clientIdForEntity } from './data/entityToClient';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSelect } from './pages/RoleSelect';
import { CEOPage } from './pages/CEO';
import { BlockHeadPage } from './pages/BlockHead';
import { MarketLeadPage } from './pages/MarketLead';
import { ManagerPage } from './pages/Manager';
import { OperationsPage } from './pages/Operations';
import { HoldingsListPage } from './pages/HoldingsListPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
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
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { BrokerPortalPage } from './pages/BrokerPortalPage';

const roleHomePath: Record<string, string> = {
  ceo: '/ceo',
  block_head: '/block-head',
  market_lead: '/market-lead',
  manager: '/tasks',
  operations: '/operations',
};

// Переход в холдинг/компанию с любой страницы открывает стандартную карточку клиента
const EntityRedirect = () => {
  const { id } = useParams();
  const clientId = clientIdForEntity(id ?? '');
  return <Navigate to={clientId ? `/clients/${clientId}` : '/clients'} replace />;
};

const RootRedirect = () => {
  const { role } = useApp();
  if (role) return <Navigate to={roleHomePath[role] || '/role-select'} replace />;
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/role-select" element={<RoleSelect />} />
    <Route path="/ceo" element={<CEOPage />} />
    <Route path="/block-head" element={<BlockHeadPage />} />
    <Route path="/market-lead" element={<MarketLeadPage />} />
    <Route path="/manager" element={<ManagerPage />} />
    <Route path="/operations" element={<OperationsPage />} />
    <Route path="/holdings" element={<HoldingsListPage />} />
    <Route path="/portfolio" element={<ClientsPage />} />
    <Route path="/clients" element={<ClientsPage />} />
    <Route path="/clients/:id" element={<ClientDetailPage />} />
    <Route path="/holdings/:id" element={<EntityRedirect />} />
    <Route path="/companies/:id" element={<EntityRedirect />} />
    <Route path="/broker/:companyId" element={<BrokerPortalPage />} />
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
    <Route path="/profile" element={<ProfilePage />} />
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
