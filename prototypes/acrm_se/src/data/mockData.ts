import type {
  Holding, Company, Person, Alert, Task, Agreement,
  NewsItem, StrategyItem, AIInsight, Cohort, EventParticipation,
  Portfolio, GrowthOpportunity, OperationRequest, RevenueMetric,
  MarketMetric, ProductUsage,
} from '../types';

// =============================================
// HOLDINGS
// =============================================
export const mockHoldings: Holding[] = [
  {
    id: 'h1',
    name: 'Группа Сбербанк',
    shortName: 'Сбербанк',
    segment: 'STRATEGIC',
    category: 'BANK',
    industry: 'Банковский сектор',
    managerId: 'mgr1',
    managerName: 'Алексей Воронов',
    revenueYTD: 1_240_000_000,
    revenuePrevYTD: 1_120_000_000,
    volumeYTD: 48_500_000_000,
    volumePrevYTD: 41_200_000_000,
    companiesCount: 8,
    activeCompaniesCount: 7,
    productsCount: 24,
    marketsCount: 7,
    healthScore: 92,
    riskScore: 12,
    growthPotential: 85,
    groupRank: 1,
    activityStatus: 'active',
    lastContact: '2026-06-05',
    companies: [],
  },
  {
    id: 'h2',
    name: 'ВТБ Группа',
    shortName: 'ВТБ',
    segment: 'STRATEGIC',
    category: 'BANK',
    industry: 'Банковский сектор',
    managerId: 'mgr1',
    managerName: 'Алексей Воронов',
    revenueYTD: 980_000_000,
    revenuePrevYTD: 1_050_000_000,
    volumeYTD: 38_200_000_000,
    volumePrevYTD: 42_100_000_000,
    companiesCount: 6,
    activeCompaniesCount: 5,
    productsCount: 19,
    marketsCount: 6,
    healthScore: 74,
    riskScore: 38,
    growthPotential: 62,
    groupRank: 2,
    activityStatus: 'declining',
    lastContact: '2026-05-28',
    companies: [],
  },
  {
    id: 'h3',
    name: 'Газпром Финанс',
    shortName: 'Газпром',
    segment: 'PREMIUM',
    category: 'CORPORATION',
    industry: 'Энергетика',
    managerId: 'mgr2',
    managerName: 'Мария Соколова',
    revenueYTD: 760_000_000,
    revenuePrevYTD: 720_000_000,
    volumeYTD: 29_100_000_000,
    volumePrevYTD: 27_800_000_000,
    companiesCount: 5,
    activeCompaniesCount: 5,
    productsCount: 16,
    marketsCount: 5,
    healthScore: 88,
    riskScore: 18,
    growthPotential: 71,
    groupRank: 3,
    activityStatus: 'active',
    lastContact: '2026-06-02',
    companies: [],
  },
  {
    id: 'h4',
    name: 'Альфа-Банк Группа',
    shortName: 'Альфа-Банк',
    segment: 'PREMIUM',
    category: 'BANK',
    industry: 'Банковский сектор',
    managerId: 'mgr2',
    managerName: 'Мария Соколова',
    revenueYTD: 620_000_000,
    revenuePrevYTD: 580_000_000,
    volumeYTD: 22_400_000_000,
    volumePrevYTD: 20_100_000_000,
    companiesCount: 4,
    activeCompaniesCount: 4,
    productsCount: 14,
    marketsCount: 5,
    healthScore: 86,
    riskScore: 16,
    growthPotential: 78,
    groupRank: 4,
    activityStatus: 'active',
    lastContact: '2026-06-06',
    companies: [],
  },
  {
    id: 'h5',
    name: 'Россельхозбанк',
    shortName: 'РСХБ',
    segment: 'PREMIUM',
    category: 'BANK',
    industry: 'Банковский сектор',
    managerId: 'mgr3',
    managerName: 'Дмитрий Козлов',
    revenueYTD: 340_000_000,
    revenuePrevYTD: 410_000_000,
    volumeYTD: 14_200_000_000,
    volumePrevYTD: 18_300_000_000,
    companiesCount: 3,
    activeCompaniesCount: 2,
    productsCount: 9,
    marketsCount: 4,
    healthScore: 58,
    riskScore: 62,
    growthPotential: 44,
    groupRank: 8,
    activityStatus: 'declining',
    lastContact: '2026-05-10',
    companies: [],
  },
  {
    id: 'h6',
    name: 'Финам Группа',
    shortName: 'Финам',
    segment: 'STANDARD',
    category: 'BROKER',
    industry: 'Брокерский бизнес',
    managerId: 'mgr3',
    managerName: 'Дмитрий Козлов',
    revenueYTD: 185_000_000,
    revenuePrevYTD: 162_000_000,
    volumeYTD: 8_900_000_000,
    volumePrevYTD: 7_600_000_000,
    companiesCount: 3,
    activeCompaniesCount: 3,
    productsCount: 11,
    marketsCount: 4,
    healthScore: 79,
    riskScore: 24,
    growthPotential: 68,
    groupRank: 12,
    activityStatus: 'active',
    lastContact: '2026-06-04',
    companies: [],
  },
];

