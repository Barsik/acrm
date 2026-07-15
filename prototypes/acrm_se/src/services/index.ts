// =============================================
// SERVICES — Mock implementations
// In production, replace each service with real API calls to:
//   - holdingService → ЕХД / CRM / клиентская база
//   - clientService  → ЕХД / CRM
//   - personService  → CRM / oCRM / BPMSoft
//   - productService → ЕХД / биллинг / торговая система
//   - revenueService → ЕХД / биллинг
//   - alertsService  → ЕХД + Service Desk + CRM (агрегация)
//   - tasksService   → oCRM / BPMSoft / Service Desk
//   - newsService    → СПАРК / Интерфакс / Раскрытие эмитентов
//   - aiInsightsService → AI/LLM-сервис (внутренний или OpenAI/YandexGPT)
//   - cohortsService → ЕХД (конструктор когорт)
//   - eventIntelligenceService → CRM / база мероприятий
//   - strategyService → CRM / BPMSoft / стратегические планы
// =============================================

import {
  mockHoldings, mockCompanies, mockPersons, mockAlerts, mockTasks,
  mockAgreements, mockNews, mockStrategyItems, mockAIInsights,
  mockCohorts, mockEventParticipations, mockOperationRequests,
  mockPortfolios, mockOpportunities, mockRevenueMetrics,
  mockMarketMetrics, mockProductUsage,
} from '../data/mockData';

import type {
  Holding, Company, Person, Alert, Task, Agreement,
  NewsItem, StrategyItem, AIInsight, Cohort, EventParticipation,
  Portfolio, GrowthOpportunity, OperationRequest, RevenueMetric,
  MarketMetric, ProductUsage,
} from '../types';

// --- Holding Service ---
// TODO: connect to ЕХД / CRM API
export const holdingService = {
  getAll: (): Holding[] => mockHoldings,
  getById: (id: string): Holding | undefined => mockHoldings.find(h => h.id === id),
  getTopByRevenue: (n = 10): Holding[] =>
    [...mockHoldings].sort((a, b) => b.revenueYTD - a.revenueYTD).slice(0, n),
  getAtRisk: (): Holding[] =>
    mockHoldings.filter(h => h.riskScore > 40 || h.activityStatus === 'declining'),
  getByManager: (managerId: string): Holding[] =>
    mockHoldings.filter(h => h.managerId === managerId),
};

// --- Company Service ---
// TODO: connect to ЕХД / клиентская база
export const companyService = {
  getAll: (): Company[] => mockCompanies,
  getById: (id: string): Company | undefined => mockCompanies.find(c => c.id === id),
  getByHolding: (holdingId: string): Company[] =>
    mockCompanies.filter(c => c.holdingId === holdingId),
  getByManager: (managerId: string): Company[] =>
    mockCompanies.filter(c => c.managerId === managerId),
  search: (q: string): Company[] => {
    const lq = q.toLowerCase();
    return mockCompanies.filter(c =>
      c.name.toLowerCase().includes(lq) ||
      c.inn.includes(lq) ||
      c.ogrn.includes(lq)
    );
  },
};

// --- Person Service ---
// TODO: connect to CRM / oCRM / BPMSoft
export const personService = {
  getAll: (): Person[] => mockPersons,
  getById: (id: string): Person | undefined => mockPersons.find(p => p.id === id),
  getByCompany: (companyId: string): Person[] =>
    mockPersons.filter(p => p.companyId === companyId),
  getByHolding: (holdingId: string): Person[] =>
    mockPersons.filter(p => p.holdingId === holdingId),
  search: (q: string): Person[] => {
    const lq = q.toLowerCase();
    return mockPersons.filter(p =>
      p.fullName.toLowerCase().includes(lq) ||
      p.email.toLowerCase().includes(lq) ||
      p.phone.includes(lq)
    );
  },
};

