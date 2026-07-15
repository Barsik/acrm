// =============================================
// CORE ENUMS
// =============================================

export type UserRole =
  | 'ceo'
  | 'block_head'
  | 'market_lead'
  | 'manager'
  | 'operations';

export type AccessLevel = 6 | 5 | 4 | 3 | 2 | 1 | 0;

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ClientSegment =
  | 'PREMIUM'
  | 'STANDARD'
  | 'SME'
  | 'INSTITUTIONAL'
  | 'RETAIL'
  | 'STRATEGIC';

export type ClientCategory =
  | 'BROKER'
  | 'BANK'
  | 'INSURANCE'
  | 'PENSION_FUND'
  | 'ASSET_MANAGER'
  | 'CORPORATION'
  | 'STATE'
  | 'FOREIGN';

export type Market =
  | 'equity'
  | 'derivatives'
  | 'fx'
  | 'money'
  | 'commodity'
  | 'clearing'
  | 'depository'
  | 'info'
  | 'tech';

export type InfluenceLevel = 'very_high' | 'high' | 'medium' | 'low';

export type PersonRole =
  | 'decision_maker'
  | 'influencer'
  | 'sponsor'
  | 'user'
  | 'gatekeeper';

export type TaskStatus = 'open' | 'in_progress' | 'done' | 'overdue';
export type AlertStatus = 'new' | 'in_progress' | 'resolved';
export type ActivityStatus = 'active' | 'declining' | 'inactive' | 'new';

// =============================================
// HOLDING & COMPANY
// =============================================

export interface Holding {
  id: string;
  name: string;
  shortName: string;
  segment: ClientSegment;
  category: ClientCategory;
  industry: string;
  managerId: string;
  managerName: string;
  revenueYTD: number;
  revenuePrevYTD: number;
  volumeYTD: number;
  volumePrevYTD: number;
  companiesCount: number;
  activeCompaniesCount: number;
  productsCount: number;
  marketsCount: number;
  healthScore: number;
  riskScore: number;
  growthPotential: number;
  groupRank: number;
  activityStatus: ActivityStatus;
  companies: Company[];
  lastContact: string;
}

export interface Company {
  id: string;
  name: string;
  inn: string;
  ogrn: string;
  holdingId: string;
  holdingName: string;
  segment: ClientSegment;
  category: ClientCategory;
  industry: string;
  clientStatus: 'active' | 'potential' | 'inactive' | 'churned';
  managerId: string;
  managerName: string;
  revenueYTD: number;
  revenuePrevYTD: number;
  volumeYTD: number;
  volumePrevYTD: number;
  activeProducts: string[];
  inactiveProducts: string[];
  markets: Market[];
  healthScore: number;
  riskScore: number;
  growthPotential: number;
  openRequests: number;
  endClientsCount: number;
  lastContact: string;
  activityStatus: ActivityStatus;
}

// =============================================
// PERSON
// =============================================

export interface Person {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  title: string;
  companyId: string;
  companyName: string;
  holdingId: string;
  holdingName: string;
  department: string;
  email: string;
  phone: string;
  assistant?: string;
  birthDate: string;
  personRole: PersonRole;
  influenceLevel: InfluenceLevel;
  vipScore: number;
  publicRole?: string;
  industryCommittees: string[];
  publicSpeaking: boolean;
  industrySignificance: 'very_high' | 'high' | 'medium' | 'low';
  groupRelationship: 'very_high' | 'high' | 'medium' | 'low';
  lastContact: string;
  meetingHistory: Meeting[];
  interestedProducts: string[];
  managerNotes: string;
}

export interface Meeting {
  id: string;
  date: string;
  topic: string;
  participants: string[];
  outcome: string;
  nextSteps: string;
}

// =============================================
// PRODUCT
// =============================================

export interface ProductUsage {
  id: string;
  productId: string;
  productName: string;
  market: Market;
  companyId: string;
  connected: boolean;
  active: boolean;
  connectedDate?: string;
  lastUsed?: string;
  volumeYTD: number;
  revenueYTD: number;
  growthPotential: 'high' | 'medium' | 'low' | 'none';
  recommendation?: string;
}

export interface MarketMetric {
  market: Market;
  marketLabel: string;
  volumeYTD: number;
  volumePrev: number;
  revenueYTD: number;
  revenuePrev: number;
  clientsCount: number;
  trend: number;
}

// =============================================
// METRICS
// =============================================

export interface RevenueMetric {
  period: string;
  revenue: number;
  prevRevenue: number;
  volume: number;
  prevVolume: number;
  market?: Market;
}

export interface OperationMetric {
  period: string;
  operationsCount: number;
  volume: number;
  markets: Partial<Record<Market, number>>;
}

export interface EndClientSegment {
  segment: string;
  count: number;
  assets: number;
  share: number;
}

// =============================================
// ALERT
// =============================================