// =============================================
// COMPANIES
// =============================================
export const mockCompanies: Company[] = [
  {
    id: 'c1',
    name: 'ПАО Сбербанк',
    inn: '7707083893',
    ogrn: '1027700132195',
    holdingId: 'h1',
    holdingName: 'Группа Сбербанк',
    segment: 'STRATEGIC',
    category: 'BANK',
    industry: 'Банковский сектор',
    clientStatus: 'active',
    managerId: 'mgr1',
    managerName: 'Алексей Воронов',
    revenueYTD: 820_000_000,
    revenuePrevYTD: 740_000_000,
    volumeYTD: 32_000_000_000,
    volumePrevYTD: 27_500_000_000,
    activeProducts: ['Фондовый рынок', 'Срочный рынок', 'Валютный рынок', 'НКЦ Клиринг', 'НРД'],
    inactiveProducts: ['Товарный рынок'],
    markets: ['equity', 'derivatives', 'fx', 'clearing', 'depository'],
    healthScore: 94,
    riskScore: 10,
    growthPotential: 82,
    openRequests: 3,
    endClientsCount: 185000,
    lastContact: '2026-06-05',
    activityStatus: 'active',
  },
  {
    id: 'c2',
    name: 'Сбер Инвестиции',
    inn: '7736020209',
    ogrn: '1027739007570',
    holdingId: 'h1',
    holdingName: 'Группа Сбербанк',
    segment: 'STRATEGIC',
    category: 'ASSET_MANAGER',
    industry: 'Управление активами',
    clientStatus: 'active',
    managerId: 'mgr1',
    managerName: 'Алексей Воронов',
    revenueYTD: 420_000_000,
    revenuePrevYTD: 380_000_000,
    volumeYTD: 16_500_000_000,
    volumePrevYTD: 13_700_000_000,
    activeProducts: ['Фондовый рынок', 'Срочный рынок', 'Денежный рынок', 'НРД'],
    inactiveProducts: ['Валютный рынок', 'Товарный рынок'],
    markets: ['equity', 'derivatives', 'money', 'depository'],
    healthScore: 89,
    riskScore: 15,
    growthPotential: 87,
    openRequests: 1,
    endClientsCount: 48000,
    lastContact: '2026-06-03',
    activityStatus: 'active',
  },
  {
    id: 'c3',
    name: 'ВТБ Капитал',
    inn: '7702070139',
    ogrn: '1027739207462',
    holdingId: 'h2',
    holdingName: 'ВТБ Группа',
    segment: 'STRATEGIC',
    category: 'BANK',
    industry: 'Инвестиционный банкинг',
    clientStatus: 'active',
    managerId: 'mgr1',
    managerName: 'Алексей Воронов',
    revenueYTD: 560_000_000,
    revenuePrevYTD: 640_000_000,
    volumeYTD: 22_100_000_000,
    volumePrevYTD: 26_800_000_000,
    activeProducts: ['Фондовый рынок', 'Срочный рынок', 'Валютный рынок'],
    inactiveProducts: ['Денежный рынок', 'Товарный рынок'],
    markets: ['equity', 'derivatives', 'fx'],
    healthScore: 72,
    riskScore: 42,
    growthPotential: 58,
    openRequests: 7,
    endClientsCount: 72000,
    lastContact: '2026-05-28',
    activityStatus: 'declining',
  },
  {
    id: 'c4',
    name: 'Альфа-Банк',
    inn: '7728168971',
    ogrn: '1027700067328',
    holdingId: 'h4',
    holdingName: 'Альфа-Банк Группа',
    segment: 'PREMIUM',
    category: 'BANK',
    industry: 'Банковский сектор',
    clientStatus: 'active',
    managerId: 'mgr2',
    managerName: 'Мария Соколова',
    revenueYTD: 420_000_000,
    revenuePrevYTD: 390_000_000,
    volumeYTD: 15_600_000_000,
    volumePrevYTD: 14_200_000_000,
    activeProducts: ['Фондовый рынок', 'Валютный рынок', 'Денежный рынок', 'Срочный рынок'],
    inactiveProducts: ['Товарный рынок'],
    markets: ['equity', 'fx', 'money', 'derivatives'],
    healthScore: 87,
    riskScore: 16,
    growthPotential: 76,
    openRequests: 2,
    endClientsCount: 31000,
    lastContact: '2026-06-06',
    activityStatus: 'active',
  },
];

