// Данные и хелперы вкладки «Аналитика портфеля» карточки клиента.
// Портировано из прототипа acrm.gromov.space (companies/:id?tab=portfolio_analytics).
import { RANKING_MONTHS } from '../ranking/rankingData';

export type SeriesKey = 'own' | 't' | 'sber' | 'vtb' | 'other' | 'market';

export const PRE_MONTHS = RANKING_MONTHS.length - 6; // достроенные месяцы перед «живыми» шестью

// ── Достройка рядов на весь период ────────────────────────────
const LEVEL_TREND = [0.72, 0.79, 0.755, 0.835, 0.8, 0.88, 0.84, 0.915, 0.87, 0.95, 0.915];

const LEVEL_NOISE: Record<SeriesKey, number[]> = {
  own: [-0.01, 0.015, -0.005, 0.02, -0.02, 0.025, -0.01, 0.015, -0.025, 0.03, -0.01],
  t: [0.02, -0.005, 0.015, -0.01, 0.02, -0.015, 0.025, -0.02, 0.02, -0.01, 0.025],
  sber: [-0.015, 0.025, -0.01, 0.015, -0.005, 0.01, -0.02, 0.03, -0.01, 0.015, -0.02],
  vtb: [0.01, -0.02, 0.025, -0.005, 0.015, 0.02, -0.015, 0.005, 0.025, -0.02, 0.015],
  other: [0, 0.01, -0.02, 0.025, -0.01, -0.005, 0.015, -0.01, 0.01, 0.005, 0],
  market: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export const levelFactor = (i: number, key: SeriesKey = 'market') => LEVEL_TREND[i] + LEVEL_NOISE[key][i];

/** Достраивает ряд из последних 6 значений до полного периода (уровневые метрики). */
export const extendLevel = (last6: number[], key: SeriesKey = 'market'): number[] => [
  ...Array.from({ length: PRE_MONTHS }, (_, i) => last6[0] * levelFactor(i, key)),
  ...last6,
];

const PCT_TREND = [-6.2, -5.1, -5.8, -4.3, -5, -3.7, -4.4, -2.9, -3.6, -2.1, -1.5];

const PCT_NOISE: Record<SeriesKey, number[]> = {
  own: [-0.6, 0.5, -0.2, 0.8, -0.7, 0.9, -0.4, 0.7, -0.8, 0.6, -0.3],
  t: [0.5, -0.4, 0.6, -0.3, 0.7, -0.5, 0.8, -0.6, 0.5, -0.4, 0.4],
  sber: [-0.3, 0.7, -0.5, 0.4, -0.2, 0.5, -0.6, 0.8, -0.4, 0.3, -0.5],
  vtb: [0.4, -0.6, 0.7, -0.2, 0.5, 0.8, -0.5, 0.2, 0.6, -0.7, 0.3],
  other: [0, 0.3, -0.6, 0.6, -0.4, 0.2, 0.5, -0.3, 0.4, 0.1, 0],
  market: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

/** Достраивает процентный ряд из последних 6 значений до полного периода. */
export const extendPct = (last6: number[], key: SeriesKey = 'market'): number[] => [
  ...Array.from({ length: PRE_MONTHS }, (_, i) => Math.max(0, last6[0] + PCT_TREND[i] + PCT_NOISE[key][i])),
  ...last6,
];

// ── Этапы клиентского цикла (view «Динамика портфеля») ────────
export type LifecycleStage = 'acquisition' | 'activation' | 'portfolio' | 'churn';

export const LIFECYCLE_STAGES: LifecycleStage[] = ['acquisition', 'activation', 'portfolio', 'churn'];

export const STAGE_LABELS: Record<LifecycleStage, string> = {
  acquisition: 'Привлечение',
  activation: 'Активация',
  portfolio: 'Активность',
  churn: 'Отток',
};

// Привлечение: открытия за месяц (последние 6 «живых» месяцев)
export interface AcquisitionRow {
  month: string;
  ownAccounts: number; ownClients: number;
  tAccounts: number; tClients: number;
  sberAccounts: number; sberClients: number;
  vtbAccounts: number; vtbClients: number;
  otherAccounts: number; otherClients: number;
}

const ACQUISITION_BASE: AcquisitionRow[] = [
  { month: '2025-12', ownAccounts: 25.4, ownClients: 21.8, tAccounts: 52.8, tClients: 44.6, sberAccounts: 47.2, sberClients: 39.7, vtbAccounts: 35.6, vtbClients: 29.8, otherAccounts: 96, otherClients: 80.4 },
  { month: '2026-01', ownAccounts: 28.8, ownClients: 24.6, tAccounts: 55.4, tClients: 46.8, sberAccounts: 48.6, sberClients: 40.9, vtbAccounts: 36.8, vtbClients: 30.7, otherAccounts: 98.2, otherClients: 82.1 },
  { month: '2026-02', ownAccounts: 26.7, ownClients: 22.9, tAccounts: 49.1, tClients: 41.5, sberAccounts: 45.3, sberClients: 38.2, vtbAccounts: 33.9, vtbClients: 28.4, otherAccounts: 91.7, otherClients: 76.8 },
  { month: '2026-03', ownAccounts: 33.4, ownClients: 28.7, tAccounts: 58.7, tClients: 49.4, sberAccounts: 51.9, sberClients: 43.6, vtbAccounts: 39.5, vtbClients: 32.9, otherAccounts: 103.4, otherClients: 86.5 },
  { month: '2026-04', ownAccounts: 39.2, ownClients: 33.8, tAccounts: 61.3, tClients: 51.5, sberAccounts: 54.2, sberClients: 45.5, vtbAccounts: 41.8, vtbClients: 34.8, otherAccounts: 108.8, otherClients: 91 },
  { month: '2026-05', ownAccounts: 43.7, ownClients: 37.9, tAccounts: 63.1, tClients: 53, sberAccounts: 56.8, sberClients: 47.7, vtbAccounts: 43.2, vtbClients: 36, otherAccounts: 112.4, otherClients: 94.1 },
];

export const acquisitionRows: AcquisitionRow[] = [
  ...RANKING_MONTHS.slice(0, -6).map((month, i) => {
    const base = ACQUISITION_BASE[0];
    return {
      month,
      ownAccounts: base.ownAccounts * levelFactor(i, 'own'),
      ownClients: base.ownClients * levelFactor(i, 'own'),
      tAccounts: base.tAccounts * levelFactor(i, 't'),
      tClients: base.tClients * levelFactor(i, 't'),
      sberAccounts: base.sberAccounts * levelFactor(i, 'sber'),
      sberClients: base.sberClients * levelFactor(i, 'sber'),
      vtbAccounts: base.vtbAccounts * levelFactor(i, 'vtb'),
      vtbClients: base.vtbClients * levelFactor(i, 'vtb'),
      otherAccounts: base.otherAccounts * levelFactor(i, 'other'),
      otherClients: base.otherClients * levelFactor(i, 'other'),
    };
  }),
  ...ACQUISITION_BASE,
];

// Активация: конверсия в первую активность по этапам
export type ActivationStage = 'funding' | 'trade30' | 'trade90';

export const ACTIVATION_LABELS: Record<ActivationStage, string> = {
  funding: 'Активации',
  trade30: 'Активации в первые 30 дней после открытия',
  trade90: 'Активации в первые 90 дней после открытия',
};

export const activationRates: Record<ActivationStage, Record<Exclude<SeriesKey, 'market'>, number[]>> = {
  funding: {
    own: extendPct([58, 61, 59, 66, 70, 72], 'own'),
    t: extendPct([68, 67, 66, 69, 70, 71], 't'),
    sber: extendPct([64, 65, 63, 66, 67, 68], 'sber'),
    vtb: extendPct([57, 59, 58, 60, 61, 62], 'vtb'),
    other: extendPct([59, 60, 58, 61, 62, 63], 'other'),
  },
  trade30: {
    own: extendPct([31, 34, 32, 38, 43, 47], 'own'),
    t: extendPct([41, 40, 39, 41, 42, 43], 't'),
    sber: extendPct([37, 38, 36, 39, 40, 41], 'sber'),
    vtb: extendPct([32, 34, 33, 35, 36, 37], 'vtb'),
    other: extendPct([33, 34, 32, 35, 36, 37], 'other'),
  },
  trade90: {
    own: extendPct([40, 43, 41, 48, 52, 56], 'own'),
    t: extendPct([53, 52, 51, 53, 54, 55], 't'),
    sber: extendPct([49, 50, 48, 51, 52, 53], 'sber'),
    vtb: extendPct([43, 45, 44, 46, 47, 48], 'vtb'),
    other: extendPct([44, 45, 43, 46, 47, 48], 'other'),
  },
};

// Активность портфеля: оборот / AuC / MAU
export type PortfolioMetric = 'turnover' | 'auc' | 'mau';

export const PORTFOLIO_LABELS: Record<PortfolioMetric, string> = {
  turnover: 'Оборот', auc: 'AuC', mau: 'MAU клиентов',
};

export const PORTFOLIO_UNITS: Record<PortfolioMetric, string> = {
  turnover: 'млрд ₽', auc: 'млрд ₽', mau: 'тыс.',
};

export const portfolioSeries: Record<PortfolioMetric, Record<Exclude<SeriesKey, 'market'>, number[]>> = {
  turnover: {
    own: extendLevel([1980, 2280, 2050, 2540, 2960, 3180], 'own'),
    t: extendLevel([3920, 4280, 3810, 4470, 4680, 4821], 't'),
    sber: extendLevel([3650, 3890, 3520, 4060, 4310, 4470], 'sber'),
    vtb: extendLevel([2860, 3070, 2760, 3290, 3480, 3610], 'vtb'),
    other: extendLevel([8240, 8860, 7960, 9340, 9820, 10180], 'other'),
  },
  auc: {
    own: extendLevel([2210, 2250, 2170, 2420, 2640, 2861], 'own'),
    t: extendLevel([3650, 3720, 3590, 3890, 4080, 4261], 't'),
    sber: extendLevel([3380, 3440, 3310, 3590, 3780, 3920], 'sber'),
    vtb: extendLevel([2640, 2690, 2580, 2810, 2960, 3070], 'vtb'),
    other: extendLevel([7620, 7750, 7480, 8120, 8510, 8840], 'other'),
  },
  mau: {
    own: extendLevel([420, 438, 425, 486, 553, 610], 'own'),
    t: extendLevel([760, 781, 748, 806, 842, 875], 't'),
    sber: extendLevel([690, 708, 681, 736, 771, 802], 'sber'),
    vtb: extendLevel([548, 562, 539, 582, 609, 632], 'vtb'),
    other: extendLevel([1480, 1516, 1450, 1570, 1640, 1705], 'other'),
  },
};

// Отток: спящие / обнуление AuC / закрытие счетов
export type ChurnEvent = 'dormant' | 'zeroAuc' | 'closed';

export const CHURN_LABELS: Record<ChurnEvent, string> = {
  dormant: 'Стали спящими', zeroAuc: 'Обнулили AuC', closed: 'Закрыли счёт',
};

export const churnSeries: Record<ChurnEvent, Record<Exclude<SeriesKey, 'market'>, number[]>> = {
  dormant: {
    own: extendLevel([7.8, 7.1, 8.4, 7.6, 9.2, 6.8], 'own'),
    t: extendLevel([12.8, 12.1, 13.4, 12.7, 14, 12.3], 't'),
    sber: extendLevel([11.4, 10.9, 12, 11.3, 12.6, 11.1], 'sber'),
    vtb: extendLevel([8.9, 8.4, 9.3, 8.8, 9.7, 8.6], 'vtb'),
    other: extendLevel([25.8, 24.6, 27.1, 25.9, 28.4, 25.2], 'other'),
  },
  zeroAuc: {
    own: extendLevel([3.2, 2.8, 3.6, 3.1, 4, 2.5], 'own'),
    t: extendLevel([5.8, 5.4, 6.1, 5.7, 6.4, 5.5], 't'),
    sber: extendLevel([4.9, 4.6, 5.2, 4.8, 5.5, 4.7], 'sber'),
    vtb: extendLevel([3.7, 3.4, 3.9, 3.6, 4.2, 3.5], 'vtb'),
    other: extendLevel([10.9, 10.1, 11.5, 10.7, 12, 10.3], 'other'),
  },
  closed: {
    own: extendLevel([1.25, 1.1, 1.4, 1.2, 1.55, 0.95], 'own'),
    t: extendLevel([2.6, 2.4, 2.8, 2.5, 3, 2.3], 't'),
    sber: extendLevel([2.2, 2, 2.4, 2.1, 2.6, 2], 'sber'),
    vtb: extendLevel([1.65, 1.5, 1.8, 1.6, 1.95, 1.45], 'vtb'),
    other: extendLevel([5.1, 4.7, 5.5, 5, 5.9, 4.6], 'other'),
  },
};

// ── Матрица «AuC-группа × частота сделок» (view «Структура») ──
export type MatrixMetric = 'clients' | 'turnover' | 'auc';

export const MATRIX_META: Record<MatrixMetric, { label: string; unit: string }> = {
  clients: { label: 'Клиенты', unit: 'тыс.' },
  turnover: { label: 'Оборот', unit: 'млрд ₽' },
  auc: { label: 'AuC', unit: 'млрд ₽' },
};

export const FREQUENCIES = [
  'Реже раза в год (спящие)', 'Раз в год', 'Раз в квартал', 'Раз в месяц', 'Ежедневно',
];

export interface AucGroupRow {
  group: string;
  range: string;
  values: number[]; // клиенты (тыс.) по частотам
}

export const AUC_GROUPS: AucGroupRow[] = [
  { group: 'UHNWI', range: '> 500 млн ₽', values: [8.24, 5.579, 3.763, 2.465, 1.168] },
  { group: 'HNWI', range: '50–500 млн ₽', values: [68.4, 44.634, 30.102, 19.722, 9.342] },
  { group: 'Affluent', range: '5–50 млн ₽', values: [440.8, 316.158, 213.222, 139.698, 66.173] },
  { group: 'Mass', range: '0,5–5 млн ₽', values: [1450.6, 1190.24, 802.72, 525.92, 249.12] },
  { group: 'Mini Mass', range: '< 500 тыс. ₽', values: [2600.4, 2157.31, 1454.93, 953.23, 451.53] },
];

const AUC_MULT = [820, 180, 18, 2.1, 0.28];             // AuC на клиента по AuC-группе
const FREQ_TURNOVER_MULT = [0.12, 0.8, 2.4, 7.2, 22];   // оборот по частоте
const GROUP_TURNOVER_MULT = [4.2, 3.1, 2, 1.15, 0.65];  // оборот по AuC-группе

export const buildMatrix = (metric: MatrixMetric): number[][] =>
  AUC_GROUPS.map((row, gi) =>
    row.values.map((v, fi) =>
      metric === 'clients' ? v : metric === 'auc' ? v * AUC_MULT[gi] : v * FREQ_TURNOVER_MULT[fi] * GROUP_TURNOVER_MULT[gi],
    ),
  );

export interface MatrixSelection {
  type: 'all' | 'row' | 'column' | 'cell';
  row?: number;
  col?: number;
}

export const selectionValue = (matrix: number[][], sel: MatrixSelection): number =>
  sel.type === 'all'
    ? matrix.reduce((sum, row) => sum + row.reduce((s, v) => s + v, 0), 0)
    : sel.type === 'row'
      ? matrix[sel.row ?? 0].reduce((s, v) => s + v, 0)
      : sel.type === 'column'
        ? matrix.reduce((s, row) => s + row[sel.col ?? 0], 0)
        : matrix[sel.row ?? 0][sel.col ?? 0];

export const selectionOwnShare = (sel: MatrixSelection): number =>
  sel.type === 'all' ? 12.5 : 10.8 + (sel.row ?? 2) * 0.65 + (sel.col ?? 2) * 0.3;

// ── Внешний портфель ──────────────────────────────────────────
// Доли ролей в кошельке [Только у нас, Основной, Второй, Периферийный]
export const roleShares: Record<MatrixMetric, number[]> = {
  clients: [42, 21, 22, 15],
  turnover: [31, 28, 25, 16],
  auc: [38, 30, 20, 12],
};

export const roleHistory: Record<MatrixMetric, number[][]> = {
  clients: [
    [47, 17, 21, 15], [46, 19, 20, 15], [47, 18, 21, 14],
    [44, 20, 21, 15], [43, 19, 23, 15], [42, 21, 22, 15],
  ],
  turnover: [
    [35, 24, 24, 17], [33, 27, 23, 17], [34, 25, 25, 16],
    [31, 29, 24, 16], [32, 26, 26, 16], [31, 28, 25, 16],
  ],
  auc: [
    [33, 27, 23, 17], [35, 28, 21, 16], [34, 27, 23, 16],
    [37, 30, 20, 13], [36, 29, 21, 14], [38, 30, 20, 12],
  ],
};

// Совокупный кошелёк сегмента (все брокеры / у нас)
export const walletTotals = {
  turnover: {
    total: extendLevel([4450, 4930, 4210, 5120, 5350, 5420], 'market'),
    ours: extendLevel([2440, 2700, 2210, 2890, 3060, 3180], 'own'),
  },
  auc: {
    total: extendLevel([1710, 1775, 1690, 1850, 1930, 1980], 'market'),
    ours: extendLevel([1e3, 1040, 970, 1070, 1130, 1184], 'own'),
  },
};

export const WALLET_SCALE_DIVISOR: Record<'turnover' | 'auc', number> = {
  turnover: 2011.6512,
  auc: 2514.564,
};

// Масштаб выбранного сегмента по месяцам (для «роль в кошельке»)
export const WALLET_TREND = [
  0.82, 0.85, 0.83, 0.88, 0.9, 0.92, 0.89, 0.94, 0.93, 0.97, 0.96, 0.95, 0.98, 0.96, 1.01, 0.99, 1,
];

// Сколько брокеров использует клиент: стартовые доли по метрике
export const brokerCountStart: Record<MatrixMetric, number[]> = {
  clients: [42, 31, 19, 8],
  turnover: [31, 34, 23, 12],
  auc: [38, 32, 20, 10],
};

export const BROKER_COUNT_NOISE = [
  0, 0.6, -0.4, 0.8, -0.2, 0.7, -0.5, 0.4, -0.6, 0.5, -0.3, 0.7, -0.4, 0.5, -0.2, 0.3, 0,
];

// Покрытие по рынкам и продуктам: у нас / у других (%)
export interface CoverageEntry {
  ours: number;
  others: number;
  change: number;
  concentrated: string;
}

export const marketCoverage: Record<string, CoverageEntry> = {
  EQUITY: { ours: 46, others: 51, change: -1.8, concentrated: 'Брокеры #1 и #2' },
  FUNDS: { ours: 22, others: 31, change: -2.4, concentrated: 'Брокер #1' },
  BONDS: { ours: 18, others: 34, change: -1.2, concentrated: 'Брокеры #2 и #3' },
  DERIVATIVES: { ours: 7, others: 26, change: 2.8, concentrated: 'Брокеры #3 и #4' },
  FX: { ours: 28, others: 43, change: 1.4, concentrated: 'Брокеры #2 и #4' },
  METALS: { ours: 9, others: 17, change: -0.7, concentrated: 'Брокер #3' },
  MONEY: { ours: 35, others: 42, change: -3.1, concentrated: 'Брокеры #1 и #2' },
};

export const productCoverage: Record<string, CoverageEntry> = {
  'Акции': { ours: 46, others: 51, change: -1.8, concentrated: 'Брокеры #1 и #2' },
  'Инвестиционные паи': { ours: 24, others: 33, change: -2.1, concentrated: 'Брокер #1' },
  'БПИФ / ETF': { ours: 19, others: 29, change: -0.8, concentrated: 'Брокеры #1 и #3' },
  'ОФЗ': { ours: 23, others: 37, change: -1.2, concentrated: 'Брокеры #2 и #3' },
  'Корпоративные облигации': { ours: 17, others: 36, change: 1.6, concentrated: 'Брокеры #2 и #3' },
  'Первичные размещения': { ours: 8, others: 21, change: 2.4, concentrated: 'Брокер #3' },
  'Однодневные облигации': { ours: 11, others: 16, change: -0.5, concentrated: 'Брокер #2' },
  'Индексные фьючерсы': { ours: 12, others: 31, change: 2.8, concentrated: 'Брокеры #3 и #4' },
  'Валютные фьючерсы': { ours: 9, others: 27, change: 1.9, concentrated: 'Брокер #4' },
  'Товарные фьючерсы': { ours: 5, others: 19, change: 3.2, concentrated: 'Брокеры #3 и #4' },
  'Опционы': { ours: 4, others: 18, change: 2.5, concentrated: 'Брокер #3' },
  'Спот TOD': { ours: 31, others: 44, change: 0.8, concentrated: 'Брокеры #2 и #4' },
  'Спот TOM': { ours: 28, others: 42, change: 1.4, concentrated: 'Брокеры #2 и #4' },
  'Свопы': { ours: 20, others: 39, change: 2.2, concentrated: 'Брокер #4' },
  'Внебиржевая ликвидность': { ours: 16, others: 31, change: 3, concentrated: 'Брокер #2' },
  'Золото': { ours: 10, others: 18, change: -0.7, concentrated: 'Брокер #3' },
  'Серебро': { ours: 5, others: 11, change: -0.2, concentrated: 'Брокер #3' },
  'РЕПО с ЦК': { ours: 39, others: 46, change: -3.1, concentrated: 'Брокеры #1 и #2' },
  'Депозиты с ЦК': { ours: 27, others: 39, change: -1.6, concentrated: 'Брокер #1' },
  'Кредитный рынок': { ours: 14, others: 25, change: 0.9, concentrated: 'Брокер #2' },
};

export interface CoverageRow extends CoverageEntry {
  name: string;
  market: string;
  gap: number;
  priority: string;
}

export const withGap = (row: CoverageEntry & { name: string; market: string }): CoverageRow => {
  const gap = row.others - row.ours;
  return { ...row, gap, priority: gap >= 12 ? 'Высокая' : gap >= 7 ? 'Средняя' : 'Низкая' };
};
