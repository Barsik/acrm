// Данные и типы вкладки «Рейтинг» карточки клиента.
// Портировано из прототипа acrm.gromov.space (companies/:id?tab=ranking).

export const fmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });

export type RankingMetric = 'clients' | 'turnover' | 'auc';
export type ValueMode = 'absolute' | 'share';
export type DynamicsMode = 'rank' | 'absolute' | 'share';
export type RankingAudience = 'crm' | 'broker';

export type DimensionKey =
  | 'accountStatus' | 'activation' | 'churn' | 'frequency' | 'tradingMode'
  | 'geography' | 'region' | 'brokerPresence' | 'walletRole' | 'brokerCount' | 'externalActivity';

export type SegmentDimensions = Record<DimensionKey, string[]>;

export interface SegmentDefinition {
  aucGroups: string[];
  dimensions: SegmentDimensions;
  cohort: { from: string; to: string };
  tradePeriod: { enabled: boolean; from: string; to: string };
}

export interface RankingFilters {
  period: string;
  market: string;
  product: string;
  clientType: string;
  segment: string;
  peerGroup: string;
  metric: RankingMetric;
  segmentDefinition: SegmentDefinition;
}

export const DEFAULT_RANKING_FILTERS: RankingFilters = {
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
      accountStatus: ['Счёт открыт'],
      activation: [],
      churn: [],
      frequency: ['Раз в месяц'],
      tradingMode: ['Не HFT'],
      geography: ['Вся Россия'],
      region: [],
      brokerPresence: ['В нескольких брокерах'],
      walletRole: [],
      brokerCount: [],
      externalActivity: ['Активнее вне нас'],
    },
    cohort: { from: '2025-01', to: '2026-05' },
    tradePeriod: { enabled: false, from: '2025-01', to: '2026-05' },
  },
};

export const RANKING_MARKETS: [string, string][] = [
  ['ALL', 'Все рынки'],
  ['EQUITY', 'Акции'],
  ['FUNDS', 'ПИФ / фонды'],
  ['BONDS', 'Облигации'],
  ['DERIVATIVES', 'Срочный рынок'],
  ['FX', 'Валютный рынок'],
  ['METALS', 'Драгоценные металлы'],
  ['MONEY', 'Денежный рынок'],
];

export const RANKING_PRODUCTS: Record<string, string[]> = {
  ALL: ['Все продукты'],
  EQUITY: ['Все продукты', 'Акции'],
  FUNDS: ['Все продукты', 'Инвестиционные паи', 'БПИФ / ETF'],
  BONDS: ['Все продукты', 'ОФЗ', 'Корпоративные облигации', 'Первичные размещения', 'Однодневные облигации'],
  DERIVATIVES: ['Все продукты', 'Индексные фьючерсы', 'Валютные фьючерсы', 'Товарные фьючерсы', 'Опционы'],
  FX: ['Все продукты', 'Спот TOD', 'Спот TOM', 'Свопы', 'Внебиржевая ликвидность'],
  METALS: ['Все продукты', 'Золото', 'Серебро'],
  MONEY: ['Все продукты', 'РЕПО с ЦК', 'Депозиты с ЦК', 'Кредитный рынок'],
};

export const METRIC_META: Record<RankingMetric, { label: string; unit: string }> = {
  turnover: { label: 'Оборот', unit: 'млрд ₽' },
  clients: { label: 'Клиенты', unit: 'тыс.' },
  auc: { label: 'AuC', unit: 'млрд ₽' },
};

// ── Участники официального рэнкинга ──────────────────────────
const BENCHMARKS: Record<RankingMetric, { leader: number; own: number }> = {
  clients: { leader: 925.4, own: 688.2 },
  turnover: { leader: 4820.6, own: 3180.4 },
  auc: { leader: 4260.8, own: 2860.7 },
};

export const OWN_RANK = 5;
export const PARTICIPANTS_TOTAL = 42;

const decay = Object.fromEntries(
  (Object.entries(BENCHMARKS) as [RankingMetric, { leader: number; own: number }][])
    .map(([metric, v]) => [metric, (v.own / v.leader) ** (1 / (OWN_RANK - 1))]),
) as Record<RankingMetric, number>;

export interface RankingParticipant {
  officialRank: number;
  name: string;
  isOwn: boolean;
  clients: number;
  turnover: number;
  auc: number;
  previousRank: number;
}