export interface Alert {
  id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  entityId: string;
  entityName: string;
  entityType: 'holding' | 'company' | 'person' | 'product' | 'task';
  source: string;
  date: string;
  recommendedAction: string;
  responsibleId: string;
  responsibleName: string;
  status: AlertStatus;
}

// =============================================
// TASK
// =============================================

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'call' | 'meeting' | 'document' | 'escalation' | 'cross_sell' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: TaskStatus;
  assigneeId: string;
  assigneeName: string;
  entityId: string;
  entityName: string;
  entityType: 'holding' | 'company' | 'person';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  /** Результат обработки задачи — заполняется при закрытии. */
  result?: string;
}

// =============================================
// AGREEMENT & DOCUMENT
// =============================================

export interface Agreement {
  id: string;
  title: string;
  type: 'contract' | 'tariff' | 'sla' | 'key' | 'certificate' | 'protocol';
  entityId: string;
  entityName: string;
  signedDate: string;
  expiresDate: string;
  status: 'active' | 'expiring' | 'expired';
  responsible: string;
  linkedTasks: string[];
}

// =============================================
// NEWS
// =============================================

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  source: string;
  category: 'market' | 'company' | 'regulatory' | 'macro';
  entityIds: string[];
  relevance: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
}

// =============================================
// STRATEGY
// =============================================

export interface StrategyItem {
  id: string;
  entityId: string;
  entityName: string;
  market: Market;
  marketLabel: string;
  currentVolume: number;
  targetVolume: number;
  revenueActual: number;
  revenueTarget: number;
  gap: number;
  initiative: string;
  owner: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
  progress: number;
}

// =============================================
// AI INSIGHT
// =============================================

export interface AIInsight {
  id: string;
  type:
    | 'summary'
    | 'risk'
    | 'opportunity'
    | 'next_action'
    | 'cross_sell'
    | 'meeting_brief';
  entityId: string;
  entityType: 'holding' | 'company' | 'portfolio' | 'market' | 'ceo';
  title: string;
  body: string;
  confidence: number;
  generatedAt: string;
  tags: string[];
}

// =============================================
// COHORT
// =============================================

export interface Cohort {
  id: string;
  name: string;
  description: string;
  criteria: CohortCriteria;
  clientIds: string[];
  createdBy: string;
  createdAt: string;
  clientsCount: number;
  avgRevenue: number;
  avgVolume: number;
}

export interface CohortCriteria {
  segments?: ClientSegment[];
  categories?: ClientCategory[];
  markets?: Market[];
  industries?: string[];
  revenueMin?: number;
  revenueMax?: number;
  activityStatus?: ActivityStatus[];
  growthPotential?: string[];
  managerId?: string;
}

// =============================================
// EVENT INTELLIGENCE
// =============================================

export interface EventParticipation {
  id: string;
  personId: string;
  personName: string;
  companyName: string;
  title: string;
  influenceLevel: InfluenceLevel;
  vipScore: number;
  relevanceScore: number;
  lastContact: string;
  recommendedBy: string;
  invitationStatus: 'recommended' | 'invited' | 'confirmed' | 'declined' | 'attended';
  relevantTopics: string[];
  priorityLevel: 'vip' | 'high' | 'medium' | 'standard';
}

// =============================================
// PORTFOLIO & MANAGER
// =============================================

export interface Portfolio {
  managerId: string;
  managerName: string;
  holdingsCount: number;
  companiesCount: number;
  revenueYTD: number;
  revenuePrev: number;
  volumeYTD: number;
  planFulfillment: number;
  clientsAtRisk: number;
  clientsWithOpportunity: number;
  openTasks: number;
  openAlerts: number;
}

// =============================================
// GROWTH OPPORTUNITY
// =============================================

export interface GrowthOpportunity {
  id: string;
  entityId: string;
  entityName: string;
  type: 'cross_sell' | 'up_sell' | 'reactivation' | 'new_product';
  product: string;
  market: Market;
  potentialRevenue: number;
  probability: number;
  description: string;
  recommendedAction: string;
  assigneeId: string;
}

// =============================================
// OPERATIONS (oCRM)
// =============================================

export interface OperationRequest {
  id: string;
  number: string;
  type: 'request' | 'incident' | 'task' | 'document';
  title: string;
  clientName: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'in_progress' | 'pending' | 'resolved' | 'overdue';
  assignee: string;
  department: string;
  sla: number;
  slaRemaining: number;
  createdAt: string;
  updatedAt: string;
  description: string;
}

// =============================================
// RELATIONSHIP MAP
// =============================================

export interface RelationshipMap {
  entityId: string;
  nodes: RelNode[];
  edges: RelEdge[];
}

export interface RelNode {
  id: string;
  label: string;
  type: 'holding' | 'company' | 'person' | 'product' | 'market';
}

export interface RelEdge {
  from: string;
  to: string;
  label: string;
}