// =============================================
// PERSONS
// =============================================
export const mockPersons: Person[] = [
  {
    id: 'p1',
    fullName: 'Греф Герман Оскарович',
    firstName: 'Герман',
    lastName: 'Греф',
    title: 'Президент, Председатель Правления',
    companyId: 'c1',
    companyName: 'ПАО Сбербанк',
    holdingId: 'h1',
    holdingName: 'Группа Сбербанк',
    department: 'Правление',
    email: 'g.gref@sberbank.ru',
    phone: '+7 495 500-00-01',
    birthDate: '1964-02-26',
    personRole: 'decision_maker',
    influenceLevel: 'very_high',
    vipScore: 98,
    publicRole: 'Председатель Правления ПАО Сбербанк',
    industryCommittees: ['НАУФОР', 'ВЭФ', 'Совет при Президенте по цифровому развитию'],
    publicSpeaking: true,
    industrySignificance: 'very_high',
    groupRelationship: 'very_high',
    lastContact: '2026-05-20',
    meetingHistory: [
      {
        id: 'm1',
        date: '2026-05-20',
        topic: 'Стратегическое партнёрство 2026–2028',
        participants: ['Мосбиржа CEO', 'Греф Г.О.'],
        outcome: 'Согласованы ключевые направления сотрудничества',
        nextSteps: 'Подготовить дорожную карту к 15.06.2026',
      },
    ],
    interestedProducts: ['Фондовый рынок', 'Срочный рынок', 'Информационные сервисы'],
    managerNotes: 'Ключевой стратегический партнёр. Фокус на цифровой трансформации и AI.',
  },
  {
    id: 'p2',
    fullName: 'Костин Андрей Леонидович',
    firstName: 'Андрей',
    lastName: 'Костин',
    title: 'Президент-Председатель Правления',
    companyId: 'c3',
    companyName: 'ВТБ Капитал',
    holdingId: 'h2',
    holdingName: 'ВТБ Группа',
    department: 'Правление',
    email: 'a.kostin@vtb.ru',
    phone: '+7 495 739-77-99',
    birthDate: '1956-09-21',
    personRole: 'decision_maker',
    influenceLevel: 'very_high',
    vipScore: 95,
    publicRole: 'Председатель Наблюдательного совета ВТБ',
    industryCommittees: ['Наблюдательный совет ВТБ', 'РСПП'],
    publicSpeaking: true,
    industrySignificance: 'very_high',
    groupRelationship: 'high',
    lastContact: '2026-04-15',
    meetingHistory: [
      {
        id: 'm2',
        date: '2026-04-15',
        topic: 'Обсуждение снижения активности на срочном рынке',
        participants: ['Руководитель блока', 'Костин А.Л.'],
        outcome: 'Выявлены причины снижения',
        nextSteps: 'Встреча с командой продаж ВТБ Капитал до 30.06.2026',
      },
    ],
    interestedProducts: ['Фондовый рынок', 'Срочный рынок'],
    managerNotes: 'Внимание: снижение активности на срочном рынке. Требует эскалации на уровень блока.',
  },
  {
    id: 'p3',
    fullName: 'Иванова Наталья Сергеевна',
    firstName: 'Наталья',
    lastName: 'Иванова',
    title: 'Директор по инвестиционному обслуживанию',
    companyId: 'c4',
    companyName: 'Альфа-Банк',
    holdingId: 'h4',
    holdingName: 'Альфа-Банк Группа',
    department: 'Инвестиционный блок',
    email: 'n.ivanova@alfabank.ru',
    phone: '+7 495 788-88-88',
    birthDate: '1978-03-14',
    personRole: 'influencer',
    influenceLevel: 'high',
    vipScore: 72,
    industryCommittees: ['НАУФОР'],
    publicSpeaking: false,
    industrySignificance: 'high',
    groupRelationship: 'very_high',
    lastContact: '2026-06-06',
    meetingHistory: [],
    interestedProducts: ['Фондовый рынок', 'Денежный рынок', 'Аналитика'],
    managerNotes: 'Ключевой контакт по вопросам срочного и денежного рынков. Отвечает за решения по расширению продуктовой линейки.',
  },
  {
    id: 'p4',
    fullName: 'Петров Владимир Александрович',
    firstName: 'Владимир',
    lastName: 'Петров',
    title: 'Казначей',
    companyId: 'c4',
    companyName: 'Альфа-Банк',
    holdingId: 'h4',
    holdingName: 'Альфа-Банк Группа',
    department: 'Казначейство',
    email: 'v.petrov@alfabank.ru',
    phone: '+7 495 788-88-89',
    birthDate: '1982-07-22',
    personRole: 'user',
    influenceLevel: 'medium',
    vipScore: 55,
    industryCommittees: [],
    publicSpeaking: false,
    industrySignificance: 'medium',
    groupRelationship: 'high',
    lastContact: '2026-05-30',
    meetingHistory: [],
    interestedProducts: ['Валютный рынок', 'Денежный рынок'],
    managerNotes: 'Операционный контакт по FX и денежному рынку.',
  },
];

