export type AnalyticsAudience = 'crm' | 'broker';
export type RatingMetric = 'turnover' | 'clients' | 'auc';
export type RatingMode = 'absolute' | 'share';
export type TrendMode = 'rank' | 'absolute' | 'share';
export type LifecycleStage = 'acquisition' | 'activation' | 'churn' | 'retention' | 'portfolio';

export interface SegmentDefinition {
  aucGroups: string[];
  dimensions: Record<string, string[]>;
  cohort: { from: string; to: string };
  tradePeriod: { enabled: boolean; from: string; to: string };
}

export interface AnalyticsFilters {
  period: string;
  market: string;
  product: string;
  clientType: string;
  segment: string;
  peerGroup: string;
  metric: RatingMetric;
  segmentDefinition: SegmentDefinition;
}

export const defaultFilters: AnalyticsFilters = {
  period: '2025-01 — 2026-05',
  market: 'ALL',
  product: 'ALL',
  clientType: 'ФЛ',
  segment: 'Affluent + HNWI',
  peerGroup: 'Сопоставимые банки и брокеры',
  metric: 'turnover',
  segmentDefinition: {
    aucGroups: ['Affluent', 'HNWI'],
    dimensions: {
      accountStatus: ['Счёт открыт'], activation: [], churn: [],
      frequency: ['Раз в месяц'], tradingMode: ['Не HFT'], geography: ['Вся Россия'], region: [],
      brokerPresence: ['В нескольких брокерах'], walletRole: [], brokerCount: [],
      externalActivity: ['Активнее вне нас'],
    },
    cohort: { from: '2025-01', to: '2026-05' },
    tradePeriod: { enabled: false, from: '2025-01', to: '2026-05' },
  },
};

export const markets = [
  ['ALL', 'Все рынки'], ['EQUITY', 'Акции'], ['FUNDS', 'ПИФ / фонды'],
  ['BONDS', 'Облигации'], ['DERIVATIVES', 'Срочный рынок'], ['FX', 'Валютный рынок'],
  ['METALS', 'Драгоценные металлы'], ['MONEY', 'Денежный рынок'],
] as const;

export const productCatalog: Record<string, string[]> = {
  ALL: ['Все продукты'],
  EQUITY: ['Все продукты', 'Акции'],
  FUNDS: ['Все продукты', 'Инвестиционные паи', 'БПИФ / ETF'],
  BONDS: ['Все продукты', 'ОФЗ', 'Корпоративные облигации', 'Первичные размещения', 'Однодневные облигации'],
  DERIVATIVES: ['Все продукты', 'Индексные фьючерсы', 'Валютные фьючерсы', 'Товарные фьючерсы', 'Опционы'],
  FX: ['Все продукты', 'Спот TOD', 'Спот TOM', 'Свопы', 'Внебиржевая ликвидность'],
  METALS: ['Все продукты', 'Золото', 'Серебро'],
  MONEY: ['Все продукты', 'РЕПО с ЦК', 'Депозиты с ЦК', 'Кредитный рынок'],
};

export interface BrokerRankRow {
  officialRank: number;
  name: string;
  companyId?: string;
  clients: number;
  turnover: number;
  auc: number;
  previousRank: number;
}

const targets = {
  clients: { leader: 925.4, own: 688.2 },
  turnover: { leader: 4820.6, own: 3180.4 },
  auc: { leader: 4260.8, own: 2860.7 },
};
const ownRank = 5;
const decay = Object.fromEntries(Object.entries(targets).map(([key, value]) => [key, Math.pow(value.own / value.leader, 1 / (ownRank - 1))])) as Record<RatingMetric, number>;

export const brokerRanking: BrokerRankRow[] = Array.from({ length: 42 }, (_, index) => {
  const rank = index + 1;
  const own = rank === ownRank;
  return {
    officialRank: rank,
    name: own ? 'Альфа-Банк' : `Участник #${rank}`,
    companyId: own ? 'c4' : undefined,
    clients: own ? targets.clients.own : targets.clients.leader * Math.pow(decay.clients, index) * (1 + Math.sin(rank * 1.17) * .018),
    turnover: own ? targets.turnover.own : targets.turnover.leader * Math.pow(decay.turnover, index),
    auc: own ? targets.auc.own : targets.auc.leader * Math.pow(decay.auc, index) * (1 + Math.cos(rank * .91) * .014),
    previousRank: own ? 7 : Math.max(1, rank + (rank % 3 === 0 ? 1 : rank % 4 === 0 ? -1 : 0)),
  };
});

export const metricMeta: Record<RatingMetric, { label: string; unit: string }> = {
  turnover: { label: 'Оборот', unit: 'млрд ₽' },
  clients: { label: 'Клиенты', unit: 'тыс.' },
  auc: { label: 'AuC', unit: 'млрд ₽' },
};

export const trendMonths = [
  '2025-01',
  '2025-02',
  '2025-03',
  '2025-04',
  '2025-05',
  '2025-06',
  '2025-07',
  '2025-08',
  '2025-09',
  '2025-10',
  '2025-11',
  '2025-12',
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
];
const trendValues: Record<RatingMetric, { own: number[]; previous: number[]; peer: number[] }> = {
  clients: { own: [472,486,501,514,526,541,558,572,590,584,603,621,638,649,663,676,688.2], previous: [438,447,459,468,479,490,501,512,524,531,542,554,565,577,589,601,614], peer: [318,326,335,343,351,359,367,374,381,388,395,402,409,416,423,430,437] },
  turnover: { own: [1760,1940,2210,1860,2350,2490,2680,2310,2820,2540,2910,3060,2730,3240,2890,3370,3180.4], previous: [1580,1690,1870,1650,1980,2110,2250,2070,2380,2210,2470,2590,2440,2710,2520,2850,2740], peer: [940,1010,1080,990,1130,1190,1250,1180,1310,1270,1370,1420,1360,1480,1430,1540,1500] },
  auc: { own: [1750,1815,1760,1890,1980,2050,2140,2080,2250,2180,2320,2410,2350,2510,2630,2760,2860.7], previous: [1590,1640,1610,1710,1790,1860,1930,1910,2010,1980,2090,2160,2140,2240,2330,2420,2500], peer: [910,930,915,955,990,1020,1050,1040,1090,1080,1130,1160,1150,1200,1240,1280,1320] },
};