export const rankingParticipants: RankingParticipant[] = Array.from({ length: PARTICIPANTS_TOTAL }, (_, i) => {
  const rank = i + 1;
  const isOwn = rank === OWN_RANK;
  return {
    officialRank: rank,
    name: isOwn ? 'Альфа-Банк' : `Участник #${rank}`,
    isOwn,
    clients: isOwn
      ? BENCHMARKS.clients.own
      : BENCHMARKS.clients.leader * decay.clients ** i * (1 + Math.sin(rank * 1.17) * 0.018),
    turnover: isOwn ? BENCHMARKS.turnover.own : BENCHMARKS.turnover.leader * decay.turnover ** i,
    auc: isOwn
      ? BENCHMARKS.auc.own
      : BENCHMARKS.auc.leader * decay.auc ** i * (1 + Math.cos(rank * 0.91) * 0.014),
    previousRank: isOwn ? 7 : Math.max(1, rank + (rank % 3 === 0 ? 1 : rank % 4 === 0 ? -1 : 0)),
  };
});

// ── Динамика метрик по месяцам ────────────────────────────────
export const RANKING_MONTHS = [
  '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
  '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05',
];

const DYNAMICS_SERIES: Record<RankingMetric, { own: number[]; previous: number[]; peer: number[] }> = {
  clients: {
    own: [472, 486, 501, 514, 526, 541, 558, 572, 590, 584, 603, 621, 638, 649, 663, 676, 688.2],
    previous: [438, 447, 459, 468, 479, 490, 501, 512, 524, 531, 542, 554, 565, 577, 589, 601, 614],
    peer: [318, 326, 335, 343, 351, 359, 367, 374, 381, 388, 395, 402, 409, 416, 423, 430, 437],
  },
  turnover: {
    own: [1760, 1940, 2210, 1860, 2350, 2490, 2680, 2310, 2820, 2540, 2910, 3060, 2730, 3240, 2890, 3370, 3180.4],
    previous: [1580, 1690, 1870, 1650, 1980, 2110, 2250, 2070, 2380, 2210, 2470, 2590, 2440, 2710, 2520, 2850, 2740],
    peer: [940, 1010, 1080, 990, 1130, 1190, 1250, 1180, 1310, 1270, 1370, 1420, 1360, 1480, 1430, 1540, 1500],
  },
  auc: {
    own: [1750, 1815, 1760, 1890, 1980, 2050, 2140, 2080, 2250, 2180, 2320, 2410, 2350, 2510, 2630, 2760, 2860.7],
    previous: [1590, 1640, 1610, 1710, 1790, 1860, 1930, 1910, 2010, 1980, 2090, 2160, 2140, 2240, 2330, 2420, 2500],
    peer: [910, 930, 915, 955, 990, 1020, 1050, 1040, 1090, 1080, 1130, 1160, 1150, 1200, 1240, 1280, 1320],
  },
};

const RANK_HISTORY = {
  own: [7, 7, 7, 7, 6, 6, 6, 6, 5, 6, 5, 5, 5, 5, 5, 5, 5],
  previous: [9, 9, 8, 8, 8, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6],
};

export interface DynamicsPoint {
  month: string;
  own: number;
  previous: number;
  peer: number;
}

export const buildDynamics = (metric: RankingMetric, mode: DynamicsMode): DynamicsPoint[] =>
  RANKING_MONTHS.map((month, i) => {
    if (mode === 'rank') {
      return { month, own: RANK_HISTORY.own[i], previous: RANK_HISTORY.previous[i], peer: 12 };
    }
    const series = DYNAMICS_SERIES[metric];
    if (mode === 'share') {
      const total = metric === 'turnover' ? 248 : metric === 'clients' ? 54 : 226;
      return { month, own: series.own[i] / total, previous: series.previous[i] / total, peer: series.peer[i] / total };
    }
    return { month, own: series.own[i], previous: series.previous[i], peer: series.peer[i] };
  });

export const formatMetricValue = (metric: RankingMetric, value: number, mode: ValueMode, total: number): string =>
  mode === 'share' ? `${fmt.format((value / total) * 100)}%` : `${fmt.format(value)} ${METRIC_META[metric].unit}`;

// ── Пир-группы ────────────────────────────────────────────────
export const PEER_GROUPS = [
  'Все участники',
  'Топ-5',
  'Сопоставимые банки и брокеры',
  'Середина группы',
  'Сильные участники',
];

export const PEER_GROUP_SIZES: Record<string, number> = {
  'Все участники': 42,
  'Топ-5': 5,
  'Сопоставимые банки и брокеры': 12,
  'Середина группы': 18,
  'Сильные участники': 9,
};

export const RANKING_REGIONS = [
  'Москва', 'Санкт-Петербург', 'Московская область', 'Ленинградская область',
  'Республика Татарстан', 'Республика Башкортостан', 'Краснодарский край',
  'Красноярский край', 'Пермский край', 'Приморский край', 'Хабаровский край',
  'Свердловская область', 'Новосибирская область', 'Нижегородская область',
  'Самарская область', 'Ростовская область', 'Челябинская область',
  'Воронежская область', 'Омская область', 'Волгоградская область',
];