// =============================================
// ALERTS
// =============================================
export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    type: 'volume_decline',
    severity: 'critical',
    title: 'Падение оборотов на 28%',
    description: 'ВТБ Капитал: падение оборотов на фондовом рынке за последние 60 дней составило 28% по сравнению с аналогичным периодом прошлого года.',
    entityId: 'c3',
    entityName: 'ВТБ Капитал',
    entityType: 'company',
    source: 'ЕХД / Торговая система',
    date: '2026-06-09',
    recommendedAction: 'Встреча с руководством ВТБ Капитал. Выяснить причины снижения активности.',
    responsibleId: 'mgr1',
    responsibleName: 'Алексей Воронов',
    status: 'new',
  },
  {
    id: 'a2',
    type: 'expiring_certificate',
    severity: 'high',
    title: 'Истекает ключ СКЗИ через 14 дней',
    description: 'Сбер Инвестиции: ключ СКЗИ для торгово-клирингового шлюза истекает 23 июня 2026.',
    entityId: 'c2',
    entityName: 'Сбер Инвестиции',
    entityType: 'company',
    source: 'Service Desk / Биллинг',
    date: '2026-06-09',
    recommendedAction: 'Инициировать процедуру перевыпуска ключа. Задача уже создана.',
    responsibleId: 'mgr1',
    responsibleName: 'Алексей Воронов',
    status: 'in_progress',
  },
  {
    id: 'a3',
    type: 'no_contact',
    severity: 'high',
    title: 'Нет контакта более 40 дней',
    description: 'Россельхозбанк: последний контакт с ключевым представителем зафиксирован 30 апреля 2026.',
    entityId: 'h5',
    entityName: 'Россельхозбанк',
    entityType: 'holding',
    source: 'CRM / Журнал коммуникаций',
    date: '2026-06-09',
    recommendedAction: 'Запланировать встречу или звонок. Риск потери клиента.',
    responsibleId: 'mgr3',
    responsibleName: 'Дмитрий Козлов',
    status: 'new',
  },
  {
    id: 'a4',
    type: 'expiring_tariff',
    severity: 'medium',
    title: 'Истекает тарифный план через 21 день',
    description: 'Финам: тарифный план на рыночные данные истекает 30 июня 2026.',
    entityId: 'h6',
    entityName: 'Финам Группа',
    entityType: 'holding',
    source: 'Биллинг',
    date: '2026-06-08',
    recommendedAction: 'Направить предложение о пролонгации/обновлении тарифа.',
    responsibleId: 'mgr3',
    responsibleName: 'Дмитрий Козлов',
    status: 'new',
  },
  {
    id: 'a5',
    type: 'inactive_product',
    severity: 'medium',
    title: 'Продукт не используется 90+ дней',
    description: 'Альфа-Банк: срочный рынок подключён, но не использовался 92 дня.',
    entityId: 'c4',
    entityName: 'Альфа-Банк',
    entityType: 'company',
    source: 'ЕХД / Торговая система',
    date: '2026-06-07',
    recommendedAction: 'Выяснить причину неактивности. Провести обучение или предложить техническую поддержку.',
    responsibleId: 'mgr2',
    responsibleName: 'Мария Соколова',
    status: 'new',
  },
];

// =============================================
// TASKS
// =============================================
export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Подготовить стратегический brief к встрече с ВТБ Капитал',
    description: 'Анализ причин падения оборотов, подготовка предложений по восстановлению активности',
    type: 'meeting',
    priority: 'critical',
    status: 'in_progress',
    assigneeId: 'mgr1',
    assigneeName: 'Алексей Воронов',
    entityId: 'c3',
    entityName: 'ВТБ Капитал',
    entityType: 'company',
    dueDate: '2026-06-15',
    createdAt: '2026-06-09',
  },
  {
    id: 't2',
    title: 'Инициировать перевыпуск СКЗИ для Сбер Инвестиции',
    description: 'Ключ СКЗИ истекает 23 июня. Создать заявку в Service Desk.',
    type: 'document',
    priority: 'high',
    status: 'in_progress',
    assigneeId: 'mgr1',
    assigneeName: 'Алексей Воронов',
    entityId: 'c2',
    entityName: 'Сбер Инвестиции',
    entityType: 'company',
    dueDate: '2026-06-12',
    createdAt: '2026-06-08',
  },
  {
    id: 't3',
    title: 'Звонок Россельхозбанк — возобновить контакт',
    description: 'Нет контакта более 40 дней. Оценить риск снижения активности.',
    type: 'call',
    priority: 'high',
    status: 'open',
    assigneeId: 'mgr3',
    assigneeName: 'Дмитрий Козлов',
    entityId: 'h5',
    entityName: 'Россельхозбанк',
    entityType: 'holding',
    dueDate: '2026-06-11',
    createdAt: '2026-06-09',
  },
  {
    id: 't4',
    title: 'Направить предложение по тарифу Финам',
    description: 'Сформировать коммерческое предложение по пролонгации/обновлению тарифного плана',
    type: 'document',
    priority: 'medium',
    status: 'open',
    assigneeId: 'mgr3',
    assigneeName: 'Дмитрий Козлов',
    entityId: 'h6',
    entityName: 'Финам Группа',
    entityType: 'holding',
    dueDate: '2026-06-16',
    createdAt: '2026-06-09',
  },
  {
    id: 't5',
    title: 'Кросс-продажа: Товарный рынок для Газпром Финанс',
    description: 'Подготовить презентацию по товарному рынку. Потенциальный доход: +38 млн/год.',
    type: 'cross_sell',
    priority: 'high',
    status: 'open',
    assigneeId: 'mgr2',
    assigneeName: 'Мария Соколова',
    entityId: 'h3',
    entityName: 'Газпром Финанс',
    entityType: 'holding',
    dueDate: '2026-06-20',
    createdAt: '2026-06-07',
  },
];