export const getTrendData = (metric: RatingMetric, mode: TrendMode) => trendMonths.map((month, index) => {
  if (mode === 'rank') return { month, own: [7,7,7,7,6,6,6,6,5,6,5,5,5,5,5,5,5][index], previous: [9,9,8,8,8,7,7,7,7,7,7,6,6,6,6,6,6][index], peer: 12 };
  const values = trendValues[metric];
  if (mode === 'share') {
    const factor = metric === 'turnover' ? 248 : metric === 'clients' ? 54 : 226;
    return { month, own: values.own[index] / factor, previous: values.previous[index] / factor, peer: values.peer[index] / factor };
  }
  return { month, own: values.own[index], previous: values.previous[index], peer: values.peer[index] };
});

export const lifecycleStages: Record<LifecycleStage, { label: string; title: string; copy: string; values: [string, string][]; own: number[]; peer: number[] }> = {
  acquisition: { label: 'Привлечение', title: 'Открытие счетов и доля в новом потоке', copy: 'После февральской просадки Альфа ускорила привлечение и второй месяц удерживает темп выше сильной группы.', values: [['Открыто у нас','126 тыс.'],['Доля в новом потоке','13,4%'],['К сильной группе','+4,8 п.п.']], own: [78,84,80,96,110,126], peer: [70,75,78,82,86,90] },
  activation: { label: 'Активация', title: 'Первая торговая активность за 30 и 90 дней', copy: 'Кампания марта улучшила 90-дневную активацию: Альфа впервые вышла выше медианы топ‑5.', values: [['Активировались','96,4 тыс.'],['Активация 90 дней','54%'],['Сильные участники','47%']], own: [38,41,39,45,49,54], peer: [42,43,44,45,46,47] },
  churn: { label: 'Отток', title: 'Спящие клиенты, обнуление AuC и закрытие счетов', copy: 'После пика в апреле отток снизился ниже уровня группы; риск сохраняется в HNWI на срочном рынке.', values: [['Стали спящими','27,8 тыс.'],['Обнулили AuC','10,6 тыс.'],['Закрыли счета','4,1 тыс.']], own: [18,16,19,17,21,15], peer: [14,14.5,14,14.8,15,15.2] },
  retention: { label: 'Удержание', title: 'Удержание по когортам открытия счёта', copy: 'Майские когорты восстановились после мартовского снижения и снова опережают сильную группу.', values: [['Вы','74%'],['Середина группы','64%'],['Сильные участники','70%']], own: [72,70,71,69,72,74], peer: [68,67,66,65,65,64] },
  portfolio: { label: 'Портфель', title: 'Структура портфеля и торговая глубина', copy: 'Рост AuC ускоряется, но конвертация активов в оборот остаётся главной точкой развития.', values: [['AuC HNWI+','1 184 млрд'],['Доля AuC','20,4%'],['Доля оборота','14,8%']], own: [15.6,16.4,15.9,17.8,19.1,20.4], peer: [13.2,13.5,13.1,13.6,13.9,14.2] },
};

export interface GroupProfile { name: string; clients: number; auc: number; activation: number; external: number; retention: number; dormant: number }
export const groupProfiles: Record<string, GroupProfile> = {
  affluent: { name: 'Affluent / HNWI', clients: 284, auc: 1184, activation: 54, external: 27, retention: 74, dormant: 15 },
  mass: { name: 'Mass / Mini Mass', clients: 404, auc: 1676.7, activation: 42.5, external: 18.8, retention: 66, dormant: 11.4 },
  external: { name: 'Активны у других', clients: 186, auc: 742.4, activation: 57.2, external: 100, retention: 68, dormant: 19.3 },
  dormant: { name: 'Спящие HNWI', clients: 48, auc: 318.7, activation: 15.4, external: 42.8, retention: 49, dormant: 100 },
};

export const portfolioBuckets = ['0%', '>0–5%', '5–10%', '10–25%', '25–50%', '50–75%', '75–100%'];
export const portfolioHeatmap = [
  [82,64,41,29,18,9,4], [78,66,44,31,20,10,5], [73,68,47,34,23,12,6],
  [69,70,51,38,26,14,7], [65,72,55,42,29,16,8], [61,74,59,46,33,18,10],
];

export const portfolioMarkets = [
  { market: 'Акции', clients: 512, aucShare: 34, turnoverShare: 29, potential: 180 },
  { market: 'Облигации', clients: 386, aucShare: 28, turnoverShare: 19, potential: 145 },
  { market: 'Фонды', clients: 248, aucShare: 15, turnoverShare: 11, potential: 96 },
  { market: 'Валюта', clients: 146, aucShare: 9, turnoverShare: 18, potential: 95 },
  { market: 'Денежный', clients: 38, aucShare: 8, turnoverShare: 13, potential: 130 },
  { market: 'Срочный', clients: 74, aucShare: 6, turnoverShare: 10, potential: 210 },
];
