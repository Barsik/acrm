import { useState } from 'react';
import { RankingFilterBar } from '../ranking/RankingFilterBar';
import { fmt, RANKING_MONTHS } from '../ranking/rankingData';
import type { RankingFilters } from '../ranking/rankingData';
import { BrokerStackChart } from './BrokerStackChart';
import type { BrokerStackRow } from './BrokerStackChart';
import { DeltaBenchmarkChart } from './DeltaBenchmarkChart';
import { PaceCard } from './PaceCard';
import {
  LIFECYCLE_STAGES, STAGE_LABELS, acquisitionRows, ACTIVATION_LABELS, activationRates,
  PORTFOLIO_LABELS, PORTFOLIO_UNITS, portfolioSeries, CHURN_LABELS, churnSeries,
} from './analyticsData';
import type { LifecycleStage, ActivationStage, PortfolioMetric, ChurnEvent } from './analyticsData';

type BrokerSeries = Record<'own' | 't' | 'sber' | 'vtb' | 'other', number[]>;

const cagr = (series: number[]) =>
  ((series[series.length - 1] / series[0]) ** (1 / (series.length - 1)) - 1) * 100;

const buildStackRows = (months: string[], series: BrokerSeries, isShare: boolean): BrokerStackRow[] =>
  months.map((month, i) => {
    const values = {
      own: series.own[i], t: series.t[i], sber: series.sber[i], vtb: series.vtb[i], other: series.other[i],
    };
    const total = values.own + values.t + values.sber + values.vtb + values.other;
    if (!isShare) return { month, ...values, total };
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

const paceRows = (series: BrokerSeries, ownName: string): [string, number, string][] => {
  const marketTotals = series.own.map((_, i) =>
    series.own[i] + series.t[i] + series.sber[i] + series.vtb[i] + series.other[i]);
  return [
    [ownName, cagr(series.own), '#E8001C'],
    ['Т-Инвестиции', cagr(series.t), '#2563EB'],
    ['СберИнвестиции', cagr(series.sber), '#7C3AED'],
    ['ВТБ Мои Инвестиции', cagr(series.vtb), '#0891B2'],
    ['Рынок в целом', cagr(marketTotals), '#64748B'],
  ];
};

const modeToggle = <T extends string>(
  options: [NoInfer<T>, string][],
  current: T,
  onChange: (value: NoInfer<T>) => void,
) => (
  <div className="flex flex-wrap rounded-lg bg-slate-100 p-1">
    {options.map(([value, label]) => (
      <button
        key={value}
        className={`rounded-md px-3 py-1.5 text-[10px] font-semibold transition ${
          current === value ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
        }`}
        onClick={() => onChange(value)}
      >
        {label}
      </button>
    ))}
  </div>
);

interface PortfolioDynamicsProps {
  ownName: string;
  filters: RankingFilters;
  setFilters: (filters: RankingFilters) => void;
  openSegment: () => void;
}

export const PortfolioDynamics = ({ ownName, filters, setFilters, openSegment }: PortfolioDynamicsProps) => {
  const [stage, setStage] = useState<LifecycleStage>('acquisition');
  const [acqMode, setAcqMode] = useState<'accounts' | 'clients' | 'accountShare' | 'clientShare'>('clients');
  const [activationStage, setActivationStage] = useState<ActivationStage>('trade90');
  const [actMode, setActMode] = useState<'absolute' | 'share'>('share');
  const [portfolioMetric, setPortfolioMetric] = useState<PortfolioMetric>('turnover');
  const [portMode, setPortMode] = useState<'absolute' | 'share'>('absolute');
  const [churnEvent, setChurnEvent] = useState<ChurnEvent>('dormant');
  const [churnMode, setChurnMode] = useState<'absolute' | 'share'>('absolute');

  const lastIdx = RANKING_MONTHS.length - 1;

  // ── Привлечение ─────────────────────────────────────────────
  const isAccounts = acqMode === 'accounts' || acqMode === 'accountShare';
  const isAcqShare = acqMode === 'accountShare' || acqMode === 'clientShare';
  const acqSeries: BrokerSeries = {
    own: acquisitionRows.map(r => (isAccounts ? r.ownAccounts : r.ownClients)),
    t: acquisitionRows.map(r => (isAccounts ? r.tAccounts : r.tClients)),
    sber: acquisitionRows.map(r => (isAccounts ? r.sberAccounts : r.sberClients)),
    vtb: acquisitionRows.map(r => (isAccounts ? r.vtbAccounts : r.vtbClients)),
    other: acquisitionRows.map(r => (isAccounts ? r.otherAccounts : r.otherClients)),
  };
  const acqRows = buildStackRows(RANKING_MONTHS, acqSeries, isAcqShare);
  const acqPace = paceRows(acqSeries, ownName);

  // ── Активация ───────────────────────────────────────────────
  const clientSeries: BrokerSeries = {
    own: acquisitionRows.map(r => r.ownClients),
    t: acquisitionRows.map(r => r.tClients),
    sber: acquisitionRows.map(r => r.sberClients),
    vtb: acquisitionRows.map(r => r.vtbClients),
    other: acquisitionRows.map(r => r.otherClients),
  };
  const rates = activationRates[activationStage];
  const activatedSeries: BrokerSeries = {
    own: clientSeries.own.map((v, i) => (v * rates.own[i]) / 100),
    t: clientSeries.t.map((v, i) => (v * rates.t[i]) / 100),
    sber: clientSeries.sber.map((v, i) => (v * rates.sber[i]) / 100),
    vtb: clientSeries.vtb.map((v, i) => (v * rates.vtb[i]) / 100),
    other: clientSeries.other.map((v, i) => (v * rates.other[i]) / 100),
  };
  const actRows = buildStackRows(RANKING_MONTHS, activatedSeries, actMode === 'share');
  const totalClients = RANKING_MONTHS.reduce(
    (sum, _, i) => sum + clientSeries.own[i] + clientSeries.t[i] + clientSeries.sber[i] + clientSeries.vtb[i] + clientSeries.other[i], 0);
  const totalActivated = RANKING_MONTHS.reduce(
    (sum, _, i) => sum + activatedSeries.own[i] + activatedSeries.t[i] + activatedSeries.sber[i] + activatedSeries.vtb[i] + activatedSeries.other[i], 0);
  const ownActivated = activatedSeries.own.reduce((s, v) => s + v, 0);
  const lastActTotal = activatedSeries.own[lastIdx] + activatedSeries.t[lastIdx] + activatedSeries.sber[lastIdx] + activatedSeries.vtb[lastIdx] + activatedSeries.other[lastIdx];
  const ownActShareLast = (activatedSeries.own[lastIdx] / lastActTotal) * 100;
  const stageSnapshot = (s: ActivationStage) => {
    const r = activationRates[s];
    const own = (clientSeries.own[lastIdx] * r.own[lastIdx]) / 100;
    const total = own +
      (clientSeries.t[lastIdx] * r.t[lastIdx]) / 100 +
      (clientSeries.sber[lastIdx] * r.sber[lastIdx]) / 100 +
      (clientSeries.vtb[lastIdx] * r.vtb[lastIdx]) / 100 +
      (clientSeries.other[lastIdx] * r.other[lastIdx]) / 100;
    return { own, share: (own / total) * 100 };
  };
  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const actAvgRows: [string, number, string][] = [
    [ownName, avg(rates.own), '#E8001C'],
    ['Т-Инвестиции', avg(rates.t), '#2563EB'],
    ['СберИнвестиции', avg(rates.sber), '#7C3AED'],
    ['ВТБ Мои Инвестиции', avg(rates.vtb), '#0891B2'],
    ['Рынок в целом', (totalActivated / totalClients) * 100, '#64748B'],
  ];

  // ── Активность портфеля ─────────────────────────────────────
  const portSeries = portfolioSeries[portfolioMetric];
  const portUnit = PORTFOLIO_UNITS[portfolioMetric];
  const portRows = buildStackRows(RANKING_MONTHS, portSeries, portMode === 'share');
  const portPace = paceRows(portSeries, ownName);
  const portLastTotal = portSeries.own[lastIdx] + portSeries.t[lastIdx] + portSeries.sber[lastIdx] + portSeries.vtb[lastIdx] + portSeries.other[lastIdx];
  const portOwnValue = portfolioMetric === 'turnover'
    ? portSeries.own.reduce((s, v) => s + v, 0)
    : portSeries.own[lastIdx];
  const portOwnShare = (portSeries.own[lastIdx] / portLastTotal) * 100;

  // ── Отток ───────────────────────────────────────────────────
  const churn = churnSeries[churnEvent];
  const churnRows = buildStackRows(RANKING_MONTHS, churn, churnMode === 'share');
  const churnPace = paceRows(churn, ownName);
  const churnOwnPeriod = churn.own.reduce((s, v) => s + v, 0);
  const churnLastTotal = churn.own[lastIdx] + churn.t[lastIdx] + churn.sber[lastIdx] + churn.vtb[lastIdx] + churn.other[lastIdx];
  const churnOwnShare = (churn.own[lastIdx] / churnLastTotal) * 100;

  return (
    <div className="space-y-4">
      <RankingFilterBar filters={filters} onChange={setFilters} onOpenSegment={openSegment} showMetric={false} />
      <section className="card p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Стратегический контур</div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Сравнение с рынком</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">ФЛ · 284 тыс. клиентов</span>
        </div>
        <div className="grid grid-cols-2 gap-3 py-4 lg:grid-cols-4">
          {([
            ['Клиенты в срезе', '284 тыс.', 'база для всех блоков'],
            ['AuC в срезе', '1 184 млрд', 'активы выбранной группы'],
            ['Доля оборота', '14,8%', '+3,6 п.п. за период'],
            ['Потенциал оборота', '+286,4 млрд', 'до сильных участников'],
          ] as const).map(([label, value, sub]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3">
              <span className="text-[10px] text-slate-500">{label}</span>
              <strong className="block text-lg text-slate-900">{value}</strong>
              <small className="text-[10px] text-slate-400">{sub}</small>
            </div>
          ))}
        </div>
        <div className="mt-5 flex overflow-x-auto border-b border-slate-200">
          {LIFECYCLE_STAGES.map(s => (
            <button
              key={s}
              className={`whitespace-nowrap border-b-2 px-4 py-2 text-xs font-semibold ${
                stage === s ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'
              }`}
              onClick={() => setStage(s)}
            >
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>

        {stage === 'acquisition' && (
          <div className="pt-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600">01 · ПРИВЛЕЧЕНИЕ</div>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Новый клиентский поток: мы, рынок и конкуренты</h3>
                <p className="mt-1 text-xs text-slate-500">Открытия за месяц · ближайшие конкуренты · 2025-01 — 2026-05</p>
              </div>
              {modeToggle<'accounts' | 'clients' | 'accountShare' | 'clientShare'>([
                ['accounts', 'Счета'], ['clients', 'Клиенты'],
                ['accountShare', 'Доля по счетам'], ['clientShare', 'Доля по клиентам'],
              ], acqMode, setAcqMode)}
            </div>
            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-100 p-3">
                  <BrokerStackChart
                    data={acqRows}
                    ownName={ownName}
                    axisLabel={isAcqShare ? '%' : isAccounts ? 'тыс. счетов' : 'тыс. клиентов'}
                    valueSuffix={isAcqShare ? '%' : ' тыс.'}
                    isShare={isAcqShare}
                    stackId="flow"
                  />
                </div>
                <DeltaBenchmarkChart months={RANKING_MONTHS} series={acqSeries} unit="тыс." ownName={ownName} />
              </div>
              <aside className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">За период</span>
                  <strong className="mt-1 block text-2xl text-slate-900">{isAccounts ? '197,2' : '169,7'} тыс.</strong>
                  <p className="text-[10px] text-slate-500">открыто у {ownName}</p>
                  <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-xs">
                    <span className="text-slate-500">Доля в новом потоке</span>
                    <strong className="text-red-600">{isAccounts ? '11,7%' : '12,0%'}</strong>
                  </div>
                </div>
                <PaceCard title="Средний темп в месяц" subtitle="CAGR по месячным открытиям · 2025-01 — 2026-05" rows={acqPace} max={8} />
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Вывод</span>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                    {ownName} растёт быстрее ближайших конкурентов: разрыв по темпу составляет{' '}
                    <strong>+{fmt.format(acqPace[0][1] - acqPace[1][1])} п.п.</strong>, но доля в новом потоке пока ниже лидеров.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        )}

        {stage === 'activation' && (
          <div className="pt-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600">02 · АКТИВАЦИЯ</div>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Переход нового клиента к первой торговой активности</h3>
                <p className="mt-1 text-xs text-slate-500">Три этапа активации · мы, ближайшие конкуренты и рынок</p>
              </div>
              {modeToggle<'absolute' | 'share'>([['absolute', 'Клиенты'], ['share', 'Доля рынка']], actMode, setActMode)}
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {(Object.entries(ACTIVATION_LABELS) as [ActivationStage, string][]).map(([key, label]) => (
                <button
                  key={key}
                  className={`rounded-xl border p-3 text-left transition ${
                    activationStage === key ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => setActivationStage(key)}
                >
                  <span className={`text-[10px] font-bold uppercase ${activationStage === key ? 'text-blue-700' : 'text-slate-400'}`}>{label}</span>
                  <strong className="mt-1 block text-lg text-slate-900">
                    {actMode === 'absolute' ? `${fmt.format(stageSnapshot(key).own)} тыс.` : `${fmt.format(stageSnapshot(key).share)}%`}
                  </strong>
                  <small className="text-[10px] text-slate-500">
                    {ownName} · 2026-05 · {actMode === 'absolute' ? 'активированные клиенты' : 'доля всех активаций рынка'}
                  </small>
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-100 p-3">
                  <BrokerStackChart
                    data={actRows}
                    ownName={ownName}
                    axisLabel={actMode === 'share' ? '%' : 'тыс. клиентов'}
                    valueSuffix={actMode === 'share' ? '%' : ' тыс.'}
                    isShare={actMode === 'share'}
                    stackId="activation"
                  />
                </div>
                <DeltaBenchmarkChart months={RANKING_MONTHS} series={activatedSeries} unit="тыс." ownName={ownName} />
              </div>
              <aside className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Активировано за период</span>
                  <strong className="mt-1 block text-2xl text-slate-900">
                    {actMode === 'absolute' ? `${fmt.format(ownActivated)} тыс.` : `${fmt.format((ownActivated / totalActivated) * 100)}%`}
                  </strong>
                  <p className="text-[10px] text-slate-500">{ACTIVATION_LABELS[activationStage]} · {ownName}</p>
                  <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-xs">
                    <span className="text-slate-500">Доля рынка в активациях · 2026-05</span>
                    <strong className="text-red-600">{fmt.format(ownActShareLast)}%</strong>
                  </div>
                </div>
                <PaceCard title="Средняя доля активации" subtitle="Среднее за шесть месяцев" rows={actAvgRows} max={70} prefix="" />
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <span className="text-[10px] font-bold uppercase text-amber-700">Разрыв с рынком</span>
                  <p className="mt-1 text-xs leading-relaxed text-amber-900">
                    По показателю «{ACTIVATION_LABELS[activationStage]}» мы отстаём от рынка на{' '}
                    <strong>{fmt.format(actAvgRows[4][1] - actAvgRows[0][1])} п.п.</strong>{' '}
                    Основная зона роста — первые 30 дней.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        )}

        {stage === 'portfolio' && (
          <div className="pt-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600">03 · АКТИВНОСТЬ</div>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Масштаб и активность клиентского портфеля</h3>
                <p className="mt-1 text-xs text-slate-500">Оборот, активы и месячная активная аудитория · мы, конкуренты и рынок</p>
              </div>
              {modeToggle<'absolute' | 'share'>([['absolute', 'Объём'], ['share', 'Доля рынка']], portMode, setPortMode)}
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {(Object.entries(PORTFOLIO_LABELS) as [PortfolioMetric, string][]).map(([key, label]) => {
                const s = portfolioSeries[key];
                const total = s.own[lastIdx] + s.t[lastIdx] + s.sber[lastIdx] + s.vtb[lastIdx] + s.other[lastIdx];
                return (
                  <button
                    key={key}
                    className={`rounded-xl border p-3 text-left transition ${
                      portfolioMetric === key ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                    onClick={() => setPortfolioMetric(key)}
                  >
                    <span className={`text-[10px] font-bold uppercase ${portfolioMetric === key ? 'text-blue-700' : 'text-slate-400'}`}>{label}</span>
                    <strong className="mt-1 block text-lg text-slate-900">{fmt.format(s.own[lastIdx])} {PORTFOLIO_UNITS[key]}</strong>
                    <small className="text-[10px] text-slate-500">Доля рынка {fmt.format((s.own[lastIdx] / total) * 100)}% · 2026-05</small>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-100 p-3">
                  <BrokerStackChart
                    data={portRows}
                    ownName={ownName}
                    axisLabel={portMode === 'share' ? '%' : portfolioMetric === 'mau' ? 'тыс. клиентов' : portUnit}
                    valueSuffix={portMode === 'share' ? '%' : ` ${portUnit}`}
                    isShare={portMode === 'share'}
                    stackId="portfolio"
                  />
                </div>
                <DeltaBenchmarkChart months={RANKING_MONTHS} series={portSeries} unit={portUnit} ownName={ownName} />
              </div>
              <aside className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {portfolioMetric === 'turnover' ? 'За период' : 'На конец периода'}
                  </span>
                  <strong className="mt-1 block text-2xl text-slate-900">{fmt.format(portOwnValue)} {portUnit}</strong>
                  <p className="text-[10px] text-slate-500">{PORTFOLIO_LABELS[portfolioMetric]} · {ownName}</p>
                  <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-xs">
                    <span className="text-slate-500">Доля рынка</span>
                    <strong className="text-red-600">{fmt.format(portOwnShare)}%</strong>
                  </div>
                </div>
                <PaceCard title="Средний темп в месяц" subtitle="CAGR · 2025-01 — 2026-05" rows={portPace} max={9} />
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Динамика</span>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                    {PORTFOLIO_LABELS[portfolioMetric]} растёт быстрее рынка на{' '}
                    <strong>+{fmt.format(portPace[0][1] - portPace[4][1])} п.п.</strong>{' '}
                    в среднем за месяц.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        )}

        {stage === 'churn' && (
          <div className="pt-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600">04 · ОТТОК</div>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Потери клиентской базы: мы, рынок и конкуренты</h3>
                <p className="mt-1 text-xs text-slate-500">Спящие клиенты, обнуление активов и закрытие счетов · 2025-01 — 2026-05</p>
              </div>
              {modeToggle<'absolute' | 'share'>([['absolute', 'Клиенты'], ['share', 'Доля оттока']], churnMode, setChurnMode)}
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {(Object.entries(CHURN_LABELS) as [ChurnEvent, string][]).map(([key, label]) => {
                const s = churnSeries[key];
                const total = s.own[lastIdx] + s.t[lastIdx] + s.sber[lastIdx] + s.vtb[lastIdx] + s.other[lastIdx];
                return (
                  <button
                    key={key}
                    className={`rounded-xl border p-3 text-left transition ${
                      churnEvent === key ? 'border-red-300 bg-red-50 ring-1 ring-red-200' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                    onClick={() => setChurnEvent(key)}
                  >
                    <span className={`text-[10px] font-bold uppercase ${churnEvent === key ? 'text-red-700' : 'text-slate-400'}`}>{label}</span>
                    <strong className="mt-1 block text-lg text-slate-900">{fmt.format(s.own[lastIdx])} тыс.</strong>
                    <small className="text-[10px] text-slate-500">
                      Доля рыночного оттока {fmt.format((s.own[lastIdx] / total) * 100)}% · 2026-05
                    </small>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-100 p-3">
                  <BrokerStackChart
                    data={churnRows}
                    ownName={ownName}
                    axisLabel={churnMode === 'share' ? '%' : 'тыс. клиентов'}
                    valueSuffix={churnMode === 'share' ? '%' : ' тыс.'}
                    isShare={churnMode === 'share'}
                    stackId="churn"
                  />
                </div>
                <DeltaBenchmarkChart months={RANKING_MONTHS} series={churn} unit="тыс." ownName={ownName} />
              </div>
              <aside className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">За период</span>
                  <strong className="mt-1 block text-2xl text-slate-900">{fmt.format(churnOwnPeriod)} тыс.</strong>
                  <p className="text-[10px] text-slate-500">{CHURN_LABELS[churnEvent]} · {ownName}</p>
                  <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-xs">
                    <span className="text-slate-500">Доля рыночного оттока</span>
                    <strong className="text-red-600">{fmt.format(churnOwnShare)}%</strong>
                  </div>
                </div>
                <PaceCard title="Средний темп в месяц" subtitle="CAGR события оттока · 2025-01 — 2026-05" rows={churnPace} max={15} />
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <span className="text-[10px] font-bold uppercase text-red-700">Сигнал риска</span>
                  <p className="mt-1 text-xs leading-relaxed text-red-900">
                    {CHURN_LABELS[churnEvent]} у нас растёт быстрее рынка на{' '}
                    <strong>+{fmt.format(churnPace[0][1] - churnPace[4][1])} п.п.</strong>{' '}
                    в среднем за месяц.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