// =============================================
// REVENUE METRICS (monthly)
// =============================================
export const mockRevenueMetrics: RevenueMetric[] = [
  { period: 'Янв', revenue: 1_820_000_000, prevRevenue: 1_650_000_000, volume: 68_000_000_000, prevVolume: 61_000_000_000 },
  { period: 'Фев', revenue: 1_640_000_000, prevRevenue: 1_520_000_000, volume: 61_000_000_000, prevVolume: 57_000_000_000 },
  { period: 'Мар', revenue: 2_100_000_000, prevRevenue: 1_900_000_000, volume: 78_000_000_000, prevVolume: 71_000_000_000 },
  { period: 'Апр', revenue: 1_980_000_000, prevRevenue: 1_820_000_000, volume: 74_000_000_000, prevVolume: 68_000_000_000 },
  { period: 'Май', revenue: 2_240_000_000, prevRevenue: 1_960_000_000, volume: 83_000_000_000, prevVolume: 73_000_000_000 },
  { period: 'Июн', revenue: 1_420_000_000, prevRevenue: 1_380_000_000, volume: 52_000_000_000, prevVolume: 51_000_000_000 },
];

// =============================================
// MARKET METRICS
// =============================================
export const mockMarketMetrics: MarketMetric[] = [
  { market: 'equity', marketLabel: 'Фондовый рынок', volumeYTD: 148_000_000_000, volumePrev: 132_000_000_000, revenueYTD: 3_200_000_000, revenuePrev: 2_900_000_000, clientsCount: 412, trend: 12 },
  { market: 'derivatives', marketLabel: 'Срочный рынок', volumeYTD: 92_000_000_000, volumePrev: 108_000_000_000, revenueYTD: 1_840_000_000, revenuePrev: 2_100_000_000, clientsCount: 287, trend: -14 },
  { market: 'fx', marketLabel: 'Валютный рынок', volumeYTD: 218_000_000_000, volumePrev: 198_000_000_000, revenueYTD: 2_180_000_000, revenuePrev: 1_980_000_000, clientsCount: 198, trend: 10 },
  { market: 'money', marketLabel: 'Денежный рынок', volumeYTD: 312_000_000_000, volumePrev: 290_000_000_000, revenueYTD: 1_560_000_000, revenuePrev: 1_450_000_000, clientsCount: 156, trend: 8 },
  { market: 'clearing', marketLabel: 'Клиринг', volumeYTD: 0, volumePrev: 0, revenueYTD: 1_120_000_000, revenuePrev: 980_000_000, clientsCount: 320, trend: 14 },
  { market: 'depository', marketLabel: 'Депозитарий', volumeYTD: 0, volumePrev: 0, revenueYTD: 840_000_000, revenuePrev: 790_000_000, clientsCount: 280, trend: 6 },
];

// =============================================
// PRODUCT USAGE
// =============================================
export const mockProductUsage: ProductUsage[] = [
  { id: 'pu1', productId: 'eq1', productName: 'Фондовый рынок', market: 'equity', companyId: 'c1', connected: true, active: true, connectedDate: '2012-03-01', lastUsed: '2026-06-09', volumeYTD: 32_000_000_000, revenueYTD: 820_000_000, growthPotential: 'medium', recommendation: 'Расширить использование алготрейдинга' },
  { id: 'pu2', productId: 'der1', productName: 'Срочный рынок', market: 'derivatives', companyId: 'c1', connected: true, active: true, connectedDate: '2012-03-01', lastUsed: '2026-06-09', volumeYTD: 8_200_000_000, revenueYTD: 164_000_000, growthPotential: 'high', recommendation: 'Увеличить лимиты для квалифицированных инвесторов' },
  { id: 'pu3', productId: 'fx1', productName: 'Валютный рынок', market: 'fx', companyId: 'c1', connected: true, active: true, connectedDate: '2014-06-15', lastUsed: '2026-06-09', volumeYTD: 18_400_000_000, revenueYTD: 184_000_000, growthPotential: 'low' },
  { id: 'pu4', productId: 'com1', productName: 'Товарный рынок', market: 'commodity', companyId: 'c1', connected: false, active: false, volumeYTD: 0, revenueYTD: 0, growthPotential: 'high', recommendation: 'Предложить подключение к товарному рынку' },
  { id: 'pu5', productId: 'der1', productName: 'Срочный рынок', market: 'derivatives', companyId: 'c4', connected: true, active: false, connectedDate: '2020-01-10', volumeYTD: 0, revenueYTD: 0, growthPotential: 'high', recommendation: 'Продукт не использовался 92 дня. Требует активации.' },
];