// --- Product Service ---
// TODO: connect to ЕХД / торговая система / биллинг
export const productService = {
  getByCompany: (companyId: string): ProductUsage[] =>
    mockProductUsage.filter(p => p.companyId === companyId),
  getMarketMetrics: (): MarketMetric[] => mockMarketMetrics,
};

// --- Revenue Service ---
// TODO: connect to ЕХД / биллинг
export const revenueService = {
  getMonthly: (): RevenueMetric[] => mockRevenueMetrics,
  getByHolding: (_holdingId: string): RevenueMetric[] => mockRevenueMetrics,
};

// --- Alerts Service ---
// TODO: connect to ЕХД + Service Desk + CRM (агрегация алертов)
// Подписчики на изменения алертов (живые счётчики в меню и т.п.)
let alertListeners: Array<() => void> = [];
const notifyAlertListeners = () => alertListeners.forEach(l => l());

export const alertsService = {
  getAll: (): Alert[] => mockAlerts,
  update: (id: string, patch: Partial<Alert>): void => {
    const alert = mockAlerts.find(a => a.id === id);
    if (alert) { Object.assign(alert, patch); notifyAlertListeners(); }
  },
  subscribe: (listener: () => void): (() => void) => {
    alertListeners.push(listener);
    return () => { alertListeners = alertListeners.filter(l => l !== listener); };
  },
  getByEntity: (entityId: string): Alert[] =>
    mockAlerts.filter(a => a.entityId === entityId),
  getCritical: (): Alert[] =>
    mockAlerts.filter(a => a.severity === 'critical' || a.severity === 'high'),
  getByManager: (managerId: string): Alert[] =>
    mockAlerts.filter(a => a.responsibleId === managerId),
};

// Подписчики на изменения задач (живые счётчики в меню и т.п.)
let taskListeners: Array<() => void> = [];
const notifyTaskListeners = () => taskListeners.forEach(l => l());

// --- Tasks Service ---
// TODO: connect to oCRM / BPMSoft / Service Desk
export const tasksService = {
  getAll: (): Task[] => mockTasks,
  create: (task: Task): void => { mockTasks.unshift(task); notifyTaskListeners(); },
  update: (id: string, patch: Partial<Task>): void => {
    const task = mockTasks.find(t => t.id === id);
    if (task) { Object.assign(task, patch); notifyTaskListeners(); }
  },
  subscribe: (listener: () => void): (() => void) => {
    taskListeners.push(listener);
    return () => { taskListeners = taskListeners.filter(l => l !== listener); };
  },
  getByEntity: (entityId: string): Task[] =>
    mockTasks.filter(t => t.entityId === entityId),
  getByAssignee: (assigneeId: string): Task[] =>
    mockTasks.filter(t => t.assigneeId === assigneeId),
  getOverdue: (): Task[] =>
    mockTasks.filter(t => t.status === 'overdue' || new Date(t.dueDate) < new Date()),
};

// --- Agreements Service ---
// TODO: connect to ЕХД / биллинг / документооборот
export const agreementsService = {
  getAll: (): Agreement[] => mockAgreements,
  getExpiring: (): Agreement[] =>
    mockAgreements.filter(a => a.status === 'expiring'),
  getByEntity: (entityId: string): Agreement[] =>
    mockAgreements.filter(a => a.entityId === entityId),
};

// --- News Service ---
// TODO: connect to СПАРК / Интерфакс / Раскрытие эмитентов / внешние API
export const newsService = {
  getAll: (): NewsItem[] => mockNews,
  getByEntity: (entityId: string): NewsItem[] =>
    mockNews.filter(n => n.entityIds.includes(entityId)),
  getRecent: (n = 5): NewsItem[] =>
    [...mockNews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n),
};

