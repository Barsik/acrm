import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpDown,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  Info,
  Layers3,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  brokerRanking,
  defaultFilters,
  getTrendData,
  groupProfiles,
  lifecycleStages,
  markets,
  metricMeta,
  portfolioBuckets,
  portfolioHeatmap,
  portfolioMarkets,
  productCatalog,
  trendMonths,
  type AnalyticsAudience,
  type AnalyticsFilters,
  type LifecycleStage,
  type RatingMetric,
  type RatingMode,
  type TrendMode,
} from '../../data/brokerAnalytics';
import { projectNumberFormat as number } from '../../utils/numberFormat';

const yAxisUnitLabel = (value: string) => ({
  value,
  angle: -90,
  position: 'insideLeft' as const,
  offset: 2,
  style: { fill: '#64748B', fontSize: 10 },
});

const recentMonthCount = 6;
const historyMonthCount = trendMonths.length - recentMonthCount;
const peerGroupOptions = ['Все участники', 'Топ-5', 'Сопоставимые банки и брокеры', 'Середина группы', 'Сильные участники'] as const;
const peerGroupCounts: Record<string, number> = {
  'Все участники': 42,
  'Топ-5': 5,
  'Сопоставимые банки и брокеры': 12,
  'Середина группы': 18,
  'Сильные участники': 9,
};
const regionOptions = [
  'Москва', 'Санкт-Петербург', 'Московская область', 'Ленинградская область',
  'Республика Татарстан', 'Республика Башкортостан', 'Краснодарский край',
  'Красноярский край', 'Пермский край', 'Приморский край', 'Хабаровский край',
  'Свердловская область', 'Новосибирская область', 'Нижегородская область',
  'Самарская область', 'Ростовская область', 'Челябинская область',
  'Воронежская область', 'Омская область', 'Волгоградская область',
] as const;
type HistoryProfile = 'own' | 't' | 'sber' | 'vtb' | 'other' | 'market';