// =============================================
// AI INSIGHTS
// =============================================
export const mockAIInsights: AIInsight[] = [
  {
    id: 'ai1',
    type: 'summary',
    entityId: 'h2',
    entityType: 'holding',
    title: 'Сводка по ВТБ Группа',
    body: 'ВТБ Группа демонстрирует устойчивое снижение активности: оборот -9% YTD, доход -7% YTD. Основной драйвер — сокращение операций на срочном рынке (-28%). Ключевой контакт (Костин А.Л.) последний раз был встречен 54 дня назад. Рекомендую эскалацию на уровень руководителя блока и срочную встречу с командой ВТБ Капитал.',
    confidence: 88,
    generatedAt: '2026-06-09T08:00:00Z',
    tags: ['ВТБ', 'риск', 'снижение активности', 'срочный рынок'],
  },
  {
    id: 'ai2',
    type: 'opportunity',
    entityId: 'h1',
    entityType: 'holding',
    title: 'Возможности роста — Группа Сбербанк',
    body: 'Группа Сбербанк имеет высокий потенциал роста на трёх направлениях: (1) Товарный рынок — Сбербанк не подключён, потенциальный доход +120 млн/год; (2) Информационные сервисы — недоиспользование расширенных аналитических пакетов; (3) Срочный рынок у Сбер Инвестиции — рост YTD +21%, потенциал дальнейшего увеличения лимитов.',
    confidence: 84,
    generatedAt: '2026-06-09T08:05:00Z',
    tags: ['Сбербанк', 'рост', 'кросс-продажи', 'товарный рынок'],
  },
  {
    id: 'ai3',
    type: 'next_action',
    entityId: 'portfolio',
    entityType: 'portfolio',
    title: 'Топ-5 приоритетных действий сегодня',
    body: '1. ВТБ Капитал — эскалировать снижение оборотов, назначить встречу\n2. СКЗИ Сбер Инвестиции — подать заявку на перевыпуск (дедлайн 12 июня)\n3. Россельхозбанк — возобновить контакт, риск потери клиента\n4. Финам — направить предложение по тарифу до 16 июня\n5. Газпром Финанс — подготовить презентацию по товарному рынку',
    confidence: 95,
    generatedAt: '2026-06-09T08:10:00Z',
    tags: ['приоритеты', 'today'],
  },
  {
    id: 'ai4',
    type: 'cross_sell',
    entityId: 'h3',
    entityType: 'holding',
    title: 'Cross-sell: Товарный рынок для Газпром',
    body: 'Газпром Финанс — крупный игрок в энергетике, но не использует товарный рынок МБ. Потенциальный объём торгов: 2–4 млрд/год. Ожидаемый доход: 38–56 млн/год. Конкуренты уже используют CME и ICE. Рекомендую запустить пилотную сессию в III квартале 2026.',
    confidence: 79,
    generatedAt: '2026-06-09T08:15:00Z',
    tags: ['Газпром', 'кросс-продажа', 'товарный рынок'],
  },
];

// =============================================
// AGREEMENTS
// =============================================
export const mockAgreements: Agreement[] = [
  { id: 'ag1', title: 'Договор комиссии ПАО Сбербанк', type: 'contract', entityId: 'c1', entityName: 'ПАО Сбербанк', signedDate: '2018-01-15', expiresDate: '2027-01-14', status: 'active', responsible: 'Воронов А.И.', linkedTasks: [] },
  { id: 'ag2', title: 'Тарифный план Premium 2026', type: 'tariff', entityId: 'c1', entityName: 'ПАО Сбербанк', signedDate: '2026-01-01', expiresDate: '2026-12-31', status: 'active', responsible: 'Воронов А.И.', linkedTasks: [] },
  { id: 'ag3', title: 'Ключ СКЗИ — торгово-клиринговый шлюз', type: 'key', entityId: 'c2', entityName: 'Сбер Инвестиции', signedDate: '2025-06-23', expiresDate: '2026-06-23', status: 'expiring', responsible: 'Воронов А.И.', linkedTasks: ['t2'] },
  { id: 'ag4', title: 'Тарифный план рыночных данных', type: 'tariff', entityId: 'h6', entityName: 'Финам Группа', signedDate: '2025-06-30', expiresDate: '2026-06-30', status: 'expiring', responsible: 'Козлов Д.В.', linkedTasks: ['t4'] },
];

// =============================================
// NEWS
// =============================================
export const mockNews: NewsItem[] = [
  {
    id: 'n1',
    title: 'ВТБ сокращает долю операций на срочном рынке в пользу внебиржевых инструментов',
    date: '2026-06-07',
    source: 'РБК',
    category: 'company',
    entityIds: ['h2', 'c3'],
    relevance: 'high',
    sentiment: 'negative',
    summary: 'По данным источников, ВТБ перераспределяет ликвидность в пользу OTC-рынка. Это может объяснять снижение активности на срочном рынке МБ.',
  },
  {
    id: 'n2',
    title: 'Сбербанк планирует расширение AI-сервисов для институциональных клиентов',
    date: '2026-06-06',
    source: 'Интерфакс',
    category: 'company',
    entityIds: ['h1', 'c1'],
    relevance: 'high',
    sentiment: 'positive',
    summary: 'Сбербанк объявил о запуске AI-платформы для управления портфелем. Возможность интеграции с аналитическими сервисами МБ.',
  },
  {
    id: 'n3',
    title: 'ЦБ РФ: новые требования к капиталу брокеров вступают в силу с 1 июля',
    date: '2026-06-05',
    source: 'Банк России',
    category: 'regulatory',
    entityIds: [],
    relevance: 'high',
    sentiment: 'neutral',
    summary: 'Новые требования к капиталу могут повлиять на активность ряда брокеров на рынках МБ.',
  },
];

