import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import { ArrowUpDown, Info } from 'lucide-react';
import { RankingFilterBar } from './RankingFilterBar';
import {
  rankingParticipants, buildDynamics, formatMetricValue, METRIC_META, PARTICIPANTS_TOTAL, fmt,
} from './rankingData';
import type { RankingFilters, RankingMetric, RankingAudience, ValueMode, DynamicsMode } from './rankingData';

const METRIC_KEYS: RankingMetric[] = ['clients', 'turnover', 'auc'];

const yAxisLabel = (value: string) => ({
  value,
  angle: -90,
  position: 'insideLeft' as const,
  offset: 2,
  style: { fill: '#64748B', fontSize: 10 },
});

interface RankingSectionProps {
  companyName: string;
  audience: RankingAudience;
  filters: RankingFilters;
  setFilters: (filters: RankingFilters) => void;
  openSegment: () => void;
}

export const RankingSection = ({ companyName, audience, filters, setFilters, openSegment }: RankingSectionProps) => {
  const [valueMode, setValueMode] = useState<ValueMode>('absolute');
  const [dynMode, setDynMode] = useState<DynamicsMode>('share');
  const [sortKey, setSortKey] = useState<'rank' | RankingMetric>('turnover');
  const [sortDesc, setSortDesc] = useState(true);

  const own = rankingParticipants.find(p => p.isOwn) ?? rankingParticipants[0];

  const totals = useMemo(() => ({
    clients: rankingParticipants.reduce((sum, p) => sum + p.clients, 0),
    turnover: rankingParticipants.reduce((sum, p) => sum + p.turnover, 0),
    auc: rankingParticipants.reduce((sum, p) => sum + p.auc, 0),
  }), []);

  const metricValues = rankingParticipants.map(p => p[filters.metric]);
  const midValue = (metricValues[20] + metricValues[21]) / 2;
  const strongValue = metricValues[10];
  const leaderValue = metricValues[0];

  const sorted = useMemo(
    () => [...rankingParticipants].sort((a, b) => {
      const av = sortKey === 'rank' ? a.officialRank : a[sortKey];
      const bv = sortKey === 'rank' ? b.officialRank : b[sortKey];
      return sortDesc ? bv - av : av - bv;
    }),
    [sortKey, sortDesc],
  );

  const toggleSort = (key: 'rank' | RankingMetric) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(key !== 'rank');
    }
  };

  const dynamics = buildDynamics(filters.metric, dynMode);
  const ownValue = own[filters.metric];

  return (
    <div className="space-y-4">
      <RankingFilterBar filters={filters} onChange={setFilters} onOpenSegment={openSegment} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <section className="card overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-end">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Рейтинг участников</h2>
                <p className="text-xs text-slate-500">{METRIC_META[filters.metric].label} · {filters.period}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-right">
                {([
                  ['Середина', midValue],
                  ['Сильные', strongValue],
                  ['Лидер', leaderValue],
                ] as const).map(([label, value]) => (
                  <div key={label}>
                    <span className="text-[10px] text-slate-400">{label}</span>
                    <strong className="block text-xs">
                      {formatMetricValue(filters.metric, value, valueMode, totals[filters.metric])}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="flex rounded-lg bg-slate-100 p-1">
                {(['absolute', 'share'] as const).map(mode => (
                  <button
                    key={mode}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${
                      valueMode === mode ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
                    }`}
                    onClick={() => setValueMode(mode)}
                  >
                    {mode === 'absolute' ? 'Абсолют' : 'Доля рынка'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-2 text-[10px] text-slate-500">
              <span>
                <strong className="text-slate-700">{PARTICIPANTS_TOTAL} участника</strong> · официальный ранг сохраняется при сортировке
              </span>
              <span>Сортировка: {sortKey === 'rank' ? 'место' : METRIC_META[sortKey].label.toLowerCase()}</span>
            </div>
            <div className="max-h-[520px] overflow-auto">
              <table className="data-table w-full min-w-[760px]">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th>
                      <button className="flex items-center gap-1" onClick={() => toggleSort('rank')}>
                        Место <ArrowUpDown size={11} />
                      </button>
                    </th>
                    <th>Участник</th>
                    {METRIC_KEYS.map(metric => (
                      <th key={metric} className={filters.metric === metric ? 'bg-blue-50 text-blue-700' : ''}>
                        <button
                          className="flex items-center gap-1"
                          onClick={() => { toggleSort(metric); setFilters({ ...filters, metric }); }}
                        >
                          {METRIC_META[metric].label}
                          <ArrowUpDown size={11} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(participant => {
                    const isOwn = participant.isOwn;
                    const displayName = audience === 'broker' && !isOwn
                      ? `Участник #${participant.officialRank}`
                      : participant.name;
                    return (
                      <tr
                        key={participant.officialRank}
                        className={isOwn ? 'bg-blue-50' : participant.officialRank <= 3 ? 'bg-amber-50/40' : ''}
                      >
                        <td className="font-bold">#{participant.officialRank}</td>
                        <td>
                          <strong className="text-slate-900">
                            {isOwn ? (audience === 'broker' ? `Вы · ${companyName}` : companyName) : displayName}
                          </strong>
                          <small className="block text-[10px] text-slate-400">
                            {isOwn
                              ? 'Ваш брокер'
                              : participant.officialRank <= 3
                                ? 'Лидер рынка'
                                : Math.abs(participant.officialRank - own.officialRank) <= 2
                                  ? 'Сосед по рейтингу'
                                  : ''}
                          </small>
                        </td>
                        {METRIC_KEYS.map(metric => (
                          <td key={metric} className={filters.metric === metric ? 'bg-blue-50/60 font-semibold' : ''}>
                            {formatMetricValue(metric, participant[metric], valueMode, totals[metric])}
                            {isOwn && (
                              <div className="mt-1 h-1 w-24 rounded bg-slate-200">
                                <div
                                  className="h-1 rounded bg-blue-600"
                                  style={{ width: `${Math.min(100, (participant[metric] / rankingParticipants[0][metric]) * 100)}%` }}
                                />
                              </div>
                            )}
                          </td>
                        ))}
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
                <h3 className="text-sm font-bold text-slate-900">Динамика выбранной метрики</h3>
                <p className="text-xs text-slate-500">Текущий и прошлый аналогичный период</p>
              </div>
              <div className="flex rounded-lg bg-slate-100 p-1">
                {(['rank', 'absolute', 'share'] as const).map(mode => (
                  <button
                    key={mode}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${
                      dynMode === mode ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
                    }`}
                    onClick={() => setDynMode(mode)}
                  >
                    {mode === 'rank' ? 'Место' : mode === 'absolute' ? 'Абсолют' : 'Доля рынка'}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {([
                ['Место', `${own.officialRank} из ${PARTICIPANTS_TOTAL}`, 'rank'],
                ['Абсолют', formatMetricValue(filters.metric, ownValue, 'absolute', totals[filters.metric]), 'absolute'],
                ['Доля рынка', formatMetricValue(filters.metric, ownValue, 'share', totals[filters.metric]), 'share'],
              ] as const).map(([label, value, mode]) => (
                <button
                  key={label}
                  className={`rounded-lg border p-3 text-left ${
                    dynMode === mode ? 'border-blue-300 bg-blue-50' : 'border-slate-200'
                  }`}
                  onClick={() => setDynMode(mode)}
                >
                  <span className="text-[10px] text-slate-500">{label}</span>
                  <strong className="block text-sm text-slate-900">{value}</strong>
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dynamics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis
                  reversed={dynMode === 'rank'}
                  width={76}
                  label={yAxisLabel(dynMode === 'rank' ? 'место' : dynMode === 'share' ? '%' : METRIC_META[filters.metric].unit)}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip formatter={(value) => fmt.format(Number(value))} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="own" name={companyName} stroke="#E21B2D" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="previous" name="Прошлый период" stroke="#94A3B8" strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="peer" name="Медиана группы" stroke="#2563EB" strokeDasharray="2 4" dot={false} />
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
              #{own.officialRank} <span className="text-sm font-normal text-slate-400">из {PARTICIPANTS_TOTAL}</span>
            </div>
            <div className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
              Топ‑5 рынка
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs font-bold text-slate-700">Сравнение с ориентирами</div>
            {([
              ['Середина группы', midValue],
              ['Сильные участники', strongValue],
              ['Лидер рынка', leaderValue],
            ] as const).map(([label, benchmark]) => {
              const delta = ((ownValue - benchmark) / benchmark) * 100;
              return (
                <div key={label} className="mt-4">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">{label}</span>
                    <strong className={delta >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {delta >= 0 ? '+' : ''}{fmt.format(delta)}%
                    </strong>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded bg-slate-100">
                    <div
                      className={`h-1.5 rounded ${delta >= 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, (ownValue / benchmark) * 72)}%` }}
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