// A shared market cycle plus participant-specific shocks keeps the mock history
// coherent while avoiding identical month-over-month changes for every broker.
const historyVolumeBase = [0.72, 0.79, 0.755, 0.835, 0.8, 0.88, 0.84, 0.915, 0.87, 0.95, 0.915];
const historyVolumeProfiles: Record<HistoryProfile, readonly number[]> = {
  own: [-0.01, 0.015, -0.005, 0.02, -0.02, 0.025, -0.01, 0.015, -0.025, 0.03, -0.01],
  t: [0.02, -0.005, 0.015, -0.01, 0.02, -0.015, 0.025, -0.02, 0.02, -0.01, 0.025],
  sber: [-0.015, 0.025, -0.01, 0.015, -0.005, 0.01, -0.02, 0.03, -0.01, 0.015, -0.02],
  vtb: [0.01, -0.02, 0.025, -0.005, 0.015, 0.02, -0.015, 0.005, 0.025, -0.02, 0.015],
  other: [0, 0.01, -0.02, 0.025, -0.01, -0.005, 0.015, -0.01, 0.01, 0.005, 0],
  market: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

const historyFactor = (index: number, profile: HistoryProfile) =>
  historyVolumeBase[index] + historyVolumeProfiles[profile][index];

const expandRecentVolume = (
  recent: readonly number[],
  profile: HistoryProfile = 'market',
) => [
  ...Array.from({ length: historyMonthCount }, (_, index) =>
    recent[0] * historyFactor(index, profile),
  ),
  ...recent,
];

const historyRateBase = [-6.2, -5.1, -5.8, -4.3, -5, -3.7, -4.4, -2.9, -3.6, -2.1, -1.5];
const historyRateProfiles: Record<HistoryProfile, readonly number[]> = {
  own: [-0.6, 0.5, -0.2, 0.8, -0.7, 0.9, -0.4, 0.7, -0.8, 0.6, -0.3],
  t: [0.5, -0.4, 0.6, -0.3, 0.7, -0.5, 0.8, -0.6, 0.5, -0.4, 0.4],
  sber: [-0.3, 0.7, -0.5, 0.4, -0.2, 0.5, -0.6, 0.8, -0.4, 0.3, -0.5],
  vtb: [0.4, -0.6, 0.7, -0.2, 0.5, 0.8, -0.5, 0.2, 0.6, -0.7, 0.3],
  other: [0, 0.3, -0.6, 0.6, -0.4, 0.2, 0.5, -0.3, 0.4, 0.1, 0],
  market: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

const expandRecentRate = (
  recent: readonly number[],
  profile: HistoryProfile = 'market',
) => {
  return [
    ...Array.from({ length: historyMonthCount }, (_, index) =>
      Math.max(
        0,
        recent[0] + historyRateBase[index] + historyRateProfiles[profile][index],
      ),
    ),
    ...recent,
  ];
};

const formatMetric = (
  key: RatingMetric,
  value: number,
  mode: RatingMode,
  total: number,
) => {
  if (mode === 'share') return `${number.format((value / total) * 100)}%`;
  return `${number.format(value)} ${metricMeta[key].unit}`;
};

type BenchmarkSeries = {
  own: readonly number[];
  t: readonly number[];
  sber: readonly number[];
  vtb: readonly number[];
  other: readonly number[];
};

const MonthlyDeltaChart = ({
  months,
  series,
  unit,
}: {
  months: readonly string[];
  series: BenchmarkSeries;
  unit: string;
}) => {
  const [mode, setMode] = useState<'absolute' | 'percent'>('percent');
  const data = months.map((month, index) => {
    if (index === 0)
      return { month, own: null, t: null, sber: null, vtb: null, market: null };
    const change = (current: number, previous: number) =>
      mode === 'percent'
        ? (current / previous - 1) * 100
        : current - previous;
    const marketAt = (position: number) =>
      series.own[position] +
      series.t[position] +
      series.sber[position] +
      series.vtb[position] +
      series.other[position];
    return {
      month,
      own: change(series.own[index], series.own[index - 1]),
      t: change(series.t[index], series.t[index - 1]),
      sber: change(series.sber[index], series.sber[index - 1]),
      vtb: change(series.vtb[index], series.vtb[index - 1]),
      market: change(marketAt(index), marketAt(index - 1)),
    };
  });
  const suffix = mode === 'percent' ? '%' : ` ${unit}`;
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Изменение к предыдущему месяцу
          </h4>
          <p className="text-[10px] text-slate-500">
            Отдельный бенчмарк динамики · первый месяц периода без дельты
          </p>
        </div>
        <div className="flex self-start rounded-lg bg-slate-200/70 p-1">
          <button className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${mode === 'absolute' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`} onClick={() => setMode('absolute')}>
            Δ, {unit}
          </button>
          <button className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${mode === 'percent' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`} onClick={() => setMode('percent')}>
            Δ, %
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis width={76} label={yAxisUnitLabel(mode === 'percent' ? '%' : unit)} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => number.format(Number(value))} />
          <Tooltip formatter={(value: number | string | undefined) => [`${number.format(Number(value ?? 0))}${suffix}`]} />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
          <Bar dataKey="own" name="Альфа-Банк" fill="#E8001C"><LabelList dataKey="own" position="top" fill="#475569" fontSize={8} formatter={(value) => number.format(Number(value))} /></Bar>
          <Bar dataKey="t" name="Т-Инвестиции" fill="#2563EB"><LabelList dataKey="t" position="top" fill="#475569" fontSize={8} formatter={(value) => number.format(Number(value))} /></Bar>
          <Bar dataKey="sber" name="СберИнвестиции" fill="#7C3AED"><LabelList dataKey="sber" position="top" fill="#475569" fontSize={8} formatter={(value) => number.format(Number(value))} /></Bar>
          <Bar dataKey="vtb" name="ВТБ Мои Инвестиции" fill="#0891B2"><LabelList dataKey="vtb" position="top" fill="#475569" fontSize={8} formatter={(value) => number.format(Number(value))} /></Bar>
          <Bar dataKey="market" name="Рынок в целом" fill="#64748B"><LabelList dataKey="market" position="top" fill="#334155" fontSize={8} fontWeight={700} formatter={(value) => number.format(Number(value))} /></Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

const SelectField = ({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: readonly (readonly [string, string])[] | string[];
  onChange: (value: string) => void;
}) => (
  <label className="min-w-0 border-r border-slate-200 px-3 py-2 last:border-r-0">
    <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span className="relative mt-0.5 block">
      <select
        className="w-full appearance-none bg-transparent pr-5 text-xs font-semibold text-slate-800 outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {values.map((item) => {
          const pair = Array.isArray(item) ? item : [item, item];
          return (
            <option key={pair[0]} value={pair[0]}>
              {pair[1]}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-0 top-0.5 text-slate-400"
      />
    </span>
  </label>
);

const TrustStrip = ({
  audience,
  peerGroup,
  onPeerGroupChange,
}: {
  audience: AnalyticsAudience;
  peerGroup: string;
  onPeerGroupChange: (peerGroup: string) => void;
}) => (
  <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white md:grid-cols-5">
    <label className="border-b border-r border-slate-100 px-4 py-3 md:border-b-0">
      <span className="block text-[9px] uppercase tracking-wide text-slate-400">С кем сравниваем</span>
      <span className="relative mt-0.5 block">
        <select className="w-full appearance-none bg-transparent pr-5 text-[11px] font-bold text-slate-800 outline-none" value={peerGroup} onChange={(event) => onPeerGroupChange(event.target.value)}>
          {peerGroupOptions.map((value) => <option key={value}>{value}</option>)}
        </select>
        <ChevronDown size={11} className="pointer-events-none absolute right-0 top-0.5 text-slate-400" />
      </span>
      <small className="text-[9px] text-slate-400">{peerGroupCounts[peerGroup] ?? 42} участников</small>
    </label>
    {[
      ['Минимальный порог', '50 клиентов'],
      ['Скрытые ячейки', '3'],
      ['Приватность', 'OK'],
      ['Данные', '2026-05'],
    ].map(([label, value]) => (
      <div
        key={label}
        className="border-r border-slate-100 px-4 py-2.5 last:border-0"
      >
        <div className="text-[10px] text-slate-400">{label}</div>
        <div
          className={`mt-0.5 text-xs font-bold ${value === 'OK' ? 'text-emerald-600' : 'text-slate-800'}`}
        >
          {value}
        </div>
      </div>
    ))}
    {audience === 'crm' && (
      <div className="col-span-2 flex items-center gap-1.5 border-t border-slate-100 bg-slate-50 px-4 py-2 text-[10px] text-slate-500 md:col-span-5">
        <LockKeyhole size={11} />
        Внутренний контур: доступна идентификация участников по правам CRM
      </div>
    )}
  </div>
);

const SegmentDrawer = ({
  open,
  filters,
  onClose,
  onApply,
}: {
  open: boolean;
  filters: AnalyticsFilters;
  onClose: () => void;
  onApply: (filters: AnalyticsFilters) => void;
}) => {
  const [draft, setDraft] = useState(filters);
  const [auc, setAuc] = useState(filters.segmentDefinition.aucGroups);
  const [dimensions, setDimensions] = useState<Record<string, string[]>>(filters.segmentDefinition.dimensions);
  const [cohort, setCohort] = useState(filters.segmentDefinition.cohort);
  const [tradePeriod, setTradePeriod] = useState(filters.segmentDefinition.tradePeriod);
  if (!open) return null;
  const toggle = (
    value: string,
    values: string[],
    setValues: (values: string[]) => void,
  ) =>
    setValues(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  const toggleDimension = (key: string, value: string) =>
    setDimensions((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  const products = productCatalog[draft.market] || productCatalog.ALL;
  const conditionCount =
    auc.length +
    Object.values(dimensions).reduce((sum, values) => sum + values.length, 0) +
    (tradePeriod.enabled ? 1 : 0) +
    (draft.market !== 'ALL' ? 1 : 0) +
    (draft.product !== 'ALL' ? 1 : 0);
  const segmentName = [
    auc.length ? auc.join(' + ') : 'Все AuC-группы',
    dimensions.frequency.length === 1 ? dimensions.frequency[0] : null,
  ].filter(Boolean).join(' · ');
  const estimatedClients = Math.max(
    0.1,
    13205.5 * Math.pow(0.62, Math.max(0, conditionCount - 1)),
  );
  const hiddenCells = conditionCount > 12 ? 7 : conditionCount > 8 ? 3 : 0;
  const renderOptions = (
    key: string,
    options: readonly string[],
    tone: 'blue' | 'violet' | 'red' = 'blue',
  ) => (
    <div className="flex flex-wrap gap-2">
      {options.map((value) => {
        const selected = dimensions[key].includes(value);
        const selectedClass = tone === 'violet'
          ? 'border-violet-600 bg-violet-50 text-violet-700'
          : tone === 'red'
            ? 'border-red-500 bg-red-50 text-red-700'
            : 'border-blue-600 bg-blue-50 text-blue-700';
        return (
          <button
            key={value}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${selected ? selectedClass : 'border-slate-200 text-slate-600'}`}
            onClick={() => toggleDimension(key, value)}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/35"
      onMouseDown={onClose}
    >
      <aside
        className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Конструктор сегмента
            </h2>
            <p className="text-xs text-slate-500">
              Контекст применяется ко всем аналитическим разделам
            </p>
          </div>
          <button
            className="rounded-lg p-2 hover:bg-slate-100"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Период и когорта
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] text-slate-500">Период анализа</span>
                <strong className="mt-1 block text-xs text-slate-900">2025-01 — 2026-05</strong>
                <small className="text-[9px] text-slate-400">предыдущий полный и текущий год</small>
              </div>
              <label className="text-xs text-slate-500">
                Счёт открыт от
                <input
                  type="month"
                  value={cohort.from}
                  onChange={(event) => setCohort({ ...cohort, from: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-slate-800"
                />
              </label>
              <label className="text-xs text-slate-500">
                Счёт открыт до
                <input
                  type="month"
                  value={cohort.to}
                  onChange={(event) => setCohort({ ...cohort, to: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-slate-800"
                />
              </label>
            </div>
            <div className={`mt-3 grid gap-3 rounded-xl border p-3 sm:grid-cols-3 ${tradePeriod.enabled ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-slate-50'}`}>
              <button
                className="flex items-center gap-3 rounded-lg text-left"
                onClick={() => setTradePeriod({ ...tradePeriod, enabled: !tradePeriod.enabled })}
              >
                <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${tradePeriod.enabled ? 'bg-red-600' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${tradePeriod.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                </span>
                <span>
                  <strong className="block text-xs text-slate-800">Были сделки за период</strong>
                  <small className="text-[9px] text-slate-500">хотя бы одна сделка</small>
                </span>
              </button>
              <label className={`text-xs ${tradePeriod.enabled ? 'text-slate-500' : 'text-slate-400'}`}>
                Сделки от
                <input
                  type="month"
                  value={tradePeriod.from}
                  disabled={!tradePeriod.enabled}
                  onChange={(event) => setTradePeriod({ ...tradePeriod, from: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                />
              </label>
              <label className={`text-xs ${tradePeriod.enabled ? 'text-slate-500' : 'text-slate-400'}`}>
                Сделки до
                <input
                  type="month"
                  value={tradePeriod.to}
                  disabled={!tradePeriod.enabled}
                  onChange={(event) => setTradePeriod({ ...tradePeriod, to: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                />
              </label>
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Тип клиента
            </h3>
            <div className="flex flex-wrap gap-2">
                {['ФЛ', 'ЮЛ', 'ФЛ + ЮЛ'].map((value) => (
                  <button
                    key={value}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold ${draft.clientType === value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                    onClick={() => setDraft({ ...draft, clientType: value })}
                  >
                    {value}
                  </button>
                ))}
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              География
            </h3>
            <div className="space-y-3">
              <div>
                <span className="mb-2 block text-[10px] text-slate-500">Тип территории</span>
                {renderOptions('geography', ['Вся Россия', 'Москва', 'Санкт-Петербург', 'Регионы-миллионники'])}
              </div>
              <label className="block text-[10px] text-slate-500">
                Регион
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
                  value={dimensions.region[0] ?? 'ALL'}
                  onChange={(event) => setDimensions((current) => ({ ...current, region: event.target.value === 'ALL' ? [] : [event.target.value] }))}
                >
                  <option value="ALL">Все регионы</option>
                  {regionOptions.map((region) => <option key={region} value={region}>{region}</option>)}
                </select>
              </label>
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              AuC-группа
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Mini Mass', 'Mass', 'Affluent', 'HNWI', 'UHNWI'].map(
                (value) => (
                  <button
                    key={value}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold ${auc.includes(value) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                    onClick={() => toggle(value, auc, setAuc)}
                  >
                    {value}
                  </button>
                ),
              )}
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Клиентский цикл
            </h3>
            <div className="space-y-3">
              <div><span className="mb-2 block text-[10px] text-slate-500">Статус счёта</span>{renderOptions('accountStatus', ['Счёт открыт', 'Новый без сделок', 'Активный', 'Спящий', 'Нулевой AuC', 'Счёт закрыт'])}</div>
              <div><span className="mb-2 block text-[10px] text-slate-500">Активация</span>{renderOptions('activation', ['Первое пополнение', 'Первая сделка ≤ 30 дней', 'Первая сделка ≤ 90 дней'], 'violet')}</div>
              <div><span className="mb-2 block text-[10px] text-slate-500">Событие оттока</span>{renderOptions('churn', ['Стал спящим', 'Обнулил AuC', 'Закрыл счёт'], 'red')}</div>
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Торговая активность
            </h3>
            <div className="space-y-3">
              <div><span className="mb-2 block text-[10px] text-slate-500">Частота сделок</span>{renderOptions('frequency', ['Реже раза в год (спящие)', 'Раз в год', 'Раз в квартал', 'Раз в месяц', 'Ежедневно'], 'violet')}</div>
              <div><span className="mb-2 block text-[10px] text-slate-500">Режим торговли</span>{renderOptions('tradingMode', ['Не HFT', 'HFT / ALGO'])}</div>
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Рынок и продукт
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="rounded-lg border border-slate-200 p-2.5 text-xs"
                value={draft.market}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    market: event.target.value,
                    product: 'ALL',
                  })
                }
              >
                {markets.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-slate-200 p-2.5 text-xs"
                value={draft.product}
                onChange={(event) => setDraft({ ...draft, product: event.target.value })}
              >
                {products.map((product, index) => (
                  <option key={product} value={index === 0 ? 'ALL' : product}>{product}</option>
                ))}
              </select>
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Внешний портфель
            </h3>
            <div className="space-y-3">
              <div><span className="mb-2 block text-[10px] text-slate-500">Где есть активность</span>{renderOptions('brokerPresence', ['Только у нас', 'В нескольких брокерах'])}</div>
              <div><span className="mb-2 block text-[10px] text-slate-500">Наша роль в кошельке</span>{renderOptions('walletRole', ['Мы — основной', 'Мы — второй', 'Мы — периферийный'], 'violet')}</div>
              <div><span className="mb-2 block text-[10px] text-slate-500">Количество брокеров</span>{renderOptions('brokerCount', ['1 брокер', '2 брокера', '3–4 брокера', '5 и более'])}</div>
              <div><span className="mb-2 block text-[10px] text-slate-500">Активность вне нас</span>{renderOptions('externalActivity', ['Неактивен вне нас', 'Слабее вне нас', 'Сопоставимо', 'Активнее вне нас'], 'red')}</div>
            </div>
          </section>
          <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-900">
              <ShieldCheck size={16} />
              Проверка выдачи
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <div>
                <span className="text-emerald-700">Клиентов</span>
                <strong className="block text-emerald-950">{number.format(estimatedClients)} тыс.</strong>
              </div>
              <div>
                <span className="text-emerald-700">Условий сегмента</span>
                <strong className="block text-emerald-950">{conditionCount}</strong>
              </div>
              <div>
                <span className="text-emerald-700">Скрыто ячеек</span>
                <strong className="block text-emerald-950">{hiddenCells}</strong>
              </div>
              <div>
                <span className="text-emerald-700">Приватность</span>
                <strong className="block text-emerald-950">{estimatedClients >= 0.05 ? 'OK' : 'Малая выборка'}</strong>
              </div>
              <div>
                <span className="text-emerald-700">Когорта открытия</span>
                <strong className="block text-emerald-950">{cohort.from} — {cohort.to}</strong>
              </div>
              <div>
                <span className="text-emerald-700">Сделки за период</span>
                <strong className="block text-emerald-950">{tradePeriod.enabled ? `${tradePeriod.from} — ${tradePeriod.to}` : 'Не задано'}</strong>
              </div>
            </div>
          </section>
        </div>
        <div className="flex justify-between border-t border-slate-200 p-4">
          <button
            className="btn-secondary"
            onClick={() => {
              setDraft(defaultFilters);
              setAuc(defaultFilters.segmentDefinition.aucGroups);
              setDimensions(defaultFilters.segmentDefinition.dimensions);
              setCohort(defaultFilters.segmentDefinition.cohort);
              setTradePeriod(defaultFilters.segmentDefinition.tradePeriod);
            }}
          >
            Сбросить
          </button>
          <button
            className="btn-primary"
            onClick={() =>
              onApply({
                ...draft,
                segment: segmentName || 'Все клиенты',
                segmentDefinition: { aucGroups: auc, dimensions, cohort, tradePeriod },
              })
            }
          >
            <CheckCircle2 size={14} />
            Применить · {conditionCount} условий
          </button>
        </div>
      </aside>
    </div>
  );
};

const FilterBar = ({
  filters,
  onChange,
  onOpenSegment,
  showMetric = true,
}: {
  filters: AnalyticsFilters;
  onChange: (filters: AnalyticsFilters) => void;
  onOpenSegment: () => void;
  showMetric?: boolean;
}) => {
  const products = (productCatalog[filters.market] || productCatalog.ALL).map(
    (item, index) => [index === 0 ? 'ALL' : item, item] as const,
  );
  return (
    <div
      className={`grid overflow-hidden rounded-xl border border-slate-200 bg-white ${showMetric ? 'lg:grid-cols-[1.2fr_1.4fr_1fr_1fr_1.1fr_auto]' : 'lg:grid-cols-[1.2fr_1.4fr_1fr_1.2fr_auto]'}`}
    >
      <SelectField
        label="Рынок"
        value={filters.market}
        values={markets}
        onChange={(market) => onChange({ ...filters, market, product: 'ALL' })}
      />
      <SelectField
        label="Продукт"
        value={filters.product}
        values={products}
        onChange={(product) => onChange({ ...filters, product })}
      />
      <SelectField
        label="Тип клиента"
        value={filters.clientType}
        values={['ФЛ', 'ЮЛ', 'ФЛ + ЮЛ']}
        onChange={(clientType) => onChange({ ...filters, clientType })}
      />
      {showMetric && (
        <SelectField
          label="Метрика"
          value={filters.metric}
          values={[
            ['turnover', 'Оборот'],
            ['clients', 'Клиенты'],
            ['auc', 'AuC'],
          ]}
          onChange={(metric) =>
            onChange({ ...filters, metric: metric as RatingMetric })
          }
        />
      )}
      <SelectField
        label="Период"
        value={filters.period}
        values={['2025-01 — 2026-05']}
        onChange={(period) => onChange({ ...filters, period })}
      />
      <button
        className="flex items-center justify-center gap-2 border-t border-slate-200 px-4 py-3 text-xs font-semibold text-blue-700 hover:bg-blue-50 lg:border-l lg:border-t-0"
        onClick={onOpenSegment}
      >
        <SlidersHorizontal size={14} />
        Все фильтры
      </button>
    </div>
  );
};

const RankingSection = ({
  companyId,
  audience,
  filters,
  setFilters,
  openSegment,
}: {
  companyId: string;
  audience: AnalyticsAudience;
  filters: AnalyticsFilters;
  setFilters: (filters: AnalyticsFilters) => void;
  openSegment: () => void;
}) => {
  const [ratingMode, setRatingMode] = useState<RatingMode>('absolute');
  const [trendMode, setTrendMode] = useState<TrendMode>('share');
  const [sort, setSort] = useState<RatingMetric | 'rank'>('turnover');
  const [descending, setDescending] = useState(true);
  const own =
    brokerRanking.find((row) => row.companyId === companyId) ||
    brokerRanking[11];
  const totals = useMemo(
    () => ({
      clients: brokerRanking.reduce((sum, row) => sum + row.clients, 0),
      turnover: brokerRanking.reduce((sum, row) => sum + row.turnover, 0),
      auc: brokerRanking.reduce((sum, row) => sum + row.auc, 0),
    }),
    [],
  );
  const values = brokerRanking.map((row) => row[filters.metric]);
  const middle = (values[20] + values[21]) / 2;
  const strong = values[10];
  const leader = values[0];
  const rows = useMemo(
    () =>
      [...brokerRanking].sort((a, b) => {
        const av = sort === 'rank' ? a.officialRank : a[sort];
        const bv = sort === 'rank' ? b.officialRank : b[sort];
        return descending ? bv - av : av - bv;
      }),
    [sort, descending],
  );
  const chooseSort = (key: RatingMetric | 'rank') => {
    if (sort === key) setDescending(!descending);
    else {
      setSort(key);
      setDescending(key !== 'rank');
    }
  };
  const trend = getTrendData(filters.metric, trendMode);
  const ownValue = own[filters.metric];

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onOpenSegment={openSegment}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <section className="card overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-end">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  Рейтинг участников
                </h2>
                <p className="text-xs text-slate-500">
                  {metricMeta[filters.metric].label} · {filters.period}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-right">
                <div>
                  <span className="text-[10px] text-slate-400">Середина</span>
                  <strong className="block text-xs">
                    {formatMetric(
                      filters.metric,
                      middle,
                      ratingMode,
                      totals[filters.metric],
                    )}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Сильные</span>
                  <strong className="block text-xs">
                    {formatMetric(
                      filters.metric,
                      strong,
                      ratingMode,
                      totals[filters.metric],
                    )}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Лидер</span>
                  <strong className="block text-xs">
                    {formatMetric(
                      filters.metric,
                      leader,
                      ratingMode,
                      totals[filters.metric],
                    )}
                  </strong>
                </div>
              </div>
              <div className="flex rounded-lg bg-slate-100 p-1">
                {(['absolute', 'share'] as RatingMode[]).map((mode) => (
                  <button
                    key={mode}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${ratingMode === mode ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                    onClick={() => setRatingMode(mode)}
                  >
                    {mode === 'absolute' ? 'Абсолют' : 'Доля рынка'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-2 text-[10px] text-slate-500">
              <span>
                <strong className="text-slate-700">42 участника</strong> ·
                официальный ранг сохраняется при сортировке
              </span>
              <span>
                Сортировка:{' '}
                {sort === 'rank'
                  ? 'место'
                  : metricMeta[sort].label.toLowerCase()}
              </span>
            </div>
            <div className="max-h-[520px] overflow-auto">
              <table className="data-table w-full min-w-[760px]">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th>
                      <button
                        className="flex items-center gap-1"
                        onClick={() => chooseSort('rank')}
                      >
                        Место <ArrowUpDown size={11} />
                      </button>
                    </th>
                    <th>Участник</th>
                    {(['clients', 'turnover', 'auc'] as RatingMetric[]).map(
                      (key) => (
                        <th
                          key={key}
                          className={
                            filters.metric === key
                              ? 'bg-blue-50 text-blue-700'
                              : ''
                          }
                        >
                          <button
                            className="flex items-center gap-1"
                            onClick={() => {
                              chooseSort(key);
                              setFilters({ ...filters, metric: key });
                            }}
                          >
                            {metricMeta[key].label}
                            <ArrowUpDown size={11} />
                          </button>
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isOwn = row.companyId === companyId;
                    const name =
                      audience === 'broker' && !isOwn
                        ? `Участник #${row.officialRank}`
                        : row.name;
                    return (
                      <tr
                        key={row.officialRank}
                        className={
                          isOwn
                            ? 'bg-blue-50'
                            : row.officialRank <= 3
                              ? 'bg-amber-50/40'
                              : ''
                        }
                      >
                        <td className="font-bold">#{row.officialRank}</td>
                        <td>
                          <strong className="text-slate-900">
                            {isOwn
                              ? audience === 'broker'
                                ? 'Вы · Альфа-Банк'
                                : row.name
                              : name}
                          </strong>
                          <small className="block text-[10px] text-slate-400">
                            {isOwn
                              ? 'Ваш брокер'
                              : row.officialRank <= 3
                                ? 'Лидер рынка'
                                : Math.abs(
                                      row.officialRank - own.officialRank,
                                    ) <= 2
                                  ? 'Сосед по рейтингу'
                                  : ''}
                          </small>
                        </td>
                        {(['clients', 'turnover', 'auc'] as RatingMetric[]).map(
                          (key) => (
                            <td
                              key={key}
                              className={
                                filters.metric === key
                                  ? 'bg-blue-50/60 font-semibold'
                                  : ''
                              }
                            >
                              {formatMetric(
                                key,
                                row[key],
                                ratingMode,
                                totals[key],
                              )}
                              {isOwn && (
                                <div className="mt-1 h-1 w-24 rounded bg-slate-200">
                                  <div
                                    className="h-1 rounded bg-blue-600"
                                    style={{
                                      width: `${Math.min(100, (row[key] / brokerRanking[0][key]) * 100)}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </td>
                          ),
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Динамика выбранной метрики
                </h3>
                <p className="text-xs text-slate-500">
                  Текущий и прошлый аналогичный период
                </p>
              </div>
              <div className="flex rounded-lg bg-slate-100 p-1">
                {(['rank', 'absolute', 'share'] as TrendMode[]).map((mode) => (
                  <button
                    key={mode}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${trendMode === mode ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                    onClick={() => setTrendMode(mode)}
                  >
                    {mode === 'rank'
                      ? 'Место'
                      : mode === 'absolute'
                        ? 'Абсолют'
                        : 'Доля рынка'}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ['Место', `${own.officialRank} из 42`],
                [
                  'Абсолют',
                  formatMetric(
                    filters.metric,
                    ownValue,
                    'absolute',
                    totals[filters.metric],
                  ),
                ],
                [
                  'Доля рынка',
                  formatMetric(
                    filters.metric,
                    ownValue,
                    'share',
                    totals[filters.metric],
                  ),
                ],
              ].map(([label, value], index) => (
                <button
                  key={label}
                  className={`rounded-lg border p-3 text-left ${index === (trendMode === 'rank' ? 0 : trendMode === 'absolute' ? 1 : 2) ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
                  onClick={() =>
                    setTrendMode(
                      index === 0 ? 'rank' : index === 1 ? 'absolute' : 'share',
                    )
                  }
                >
                  <span className="text-[10px] text-slate-500">{label}</span>
                  <strong className="block text-sm text-slate-900">
                    {value}
                  </strong>
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis
                  reversed={trendMode === 'rank'}
                  width={76}
                  label={yAxisUnitLabel(
                    trendMode === 'rank'
                      ? 'место'
                      : trendMode === 'share'
                        ? '%'
                        : metricMeta[filters.metric].unit,
                  )}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip formatter={(value) => number.format(Number(value))} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="own"
                  name="Альфа-Банк"
                  stroke="#E21B2D"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  name="Прошлый период"
                  stroke="#94A3B8"
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="peer"
                  name="Медиана группы"
                  stroke="#2563EB"
                  strokeDasharray="2 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>
        </div>
        <aside className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              Позиция и оценка <Info size={13} />
            </div>
            <div className="mt-4 text-2xl font-bold text-slate-900">
              #{own.officialRank}{' '}
              <span className="text-sm font-normal text-slate-400">из 42</span>
            </div>
            <div className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
              Топ‑5 рынка
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs font-bold text-slate-700">
              Сравнение с ориентирами
            </div>
            {[
              ['Середина группы', middle],
              ['Сильные участники', strong],
              ['Лидер рынка', leader],
            ].map(([label, value]) => {
              const numeric = Number(value);
              const delta = ((ownValue - numeric) / numeric) * 100;
              return (
                <div key={String(label)} className="mt-4">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">{label}</span>
                    <strong
                      className={
                        delta >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }
                    >
                      {delta >= 0 ? '+' : ''}
                      {number.format(delta)}%
                    </strong>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded bg-slate-100">
                    <div
                      className={`h-1.5 rounded ${delta >= 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{
                        width: `${Math.min(100, (ownValue / numeric) * 72)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

const MarketSection = ({
  filters,
  setFilters,
  openSegment,
  initialStage = 'acquisition',
}: {
  filters: AnalyticsFilters;
  setFilters: (filters: AnalyticsFilters) => void;
  openSegment: () => void;
  initialStage?: LifecycleStage;
}) => {
  const [stage, setStage] = useState<LifecycleStage>(initialStage);
  const [acquisitionMetric, setAcquisitionMetric] = useState<
    'accounts' | 'clients' | 'accountShare' | 'clientShare'
  >('clients');
  const [activationMetric, setActivationMetric] = useState<
    'funding' | 'trade30' | 'trade90'
  >('trade90');
  const [activationMode, setActivationMode] = useState<'absolute' | 'share'>(
    'share',
  );
  const [portfolioMetric, setPortfolioMetric] = useState<
    'turnover' | 'auc' | 'mau'
  >('turnover');
  const [portfolioMode, setPortfolioMode] = useState<'absolute' | 'share'>(
    'absolute',
  );
  const [churnMetric, setChurnMetric] = useState<
    'dormant' | 'zeroAuc' | 'closed'
  >('dormant');
  const [churnMode, setChurnMode] = useState<'absolute' | 'share'>('absolute');
  const lifecycleOrder: LifecycleStage[] = [
    'acquisition',
    'activation',
    'portfolio',
    'churn',
  ];
  const lifecycleLabel = (key: LifecycleStage) =>
    key === 'portfolio' ? 'Активность' : lifecycleStages[key].label;
  const current = lifecycleStages[stage];
  const stageAxisUnit = stage === 'acquisition' || stage === 'churn' ? 'тыс. клиентов' : '%';
  const currentOwnTrend = expandRecentRate(current.own, 'own');
  const currentPeerTrend = expandRecentRate(current.peer, 'market');
  const chart = trendMonths.map((month, index) => ({
    month,
    own: currentOwnTrend[index],
    peer: currentPeerTrend[index],
  }));
  const acquisitionRecent = [
    {
      month: '2025-12',
      ownAccounts: 25.4,
      ownClients: 21.8,
      tAccounts: 52.8,
      tClients: 44.6,
      sberAccounts: 47.2,
      sberClients: 39.7,
      vtbAccounts: 35.6,
      vtbClients: 29.8,
      otherAccounts: 96.0,
      otherClients: 80.4,
    },
    {
      month: '2026-01',
      ownAccounts: 28.8,
      ownClients: 24.6,
      tAccounts: 55.4,
      tClients: 46.8,
      sberAccounts: 48.6,
      sberClients: 40.9,
      vtbAccounts: 36.8,
      vtbClients: 30.7,
      otherAccounts: 98.2,
      otherClients: 82.1,
    },
    {
      month: '2026-02',
      ownAccounts: 26.7,
      ownClients: 22.9,
      tAccounts: 49.1,
      tClients: 41.5,
      sberAccounts: 45.3,
      sberClients: 38.2,
      vtbAccounts: 33.9,
      vtbClients: 28.4,
      otherAccounts: 91.7,
      otherClients: 76.8,
    },
    {
      month: '2026-03',
      ownAccounts: 33.4,
      ownClients: 28.7,
      tAccounts: 58.7,
      tClients: 49.4,
      sberAccounts: 51.9,
      sberClients: 43.6,
      vtbAccounts: 39.5,
      vtbClients: 32.9,
      otherAccounts: 103.4,
      otherClients: 86.5,
    },
    {
      month: '2026-04',
      ownAccounts: 39.2,
      ownClients: 33.8,
      tAccounts: 61.3,
      tClients: 51.5,
      sberAccounts: 54.2,
      sberClients: 45.5,
      vtbAccounts: 41.8,
      vtbClients: 34.8,
      otherAccounts: 108.8,
      otherClients: 91.0,
    },
    {
      month: '2026-05',
      ownAccounts: 43.7,
      ownClients: 37.9,
      tAccounts: 63.1,
      tClients: 53.0,
      sberAccounts: 56.8,
      sberClients: 47.7,
      vtbAccounts: 43.2,
      vtbClients: 36.0,
      otherAccounts: 112.4,
      otherClients: 94.1,
    },
  ];
  const acquisitionBase = [
    ...trendMonths.slice(0, -recentMonthCount).map((month, index) => {
      const seed = acquisitionRecent[0];
      return {
        month,
        ownAccounts: seed.ownAccounts * historyFactor(index, 'own'),
        ownClients: seed.ownClients * historyFactor(index, 'own'),
        tAccounts: seed.tAccounts * historyFactor(index, 't'),
        tClients: seed.tClients * historyFactor(index, 't'),
        sberAccounts: seed.sberAccounts * historyFactor(index, 'sber'),
        sberClients: seed.sberClients * historyFactor(index, 'sber'),
        vtbAccounts: seed.vtbAccounts * historyFactor(index, 'vtb'),
        vtbClients: seed.vtbClients * historyFactor(index, 'vtb'),
        otherAccounts: seed.otherAccounts * historyFactor(index, 'other'),
        otherClients: seed.otherClients * historyFactor(index, 'other'),
      };
    }),
    ...acquisitionRecent,
  ];
  const isAccounts =
    acquisitionMetric === 'accounts' || acquisitionMetric === 'accountShare';
  const isShare =
    acquisitionMetric === 'accountShare' || acquisitionMetric === 'clientShare';
  const acquisitionDeltaSeries: BenchmarkSeries = {
    own: acquisitionBase.map((row) => isAccounts ? row.ownAccounts : row.ownClients),
    t: acquisitionBase.map((row) => isAccounts ? row.tAccounts : row.tClients),
    sber: acquisitionBase.map((row) => isAccounts ? row.sberAccounts : row.sberClients),
    vtb: acquisitionBase.map((row) => isAccounts ? row.vtbAccounts : row.vtbClients),
    other: acquisitionBase.map((row) => isAccounts ? row.otherAccounts : row.otherClients),
  };
  const acquisitionChart = acquisitionBase.map((row) => {
    const values = isAccounts
      ? {
          own: row.ownAccounts,
          t: row.tAccounts,
          sber: row.sberAccounts,
          vtb: row.vtbAccounts,
          other: row.otherAccounts,
        }
      : {
          own: row.ownClients,
          t: row.tClients,
          sber: row.sberClients,
          vtb: row.vtbClients,
          other: row.otherClients,
        };
    if (!isShare)
      return {
        month: row.month,
        ...values,
        total: Object.values(values).reduce((sum, value) => sum + value, 0),
      };
    const total = Object.values(values).reduce((sum, value) => sum + value, 0);
    return {
      month: row.month,
      own: (values.own / total) * 100,
      t: (values.t / total) * 100,
      sber: (values.sber / total) * 100,
      vtb: (values.vtb / total) * 100,
      other: (values.other / total) * 100,
      total: 100,
    };
  });
  const first = acquisitionBase[0];
  const last = acquisitionBase[acquisitionBase.length - 1];
  const avgGrowth = (start: number, end: number) =>
    (Math.pow(end / start, 1 / (acquisitionBase.length - 1)) - 1) * 100;
  const marketFlow = (row: typeof first) =>
    isAccounts
      ? row.ownAccounts +
        row.tAccounts +
        row.sberAccounts +
        row.vtbAccounts +
        row.otherAccounts
      : row.ownClients +
        row.tClients +
        row.sberClients +
        row.vtbClients +
        row.otherClients;
  const growthRows = [
    [
      'Альфа-Банк',
      avgGrowth(
        isAccounts ? first.ownAccounts : first.ownClients,
        isAccounts ? last.ownAccounts : last.ownClients,
      ),
      '#E8001C',
    ],
    [
      'Т-Инвестиции',
      avgGrowth(
        isAccounts ? first.tAccounts : first.tClients,
        isAccounts ? last.tAccounts : last.tClients,
      ),
      '#2563EB',
    ],
    [
      'СберИнвестиции',
      avgGrowth(
        isAccounts ? first.sberAccounts : first.sberClients,
        isAccounts ? last.sberAccounts : last.sberClients,
      ),
      '#7C3AED',
    ],
    [
      'ВТБ Мои Инвестиции',
      avgGrowth(
        isAccounts ? first.vtbAccounts : first.vtbClients,
        isAccounts ? last.vtbAccounts : last.vtbClients,
      ),
      '#0891B2',
    ],
    [
      'Рынок в целом',
      avgGrowth(marketFlow(first), marketFlow(last)),
      '#64748B',
    ],
  ] as const;
  const activationMetricLabels = {
    funding: 'Активации',
    trade30: 'Активации в первые 30 дней после открытия',
    trade90: 'Активации в первые 90 дней после открытия',
  } as const;
  const activationSource = acquisitionBase.map((row) => ({
    month: row.month,
    own: row.ownClients,
    t: row.tClients,
    sber: row.sberClients,
    vtb: row.vtbClients,
    other: row.otherClients,
  }));
  const activationRates = {
    funding: {
      own: expandRecentRate([58, 61, 59, 66, 70, 72], 'own'),
      t: expandRecentRate([68, 67, 66, 69, 70, 71], 't'),
      sber: expandRecentRate([64, 65, 63, 66, 67, 68], 'sber'),
      vtb: expandRecentRate([57, 59, 58, 60, 61, 62], 'vtb'),
      other: expandRecentRate([59, 60, 58, 61, 62, 63], 'other'),
    },
    trade30: {
      own: expandRecentRate([31, 34, 32, 38, 43, 47], 'own'),
      t: expandRecentRate([41, 40, 39, 41, 42, 43], 't'),
      sber: expandRecentRate([37, 38, 36, 39, 40, 41], 'sber'),
      vtb: expandRecentRate([32, 34, 33, 35, 36, 37], 'vtb'),
      other: expandRecentRate([33, 34, 32, 35, 36, 37], 'other'),
    },
    trade90: {
      own: expandRecentRate([40, 43, 41, 48, 52, 56], 'own'),
      t: expandRecentRate([53, 52, 51, 53, 54, 55], 't'),
      sber: expandRecentRate([49, 50, 48, 51, 52, 53], 'sber'),
      vtb: expandRecentRate([43, 45, 44, 46, 47, 48], 'vtb'),
      other: expandRecentRate([44, 45, 43, 46, 47, 48], 'other'),
    },
  } as const;
  const selectedRates = activationRates[activationMetric];
  const activationDeltaSeries: BenchmarkSeries = {
    own: activationSource.map((row, index) => (row.own * selectedRates.own[index]) / 100),
    t: activationSource.map((row, index) => (row.t * selectedRates.t[index]) / 100),
    sber: activationSource.map((row, index) => (row.sber * selectedRates.sber[index]) / 100),
    vtb: activationSource.map((row, index) => (row.vtb * selectedRates.vtb[index]) / 100),
    other: activationSource.map((row, index) => (row.other * selectedRates.other[index]) / 100),
  };
  const activationChart = activationSource.map((row, index) => {
    const absoluteValues = {
      own: (row.own * selectedRates.own[index]) / 100,
      t: (row.t * selectedRates.t[index]) / 100,
      sber: (row.sber * selectedRates.sber[index]) / 100,
      vtb: (row.vtb * selectedRates.vtb[index]) / 100,
      other: (row.other * selectedRates.other[index]) / 100,
    };
    const marketTotal = Object.values(absoluteValues).reduce(
      (sum, value) => sum + value,
      0,
    );
    const values =
      activationMode === 'share'
        ? Object.fromEntries(
            Object.entries(absoluteValues).map(([key, value]) => [
              key,
              (value / marketTotal) * 100,
            ]),
          )
        : absoluteValues;
    return {
      month: row.month,
      ...values,
      total: activationMode === 'share' ? 100 : marketTotal,
    };
  });
  const marketActivationBase = activationSource.reduce(
    (sum, row) => sum + row.own + row.t + row.sber + row.vtb + row.other,
    0,
  );
  const marketActivated = activationSource.reduce(
    (sum, row, index) =>
      sum +
      (row.own * selectedRates.own[index]) / 100 +
      (row.t * selectedRates.t[index]) / 100 +
      (row.sber * selectedRates.sber[index]) / 100 +
      (row.vtb * selectedRates.vtb[index]) / 100 +
      (row.other * selectedRates.other[index]) / 100,
    0,
  );
  const activationAverages = [
    [
      'Альфа-Банк',
      selectedRates.own.reduce((sum, value) => sum + value, 0) /
        selectedRates.own.length,
      '#E8001C',
    ],
    [
      'Т-Инвестиции',
      selectedRates.t.reduce((sum, value) => sum + value, 0) /
        selectedRates.t.length,
      '#2563EB',
    ],
    [
      'СберИнвестиции',
      selectedRates.sber.reduce((sum, value) => sum + value, 0) /
        selectedRates.sber.length,
      '#7C3AED',
    ],
    [
      'ВТБ Мои Инвестиции',
      selectedRates.vtb.reduce((sum, value) => sum + value, 0) /
        selectedRates.vtb.length,
      '#0891B2',
    ],
    [
      'Рынок в целом',
      (marketActivated / marketActivationBase) * 100,
      '#64748B',
    ],
  ] as const;
  const ownActivatedTotal = activationSource.reduce(
    (sum, row, index) => sum + (row.own * selectedRates.own[index]) / 100,
    0,
  );
  const latestActivationIndex = activationSource.length - 1;
  const latestActivationAbsolute =
    (activationSource[latestActivationIndex].own * selectedRates.own[latestActivationIndex]) / 100;
  const latestMarketActivation =
    (activationSource[latestActivationIndex].own * selectedRates.own[latestActivationIndex]) / 100 +
    (activationSource[latestActivationIndex].t * selectedRates.t[latestActivationIndex]) / 100 +
    (activationSource[latestActivationIndex].sber * selectedRates.sber[latestActivationIndex]) / 100 +
    (activationSource[latestActivationIndex].vtb * selectedRates.vtb[latestActivationIndex]) / 100 +
    (activationSource[latestActivationIndex].other * selectedRates.other[latestActivationIndex]) / 100;
  const latestActivationMarketShare =
    (latestActivationAbsolute / latestMarketActivation) * 100;
  const activationMetricSummary = (
    metric: keyof typeof activationMetricLabels,
  ) => {
    const rates = activationRates[metric];
    const source = activationSource[latestActivationIndex];
    const own = (source.own * rates.own[latestActivationIndex]) / 100;
    const market =
      own +
      (source.t * rates.t[latestActivationIndex]) / 100 +
      (source.sber * rates.sber[latestActivationIndex]) / 100 +
      (source.vtb * rates.vtb[latestActivationIndex]) / 100 +
      (source.other * rates.other[latestActivationIndex]) / 100;
    return { own, share: (own / market) * 100 };
  };
  const portfolioMetricLabels = {
    turnover: 'Оборот',
    auc: 'AuC',
    mau: 'MAU клиентов',
  } as const;
  const portfolioUnits = {
    turnover: 'млрд ₽',
    auc: 'млрд ₽',
    mau: 'тыс.',
  } as const;
  const portfolioSeries = {
    turnover: {
      own: expandRecentVolume([1980, 2280, 2050, 2540, 2960, 3180], 'own'),
      t: expandRecentVolume([3920, 4280, 3810, 4470, 4680, 4821], 't'),
      sber: expandRecentVolume([3650, 3890, 3520, 4060, 4310, 4470], 'sber'),
      vtb: expandRecentVolume([2860, 3070, 2760, 3290, 3480, 3610], 'vtb'),
      other: expandRecentVolume([8240, 8860, 7960, 9340, 9820, 10180], 'other'),
    },
    auc: {
      own: expandRecentVolume([2210, 2250, 2170, 2420, 2640, 2861], 'own'),
      t: expandRecentVolume([3650, 3720, 3590, 3890, 4080, 4261], 't'),
      sber: expandRecentVolume([3380, 3440, 3310, 3590, 3780, 3920], 'sber'),
      vtb: expandRecentVolume([2640, 2690, 2580, 2810, 2960, 3070], 'vtb'),
      other: expandRecentVolume([7620, 7750, 7480, 8120, 8510, 8840], 'other'),
    },
    mau: {
      own: expandRecentVolume([420, 438, 425, 486, 553, 610], 'own'),
      t: expandRecentVolume([760, 781, 748, 806, 842, 875], 't'),
      sber: expandRecentVolume([690, 708, 681, 736, 771, 802], 'sber'),
      vtb: expandRecentVolume([548, 562, 539, 582, 609, 632], 'vtb'),
      other: expandRecentVolume([1480, 1516, 1450, 1570, 1640, 1705], 'other'),
    },
  } as const;
  const selectedPortfolio = portfolioSeries[portfolioMetric];
  const portfolioMonths = trendMonths;
  const portfolioChart = portfolioMonths.map((month, index) => {
    const values = {
      own: selectedPortfolio.own[index],
      t: selectedPortfolio.t[index],
      sber: selectedPortfolio.sber[index],
      vtb: selectedPortfolio.vtb[index],
      other: selectedPortfolio.other[index],
    };
    if (portfolioMode === 'absolute')
      return {
        month,
        ...values,
        total: Object.values(values).reduce((sum, value) => sum + value, 0),
      };
    const total = Object.values(values).reduce((sum, value) => sum + value, 0);
    return {
      month,
      own: (values.own / total) * 100,
      t: (values.t / total) * 100,
      sber: (values.sber / total) * 100,
      vtb: (values.vtb / total) * 100,
      other: (values.other / total) * 100,
      total: 100,
    };
  });
  const portfolioCagr = (values: readonly number[]) =>
    (Math.pow(values[values.length - 1] / values[0], 1 / (values.length - 1)) - 1) * 100;
  const portfolioMarketSeries = portfolioMonths.map(
    (_, index) =>
      selectedPortfolio.own[index] +
      selectedPortfolio.t[index] +
      selectedPortfolio.sber[index] +
      selectedPortfolio.vtb[index] +
      selectedPortfolio.other[index],
  );
  const portfolioGrowthRows = [
    ['Альфа-Банк', portfolioCagr(selectedPortfolio.own), '#E8001C'],
    ['Т-Инвестиции', portfolioCagr(selectedPortfolio.t), '#2563EB'],
    ['СберИнвестиции', portfolioCagr(selectedPortfolio.sber), '#7C3AED'],
    ['ВТБ Мои Инвестиции', portfolioCagr(selectedPortfolio.vtb), '#0891B2'],
    ['Рынок в целом', portfolioCagr(portfolioMarketSeries), '#64748B'],
  ] as const;
  const latestPortfolioIndex = portfolioMonths.length - 1;
  const portfolioLatestMarket = portfolioMarketSeries[latestPortfolioIndex];
  const portfolioOwnTotal =
    portfolioMetric === 'turnover'
      ? selectedPortfolio.own.reduce((sum, value) => sum + value, 0)
      : selectedPortfolio.own[latestPortfolioIndex];
  const portfolioOwnShare =
    (selectedPortfolio.own[latestPortfolioIndex] / portfolioLatestMarket) * 100;
  const churnMetricLabels = {
    dormant: 'Стали спящими',
    zeroAuc: 'Обнулили AuC',
    closed: 'Закрыли счёт',
  } as const;
  const churnSeries = {
    dormant: {
      own: expandRecentVolume([7.8, 7.1, 8.4, 7.6, 9.2, 6.8], 'own'),
      t: expandRecentVolume([12.8, 12.1, 13.4, 12.7, 14.0, 12.3], 't'),
      sber: expandRecentVolume([11.4, 10.9, 12.0, 11.3, 12.6, 11.1], 'sber'),
      vtb: expandRecentVolume([8.9, 8.4, 9.3, 8.8, 9.7, 8.6], 'vtb'),
      other: expandRecentVolume([25.8, 24.6, 27.1, 25.9, 28.4, 25.2], 'other'),
    },
    zeroAuc: {
      own: expandRecentVolume([3.2, 2.8, 3.6, 3.1, 4.0, 2.5], 'own'),
      t: expandRecentVolume([5.8, 5.4, 6.1, 5.7, 6.4, 5.5], 't'),
      sber: expandRecentVolume([4.9, 4.6, 5.2, 4.8, 5.5, 4.7], 'sber'),
      vtb: expandRecentVolume([3.7, 3.4, 3.9, 3.6, 4.2, 3.5], 'vtb'),
      other: expandRecentVolume([10.9, 10.1, 11.5, 10.7, 12.0, 10.3], 'other'),
    },
    closed: {
      own: expandRecentVolume([1.25, 1.1, 1.4, 1.2, 1.55, 0.95], 'own'),
      t: expandRecentVolume([2.6, 2.4, 2.8, 2.5, 3.0, 2.3], 't'),
      sber: expandRecentVolume([2.2, 2.0, 2.4, 2.1, 2.6, 2.0], 'sber'),
      vtb: expandRecentVolume([1.65, 1.5, 1.8, 1.6, 1.95, 1.45], 'vtb'),
      other: expandRecentVolume([5.1, 4.7, 5.5, 5.0, 5.9, 4.6], 'other'),
    },
  } as const;
  const selectedChurn = churnSeries[churnMetric];
  const churnChart = portfolioMonths.map((month, index) => {
    const values = {
      own: selectedChurn.own[index],
      t: selectedChurn.t[index],
      sber: selectedChurn.sber[index],
      vtb: selectedChurn.vtb[index],
      other: selectedChurn.other[index],
    };
    if (churnMode === 'absolute')
      return {
        month,
        ...values,
        total: Object.values(values).reduce((sum, value) => sum + value, 0),
      };
    const total = Object.values(values).reduce((sum, value) => sum + value, 0);
    return {
      month,
      own: (values.own / total) * 100,
      t: (values.t / total) * 100,
      sber: (values.sber / total) * 100,
      vtb: (values.vtb / total) * 100,
      other: (values.other / total) * 100,
      total: 100,
    };
  });
  const churnMarketSeries = portfolioMonths.map(
    (_, index) =>
      selectedChurn.own[index] +
      selectedChurn.t[index] +
      selectedChurn.sber[index] +
      selectedChurn.vtb[index] +
      selectedChurn.other[index],
  );
  const churnGrowthRows = [
    ['Альфа-Банк', portfolioCagr(selectedChurn.own), '#E8001C'],
    ['Т-Инвестиции', portfolioCagr(selectedChurn.t), '#2563EB'],
    ['СберИнвестиции', portfolioCagr(selectedChurn.sber), '#7C3AED'],
    ['ВТБ Мои Инвестиции', portfolioCagr(selectedChurn.vtb), '#0891B2'],
    ['Рынок в целом', portfolioCagr(churnMarketSeries), '#64748B'],
  ] as const;
  const churnOwnTotal = selectedChurn.own.reduce(
    (sum, value) => sum + value,
    0,
  );
  const churnLatestMarket = churnMarketSeries[latestPortfolioIndex];
  const churnOwnShare = (selectedChurn.own[latestPortfolioIndex] / churnLatestMarket) * 100;
  return (
    <div className="space-y-4">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onOpenSegment={openSegment}
        showMetric={false}
      />
      <section className="card p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
              Стратегический контур
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Сравнение с рынком
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            ФЛ · 284 тыс. клиентов
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 py-4 lg:grid-cols-4">
          {[
            ['Клиенты в срезе', '284 тыс.', 'база для всех блоков'],
            ['AuC в срезе', '1 184 млрд', 'активы выбранной группы'],
            ['Доля оборота', '14,8%', '+3,6 п.п. за период'],
            ['Потенциал оборота', '+286,4 млрд', 'до сильных участников'],
          ].map(([label, value, hint]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3">
              <span className="text-[10px] text-slate-500">{label}</span>
              <strong className="block text-lg text-slate-900">{value}</strong>
              <small className="text-[10px] text-slate-400">{hint}</small>
            </div>
          ))}
        </div>
        <div className="mt-5 flex overflow-x-auto border-b border-slate-200">
          {lifecycleOrder.map((key) => (
            <button
              key={key}
              className={`whitespace-nowrap border-b-2 px-4 py-2 text-xs font-semibold ${stage === key ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'}`}
              onClick={() => setStage(key)}
            >
              {lifecycleLabel(key)}
            </button>
          ))}
        </div>
        {stage === 'acquisition' ? (
          <div className="pt-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                  01 · ПРИВЛЕЧЕНИЕ
                </div>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Новый клиентский поток: мы, рынок и конкуренты
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Открытия за месяц · ближайшие конкуренты · 2025-01 — 2026-05
                </p>
              </div>
              <div className="flex flex-wrap rounded-lg bg-slate-100 p-1">
                {(
                  [
                    ['accounts', 'Счета'],
                    ['clients', 'Клиенты'],
                    ['accountShare', 'Доля по счетам'],
                    ['clientShare', 'Доля по клиентам'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-semibold transition ${acquisitionMetric === key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setAcquisitionMetric(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-100 p-3">
                <ResponsiveContainer width="100%" height={330}>
                  <BarChart
                    data={acquisitionChart}
                    margin={{ top: 28, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      width={82}
                      label={yAxisUnitLabel(isShare ? '%' : isAccounts ? 'тыс. счетов' : 'тыс. клиентов')}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      ticks={isShare ? [0, 25, 50, 75, 100] : undefined}
                      tickFormatter={(value) => number.format(Number(value))}
                      domain={isShare ? [0, 106] : [0, (dataMax: number) => Math.ceil(dataMax * 1.08)]}
                    />
                    <Tooltip
                      formatter={(value: number | string | undefined) => [
                        `${number.format(Number(value ?? 0))}${isShare ? '%' : ' тыс.'}`,
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Bar
                      dataKey="own"
                      stackId="flow"
                      name="Альфа-Банк"
                      fill="#E8001C"
                    >
                      <LabelList dataKey="own" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="t"
                      stackId="flow"
                      name="Т-Инвестиции"
                      fill="#2563EB"
                    >
                      <LabelList dataKey="t" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="sber"
                      stackId="flow"
                      name="СберИнвестиции"
                      fill="#7C3AED"
                    >
                      <LabelList dataKey="sber" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="vtb"
                      stackId="flow"
                      name="ВТБ Мои Инвестиции"
                      fill="#0891B2"
                    >
                      <LabelList dataKey="vtb" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="other"
                      stackId="flow"
                      name="Остальной рынок"
                      fill="#CBD5E1"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList dataKey="other" position="center" fill="#475569" fontSize={9} formatter={(value) => number.format(Number(value))} />
                      <LabelList
                        dataKey="total"
                        position="top"
                        fill="#334155"
                        fontSize={10}
                        fontWeight={700}
                        formatter={(value) => `${number.format(Number(value))}${isShare ? '%' : ' тыс.'}`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
                <MonthlyDeltaChart
                  months={acquisitionBase.map((row) => row.month)}
                  series={acquisitionDeltaSeries}
                  unit="тыс."
                />
              </div>
              <aside className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    За период
                  </span>
                  <strong className="mt-1 block text-2xl text-slate-900">
                    {isAccounts ? '197,2' : '169,7'} тыс.
                  </strong>
                  <p className="text-[10px] text-slate-500">
                    открыто у Альфа-Банка
                  </p>
                  <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-xs">
                    <span className="text-slate-500">Доля в новом потоке</span>
                    <strong className="text-red-600">
                      {isAccounts ? '11,7%' : '12,0%'}
                    </strong>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="text-xs font-bold text-slate-800">
                    Средний темп в месяц
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    CAGR по месячным открытиям · 2025-01 — 2026-05
                  </p>
                  <div className="mt-3 space-y-3">
                    {growthRows.map(([label, value, color]) => (
                      <div key={label}>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-600">{label}</span>
                          <strong>+{number.format(value)}%</strong>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (value / 8) * 100)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">
                    Вывод
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                    Альфа растёт быстрее ближайших конкурентов: разрыв по темпу
                    составляет{' '}
                    <strong>
                      +{number.format(growthRows[0][1] - growthRows[1][1])} п.п.
                    </strong>
                    , но доля в новом потоке пока ниже лидеров.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        ) : stage === 'activation' ? (
          <div className="pt-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                  02 · АКТИВАЦИЯ
                </div>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Переход нового клиента к первой торговой активности
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Три этапа активации · мы, ближайшие конкуренты и рынок
                </p>
              </div>
              <div className="flex rounded-lg bg-slate-100 p-1">
                {(
                  [
                    ['absolute', 'Клиенты'],
                    ['share', 'Доля рынка'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${activationMode === key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                    onClick={() => setActivationMode(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {(
                Object.entries(activationMetricLabels) as [
                  keyof typeof activationMetricLabels,
                  string,
                ][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  className={`rounded-xl border p-3 text-left transition ${activationMetric === key ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  onClick={() => setActivationMetric(key)}
                >
                  <span
                    className={`text-[10px] font-bold uppercase ${activationMetric === key ? 'text-blue-700' : 'text-slate-400'}`}
                  >
                    {label}
                  </span>
                  <strong className="mt-1 block text-lg text-slate-900">
                    {activationMode === 'absolute'
                      ? `${number.format(activationMetricSummary(key).own)} тыс.`
                      : `${number.format(activationMetricSummary(key).share)}%`}
                  </strong>
                  <small className="text-[10px] text-slate-500">
                    Альфа-Банк · 2026-05 ·{' '}
                    {activationMode === 'absolute'
                      ? 'активированные клиенты'
                      : 'доля всех активаций рынка'}
                  </small>
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-100 p-3">
                <ResponsiveContainer width="100%" height={330}>
                  <BarChart
                    data={activationChart}
                    margin={{ top: 28, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      width={82}
                      label={yAxisUnitLabel(activationMode === 'share' ? '%' : 'тыс. клиентов')}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      ticks={activationMode === 'share' ? [0, 25, 50, 75, 100] : undefined}
                      domain={activationMode === 'share' ? [0, 106] : [0, (dataMax: number) => Math.ceil(dataMax * 1.08)]}
                      tickFormatter={(value) => number.format(Number(value))}
                    />
                    <Tooltip
                      formatter={(value: number | string | undefined) => [
                        `${number.format(Number(value ?? 0))}${activationMode === 'share' ? '%' : ' тыс.'}`,
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Bar
                      dataKey="own"
                      stackId="activation"
                      name="Альфа-Банк"
                      fill="#E8001C"
                    >
                      <LabelList dataKey="own" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="t"
                      stackId="activation"
                      name="Т-Инвестиции"
                      fill="#2563EB"
                    >
                      <LabelList dataKey="t" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="sber"
                      stackId="activation"
                      name="СберИнвестиции"
                      fill="#7C3AED"
                    >
                      <LabelList dataKey="sber" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="vtb"
                      stackId="activation"
                      name="ВТБ Мои Инвестиции"
                      fill="#0891B2"
                    >
                      <LabelList dataKey="vtb" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="other"
                      stackId="activation"
                      name="Остальной рынок"
                      fill="#CBD5E1"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList dataKey="other" position="center" fill="#475569" fontSize={9} formatter={(value) => number.format(Number(value))} />
                      <LabelList dataKey="total" position="top" fill="#334155" fontSize={10} fontWeight={700} formatter={(value) => `${number.format(Number(value))}${activationMode === 'absolute' ? ' тыс.' : '%'}`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
                <MonthlyDeltaChart
                  months={activationSource.map((row) => row.month)}
                  series={activationDeltaSeries}
                  unit="тыс."
                />
              </div>
              <aside className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Активировано за период
                  </span>
                  <strong className="mt-1 block text-2xl text-slate-900">
                    {activationMode === 'absolute'
                      ? `${number.format(ownActivatedTotal)} тыс.`
                      : `${number.format((ownActivatedTotal / marketActivated) * 100)}%`}
                  </strong>
                  <p className="text-[10px] text-slate-500">
                    {activationMetricLabels[activationMetric]} · Альфа-Банк
                  </p>
                  <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-xs">
                    <span className="text-slate-500">Доля рынка в активациях · 2026-05</span>
                    <strong className="text-red-600">
                      {number.format(latestActivationMarketShare)}%
                    </strong>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="text-xs font-bold text-slate-800">
                    Средняя доля активации
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Среднее за шесть месяцев
                  </p>
                  <div className="mt-3 space-y-3">
                    {activationAverages.map(([label, value, color]) => (
                      <div key={label}>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-600">{label}</span>
                          <strong>{number.format(value)}%</strong>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (value / 70) * 100)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <span className="text-[10px] font-bold uppercase text-amber-700">
                    Разрыв с рынком
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-amber-900">
                    По показателю «{activationMetricLabels[activationMetric]}»
                    Альфа отстаёт от рынка на{' '}
                    <strong>
                      {number.format(
                        activationAverages[4][1] - activationAverages[0][1],
                      )}{' '}
                      п.п.
                    </strong>{' '}
                    Основная зона роста — первые 30 дней.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        ) : stage === 'portfolio' ? (
          <div className="pt-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                  03 · АКТИВНОСТЬ
                </div>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Масштаб и активность клиентского портфеля
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Оборот, активы и месячная активная аудитория · мы, конкуренты
                  и рынок
                </p>
              </div>
              <div className="flex rounded-lg bg-slate-100 p-1">
                {(
                  [
                    ['absolute', 'Объём'],
                    ['share', 'Доля рынка'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${portfolioMode === key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                    onClick={() => setPortfolioMode(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {(
                Object.entries(portfolioMetricLabels) as [
                  keyof typeof portfolioMetricLabels,
                  string,
                ][]
              ).map(([key, label]) => {
                const series = portfolioSeries[key];
                const market =
                  series.own[latestPortfolioIndex] +
                  series.t[latestPortfolioIndex] +
                  series.sber[latestPortfolioIndex] +
                  series.vtb[latestPortfolioIndex] +
                  series.other[latestPortfolioIndex];
                return (
                  <button
                    key={key}
                    className={`rounded-xl border p-3 text-left transition ${portfolioMetric === key ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    onClick={() => setPortfolioMetric(key)}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase ${portfolioMetric === key ? 'text-blue-700' : 'text-slate-400'}`}
                    >
                      {label}
                    </span>
                    <strong className="mt-1 block text-lg text-slate-900">
                      {number.format(series.own[latestPortfolioIndex])} {portfolioUnits[key]}
                    </strong>
                    <small className="text-[10px] text-slate-500">
                      Доля рынка {number.format((series.own[latestPortfolioIndex] / market) * 100)}
                      % · 2026-05
                    </small>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-100 p-3">
                <ResponsiveContainer width="100%" height={330}>
                  <BarChart
                    data={portfolioChart}
                    margin={{ top: 28, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      width={82}
                      label={yAxisUnitLabel(
                        portfolioMode === 'share'
                          ? '%'
                          : portfolioMetric === 'mau'
                            ? 'тыс. клиентов'
                            : portfolioUnits[portfolioMetric],
                      )}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      ticks={portfolioMode === 'share' ? [0, 25, 50, 75, 100] : undefined}
                      domain={portfolioMode === 'share' ? [0, 106] : [0, (dataMax: number) => Math.ceil(dataMax * 1.08)]}
                      tickFormatter={(value) => number.format(Number(value))}
                    />
                    <Tooltip
                      formatter={(value: number | string | undefined) => [
                        `${number.format(Number(value ?? 0))}${portfolioMode === 'share' ? '%' : ` ${portfolioUnits[portfolioMetric]}`}`,
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Bar
                      dataKey="own"
                      stackId="portfolio"
                      name="Альфа-Банк"
                      fill="#E8001C"
                    >
                      <LabelList dataKey="own" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="t"
                      stackId="portfolio"
                      name="Т-Инвестиции"
                      fill="#2563EB"
                    >
                      <LabelList dataKey="t" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="sber"
                      stackId="portfolio"
                      name="СберИнвестиции"
                      fill="#7C3AED"
                    >
                      <LabelList dataKey="sber" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="vtb"
                      stackId="portfolio"
                      name="ВТБ Мои Инвестиции"
                      fill="#0891B2"
                    >
                      <LabelList dataKey="vtb" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="other"
                      stackId="portfolio"
                      name="Остальной рынок"
                      fill="#CBD5E1"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList dataKey="other" position="center" fill="#475569" fontSize={9} formatter={(value) => number.format(Number(value))} />
                      <LabelList
                        dataKey="total"
                        position="top"
                        fill="#334155"
                        fontSize={10}
                        fontWeight={700}
                        formatter={(value) => `${number.format(Number(value))}${portfolioMode === 'share' ? '%' : ` ${portfolioUnits[portfolioMetric]}`}`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
                <MonthlyDeltaChart
                  months={portfolioMonths}
                  series={selectedPortfolio}
                  unit={portfolioUnits[portfolioMetric]}
                />
              </div>
              <aside className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {portfolioMetric === 'turnover'
                      ? 'За период'
                      : 'На конец периода'}
                  </span>
                  <strong className="mt-1 block text-2xl text-slate-900">
                    {number.format(portfolioOwnTotal)}{' '}
                    {portfolioUnits[portfolioMetric]}
                  </strong>
                  <p className="text-[10px] text-slate-500">
                    {portfolioMetricLabels[portfolioMetric]} · Альфа-Банк
                  </p>
                  <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-xs">
                    <span className="text-slate-500">Доля рынка</span>
                    <strong className="text-red-600">
                      {number.format(portfolioOwnShare)}%
                    </strong>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="text-xs font-bold text-slate-800">
                    Средний темп в месяц
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    CAGR · 2025-01 — 2026-05
                  </p>
                  <div className="mt-3 space-y-3">
                    {portfolioGrowthRows.map(([label, value, color]) => (
                      <div key={label}>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-600">{label}</span>
                          <strong>+{number.format(value)}%</strong>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (value / 9) * 100)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">
                    Динамика
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                    {portfolioMetricLabels[portfolioMetric]} Альфы растёт
                    быстрее рынка на{' '}
                    <strong>
                      +
                      {number.format(
                        portfolioGrowthRows[0][1] - portfolioGrowthRows[4][1],
                      )}{' '}
                      п.п.
                    </strong>{' '}
                    в среднем за месяц.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        ) : stage === 'churn' ? (
          <div className="pt-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                  04 · ОТТОК
                </div>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Потери клиентской базы: мы, рынок и конкуренты
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Спящие клиенты, обнуление активов и закрытие счетов · 2025-01 — 2026-05
                </p>
              </div>
              <div className="flex flex-wrap rounded-lg bg-slate-100 p-1">
                {(
                  [
                    ['absolute', 'Клиенты'],
                    ['share', 'Доля оттока'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${churnMode === key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                    onClick={() => setChurnMode(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {(
                Object.entries(churnMetricLabels) as [
                  keyof typeof churnMetricLabels,
                  string,
                ][]
              ).map(([key, label]) => {
                const series = churnSeries[key];
                const market =
                  series.own[latestPortfolioIndex] +
                  series.t[latestPortfolioIndex] +
                  series.sber[latestPortfolioIndex] +
                  series.vtb[latestPortfolioIndex] +
                  series.other[latestPortfolioIndex];
                return (
                  <button
                    key={key}
                    className={`rounded-xl border p-3 text-left transition ${churnMetric === key ? 'border-red-300 bg-red-50 ring-1 ring-red-200' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    onClick={() => setChurnMetric(key)}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase ${churnMetric === key ? 'text-red-700' : 'text-slate-400'}`}
                    >
                      {label}
                    </span>
                    <strong className="mt-1 block text-lg text-slate-900">
                      {number.format(series.own[latestPortfolioIndex])} тыс.
                    </strong>
                    <small className="text-[10px] text-slate-500">
                      Доля рыночного оттока{' '}
                      {number.format((series.own[latestPortfolioIndex] / market) * 100)}% ·
                      2026-05
                    </small>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-100 p-3">
                <ResponsiveContainer width="100%" height={330}>
                  <BarChart
                    data={churnChart}
                    margin={{ top: 28, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      width={82}
                      label={yAxisUnitLabel(churnMode === 'share' ? '%' : 'тыс. клиентов')}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      ticks={churnMode === 'share' ? [0, 25, 50, 75, 100] : undefined}
                      domain={churnMode === 'share' ? [0, 106] : [0, (dataMax: number) => Math.ceil(dataMax * 1.08)]}
                      tickFormatter={(value) => number.format(Number(value))}
                    />
                    <Tooltip
                      formatter={(value: number | string | undefined) => [
                        `${number.format(Number(value ?? 0))}${churnMode === 'share' ? '%' : ' тыс.'}`,
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Bar
                      dataKey="own"
                      stackId="churn"
                      name="Альфа-Банк"
                      fill="#E8001C"
                    >
                      <LabelList dataKey="own" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="t"
                      stackId="churn"
                      name="Т-Инвестиции"
                      fill="#2563EB"
                    >
                      <LabelList dataKey="t" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="sber"
                      stackId="churn"
                      name="СберИнвестиции"
                      fill="#7C3AED"
                    >
                      <LabelList dataKey="sber" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="vtb"
                      stackId="churn"
                      name="ВТБ Мои Инвестиции"
                      fill="#0891B2"
                    >
                      <LabelList dataKey="vtb" position="center" fill="#fff" fontSize={9} formatter={(value) => number.format(Number(value))} />
                    </Bar>
                    <Bar
                      dataKey="other"
                      stackId="churn"
                      name="Остальной рынок"
                      fill="#CBD5E1"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList dataKey="other" position="center" fill="#475569" fontSize={9} formatter={(value) => number.format(Number(value))} />
                      <LabelList
                        dataKey="total"
                        position="top"
                        fill="#334155"
                        fontSize={10}
                        fontWeight={700}
                        formatter={(value) => `${number.format(Number(value))}${churnMode === 'share' ? '%' : ' тыс.'}`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
                <MonthlyDeltaChart
                  months={portfolioMonths}
                  series={selectedChurn}
                  unit="тыс."
                />
              </div>
              <aside className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    За период
                  </span>
                  <strong className="mt-1 block text-2xl text-slate-900">
                    {number.format(churnOwnTotal)} тыс.
                  </strong>
                  <p className="text-[10px] text-slate-500">
                    {churnMetricLabels[churnMetric]} · Альфа-Банк
                  </p>
                  <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-xs">
                    <span className="text-slate-500">
                      Доля рыночного оттока
                    </span>
                    <strong className="text-red-600">
                      {number.format(churnOwnShare)}%
                    </strong>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="text-xs font-bold text-slate-800">
                    Средний темп в месяц
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    CAGR события оттока · 2025-01 — 2026-05
                  </p>
                  <div className="mt-3 space-y-3">
                    {churnGrowthRows.map(([label, value, color]) => (
                      <div key={label}>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-600">{label}</span>
                          <strong>+{number.format(value)}%</strong>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (value / 15) * 100)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <span className="text-[10px] font-bold uppercase text-red-700">
                    Сигнал риска
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-red-900">
                    {churnMetricLabels[churnMetric]} у Альфы растёт быстрее
                    рынка на{' '}
                    <strong>
                      +
                      {number.format(
                        churnGrowthRows[0][1] - churnGrowthRows[4][1],
                      )}{' '}
                      п.п.
                    </strong>{' '}
                    в среднем за месяц.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 pt-5 lg:grid-cols-[320px_1fr]">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                {String(lifecycleOrder.indexOf(stage) + 1).padStart(2, '0')} ·{' '}
                {lifecycleLabel(stage)}
              </div>
              <h3 className="mt-2 text-lg font-bold text-slate-900">
                {current.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {current.copy}
              </p>
              <div className="mt-4 space-y-2">
                {current.values.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                  >
                    <span className="text-slate-500">{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis width={76} label={yAxisUnitLabel(stageAxisUnit)} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => number.format(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="own"
                    name="Альфа-Банк"
                    stroke="#E21B2D"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="peer"
                    name="Медиана группы"
                    stroke="#2563EB"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const GroupsSection = () => {
  const [groupA, setGroupA] = useState('affluent');
  const [groupB, setGroupB] = useState('mass');
  const [cell, setCell] = useState<[number, number] | null>(null);
  const a = groupProfiles[groupA];
  const b = groupProfiles[groupB];
  const rows: [string, keyof typeof a, string][] = [
    ['Клиенты', 'clients', 'тыс.'],
    ['AuC', 'auc', 'млрд ₽'],
    ['Активация 90 дней', 'activation', '%'],
    ['Активны у других', 'external', '%'],
    ['Удержание 180 дней', 'retention', '%'],
    ['Спящие клиенты', 'dormant', '%'],
  ];
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Две аудитории и рынок
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Сравнение клиентских групп
          </h2>
          <p className="text-xs text-slate-500">
            Выберите две аудитории и провалитесь в сегмент
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          Рынок — база сравнения
        </span>
      </div>
      <div className="mt-4 grid items-end gap-3 md:grid-cols-[1fr_auto_1fr_1fr]">
        <label className="text-[10px] font-bold uppercase text-slate-400">
          Группа A
          <select
            className="mt-1 block w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
            value={groupA}
            onChange={(event) => setGroupA(event.target.value)}
          >
            {Object.entries(groupProfiles).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="mb-0.5 rounded-lg border border-slate-200 p-2.5"
          onClick={() => {
            setGroupA(groupB);
            setGroupB(groupA);
          }}
        >
          <RefreshCw size={14} />
        </button>
        <label className="text-[10px] font-bold uppercase text-slate-400">
          Группа B
          <select
            className="mt-1 block w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
            value={groupB}
            onChange={(event) => setGroupB(event.target.value)}
          >
            {Object.entries(groupProfiles).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-lg bg-slate-50 p-2.5 text-xs">
          <span className="block text-[10px] text-slate-400">
            База сравнения
          </span>
          <strong>Рынок выбранных клиентов</strong>
        </div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_260px]">
        <div>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Метрика</th>
                  <th>{a.name}</th>
                  <th>{b.name}</th>
                  <th>Рынок</th>
                  <th>Разница A/B</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, key, unit]) => {
                  const av = Number(a[key]);
                  const bv = Number(b[key]);
                  const market = ((av + bv) / 2) * 0.92;
                  return (
                    <tr key={label}>
                      <td className="font-semibold">{label}</td>
                      <td>
                        {number.format(av)} {unit}
                      </td>
                      <td>
                        {number.format(bv)} {unit}
                      </td>
                      <td>
                        {number.format(market)} {unit}
                      </td>
                      <td
                        className={
                          av - bv >= 0
                            ? 'font-semibold text-emerald-600'
                            : 'font-semibold text-red-600'
                        }
                      >
                        {av - bv >= 0 ? '+' : ''}
                        {number.format(av - bv)} {unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-5">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Матрица iAUM × частота сделок
              </h3>
              <p className="text-xs text-slate-500">
                Нажмите ячейку для детализации сегмента
              </p>
            </div>
            <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1 text-[9px]">
              <div />
              {['Редко', 'Квартал', 'Месяц', 'Неделя', 'Ежедневно'].map(
                (value) => (
                  <div key={value} className="p-1 text-center text-slate-400">
                    {value}
                  </div>
                ),
              )}
              {[
                '< 1 млн',
                '1–10 млн',
                '10–50 млн',
                '50–500 млн',
                '500 млн+',
              ].flatMap((rowLabel, row) => [
                <div
                  key={`${rowLabel}-label`}
                  className="flex items-center text-slate-500"
                >
                  {rowLabel}
                </div>,
                ...[18, 32, 46, 62, 79].map((base, col) => (
                  <button
                    key={`${row}-${col}`}
                    className={`h-10 rounded text-[10px] font-bold ${cell?.[0] === row && cell?.[1] === col ? 'ring-2 ring-blue-600' : ''}`}
                    style={{
                      background: `rgba(37,99,235,${(base + row * 5 - col * 2) / 100})`,
                      color: base > 48 ? 'white' : '#334155',
                    }}
                    onClick={() => setCell([row, col])}
                  >
                    {Math.max(3, base + row * 7 - col * 3)} тыс.
                  </button>
                )),
              ])}
            </div>
          </div>
        </div>
        <aside className="space-y-3">
          <div className="rounded-xl bg-blue-50 p-4">
            <span className="text-[10px] font-bold uppercase text-blue-600">
              Главное отличие
            </span>
            <strong className="mt-2 block text-2xl text-blue-950">
              AuC {a.auc > b.auc ? '+' : ''}
              {number.format(((a.auc - b.auc) / b.auc) * 100)}%
            </strong>
            <p className="mt-2 text-xs text-blue-800">
              Группа A{' '}
              {a.clients < b.clients
                ? 'меньше по числу клиентов, но сильнее по активам'
                : 'крупнее по базе клиентов'}
              .
            </p>
          </div>
          <div className="card p-4">
            <div className="text-xs font-bold">Выбранный сегмент</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {cell
                ? `iAUM: ${['< 1 млн', '1–10 млн', '10–50 млн', '50–500 млн', '500 млн+'][cell[0]]}; частота: ${['редко', 'квартал', 'месяц', 'неделя', 'ежедневно'][cell[1]]}. Потенциал оборота: +${42 + cell[0] * 18 + cell[1] * 7} млрд ₽.`
                : 'Выберите ячейку матрицы для детализации.'}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export const BrokerRankingView = ({
  companyId,
  audience,
}: {
  companyId: string;
  audience: AnalyticsAudience;
}) => {
  const [filters, setFilters] = useState(defaultFilters);
  const [drawer, setDrawer] = useState(false);
  return (
    <div className="space-y-4">
      <div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
            <BarChart3 size={15} />
            Рыночная и клиентская аналитика
          </div>
        </div>
      </div>
      <TrustStrip audience={audience} peerGroup={filters.peerGroup} onPeerGroupChange={(peerGroup) => setFilters({ ...filters, peerGroup })} />
      <RankingSection
        companyId={companyId}
        audience={audience}
        filters={filters}
        setFilters={setFilters}
        openSegment={() => setDrawer(true)}
      />
      <SegmentDrawer
        open={drawer}
        filters={filters}
        onClose={() => setDrawer(false)}
        onApply={(next) => {
          setFilters(next);
          setDrawer(false);
        }}
      />
    </div>
  );
};

export const BrokerPortfolioView = ({
  audience,
}: {
  audience: AnalyticsAudience;
}) => {
  const [filters, setFilters] = useState(defaultFilters);
  const [drawer, setDrawer] = useState(false);
  const [portfolioSection, setPortfolioSection] = useState<
    'dynamics' | 'structure' | 'external'
  >('structure');
  const [asset, setAsset] = useState('Акции');
  const [month, setMonth] = useState(5);
  const [bucket, setBucket] = useState(3);
  const [structureMatrixSelection, setStructureMatrixSelection] = useState<{
    type: 'cell' | 'row' | 'column' | 'all';
    row?: number;
    col?: number;
  }>({ type: 'cell', row: 2, col: 3 });
  const [structureMatrixMetric, setStructureMatrixMetric] = useState<'clients' | 'turnover' | 'auc'>('clients');
  const [externalMetric, setExternalMetric] = useState<'clients' | 'turnover' | 'auc'>('auc');
  const [externalValueMode, setExternalValueMode] = useState<'share' | 'absolute'>('absolute');
  const [externalGapView, setExternalGapView] = useState<'markets' | 'products'>('markets');
  const [externalProduct, setExternalProduct] = useState('Срочный рынок');
  const distribution = portfolioBuckets.map((range, index) => ({
    range,
    clients: portfolioHeatmap[month][index],
  }));
  const structureFrequencies = ['Реже раза в год (спящие)', 'Раз в год', 'Раз в квартал', 'Раз в месяц', 'Ежедневно'] as const;
  const structureMatrix = [
    { group: 'UHNWI', range: '> 500 млн ₽', values: [8.24, 5.579, 3.763, 2.465, 1.168] },
    { group: 'HNWI', range: '50–500 млн ₽', values: [68.4, 44.634, 30.102, 19.722, 9.342] },
    { group: 'Affluent', range: '5–50 млн ₽', values: [440.8, 316.158, 213.222, 139.698, 66.173] },
    { group: 'Mass', range: '0,5–5 млн ₽', values: [1450.6, 1190.24, 802.72, 525.92, 249.12] },
    { group: 'Mini Mass', range: '< 500 тыс. ₽', values: [2600.4, 2157.31, 1454.93, 953.23, 451.53] },
  ] as const;
  const structureMetricMeta = {
    clients: { label: 'Клиенты', unit: 'тыс.' },
    turnover: { label: 'Оборот', unit: 'млрд ₽' },
    auc: { label: 'AuC', unit: 'млрд ₽' },
  } as const;
  const aucPerClient = [820, 180, 18, 2.1, 0.28] as const;
  const turnoverFrequency = [0.12, 0.8, 2.4, 7.2, 22] as const;
  const turnoverWealth = [4.2, 3.1, 2.0, 1.15, 0.65] as const;
  const structureMatrixValues = structureMatrix.map((row, rowIndex) =>
    row.values.map((clients, colIndex) => {
      if (structureMatrixMetric === 'clients') return clients;
      if (structureMatrixMetric === 'auc') return clients * aucPerClient[rowIndex];
      return clients * turnoverFrequency[colIndex] * turnoverWealth[rowIndex];
    }),
  );
  const structureMatrixGrandTotal = structureMatrixValues.reduce(
    (sum, row) => sum + row.reduce((rowSum, value) => rowSum + value, 0),
    0,
  );
  const structureMatrixMax = Math.max(...structureMatrixValues.flat());
  const selectedStructureMarket = structureMatrixSelection.type === 'all'
    ? structureMatrixGrandTotal
    : structureMatrixSelection.type === 'row'
      ? structureMatrixValues[structureMatrixSelection.row ?? 0].reduce((sum,value) => sum + value,0)
      : structureMatrixSelection.type === 'column'
        ? structureMatrixValues.reduce((sum,row) => sum + row[structureMatrixSelection.col ?? 0],0)
        : structureMatrixValues[structureMatrixSelection.row ?? 0][structureMatrixSelection.col ?? 0];
  const selectedStructureBrokerShare = structureMatrixSelection.type === 'all'
    ? 12.5
    : 10.8 + (structureMatrixSelection.row ?? 2) * 0.65 + (structureMatrixSelection.col ?? 2) * 0.3;
  const selectedStructureCompetitorShare = selectedStructureBrokerShare + ((structureMatrixSelection.col ?? 2) < 3 ? 1.4 : -0.7);
  const selectedStructureBroker = selectedStructureMarket * selectedStructureBrokerShare / 100;
  const selectedStructureCompetitor = selectedStructureMarket * selectedStructureCompetitorShare / 100;
  const structureMetricUnit = structureMetricMeta[structureMatrixMetric].unit;
  const externalRoleMix = externalMetric === 'clients' ? [42,21,22,15] : externalMetric === 'turnover' ? [31,28,25,16] : [38,30,20,12];
  const externalRoleTrendSource = {
    clients: [[47,17,21,15],[46,19,20,15],[47,18,21,14],[44,20,21,15],[43,19,23,15],[42,21,22,15]],
    turnover: [[35,24,24,17],[33,27,23,17],[34,25,25,16],[31,29,24,16],[32,26,26,16],[31,28,25,16]],
    auc: [[33,27,23,17],[35,28,21,16],[34,27,23,16],[37,30,20,13],[36,29,21,14],[38,30,20,12]],
  } as const;
  const externalRoleRecent = externalRoleTrendSource[externalMetric];
  const externalRoleStart = externalRoleRecent[0];
  const externalRoleHistory = trendMonths.slice(0, -recentMonthCount).map((_, index) => {
    const distance = historyMonthCount - index;
    const onlyUs = externalRoleStart[0] + distance * 0.22;
    const primary = externalRoleStart[1] - distance * 0.08;
    const second = externalRoleStart[2] - distance * 0.06;
    return [onlyUs, primary, second, 100 - onlyUs - primary - second];
  });
  const externalRoleRows = [...externalRoleHistory, ...externalRoleRecent];
  const externalRoleTrend = trendMonths.map((roleMonth,index) => ({
    month: roleMonth,
    onlyUs: externalRoleRows[index][0],
    primary: externalRoleRows[index][1],
    second: externalRoleRows[index][2],
    peripheral: externalRoleRows[index][3],
  }));
  const externalStrongRoleStart = externalRoleTrend[0].onlyUs + externalRoleTrend[0].primary;
  const externalStrongRoleEnd = externalRoleTrend[externalRoleTrend.length - 1].onlyUs + externalRoleTrend[externalRoleTrend.length - 1].primary;
  const externalStrongRoleDelta = externalStrongRoleEnd - externalStrongRoleStart;
  const externalMatrixValues = structureMatrix.map((row, rowIndex) =>
    row.values.map((clients, colIndex) => {
      if (externalMetric === 'clients') return clients;
      if (externalMetric === 'auc') return clients * aucPerClient[rowIndex];
      return clients * turnoverFrequency[colIndex] * turnoverWealth[rowIndex];
    }),
  );
  const externalSelectedTotal = structureMatrixSelection.type === 'all'
    ? externalMatrixValues.reduce((sum,row) => sum + row.reduce((rowSum,value) => rowSum + value,0),0)
    : structureMatrixSelection.type === 'row'
      ? externalMatrixValues[structureMatrixSelection.row ?? 0].reduce((sum,value) => sum + value,0)
      : structureMatrixSelection.type === 'column'
        ? externalMatrixValues.reduce((sum,row) => sum + row[structureMatrixSelection.col ?? 0],0)
        : externalMatrixValues[structureMatrixSelection.row ?? 0][structureMatrixSelection.col ?? 0];
  const externalMetricUnit = structureMetricMeta[externalMetric].unit;
  const formatExternalAbsolute = (share: number) => `${number.format(externalSelectedTotal * share / 100)} ${externalMetricUnit}`;
  const formatExternalValue = (share: number) => externalValueMode === 'share' ? `${number.format(share)}%` : formatExternalAbsolute(share);
  const externalMarketGapMetrics = {
    EQUITY: { ours:46, others:51, change:-1.8, concentrated:'Брокеры #1 и #2' },
    FUNDS: { ours:22, others:31, change:-2.4, concentrated:'Брокер #1' },
    BONDS: { ours:18, others:34, change:-1.2, concentrated:'Брокеры #2 и #3' },
    DERIVATIVES: { ours:7, others:26, change:2.8, concentrated:'Брокеры #3 и #4' },
    FX: { ours:28, others:43, change:1.4, concentrated:'Брокеры #2 и #4' },
    METALS: { ours:9, others:17, change:-0.7, concentrated:'Брокер #3' },
    MONEY: { ours:35, others:42, change:-3.1, concentrated:'Брокеры #1 и #2' },
  } as const;
  const externalProductGapMetrics = {
    'Акции': { ours:46, others:51, change:-1.8, concentrated:'Брокеры #1 и #2' },
    'Инвестиционные паи': { ours:24, others:33, change:-2.1, concentrated:'Брокер #1' },
    'БПИФ / ETF': { ours:19, others:29, change:-0.8, concentrated:'Брокеры #1 и #3' },
    'ОФЗ': { ours:23, others:37, change:-1.2, concentrated:'Брокеры #2 и #3' },
    'Корпоративные облигации': { ours:17, others:36, change:1.6, concentrated:'Брокеры #2 и #3' },
    'Первичные размещения': { ours:8, others:21, change:2.4, concentrated:'Брокер #3' },
    'Однодневные облигации': { ours:11, others:16, change:-0.5, concentrated:'Брокер #2' },
    'Индексные фьючерсы': { ours:12, others:31, change:2.8, concentrated:'Брокеры #3 и #4' },
    'Валютные фьючерсы': { ours:9, others:27, change:1.9, concentrated:'Брокер #4' },
    'Товарные фьючерсы': { ours:5, others:19, change:3.2, concentrated:'Брокеры #3 и #4' },
    'Опционы': { ours:4, others:18, change:2.5, concentrated:'Брокер #3' },
    'Спот TOD': { ours:31, others:44, change:0.8, concentrated:'Брокеры #2 и #4' },
    'Спот TOM': { ours:28, others:42, change:1.4, concentrated:'Брокеры #2 и #4' },
    'Свопы': { ours:20, others:39, change:2.2, concentrated:'Брокер #4' },
    'Внебиржевая ликвидность': { ours:16, others:31, change:3, concentrated:'Брокер #2' },
    'Золото': { ours:10, others:18, change:-0.7, concentrated:'Брокер #3' },
    'Серебро': { ours:5, others:11, change:-0.2, concentrated:'Брокер #3' },
    'РЕПО с ЦК': { ours:39, others:46, change:-3.1, concentrated:'Брокеры #1 и #2' },
    'Депозиты с ЦК': { ours:27, others:39, change:-1.6, concentrated:'Брокер #1' },
    'Кредитный рынок': { ours:14, others:25, change:0.9, concentrated:'Брокер #2' },
  } as const;
  const withGapPriority = <T extends { ours:number; others:number }>(row:T) => {
    const gap = row.others - row.ours;
    return { ...row, gap, priority: gap >= 12 ? 'Высокая' : gap >= 7 ? 'Средняя' : 'Низкая' };
  };
  const externalMarketGapRows = markets
    .filter(([key]) => key !== 'ALL')
    .map(([key,label]) => withGapPriority({ name:label, market:label, ...externalMarketGapMetrics[key as keyof typeof externalMarketGapMetrics] }))
    .sort((a,b) => b.gap - a.gap);
  const externalProductGapRows = markets
    .filter(([key]) => key !== 'ALL')
    .flatMap(([key,marketLabel]) => productCatalog[key]
      .filter((product) => product !== 'Все продукты')
      .map((product) => withGapPriority({ name:product, market:marketLabel, ...externalProductGapMetrics[product as keyof typeof externalProductGapMetrics] })))
    .sort((a,b) => b.gap - a.gap);
  const activeExternalGapRows = externalGapView === 'markets' ? externalMarketGapRows : externalProductGapRows;
  const selectedExternalGapRow = activeExternalGapRows.find((row) => row.name === externalProduct) ?? activeExternalGapRows[0];
  const externalRoleVolumeFactors = [0.82,0.85,0.83,0.88,0.9,0.92,0.89,0.94,0.93,0.97,0.96,0.95,0.98,0.96,1.01,0.99,1];
  const externalRoleTrendDisplay = externalRoleTrend.map((item,index) => {
    const monthlyTotal = externalSelectedTotal * externalRoleVolumeFactors[index];
    const toDisplayValue = (share: number) => externalValueMode === 'share' ? share : monthlyTotal * share / 100;
    return {
      month: item.month,
      onlyUs: toDisplayValue(item.onlyUs),
      primary: toDisplayValue(item.primary),
      second: toDisplayValue(item.second),
      peripheral: toDisplayValue(item.peripheral),
      total: externalValueMode === 'share' ? 100 : monthlyTotal,
    };
  });
  const externalWalletSource = externalMetric === 'turnover'
    ? {
        total: expandRecentVolume([4450,4930,4210,5120,5350,5420], 'market'),
        ours: expandRecentVolume([2440,2700,2210,2890,3060,3180], 'own'),
      }
    : {
        total: expandRecentVolume([1710,1775,1690,1850,1930,1980], 'market'),
        ours: expandRecentVolume([1000,1040,970,1070,1130,1184], 'own'),
      };
  const externalWalletDefaultSelection = externalMetric === 'turnover' ? 2011.6512 : 2514.564;
  const externalWalletScale = externalMetric === 'clients' ? 1 : externalSelectedTotal / externalWalletDefaultSelection;
  const externalWalletTrend = trendMonths.map((walletMonth,index) => {
    const total = externalWalletSource.total[index] * externalWalletScale;
    const ours = externalWalletSource.ours[index] * externalWalletScale;
    const outside = total - ours;
    return {
      month: walletMonth,
      total: externalValueMode === 'share' ? 100 : total,
      ours: externalValueMode === 'share' ? ours / total * 100 : ours,
      outside: externalValueMode === 'share' ? outside / total * 100 : outside,
    };
  });
  const externalWalletLatestAbsolute = (() => {
    const latestIndex = externalWalletSource.total.length - 1;
    const total = externalWalletSource.total[latestIndex] * externalWalletScale;
    const ours = externalWalletSource.ours[latestIndex] * externalWalletScale;
    return { total, ours, outside: total - ours, share: ours / total * 100 };
  })();
  const externalWalletShareStart = externalWalletSource.ours[0] / externalWalletSource.total[0] * 100;
  const externalWalletShareDelta = externalWalletLatestAbsolute.share - externalWalletShareStart;
  const roundShare = (value: number) => Math.round(value * 10) / 10;
  const externalBrokerCountCurrent = externalMetric === 'clients'
    ? [42, 31, 19, 8]
    : externalMetric === 'turnover'
      ? [31, 34, 23, 12]
      : [38, 32, 20, 10];
  const brokerCountWave = [0,0.6,-0.4,0.8,-0.2,0.7,-0.5,0.4,-0.6,0.5,-0.3,0.7,-0.4,0.5,-0.2,0.3,0];
  const externalBrokerCountTrend = trendMonths.map((countMonth, index) => {
    const remaining = 1 - index / (trendMonths.length - 1);
    const wave = brokerCountWave[index];
    const onlyAlpha = roundShare(externalBrokerCountCurrent[0] + 9 * remaining + wave);
    const twoBrokers = roundShare(externalBrokerCountCurrent[1] - 3 * remaining - wave * 0.35);
    const threeFour = roundShare(externalBrokerCountCurrent[2] - 3 * remaining + wave * 0.15);
    const fivePlus = roundShare(100 - onlyAlpha - twoBrokers - threeFour);
    return {
      month: countMonth,
      onlyAlpha,
      onlyAlphaLabel: index === 0 || index === trendMonths.length - 1 ? onlyAlpha : null,
      twoBrokers,
      threeFour,
      fivePlus,
    };
  });
  const exclusiveShareStart = externalBrokerCountTrend[0].onlyAlpha;
  const exclusiveShareEnd = externalBrokerCountTrend[externalBrokerCountTrend.length - 1].onlyAlpha;
  const exclusiveShareDelta = exclusiveShareEnd - exclusiveShareStart;
  return (
    <div className="space-y-4">
      <TrustStrip audience={audience} peerGroup={filters.peerGroup} onPeerGroupChange={(peerGroup) => setFilters({ ...filters, peerGroup })} />
      <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 md:grid-cols-3">
        {(
          [
            ['structure', '01', 'Структура портфеля', 'Поведение и AuC-сегменты'],
            ['dynamics', '02', 'Динамика портфеля', 'Клиентский цикл во времени'],
            ['external', '03', 'Внешний портфель', 'Активность клиентов у других брокеров'],
          ] as const
        ).map(([key, index, title, subtitle]) => (
          <button
            key={key}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition ${portfolioSection === key ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white/70'}`}
            onClick={() => setPortfolioSection(key)}
          >
            <span className={`text-xs font-bold ${portfolioSection === key ? 'text-blue-600' : 'text-slate-400'}`}>{index}</span>
            <span>
              <strong className="block text-sm text-slate-900">{title}</strong>
              <small className="text-[10px] text-slate-500">{subtitle}</small>
            </span>
          </button>
        ))}
      </div>
      {portfolioSection === 'dynamics' ? (
        <MarketSection
          filters={filters}
          setFilters={setFilters}
          openSegment={() => setDrawer(true)}
        />
      ) : portfolioSection === 'structure' ? (
        <>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onOpenSegment={() => setDrawer(true)}
        showMetric={false}
      />
      <div className="grid gap-4">
        <div className="flex flex-col gap-4">
          <section className="hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  Portfolio structure
                </div>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Структура портфеля Альфа-Банка
                </h2>
                <p className="text-xs text-slate-500">
                  Проникновение классов активов и торговая глубина клиентской
                  базы
                </p>
              </div>
              <select
                className="rounded-lg border border-slate-200 p-2.5 text-xs font-semibold"
                value={asset}
                onChange={(event) => setAsset(event.target.value)}
              >
                {portfolioMarkets.map((item) => (
                  <option key={item.market}>{item.market}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3 py-4 lg:grid-cols-4">
              {[
                ['Клиенты в срезе', '284 тыс.'],
                ['AuC', '1 184 млрд ₽'],
                ['Средняя доля класса', '17,4%'],
                ['Потенциал оборота', '+210 млрд ₽'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-500">{label}</span>
                  <strong className="block text-lg">{value}</strong>
                </div>
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <h3 className="mb-2 text-sm font-bold">
                  Распределение клиентов · {asset}
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="range" tick={{ fontSize: 9 }} />
                    <YAxis width={76} label={yAxisUnitLabel('тыс. клиентов')} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => number.format(Number(value))} />
                    <Bar
                      dataKey="clients"
                      name="Клиенты, тыс."
                      fill="#2563EB"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-bold">
                  Тепловая карта: месяц × доля класса
                </h3>
                <p className="mb-3 text-[10px] text-slate-500">
                  Выберите ячейку для анализа перехода между бакетами
                </p>
                <div className="grid grid-cols-[42px_repeat(7,1fr)] gap-1 text-[9px]">
                  <div />
                  {portfolioBuckets.map((value) => (
                    <div key={value} className="text-center text-slate-400">
                      {value}
                    </div>
                  ))}
                  {trendMonths.slice(-recentMonthCount).flatMap(
                    (label, row) => [
                      <div
                        key={`${label}-label`}
                        className="flex items-center text-slate-400"
                      >
                        {label}
                      </div>,
                      ...portfolioHeatmap[row].map((value, col) => (
                        <button
                          key={`${row}-${col}`}
                          className={`h-8 rounded text-[9px] font-bold ${month === row && bucket === col ? 'ring-2 ring-blue-700' : ''}`}
                          style={{
                            background: `rgba(37,99,235,${value / 100})`,
                            color: value > 50 ? 'white' : '#334155',
                          }}
                          onClick={() => {
                            setMonth(row);
                            setBucket(col);
                          }}
                        >
                          {value}
                        </button>
                      )),
                    ],
                  )}
                </div>
              </div>
            </div>
          </section>
          <section className="card order-first overflow-hidden">
            <div className="border-b border-slate-100 p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-red-600">
                Сравнение портфелей
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Брокер, ближайшие конкуренты и рынок
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Поведенческие портфели и AuC-сегменты выбранной клиентской группы
              </p>
            </div>
            <div className="border-b border-slate-200 bg-white p-4">
              <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Матрица: AuC-группа × частота сделок</h3>
                  <p className="text-[10px] text-slate-500">{structureMetricMeta[structureMatrixMetric].label} и доля от общего значения · выберите ячейку для детализации</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex rounded-lg bg-slate-100 p-1">
                    {([['clients','Клиенты'],['turnover','Оборот'],['auc','AuC']] as const).map(([key,label]) => <button key={key} className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${structureMatrixMetric === key ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`} onClick={() => setStructureMatrixMetric(key)}>{label}</button>)}
                  </div>
                  <div className="text-[10px] text-slate-500">Всего: <strong className="text-slate-800">{number.format(structureMatrixGrandTotal)} {structureMetricUnit}</strong></div>
                </div>
              </div>
              <div className="overflow-x-auto pb-2">
                <div className="grid min-w-[980px] grid-cols-[150px_repeat(5,minmax(125px,1fr))_120px] gap-1.5">
                  <button className={`rounded-lg px-2 py-2 text-center text-[10px] font-bold transition ${structureMatrixSelection.type === 'all' ? 'bg-red-50 text-red-600 ring-2 ring-inset ring-red-500' : 'bg-slate-100 text-slate-600 hover:ring-2 hover:ring-inset hover:ring-blue-300'}`} onClick={() => setStructureMatrixSelection({type:'all'})}>Все</button>
                  {structureFrequencies.map((frequency, colIndex) => <button key={frequency} className={`rounded-lg px-2 py-2 text-center text-[10px] font-bold transition ${structureMatrixSelection.type === 'column' && structureMatrixSelection.col === colIndex ? 'bg-red-50 text-red-600 ring-2 ring-inset ring-red-500' : 'bg-slate-100 text-slate-600 hover:ring-2 hover:ring-inset hover:ring-blue-300'}`} onClick={() => setStructureMatrixSelection({type:'column',col:colIndex})}>{frequency}</button>)}
                  <div className="rounded-lg bg-slate-200 px-2 py-2 text-center text-[10px] font-bold text-slate-700">Итого</div>
                  {structureMatrix.flatMap((row, rowIndex) => {
                    const rowTotal = structureMatrixValues[rowIndex].reduce((sum, value) => sum + value, 0);
                    return [
                      <button key={`${row.group}-label`} className={`flex flex-col justify-center rounded-lg px-3 py-2 text-left transition ${structureMatrixSelection.type === 'row' && structureMatrixSelection.row === rowIndex ? 'bg-red-50 ring-2 ring-inset ring-red-500' : 'bg-slate-50 hover:ring-2 hover:ring-inset hover:ring-blue-300'}`} onClick={() => setStructureMatrixSelection({type:'row',row:rowIndex})}><strong className="text-xs text-slate-900">{row.group}</strong><small className="text-[9px] text-slate-500">{row.range}</small></button>,
                      ...structureMatrixValues[rowIndex].map((value, colIndex) => {
                        const intensity = Math.min(1, value / structureMatrixMax);
                        const selected = structureMatrixSelection.type === 'all' || (structureMatrixSelection.type === 'row' && structureMatrixSelection.row === rowIndex) || (structureMatrixSelection.type === 'column' && structureMatrixSelection.col === colIndex) || (structureMatrixSelection.type === 'cell' && structureMatrixSelection.row === rowIndex && structureMatrixSelection.col === colIndex);
                        return <button key={`${row.group}-${colIndex}`} className={`min-h-16 rounded-lg px-2 py-2 text-left transition ${selected ? 'ring-2 ring-red-500 ring-inset' : 'hover:ring-2 hover:ring-blue-300'}`} style={{backgroundColor:intensity > 0.78 ? 'rgba(232,0,28,0.78)' : `rgba(37,99,235,${0.16 + intensity * 0.72})`,color:intensity > 0.28 ? 'white' : '#1E293B'}} onClick={() => setStructureMatrixSelection({type:'cell',row:rowIndex,col:colIndex})}>
                          <strong className="block text-xs">{number.format(value)} {structureMetricUnit}</strong>
                          <small className="mt-1 block text-[9px] opacity-80">{number.format((value / structureMatrixGrandTotal) * 100)}% от всех</small>
                        </button>;
                      }),
                      <button key={`${row.group}-total`} className={`flex min-h-16 flex-col justify-center rounded-lg px-3 py-2 text-left transition ${structureMatrixSelection.type === 'row' && structureMatrixSelection.row === rowIndex ? 'bg-red-50 ring-2 ring-inset ring-red-500' : 'bg-slate-200 hover:ring-2 hover:ring-inset hover:ring-blue-300'}`} onClick={() => setStructureMatrixSelection({type:'row',row:rowIndex})}><strong className="text-xs text-slate-900">{number.format(rowTotal)} {structureMetricUnit}</strong><small className="text-[9px] text-slate-500">итого</small></button>,
                    ];
                  })}
                  <div className="flex flex-col justify-center rounded-lg bg-slate-200 px-3 py-2"><strong className="text-xs">Итого</strong><small className="text-[9px] text-slate-500">по частоте</small></div>
                  {structureFrequencies.map((frequency, colIndex) => {
                    const total = structureMatrixValues.reduce((sum,row) => sum + row[colIndex],0);
                    return <button key={`${frequency}-total`} className={`flex min-h-14 flex-col justify-center rounded-lg px-3 py-2 text-center transition ${structureMatrixSelection.type === 'column' && structureMatrixSelection.col === colIndex ? 'bg-red-50 ring-2 ring-inset ring-red-500' : 'bg-slate-200 hover:ring-2 hover:ring-inset hover:ring-blue-300'}`} onClick={() => setStructureMatrixSelection({type:'column',col:colIndex})}><strong className="text-xs">{number.format(total)} {structureMetricUnit}</strong><small className="text-[9px] text-slate-500">итого</small></button>;
                  })}
                  <button className={`flex min-h-14 flex-col justify-center rounded-lg bg-slate-800 px-3 py-2 text-center text-white transition ${structureMatrixSelection.type === 'all' ? 'ring-2 ring-inset ring-red-500' : 'hover:ring-2 hover:ring-inset hover:ring-blue-300'}`} onClick={() => setStructureMatrixSelection({type:'all'})}><strong className="text-xs">{number.format(structureMatrixGrandTotal)} {structureMetricUnit}</strong><small className="text-[9px] text-slate-300">всего</small></button>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-blue-700">{number.format(selectedStructureMarket)} {structureMetricUnit} · {number.format((selectedStructureMarket / structureMatrixGrandTotal) * 100)}% общего значения</span>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-[10px] font-bold text-blue-700 transition hover:bg-blue-50" onClick={() => setPortfolioSection('dynamics')}>Смотреть ЖЦ в динамике →</button>
                  <button className="rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-blue-700" onClick={() => setPortfolioSection('external')}>Анализ внешнего портфеля →</button>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-bold">Бенчмарк выбранной области · {structureMetricMeta[structureMatrixMetric].label}</h3>
                  <p className="mt-0.5 text-[10px] text-slate-500">Сравнение автоматически обновляется при выборе сегмента в матрице</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table w-full min-w-[720px]">
                    <thead><tr><th>Сегмент</th><th>Брокер</th><th>Конкуренты</th><th>Рынок</th></tr></thead>
                    <tbody>
                      <tr>
                        <td><strong>Выбранная область</strong></td>
                        <td className={selectedStructureBroker >= selectedStructureCompetitor ? 'bg-emerald-50' : 'bg-amber-50'}><strong>{number.format(selectedStructureBroker)} {structureMetricUnit}</strong><small className="mt-0.5 block text-slate-500">доля рынка {number.format(selectedStructureBrokerShare)}%</small></td>
                        <td><strong>{number.format(selectedStructureCompetitor)} {structureMetricUnit}</strong><small className="mt-0.5 block text-slate-500">доля рынка {number.format(selectedStructureCompetitorShare)}%</small></td>
                        <td><strong>{number.format(selectedStructureMarket)} {structureMetricUnit}</strong><small className="mt-0.5 block text-slate-500">рынок выбранного сегмента</small></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="grid border-t border-slate-200 sm:grid-cols-3">
                  <div className="p-4"><span className="text-[10px] text-slate-500">Разрыв к конкурентам</span><strong className={`block text-base ${selectedStructureBroker >= selectedStructureCompetitor ? 'text-emerald-600' : 'text-red-600'}`}>{selectedStructureBroker >= selectedStructureCompetitor ? '+' : ''}{number.format(selectedStructureBrokerShare - selectedStructureCompetitorShare)} п.п.</strong></div>
                  <div className="border-t border-slate-200 p-4 sm:border-l sm:border-t-0"><span className="text-[10px] text-slate-500">Позиция брокера</span><strong className="block text-base">{selectedStructureBroker >= selectedStructureCompetitor ? 'Выше конкурентов' : 'Ниже конкурентов'}</strong></div>
                  <div className="border-t border-slate-200 p-4 sm:border-l sm:border-t-0"><span className="text-[10px] text-slate-500">Доля сегмента в {structureMetricMeta[structureMatrixMetric].label.toLowerCase()}</span><strong className="block text-base">{number.format((selectedStructureMarket / structureMatrixGrandTotal) * 100)}%</strong></div>
                </div>
              </div>
            </div>
          </section>
          <section className="hidden">
            <h3 className="text-sm font-bold">Портфель по рынкам</h3>
            <p className="text-xs text-slate-500">
              Доля AuC, доля оборота и потенциал
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Класс активов</th>
                    <th>Клиенты</th>
                    <th>Доля AuC</th>
                    <th>Доля оборота</th>
                    <th>Разрыв</th>
                    <th>Потенциал</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioMarkets.map((item) => (
                    <tr key={item.market}>
                      <td className="font-semibold">{item.market}</td>
                      <td>{item.clients} тыс.</td>
                      <td>{item.aucShare}%</td>
                      <td>{item.turnoverShare}%</td>
                      <td
                        className={
                          item.turnoverShare - item.aucShare >= 0
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }
                      >
                        {item.turnoverShare - item.aucShare >= 0 ? '+' : ''}
                        {item.turnoverShare - item.aucShare} п.п.
                      </td>
                      <td className="font-semibold text-blue-700">
                        +{item.potential} млрд ₽
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <aside className="hidden">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-900">
              <Brain size={15} />
              Главный инсайт
            </div>
            <p className="mt-2 text-xs leading-relaxed text-violet-800">
              Сильный AuC в сегменте HNWI не полностью превращается в оборот.
              Наибольший разрыв — облигации и срочный рынок.
            </p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Layers3 size={14} />
              Выбранный бакет
            </div>
            <strong className="mt-3 block text-lg">
              {portfolioBuckets[bucket]}
            </strong>
            <p className="mt-1 text-xs text-slate-500">
              {portfolioHeatmap[month][bucket]} тыс. клиентов ·{' '}
              {trendMonths.slice(-recentMonthCount)[month]}
            </p>
            <button className="mt-3 w-full rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
              Открыть transition matrix
            </button>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <TrendingUp size={15} />
              Следующее действие
            </div>
            <p className="mt-2 text-xs text-amber-800">
              Сформировать кампанию для HNWI-клиентов с долей срочного рынка
              ниже 5%.
            </p>
            <button className="mt-3 text-xs font-bold text-amber-900">
              Создать сегмент <ArrowRight size={12} className="inline" />
            </button>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Users size={14} />
              Профиль сегмента
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Активны у других</span>
                <strong>38%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Мультипродуктовые</span>
                <strong>44%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Спящие клиенты</span>
                <strong>18%</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
        </>
      ) : (
        <>
          <FilterBar filters={filters} onChange={setFilters} onOpenSegment={() => setDrawer(true)} showMetric={false} />
          <section className="card overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-red-600">03 · Внешний портфель</div>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Где ещё работают клиенты выбранного сегмента</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Сравнение активности в Альфа-Банке и у других брокеров
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div>
                  <span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">Что измеряем</span>
                  <div className="flex rounded-lg bg-slate-100 p-1">
                    {([['clients','Клиенты'],['turnover','Оборот'],['auc','AuC']] as const).map(([key,label]) => (
                      <button key={key} className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${externalMetric === key ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`} onClick={() => setExternalMetric(key)}>{label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">Как показываем</span>
                  <div className="flex rounded-lg bg-slate-100 p-1">
                    {([['share','Доля'],['absolute','Абсолют']] as const).map(([key,label]) => <button key={key} className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${externalValueMode === key ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`} onClick={() => setExternalValueMode(key)}>{label}</button>)}
                  </div>
                </div>
              </div>
            </div>

            {externalMetric !== 'clients' && (
              <div className="border-b border-slate-200 bg-slate-50 p-5">
                <div className="rounded-xl border border-slate-200 bg-white">
                  <div className="flex flex-col gap-2 border-b border-slate-200 p-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-red-600">Совокупный кошелёк сегмента</div>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">{externalMetric === 'auc' ? 'AuC' : 'Оборот'} всех клиентов, у которых есть счёт в Альфа-Банке</h3>
                      <p className="mt-1 text-[10px] text-slate-500">Включает {externalMetric === 'auc' ? 'активы' : 'торговый оборот'} этих же клиентов в Альфа-Банке и у всех других брокеров</p>
                    </div>
                  </div>
                  <div className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ['Совокупно во всех брокерах',externalWalletLatestAbsolute.total,100,'полный кошелёк выбранных клиентов'],
                      ['В Альфа-Банке',externalWalletLatestAbsolute.ours,externalWalletLatestAbsolute.share,'наша часть кошелька'],
                      ['Вне Альфа-Банка',externalWalletLatestAbsolute.outside,100-externalWalletLatestAbsolute.share,'часть у других брокеров'],
                    ].map(([label,absolute,share,note]) => <div key={String(label)} className="border-b border-slate-200 p-4 sm:border-r xl:border-b-0"><span className="text-[10px] text-slate-500">{label}</span><strong className="mt-1 block text-xl text-slate-900">{externalValueMode === 'absolute' ? `${number.format(Number(absolute))} млрд ₽` : `${number.format(Number(share))}%`}</strong><span className="block text-xs font-semibold text-slate-600">{externalValueMode === 'absolute' ? `${number.format(Number(share))}%` : `${number.format(Number(absolute))} млрд ₽`}</span><small className="mt-1 block text-[9px] text-slate-400">{note}</small></div>)}
                    <div className={`p-4 ${externalWalletShareDelta >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}><span className="text-[10px] text-slate-500">Изменение нашей доли</span><strong className={`mt-1 block text-xl ${externalWalletShareDelta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{externalWalletShareDelta >= 0 ? '+' : ''}{number.format(externalWalletShareDelta)} п.п.</strong><span className="block text-xs font-semibold text-slate-600">{number.format(externalWalletShareStart)}% → {number.format(externalWalletLatestAbsolute.share)}%</span><small className="mt-1 block text-[9px] text-slate-400">2025-01 → 2026-05</small></div>
                  </div>
                  <div className="p-4">
                    <div className="mb-3"><h4 className="text-sm font-bold text-slate-900">Как меняется совокупный кошелёк и его распределение</h4><p className="mt-1 text-[10px] text-slate-500">{externalValueMode === 'absolute' ? 'Абсолютные значения, млрд ₽' : 'Доля совокупного кошелька, %'} · 2025-01 — 2026-05</p></div>
                    <ResponsiveContainer width="100%" height={285}>
                      <BarChart data={externalWalletTrend} margin={{top:24,right:18,left:10,bottom:4}} barCategoryGap="18%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" tick={{fontSize:10}} />
                        <YAxis width={76} label={yAxisUnitLabel(externalValueMode === 'share' ? '%' : 'млрд ₽')} domain={externalValueMode === 'share' ? [0,106] : [0,(dataMax:number) => Math.ceil(dataMax * 1.1)]} tick={{fontSize:10}} tickFormatter={(value) => number.format(Number(value))} />
                        <Tooltip formatter={(value,name) => [`${number.format(Number(value))}${externalValueMode === 'share' ? '%' : ' млрд ₽'}`,name]} />
                        <Legend wrapperStyle={{fontSize:10,paddingTop:10}} />
                        <Bar dataKey="ours" name="В Альфа-Банке" stackId="wallet" fill="#E8001C">
                          <LabelList dataKey="ours" position="center" fill="#FFFFFF" fontSize={8} fontWeight={700} formatter={(value) => number.format(Number(value))} />
                        </Bar>
                        <Bar dataKey="outside" name="Вне Альфа-Банка" stackId="wallet" fill="#2563EB" radius={[4,4,0,0]}>
                          <LabelList dataKey="outside" position="center" fill="#FFFFFF" fontSize={8} fontWeight={700} formatter={(value) => number.format(Number(value))} />
                          <LabelList dataKey="total" position="top" fill="#334155" fontSize={9} fontWeight={700} formatter={(value) => `${number.format(Number(value))}${externalValueMode === 'share' ? '%' : ''}`} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            <div className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Только у нас', externalMetric === 'clients' ? 42 : externalMetric === 'turnover' ? 31 : 38, 'нет активного счёта у других'],
                ['В нескольких брокерах', externalMetric === 'clients' ? 58 : externalMetric === 'turnover' ? 69 : 62, 'активны минимум у двух'],
                ['Мы — основной брокер', externalMetric === 'clients' ? 36 : externalMetric === 'turnover' ? 44 : 49, `максимальная доля ${externalMetric === 'auc' ? 'AuC' : externalMetric === 'turnover' ? 'оборота' : 'активности'}`],
                ['Активнее вне нас', externalMetric === 'clients' ? 27 : externalMetric === 'turnover' ? 34 : 29, 'точка возврата кошелька'],
              ].map(([label,share,note]) => <div key={String(label)} className="border-b border-slate-200 p-4 last:border-b-0 sm:border-r xl:border-b-0"><span className="text-[10px] text-slate-500">{label}</span><strong className="mt-1 block text-2xl text-slate-900">{formatExternalValue(Number(share))}</strong><span className="block text-xs font-semibold text-slate-700">{externalValueMode === 'share' ? formatExternalAbsolute(Number(share)) : `${share}%`}</span><small className="mt-1 block text-[10px] text-slate-500">{note}</small></div>)}
            </div>

            <div className="border-b border-slate-200 p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">Динамика роли Альфа-Банка в кошельке</h3>
                <p className="mt-1 text-[10px] text-slate-500">Структура выбранного сегмента по месяцам · {externalValueMode === 'share' ? '%' : externalMetricUnit}</p>
              </div>
              <ResponsiveContainer width="100%" height={285}>
                <BarChart data={externalRoleTrendDisplay} margin={{top:24,right:18,left:12,bottom:4}} barCategoryGap="18%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{fontSize:10}} />
                  <YAxis width={76} label={yAxisUnitLabel(externalValueMode === 'share' ? '%' : externalMetricUnit)} domain={externalValueMode === 'share' ? [0,106] : [0,(dataMax:number) => Math.ceil(dataMax * 1.08)]} tick={{fontSize:10}} tickFormatter={(value) => number.format(Number(value))} />
                  <Tooltip formatter={(value,name) => [externalValueMode === 'share' ? `${number.format(Number(value))}%` : `${number.format(Number(value))} ${externalMetricUnit}`,name]} />
                  <Bar dataKey="onlyUs" name="Только у нас" stackId="role" fill="#059669"><LabelList dataKey="onlyUs" position="center" fill="#FFFFFF" fontSize={8} fontWeight={700} formatter={(value) => externalValueMode === 'share' ? `${number.format(Number(value))}%` : number.format(Number(value))} /></Bar>
                  <Bar dataKey="primary" name="Основной" stackId="role" fill="#34D399"><LabelList dataKey="primary" position="center" fill="#FFFFFF" fontSize={8} fontWeight={700} formatter={(value) => externalValueMode === 'share' ? `${number.format(Number(value))}%` : number.format(Number(value))} /></Bar>
                  <Bar dataKey="second" name="Второй" stackId="role" fill="#FBBF24"><LabelList dataKey="second" position="center" fill="#713F12" fontSize={8} fontWeight={700} formatter={(value) => externalValueMode === 'share' ? `${number.format(Number(value))}%` : number.format(Number(value))} /></Bar>
                  <Bar dataKey="peripheral" name="Периферийный" stackId="role" fill="#E8001C" radius={[4,4,0,0]}>
                    <LabelList dataKey="peripheral" position="center" fill="#FFFFFF" fontSize={8} fontWeight={700} formatter={(value) => externalValueMode === 'share' ? `${number.format(Number(value))}%` : number.format(Number(value))} />
                    <LabelList dataKey="total" position="top" fill="#334155" fontSize={9} fontWeight={700} formatter={(value) => externalValueMode === 'share' ? `${number.format(Number(value))}%` : number.format(Number(value))} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-600">
                {[
                  ['Только у нас','#059669'],
                  ['Основной','#34D399'],
                  ['Второй','#FBBF24'],
                  ['Периферийный','#E8001C'],
                ].map(([label,color]) => <span key={label} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5" style={{backgroundColor:color}} />{label}</span>)}
              </div>
            </div>

            <div className="border-b border-slate-200 p-5">
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-900">Наша роль в кошельке клиента</h3>
                <p className="mt-1 text-[10px] text-slate-500">Структура выбранного сегмента по {externalMetric === 'clients' ? 'клиентам' : externalMetric === 'turnover' ? 'обороту' : 'AuC'}</p>
                <div className="mt-5 flex h-8 overflow-hidden rounded-lg">
                  {[
                    ['Только у нас',externalRoleMix[0],'bg-emerald-600'],
                    ['Основной',externalRoleMix[1],'bg-emerald-400'],
                    ['Второй',externalRoleMix[2],'bg-amber-400'],
                    ['Периферийный',externalRoleMix[3],'bg-red-500'],
                  ].map(([label,value,color]) => <div key={String(label)} className={`${color} flex items-center justify-center text-[9px] font-bold text-white`} style={{width:`${value}%`}} title={`${label}: ${value}%`}>{value}%</div>)}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <span className="text-[9px] font-bold uppercase text-emerald-700">Удерживаем кошелёк</span>
                    <div className="mt-2 space-y-3">
                      {[
                        ['Только у нас',externalRoleMix[0],'нет активности у других','bg-emerald-600'],
                        ['Основной',externalRoleMix[1],'максимальная доля у нас','bg-emerald-400'],
                      ].map(([label,value,note,color]) => <div key={String(label)} className="flex items-start justify-between gap-2"><div className="flex gap-2"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-sm ${color}`} /><div><strong className="block text-[10px] text-slate-800">{label}</strong><small className="text-[9px] text-slate-500">{note}</small></div></div><div className="text-right"><strong className="block text-xs">{formatExternalValue(Number(value))}</strong><small className="whitespace-nowrap text-[9px] text-slate-500">{externalValueMode === 'share' ? formatExternalAbsolute(Number(value)) : `${value}%`}</small></div></div>)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3">
                    <span className="text-[9px] font-bold uppercase text-amber-700">Уступаем кошелёк</span>
                    <div className="mt-2 space-y-3">
                      {[
                        ['Второй',externalRoleMix[2],'уступаем одному брокеру','bg-amber-400'],
                        ['Периферийный',externalRoleMix[3],'активность преимущественно вне нас','bg-red-500'],
                      ].map(([label,value,note,color]) => <div key={String(label)} className="flex items-start justify-between gap-2"><div className="flex gap-2"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-sm ${color}`} /><div><strong className="block text-[10px] text-slate-800">{label}</strong><small className="text-[9px] text-slate-500">{note}</small></div></div><div className="text-right"><strong className="block text-xs">{formatExternalValue(Number(value))}</strong><small className="whitespace-nowrap text-[9px] text-slate-500">{externalValueMode === 'share' ? formatExternalAbsolute(Number(value)) : `${value}%`}</small></div></div>)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className={`mb-3 rounded-lg px-3 py-2 ${externalStrongRoleDelta > 0 ? 'bg-emerald-50 text-emerald-800' : externalStrongRoleDelta < 0 ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-700'}`}>
                    <span className="text-[9px] font-bold uppercase">{externalStrongRoleDelta > 0 ? 'Позиция улучшается' : externalStrongRoleDelta < 0 ? 'Позиция ухудшается' : 'Позиция стабильна'}</span>
                    <div className="mt-0.5 flex items-end justify-between gap-2"><strong className="text-base">{externalStrongRoleDelta > 0 ? '+' : ''}{number.format(externalStrongRoleDelta)} п.п.</strong><small className="text-[9px]">«Только у нас + Основной»: {number.format(externalStrongRoleStart)}% → {number.format(externalStrongRoleEnd)}%</small></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-900">Сколько брокеров использует клиент — динамика</h3>
                <p className="mt-1 text-[10px] text-slate-500">Структура выбранного сегмента по месяцам, % · 2025-01 — 2026-05</p>
                <div className={`mt-3 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${exclusiveShareDelta < 0 ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-500">Доля «Только Альфа-Банк»</span>
                    <strong className="mt-0.5 block text-base text-slate-900">{number.format(exclusiveShareStart)}% → {number.format(exclusiveShareEnd)}%</strong>
                    <small className="text-[9px] text-slate-500">Сейчас: {formatExternalAbsolute(exclusiveShareEnd)}</small>
                  </div>
                  <div className="text-right">
                    <strong className={`block text-lg ${exclusiveShareDelta < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{exclusiveShareDelta > 0 ? '+' : ''}{number.format(exclusiveShareDelta)} п.п.</strong>
                    <small className={`text-[9px] font-bold ${exclusiveShareDelta < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{exclusiveShareDelta < 0 ? 'Доля размывается' : exclusiveShareDelta > 0 ? 'Доля растёт' : 'Доля стабильна'}</small>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={285}>
                  <BarChart data={externalBrokerCountTrend} margin={{top:18,right:8,left:4,bottom:4}} barCategoryGap="18%">
                    <CartesianGrid vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{fontSize:8}} />
                    <YAxis width={52} label={yAxisUnitLabel('%')} domain={[0,100]} ticks={[0,25,50,75,100]} tick={{fontSize:9}} tickFormatter={(value) => number.format(Number(value))} />
                    <Tooltip formatter={(value,name) => [`${number.format(Number(value))}%`,name]} />
                    <Legend wrapperStyle={{fontSize:9,paddingTop:8}} />
                    <Bar dataKey="onlyAlpha" name="Только Альфа-Банк" stackId="count" fill="#E8001C"><LabelList dataKey="onlyAlphaLabel" position="center" fill="#FFFFFF" fontSize={8} fontWeight={700} formatter={(value) => value == null ? '' : `${number.format(Number(value))}%`} /></Bar>
                    <Bar dataKey="twoBrokers" name="2 брокера" stackId="count" fill="#2563EB" />
                    <Bar dataKey="threeFour" name="3–4 брокера" stackId="count" fill="#7C3AED" />
                    <Bar dataKey="fivePlus" name="5 и более" stackId="count" fill="#64748B" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border-t border-slate-200 p-5">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Аналитика по рынкам и продуктам</h3>
                  <p className="mt-1 text-[10px] text-slate-500">Где выбранные клиенты активнее у других брокеров и как меняется разрыв</p>
                </div>
                <div className="flex rounded-lg bg-slate-100 p-1">
                  <button className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${externalGapView === 'markets' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`} onClick={() => { setExternalGapView('markets'); setExternalProduct(externalMarketGapRows[0].name); }}>Рынки · {externalMarketGapRows.length}</button>
                  <button className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${externalGapView === 'products' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`} onClick={() => { setExternalGapView('products'); setExternalProduct(externalProductGapRows[0].name); }}>Продукты · {externalProductGapRows.length}</button>
                </div>
              </div>

              <div className="mb-4 grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
                <div className="border-b border-slate-200 p-4 sm:border-r xl:border-b-0">
                  <span className="text-[9px] font-bold uppercase text-slate-400">Выбрано</span>
                  <strong className="mt-1 block text-base text-slate-900">{selectedExternalGapRow.name}</strong>
                  <small className="text-[9px] text-slate-500">{externalGapView === 'products' ? selectedExternalGapRow.market : 'рынок целиком'}</small>
                </div>
                <div className="border-b border-slate-200 p-4 xl:border-b-0 xl:border-r">
                  <span className="text-[9px] font-bold uppercase text-slate-400">У нас / у других</span>
                  <strong className="mt-1 block text-base text-slate-900">{number.format(selectedExternalGapRow.ours)}% / {number.format(selectedExternalGapRow.others)}%</strong>
                  <small className="text-[9px] text-slate-500">{formatExternalAbsolute(selectedExternalGapRow.ours)} / {formatExternalAbsolute(selectedExternalGapRow.others)}</small>
                </div>
                <div className="border-b border-slate-200 p-4 sm:border-r xl:border-b-0">
                  <span className="text-[9px] font-bold uppercase text-slate-400">Разрыв</span>
                  <strong className="mt-1 block text-base text-red-600">+{number.format(selectedExternalGapRow.gap)} п.п.</strong>
                  <small className={selectedExternalGapRow.change > 0 ? 'text-[9px] text-red-600' : 'text-[9px] text-emerald-600'}>{selectedExternalGapRow.change > 0 ? 'Расширился' : 'Сократился'} на {number.format(Math.abs(selectedExternalGapRow.change))} п.п. к 2025-05</small>
                </div>
                <div className="p-4">
                  <span className="text-[9px] font-bold uppercase text-slate-400">Где сосредоточен объём</span>
                  <strong className="mt-1 block text-base text-slate-900">{selectedExternalGapRow.concentrated}</strong>
                  <small className="text-[9px] text-slate-500">приоритет возврата: {selectedExternalGapRow.priority.toLowerCase()}</small>
                </div>
              </div>

              <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>{externalGapView === 'markets' ? 'Весь перечень рынков' : 'Все продукты по всем рынкам'}</span>
                <span>Сортировка: по величине разрыва</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="data-table w-full min-w-[980px]">
                  <thead><tr><th>{externalGapView === 'markets' ? 'Рынок' : 'Продукт'}</th><th>У нас</th><th>У других</th><th>Разрыв и динамика</th><th>Где сосредоточены</th><th>Приоритет</th><th></th></tr></thead>
                  <tbody>
                    {activeExternalGapRows.map((row) => <tr key={`${row.market}-${row.name}`} className={externalProduct === row.name ? 'bg-red-50/60' : ''}>
                      <td><strong>{row.name}</strong>{externalGapView === 'products' && <small className="mt-0.5 block text-slate-400">{row.market}</small>}</td>
                      <td><strong>{number.format(row.ours)}%</strong><small className="ml-1 text-slate-400">· {formatExternalAbsolute(row.ours)}</small><div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-red-500" style={{width:`${row.ours}%`}} /></div></td>
                      <td><strong>{number.format(row.others)}%</strong><small className="ml-1 text-slate-400">· {formatExternalAbsolute(row.others)}</small><div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-500" style={{width:`${row.others}%`}} /></div></td>
                      <td><strong className="text-red-600">+{number.format(row.gap)} п.п.</strong><small className={`mt-0.5 block ${row.change > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{row.change > 0 ? '▲' : '▼'} {number.format(Math.abs(row.change))} п.п. к 2025-05</small></td>
                      <td>{row.concentrated}</td>
                      <td><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${row.priority === 'Высокая' ? 'bg-red-50 text-red-600' : row.priority === 'Средняя' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{row.priority}</span></td>
                      <td><button className={`rounded-lg px-2 py-1.5 text-[9px] font-bold ${externalProduct === row.name ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} onClick={() => setExternalProduct(row.name)}>{externalProduct === row.name ? 'Выбрано' : 'Смотреть'}</button></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        </>
      )}
      <SegmentDrawer
        open={drawer}
        filters={filters}
        onClose={() => setDrawer(false)}
        onApply={(next) => {
          setFilters(next);
          setDrawer(false);
        }}
      />
    </div>
  );
};