// =============================================
// STRATEGY ITEMS
// =============================================
export const mockStrategyItems: StrategyItem[] = [
  { id: 'si1', entityId: 'h2', entityName: 'ВТБ Группа', market: 'derivatives', marketLabel: 'Срочный рынок', currentVolume: 22_100_000_000, targetVolume: 30_000_000_000, revenueActual: 560_000_000, revenueTarget: 720_000_000, gap: -160_000_000, initiative: 'Восстановление активности на срочном рынке', owner: 'Блок клиентского бизнеса', status: 'behind', progress: 38 },
  { id: 'si2', entityId: 'h1', entityName: 'Сбербанк', market: 'commodity', marketLabel: 'Товарный рынок', currentVolume: 0, targetVolume: 2_000_000_000, revenueActual: 0, revenueTarget: 40_000_000, gap: -40_000_000, initiative: 'Подключение к товарному рынку', owner: 'PM Товарного рынка', status: 'at_risk', progress: 20 },
  { id: 'si3', entityId: 'h1', entityName: 'Сбербанк', market: 'equity', marketLabel: 'Фондовый рынок', currentVolume: 32_000_000_000, targetVolume: 36_000_000_000, revenueActual: 820_000_000, revenueTarget: 900_000_000, gap: -80_000_000, initiative: 'Расширение алготрейдинга', owner: 'Фондовый рынок', status: 'on_track', progress: 72 },
  { id: 'si4', entityId: 'h4', entityName: 'Альфа-Банк Группа', market: 'derivatives', marketLabel: 'Срочный рынок', currentVolume: 0, targetVolume: 1_500_000_000, revenueActual: 0, revenueTarget: 30_000_000, gap: -30_000_000, initiative: 'Активация срочного рынка', owner: 'Клиентский менеджер', status: 'at_risk', progress: 15 },
];

// =============================================
// PORTFOLIO (manager view)
// =============================================
export const mockPortfolios: Portfolio[] = [
  { managerId: 'mgr1', managerName: 'Алексей Воронов', holdingsCount: 4, companiesCount: 12, revenueYTD: 2_800_000_000, revenuePrev: 2_520_000_000, volumeYTD: 118_800_000_000, planFulfillment: 78, clientsAtRisk: 2, clientsWithOpportunity: 5, openTasks: 8, openAlerts: 4 },
  { managerId: 'mgr2', managerName: 'Мария Соколова', holdingsCount: 3, companiesCount: 8, revenueYTD: 1_565_000_000, revenuePrev: 1_420_000_000, volumeYTD: 65_400_000_000, planFulfillment: 84, clientsAtRisk: 1, clientsWithOpportunity: 4, openTasks: 5, openAlerts: 3 },
  { managerId: 'mgr3', managerName: 'Дмитрий Козлов', holdingsCount: 3, companiesCount: 7, revenueYTD: 735_000_000, revenuePrev: 780_000_000, volumeYTD: 28_100_000_000, planFulfillment: 64, clientsAtRisk: 3, clientsWithOpportunity: 2, openTasks: 9, openAlerts: 6 },
];

// =============================================
// GROWTH OPPORTUNITIES
// =============================================
export const mockOpportunities: GrowthOpportunity[] = [
  { id: 'go1', entityId: 'h1', entityName: 'Группа Сбербанк', type: 'cross_sell', product: 'Товарный рынок', market: 'commodity', potentialRevenue: 120_000_000, probability: 68, description: 'Сбербанк — крупнейший клиент без подключения к товарному рынку', recommendedAction: 'Подготовить презентацию и пилотную сессию', assigneeId: 'mgr1' },
  { id: 'go2', entityId: 'c3', entityName: 'ВТБ Капитал', type: 'reactivation', product: 'Срочный рынок', market: 'derivatives', potentialRevenue: 160_000_000, probability: 52, description: 'Восстановление активности на срочном рынке после снижения', recommendedAction: 'Встреча с топ-менеджментом, выяснение причин снижения', assigneeId: 'mgr1' },
  { id: 'go3', entityId: 'h3', entityName: 'Газпром Финанс', type: 'cross_sell', product: 'Товарный рынок', market: 'commodity', potentialRevenue: 56_000_000, probability: 74, description: 'Газпром активно торгует на ICE, аналогичная активность на МБ не реализована', recommendedAction: 'Провести презентацию продукта в III кв. 2026', assigneeId: 'mgr2' },
  { id: 'go4', entityId: 'c4', entityName: 'Альфа-Банк', type: 'reactivation', product: 'Срочный рынок', market: 'derivatives', potentialRevenue: 30_000_000, probability: 61, description: 'Срочный рынок подключён, не используется 92 дня', recommendedAction: 'Связаться с казначейством, предложить техническую помощь', assigneeId: 'mgr2' },
];