// --- AI Insights Service ---
// TODO: connect to AI/LLM-сервис (Anthropic Claude / YandexGPT / внутренний LLM)
export const aiInsightsService = {
  getAll: (): AIInsight[] => mockAIInsights,
  getByEntity: (entityId: string): AIInsight[] =>
    mockAIInsights.filter(a => a.entityId === entityId),
  getPortfolioSummary: (): AIInsight | undefined =>
    mockAIInsights.find(a => a.entityType === 'portfolio'),
  getCEOSummary: (): AIInsight | undefined =>
    mockAIInsights.find(a => a.entityType === 'ceo') || mockAIInsights[0],
};

// --- Cohorts Service ---
// TODO: connect to ЕХД (конструктор когорт)
export const cohortsService = {
  getAll: (): Cohort[] => mockCohorts,
  getById: (id: string): Cohort | undefined => mockCohorts.find(c => c.id === id),
};

// --- Event Intelligence Service ---
// TODO: connect to CRM / база мероприятий / HR-системы
export const eventIntelligenceService = {
  getParticipants: (): EventParticipation[] => mockEventParticipations,
  getRecommended: (): EventParticipation[] =>
    mockEventParticipations.filter(e => e.invitationStatus === 'recommended'),
};

// --- Portfolio Service ---
// TODO: connect to CRM / HR / оргструктура
export const portfolioService = {
  getAll: (): Portfolio[] => mockPortfolios,
  getByManager: (managerId: string): Portfolio | undefined =>
    mockPortfolios.find(p => p.managerId === managerId),
};

// --- Strategy Service ---
// TODO: connect to CRM / BPMSoft / стратегические планы
export const strategyService = {
  getAll: (): StrategyItem[] => mockStrategyItems,
  getByEntity: (entityId: string): StrategyItem[] =>
    mockStrategyItems.filter(s => s.entityId === entityId),
};

// --- Opportunities Service ---
// TODO: connect to AI/LLM + ЕХД (white space analysis)
export const opportunitiesService = {
  getAll: (): GrowthOpportunity[] => mockOpportunities,
  getByEntity: (entityId: string): GrowthOpportunity[] =>
    mockOpportunities.filter(o => o.entityId === entityId),
  getTopOpportunities: (n = 5): GrowthOpportunity[] =>
    [...mockOpportunities].sort((a, b) => b.potentialRevenue - a.potentialRevenue).slice(0, n),
};

// --- Operations Service ---
// TODO: connect to Service Desk / BPMSoft / oCRM
export const operationsService = {
  getAll: (): OperationRequest[] => mockOperationRequests,
  getOverdue: (): OperationRequest[] =>
    mockOperationRequests.filter(r => r.status === 'overdue'),
  getCritical: (): OperationRequest[] =>
    mockOperationRequests.filter(r => r.priority === 'critical'),
};

// --- Activity Monitor Service ---
// TODO: connect to ЕХД / торговая система / клиринг (агрегация активности)
import { clients, activityProducts, markets } from '../data/mockDatabase';
import type { ClientRecord, Market } from '../data/mockDatabase';

export const activityMonitorService = {
  getProducts: (): string[] => activityProducts,
  getMarkets: (): Market[] => markets,
  // Монитор активности отслеживает клиентов с данными по продуктам.
  getClients: (): ClientRecord[] => clients.filter(c => c.productStatuses),
};

// --- Global Search ---
// TODO: connect to полнотекстовый поиск ЕХД / ElasticSearch
export const searchService = {
  search: (query: string) => {
    const q = query.toLowerCase();
    if (!q || q.length < 2) return { holdings: [], companies: [], persons: [], tasks: [] };
    return {
      holdings: mockHoldings.filter(h => h.name.toLowerCase().includes(q) || h.shortName.toLowerCase().includes(q)),
      companies: mockCompanies.filter(c => c.name.toLowerCase().includes(q) || c.inn.includes(q) || c.ogrn.includes(q)),
      persons: mockPersons.filter(p => p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)),
      tasks: mockTasks.filter(t => t.title.toLowerCase().includes(q) || t.entityName.toLowerCase().includes(q)),
    };
  },
};