// =============================================
// EVENT PARTICIPATIONS
// =============================================
export const mockEventParticipations: EventParticipation[] = [
  { id: 'ep1', personId: 'p1', personName: 'Греф Герман Оскарович', companyName: 'ПАО Сбербанк', title: 'Президент', influenceLevel: 'very_high', vipScore: 98, relevanceScore: 96, lastContact: '2026-05-20', recommendedBy: 'Алексей Воронов', invitationStatus: 'recommended', relevantTopics: ['Цифровые активы', 'AI в финансах', 'Стратегия рынка'], priorityLevel: 'vip' },
  { id: 'ep2', personId: 'p2', personName: 'Костин Андрей Леонидович', companyName: 'ВТБ Капитал', title: 'Председатель Правления', influenceLevel: 'very_high', vipScore: 95, relevanceScore: 88, lastContact: '2026-04-15', recommendedBy: 'Алексей Воронов', invitationStatus: 'recommended', relevantTopics: ['Срочный рынок', 'Регуляторика', 'Банковский сектор'], priorityLevel: 'vip' },
  { id: 'ep3', personId: 'p3', personName: 'Иванова Наталья Сергеевна', companyName: 'Альфа-Банк', title: 'Директор инвестиционного обслуживания', influenceLevel: 'high', vipScore: 72, relevanceScore: 78, lastContact: '2026-06-06', recommendedBy: 'Мария Соколова', invitationStatus: 'invited', relevantTopics: ['Фондовый рынок', 'Денежный рынок', 'Аналитические сервисы'], priorityLevel: 'high' },
];

// =============================================
// OPERATIONS REQUESTS
// =============================================
export const mockOperationRequests: OperationRequest[] = [
  { id: 'or1', number: 'REQ-2026-4821', type: 'incident', title: 'Недоступность торгового шлюза FIX', clientName: 'ВТБ Капитал', priority: 'critical', status: 'in_progress', assignee: 'Тех. поддержка L2', department: 'ИТ', sla: 4, slaRemaining: 2, createdAt: '2026-06-09T09:15:00Z', updatedAt: '2026-06-09T10:30:00Z', description: 'Клиент сообщает о недоступности FIX-сессии с 09:10.' },
  { id: 'or2', number: 'REQ-2026-4819', type: 'request', title: 'Подключение нового торгового терминала', clientName: 'Финам', priority: 'medium', status: 'pending', assignee: 'Отдел подключений', department: 'Клиентский сервис', sla: 48, slaRemaining: 31, createdAt: '2026-06-08T14:00:00Z', updatedAt: '2026-06-09T08:00:00Z', description: 'Запрос на подключение нового торгового терминала Quik.' },
  { id: 'or3', number: 'REQ-2026-4810', type: 'document', title: 'Перевыпуск СКЗИ', clientName: 'Сбер Инвестиции', priority: 'high', status: 'in_progress', assignee: 'УКС / Регистрация', department: 'УКС', sla: 72, slaRemaining: 14, createdAt: '2026-06-08T11:00:00Z', updatedAt: '2026-06-09T09:00:00Z', description: 'Заявка на перевыпуск ключа СКЗИ для торгово-клирингового шлюза.' },
  { id: 'or4', number: 'REQ-2026-4802', type: 'request', title: 'Изменение торговых параметров', clientName: 'Россельхозбанк', priority: 'medium', status: 'overdue', assignee: 'Клиентский сервис', department: 'Клиентский сервис', sla: 24, slaRemaining: -8, createdAt: '2026-06-07T16:00:00Z', updatedAt: '2026-06-08T09:00:00Z', description: 'Запрос на изменение лимитов позиций по фондовому рынку.' },
];

// =============================================
// COHORTS
// =============================================
export const mockCohorts: Cohort[] = [
  {
    id: 'co1',
    name: 'Стратегические клиенты — риск снижения активности',
    description: 'Клиенты из сегмента STRATEGIC и PREMIUM с падением оборотов более 15% YTD',
    criteria: { segments: ['STRATEGIC', 'PREMIUM'], activityStatus: ['declining'] },
    clientIds: ['h2', 'h5'],
    createdBy: 'Алексей Воронов',
    createdAt: '2026-06-01',
    clientsCount: 2,
    avgRevenue: 660_000_000,
    avgVolume: 26_200_000_000,
  },
  {
    id: 'co2',
    name: 'Брокеры с высоким потенциалом кросс-продаж',
    description: 'Брокеры, не использующие товарный или срочный рынок',
    criteria: { categories: ['BROKER'], markets: ['commodity', 'derivatives'] },
    clientIds: ['h6'],
    createdBy: 'Мария Соколова',
    createdAt: '2026-05-28',
    clientsCount: 8,
    avgRevenue: 142_000_000,
    avgVolume: 6_800_000_000,
  },
];

// =============================================
// HELPER: Format numbers
// =============================================
export const formatRevenue = (v: number): string => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} млрд ₽`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)} млн ₽`;
  return `${v.toLocaleString('ru')} ₽`;
};

export const formatVolume = (v: number): string => {
  if (v >= 1_000_000_000_000) return `${(v / 1_000_000_000_000).toFixed(1)} трлн ₽`;
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} млрд ₽`;
  return `${(v / 1_000_000).toFixed(0)} млн ₽`;
};

export const formatPercent = (current: number, prev: number): string => {
  if (!prev) return '—';
  const diff = ((current - prev) / prev) * 100;
  return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
};
