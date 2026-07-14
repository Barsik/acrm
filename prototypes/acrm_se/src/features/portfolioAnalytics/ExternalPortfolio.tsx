import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList,
} from 'recharts';
import { RankingFilterBar } from '../ranking/RankingFilterBar';
import { fmt, RANKING_MONTHS, RANKING_MARKETS, RANKING_PRODUCTS } from '../ranking/rankingData';
import type { RankingFilters } from '../ranking/rankingData';
import { yAxisLabel } from './chartUtils';
import {
  MATRIX_META, buildMatrix, selectionValue, PRE_MONTHS, roleShares, roleHistory,
  walletTotals, WALLET_SCALE_DIVISOR, WALLET_TREND, brokerCountStart, BROKER_COUNT_NOISE,
  marketCoverage, productCoverage, withGap,
} from './analyticsData';
import type { MatrixMetric, MatrixSelection, CoverageRow } from './analyticsData';

const round1 = (v: number) => Math.round(v * 10) / 10;

interface ExternalPortfolioProps {
  ownName: string;
  filters: RankingFilters;
  setFilters: (filters: RankingFilters) => void;
  openSegment: () => void;
  selection: MatrixSelection;
  extMetric: MatrixMetric;
  setExtMetric: (metric: MatrixMetric) => void;
  extMode: 'share' | 'absolute';
  setExtMode: (mode: 'share' | 'absolute') => void;
  coverageView: 'markets' | 'products';
  setCoverageView: (view: 'markets' | 'products') => void;
  coverageName: string;
  setCoverageName: (name: string) => void;
}

export const ExternalPortfolio = ({
  ownName, filters, setFilters, openSegment, selection,
  extMetric, setExtMetric, extMode, setExtMode,
  coverageView, setCoverageView, coverageName, setCoverageName,
}: ExternalPortfolioProps) => {
  const matrix = buildMatrix(extMetric);
  const segmentValue = selectionValue(matrix, selection);
  const unit = MATRIX_META[extMetric].unit;

  const shareToValue = (sharePct: number) => `${fmt.format((segmentValue * sharePct) / 100)} ${unit}`;
  const displayValue = (sharePct: number) => (extMode === 'share' ? `${fmt.format(sharePct)}%` : shareToValue(sharePct));

  // Роль в кошельке: доли и история
  const shares = roleShares[extMetric];
  const history = roleHistory[extMetric];
  const historyFull = [
    ...Array.from({ length: PRE_MONTHS }, (_, i) => {
      const n = PRE_MONTHS - i;
      const onlyUs = history[0][0] + n * 0.22;
      const primary = history[0][1] - n * 0.08;
      const second = history[0][2] - n * 0.06;
      return [onlyUs, primary, second, 100 - onlyUs - primary - second];
    }),
    ...history,
  ];
  const roleRows = RANKING_MONTHS.map((month, i) => ({
    month, onlyUs: historyFull[i][0], primary: historyFull[i][1], second: historyFull[i][2], peripheral: historyFull[i][3],
  }));
  const keepFirst = roleRows[0].onlyUs + roleRows[0].primary;
  const keepLast = roleRows[roleRows.length - 1].onlyUs + roleRows[roleRows.length - 1].primary;
  const keepDelta = keepLast - keepFirst;

  const roleChartRows = roleRows.map((row, i) => {
    const scale = segmentValue * WALLET_TREND[i];
    const value = (v: number) => (extMode === 'share' ? v : (scale * v) / 100);
    return {
      month: row.month,
      onlyUs: value(row.onlyUs),
      primary: value(row.primary),
      second: value(row.second),
      peripheral: value(row.peripheral),
      total: extMode === 'share' ? 100 : scale,
    };
  });

  // Совокупный кошелёк (для оборота и AuC)
  const wallet = extMetric === 'turnover' ? walletTotals.turnover : walletTotals.auc;
  const walletScale = extMetric === 'clients'
    ? 1
    : segmentValue / WALLET_SCALE_DIVISOR[extMetric === 'turnover' ? 'turnover' : 'auc'];
  const walletRows = RANKING_MONTHS.map((month, i) => {
    const total = wallet.total[i] * walletScale;
    const ours = wallet.ours[i] * walletScale;
    const outside = total - ours;
    return {
      month,
      total: extMode === 'share' ? 100 : total,
      ours: extMode === 'share' ? (ours / total) * 100 : ours,
      outside: extMode === 'share' ? (outside / total) * 100 : outside,
    };
  });
  const walletNow = (() => {
    const last = wallet.total.length - 1;
    const total = wallet.total[last] * walletScale;
    const ours = wallet.ours[last] * walletScale;
    return { total, ours, outside: total - ours, share: (ours / total) * 100 };
  })();
  const walletStartShare = (wallet.ours[0] / wallet.total[0]) * 100;
  const walletShareDelta = walletNow.share - walletStartShare;

  // Сколько брокеров использует клиент
  const countStart = brokerCountStart[extMetric];
  const brokerCountRows = RANKING_MONTHS.map((month, i) => {
    const progress = 1 - i / (RANKING_MONTHS.length - 1);
    const noise = BROKER_COUNT_NOISE[i];
    const onlyAlpha = round1(countStart[0] + 9 * progress + noise);
    const twoBrokers = round1(countStart[1] - 3 * progress - noise * 0.35);
    const threeFour = round1(countStart[2] - 3 * progress + noise * 0.15);
    return {
      month,
      onlyAlpha,
      onlyAlphaLabel: i === 0 || i === RANKING_MONTHS.length - 1 ? onlyAlpha : null,
      twoBrokers,
      threeFour,
      fivePlus: round1(100 - onlyAlpha - twoBrokers - threeFour),
    };
  });
  const onlyStart = brokerCountRows[0].onlyAlpha;
  const onlyEnd = brokerCountRows[brokerCountRows.length - 1].onlyAlpha;
  const onlyDelta = onlyEnd - onlyStart;

  // Аналитика по рынкам и продуктам
  const marketRows: CoverageRow[] = RANKING_MARKETS
    .filter(([key]) => key !== 'ALL')
    .map(([key, label]) => withGap({ name: label, market: label, ...marketCoverage[key] }))
    .sort((a, b) => b.gap - a.gap);
  const productRows: CoverageRow[] = RANKING_MARKETS
    .filter(([key]) => key !== 'ALL')
    .flatMap(([key, label]) =>
      RANKING_PRODUCTS[key]
        .filter(product => product !== 'Все продукты')
        .map(product => withGap({ name: product, market: label, ...productCoverage[product] })),
    )
    .sort((a, b) => b.gap - a.gap);
  const coverageRows = coverageView === 'markets' ? marketRows : productRows;
  const selectedCoverage = coverageRows.find(row => row.name === coverageName) ?? coverageRows[0];

  const brokerRelation: [string, number, string][] = [
    ['Только у нас', extMetric === 'clients' ? 42 : extMetric === 'turnover' ? 31 : 38, 'нет активного счёта у других'],
    ['В нескольких брокерах', extMetric === 'clients' ? 58 : extMetric === 'turnover' ? 69 : 62, 'активны минимум у двух'],
    ['Мы — основной брокер', extMetric === 'clients' ? 36 : extMetric === 'turnover' ? 44 : 49,
      `максимальная доля ${extMetric === 'auc' ? 'AuC' : extMetric === 'turnover' ? 'оборота' : 'активности'}`],
    ['Активнее вне нас', extMetric === 'clients' ? 27 : extMetric === 'turnover' ? 34 : 29, 'точка возврата кошелька'],
  ];

  const stackLabel = (dataKey: string, fill = '#FFFFFF') => (
    <LabelList
      dataKey={dataKey}
      position="center"
      fill={fill}
      fontSize={8}
      fontWeight={700}
      formatter={(v: number) => (extMode === 'share' ? `${fmt.format(Number(v))}%` : fmt.format(Number(v)))}
    />
  );

  return (
    <>
      <RankingFilterBar filters={filters} onChange={setFilters} onOpenSegment={openSegment} showMetric={false} />
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-red-600">03 · Внешний портфель</div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Где ещё работают клиенты выбранного сегмента</h2>
            <p className="mt-1 text-xs text-slate-500">Сравнение активности в {ownName} и у других брокеров</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div>
              <span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">Что измеряем</span>
              <div className="flex rounded-lg bg-slate-100 p-1">
                {(Object.entries(MATRIX_META) as [MatrixMetric, { label: string }][]).map(([key, meta]) => (
                  <button
                    key={key}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${
                      extMetric === key ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'
                    }`}
                    onClick={() => setExtMetric(key)}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">Как показываем</span>
              <div className="flex rounded-lg bg-slate-100 p-1">
                {([['share', 'Доля'], ['absolute', 'Абсолют']] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${
                      extMode === mode ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'
                    }`}
                    onClick={() => setExtMode(mode)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {extMetric !== 'clients' && (
          <div className="border-b border-slate-200 bg-slate-50 p-5">
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-2 border-b border-slate-200 p-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-red-600">Совокупный кошелёк сегмента</div>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    {extMetric === 'auc' ? 'AuC' : 'Оборот'} всех клиентов, у которых есть счёт в {ownName}
                  </h3>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Включает {extMetric === 'auc' ? 'активы' : 'торговый оборот'} этих же клиентов в {ownName} и у всех других брокеров
                  </p>
                </div>
              </div>
              <div className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
                {([
                  ['Совокупно во всех брокерах', walletNow.total, 100, 'полный кошелёк выбранных клиентов'],
                  [`В ${ownName}`, walletNow.ours, walletNow.share, 'наша часть кошелька'],
                  [`Вне ${ownName}`, walletNow.outside, 100 - walletNow.share, 'часть у других брокеров'],
                ] as const).map(([label, value, share, sub]) => (
                  <div key={label} className="border-b border-slate-200 p-4 sm:border-r xl:border-b-0">
                    <span className="text-[10px] text-slate-500">{label}</span>
                    <strong className="mt-1 block text-xl text-slate-900">
                      {extMode === 'absolute' ? `${fmt.format(value)} млрд ₽` : `${fmt.format(share)}%`}
                    </strong>
                    <span className="block text-xs font-semibold text-slate-600">
                      {extMode === 'absolute' ? `${fmt.format(share)}%` : `${fmt.format(value)} млрд ₽`}
                    </span>
                    <small className="mt-1 block text-[9px] text-slate-400">{sub}</small>
                  </div>
                ))}
                <div className={`p-4 ${walletShareDelta >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <span className="text-[10px] text-slate-500">Изменение нашей доли</span>
                  <strong className={`mt-1 block text-xl ${walletShareDelta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {walletShareDelta >= 0 ? '+' : ''}{fmt.format(walletShareDelta)} п.п.
                  </strong>
                  <span className="block text-xs font-semibold text-slate-600">
                    {fmt.format(walletStartShare)}% → {fmt.format(walletNow.share)}%
                  </span>
                  <small className="mt-1 block text-[9px] text-slate-400">2025-01 → 2026-05</small>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="text-sm font-bold text-slate-900">Как меняется совокупный кошелёк и его распределение</h4>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {extMode === 'absolute' ? 'Абсолютные значения, млрд ₽' : 'Доля совокупного кошелька, %'} · 2025-01 — 2026-05
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={285}>
                  <BarChart data={walletRows} margin={{ top: 24, right: 18, left: 10, bottom: 4 }} barCategoryGap="18%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis
                      width={76}
                      label={yAxisLabel(extMode === 'share' ? '%' : 'млрд ₽')}
                      domain={extMode === 'share' ? [0, 106] : [0, (max: number) => Math.ceil(max * 1.1)]}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => fmt.format(Number(value))}
                    />
                    <Tooltip formatter={(value, name) => [`${fmt.format(Number(value))}${extMode === 'share' ? '%' : ' млрд ₽'}`, name]} />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Bar dataKey="ours" name={`В ${ownName}`} stackId="wallet" fill="#E8001C">
                      <LabelList dataKey="ours" position="center" fill="#FFFFFF" fontSize={8} fontWeight={700} formatter={(v: number) => fmt.format(Number(v))} />
                    </Bar>
                    <Bar dataKey="outside" name={`Вне ${ownName}`} stackId="wallet" fill="#2563EB" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="outside" position="center" fill="#FFFFFF" fontSize={8} fontWeight={700} formatter={(v: number) => fmt.format(Number(v))} />
                      <LabelList dataKey="total" position="top" fill="#334155" fontSize={9} fontWeight={700} formatter={(v: number) => `${fmt.format(Number(v))}${extMode === 'share' ? '%' : ''}`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
          {brokerRelation.map(([label, share, sub]) => (
            <div key={label} className="border-b border-slate-200 p-4 last:border-b-0 sm:border-r xl:border-b-0">
              <span className="text-[10px] text-slate-500">{label}</span>
              <strong className="mt-1 block text-2xl text-slate-900">{displayValue(share)}</strong>
              <span className="block text-xs font-semibold text-slate-700">
                {extMode === 'share' ? shareToValue(share) : `${share}%`}
              </span>
              <small className="mt-1 block text-[10px] text-slate-500">{sub}</small>
            </div>
          ))}
        </div>

        <div className="border-b border-slate-200 p-5">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">Динамика роли {ownName} в кошельке</h3>
            <p className="mt-1 text-[10px] text-slate-500">
              Структура выбранного сегмента по месяцам · {extMode === 'share' ? '%' : unit}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={285}>
            <BarChart data={roleChartRows} margin={{ top: 24, right: 18, left: 12, bottom: 4 }} barCategoryGap="18%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis
                width={76}
                label={yAxisLabel(extMode === 'share' ? '%' : unit)}
                domain={extMode === 'share' ? [0, 106] : [0, (max: number) => Math.ceil(max * 1.08)]}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => fmt.format(Number(value))}
              />
              <Tooltip formatter={(value, name) => [
                extMode === 'share' ? `${fmt.format(Number(value))}%` : `${fmt.format(Number(value))} ${unit}`,
                name,
              ]} />
              <Bar dataKey="onlyUs" name="Только у нас" stackId="role" fill="#059669">{stackLabel('onlyUs')}</Bar>
              <Bar dataKey="primary" name="Основной" stackId="role" fill="#34D399">{stackLabel('primary')}</Bar>
              <Bar dataKey="second" name="Второй" stackId="role" fill="#FBBF24">{stackLabel('second', '#713F12')}</Bar>
              <Bar dataKey="peripheral" name="Периферийный" stackId="role" fill="#E8001C" radius={[4, 4, 0, 0]}>
                {stackLabel('peripheral')}
                <LabelList
                  dataKey="total"
                  position="top"
                  fill="#334155"
                  fontSize={9}
                  fontWeight={700}
                  formatter={(v: number) => (extMode === 'share' ? `${fmt.format(Number(v))}%` : fmt.format(Number(v)))}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-600">
            {([
              ['Только у нас', '#059669'], ['Основной', '#34D399'], ['Второй', '#FBBF24'], ['Периферийный', '#E8001C'],
            ] as const).map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="border-b border-slate-200 p-5">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900">Наша роль в кошельке клиента</h3>
            <p className="mt-1 text-[10px] text-slate-500">
              Структура выбранного сегмента по {extMetric === 'clients' ? 'клиентам' : extMetric === 'turnover' ? 'обороту' : 'AuC'}
            </p>
            <div className="mt-5 flex h-8 overflow-hidden rounded-lg">
              {([
                ['Только у нас', shares[0], 'bg-emerald-600'],
                ['Основной', shares[1], 'bg-emerald-400'],
                ['Второй', shares[2], 'bg-amber-400'],
                ['Периферийный', shares[3], 'bg-red-500'],
              ] as const).map(([label, share, color]) => (
                <div
                  key={label}
                  className={`${color} flex items-center justify-center text-[9px] font-bold text-white`}
                  style={{ width: `${share}%` }}
                  title={`${label}: ${share}%`}
                >
                  {share}%
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {([
                ['Удерживаем кошелёк', 'bg-emerald-50', 'text-emerald-700', [
                  ['Только у нас', shares[0], 'нет активности у других', 'bg-emerald-600'],
                  ['Основной', shares[1], 'максимальная доля у нас', 'bg-emerald-400'],
                ]],
                ['Уступаем кошелёк', 'bg-amber-50', 'text-amber-700', [
                  ['Второй', shares[2], 'уступаем одному брокеру', 'bg-amber-400'],
                  ['Периферийный', shares[3], 'активность преимущественно вне нас', 'bg-red-500'],
                ]],
              ] as [string, string, string, [string, number, string, string][]][]).map(([title, bg, titleColor, rows]) => (
                <div key={title} className={`rounded-lg ${bg} p-3`}>
                  <span className={`text-[9px] font-bold uppercase ${titleColor}`}>{title}</span>
                  <div className="mt-2 space-y-3">
                    {rows.map(([label, share, sub, dotColor]) => (
                      <div key={label} className="flex items-start justify-between gap-2">
                        <div className="flex gap-2">
                          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-sm ${dotColor}`} />
                          <div>
                            <strong className="block text-[10px] text-slate-800">{label}</strong>
                            <small className="text-[9px] text-slate-500">{sub}</small>
                          </div>
                        </div>
                        <div className="text-right">
                          <strong className="block text-xs">{displayValue(share)}</strong>
                          <small className="whitespace-nowrap text-[9px] text-slate-500">
                            {extMode === 'share' ? shareToValue(share) : `${share}%`}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className={`mb-3 rounded-lg px-3 py-2 ${
                keepDelta > 0 ? 'bg-emerald-50 text-emerald-800' : keepDelta < 0 ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-700'
              }`}>
                <span className="text-[9px] font-bold uppercase">
                  {keepDelta > 0 ? 'Позиция улучшается' : keepDelta < 0 ? 'Позиция ухудшается' : 'Позиция стабильна'}
                </span>
                <div className="mt-0.5 flex items-end justify-between gap-2">
                  <strong className="text-base">{keepDelta > 0 ? '+' : ''}{fmt.format(keepDelta)} п.п.</strong>
                  <small className="text-[9px]">
                    «Только у нас + Основной»: {fmt.format(keepFirst)}% → {fmt.format(keepLast)}%
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900">Сколько брокеров использует клиент — динамика</h3>
            <p className="mt-1 text-[10px] text-slate-500">Структура выбранного сегмента по месяцам, % · 2025-01 — 2026-05</p>
            <div className={`mt-3 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
              onlyDelta < 0 ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'
            }`}>
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">Доля «Только {ownName}»</span>
                <strong className="mt-0.5 block text-base text-slate-900">
                  {fmt.format(onlyStart)}% → {fmt.format(onlyEnd)}%
                </strong>
                <small className="text-[9px] text-slate-500">Сейчас: {shareToValue(onlyEnd)}</small>
              </div>
              <div className="text-right">
                <strong className={`block text-lg ${onlyDelta < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {onlyDelta > 0 ? '+' : ''}{fmt.format(onlyDelta)} п.п.
                </strong>
                <small className={`text-[9px] font-bold ${onlyDelta < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {onlyDelta < 0 ? 'Доля размывается' : onlyDelta > 0 ? 'Доля растёт' : 'Доля стабильна'}
                </small>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={285}>
              <BarChart data={brokerCountRows} margin={{ top: 18, right: 8, left: 4, bottom: 4 }} barCategoryGap="18%">
                <CartesianGrid vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 8 }} />
                <YAxis
                  width={52}
                  label={yAxisLabel('%')}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 9 }}
                  tickFormatter={(value) => fmt.format(Number(value))}
                />
                <Tooltip formatter={(value, name) => [`${fmt.format(Number(value))}%`, name]} />
                <Legend wrapperStyle={{ fontSize: 9, paddingTop: 8 }} />
                <Bar dataKey="onlyAlpha" name={`Только ${ownName}`} stackId="count" fill="#E8001C">
                  <LabelList
                    dataKey="onlyAlphaLabel"
                    position="center"
                    fill="#FFFFFF"
                    fontSize={8}
                    fontWeight={700}
                    formatter={(v: number | null) => (v == null ? '' : `${fmt.format(Number(v))}%`)}
                  />
                </Bar>
                <Bar dataKey="twoBrokers" name="2 брокера" stackId="count" fill="#2563EB" />
                <Bar dataKey="threeFour" name="3–4 брокера" stackId="count" fill="#7C3AED" />
                <Bar dataKey="fivePlus" name="5 и более" stackId="count" fill="#64748B" radius={[3, 3, 0, 0]} />
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
              <button
                className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${
                  coverageView === 'markets' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'
                }`}
                onClick={() => { setCoverageView('markets'); setCoverageName(marketRows[0].name); }}
              >
                Рынки · {marketRows.length}
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${
                  coverageView === 'products' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'
                }`}
                onClick={() => { setCoverageView('products'); setCoverageName(productRows[0].name); }}
              >
                Продукты · {productRows.length}
              </button>
            </div>
          </div>

          <div className="mb-4 grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
            <div className="border-b border-slate-200 p-4 sm:border-r xl:border-b-0">
              <span className="text-[9px] font-bold uppercase text-slate-400">Выбрано</span>
              <strong className="mt-1 block text-base text-slate-900">{selectedCoverage.name}</strong>
              <small className="text-[9px] text-slate-500">
                {coverageView === 'products' ? selectedCoverage.market : 'рынок целиком'}
              </small>
            </div>
            <div className="border-b border-slate-200 p-4 xl:border-b-0 xl:border-r">
              <span className="text-[9px] font-bold uppercase text-slate-400">У нас / у других</span>
              <strong className="mt-1 block text-base text-slate-900">
                {fmt.format(selectedCoverage.ours)}% / {fmt.format(selectedCoverage.others)}%
              </strong>
              <small className="text-[9px] text-slate-500">
                {shareToValue(selectedCoverage.ours)} / {shareToValue(selectedCoverage.others)}
              </small>
            </div>
            <div className="border-b border-slate-200 p-4 sm:border-r xl:border-b-0">
              <span className="text-[9px] font-bold uppercase text-slate-400">Разрыв</span>
              <strong className="mt-1 block text-base text-red-600">+{fmt.format(selectedCoverage.gap)} п.п.</strong>
              <small className={selectedCoverage.change > 0 ? 'text-[9px] text-red-600' : 'text-[9px] text-emerald-600'}>
                {selectedCoverage.change > 0 ? 'Расширился' : 'Сократился'} на {fmt.format(Math.abs(selectedCoverage.change))} п.п. к 2025-05
              </small>
            </div>
            <div className="p-4">
              <span className="text-[9px] font-bold uppercase text-slate-400">Где сосредоточен объём</span>
              <strong className="mt-1 block text-base text-slate-900">{selectedCoverage.concentrated}</strong>
              <small className="text-[9px] text-slate-500">приоритет возврата: {selectedCoverage.priority.toLowerCase()}</small>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500">
            <span>{coverageView === 'markets' ? 'Весь перечень рынков' : 'Все продукты по всем рынкам'}</span>
            <span>Сортировка: по величине разрыва</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="data-table w-full min-w-[980px]">
              <thead>
                <tr>
                  <th>{coverageView === 'markets' ? 'Рынок' : 'Продукт'}</th>
                  <th>У нас</th>
                  <th>У других</th>
                  <th>Разрыв и динамика</th>
                  <th>Где сосредоточены</th>
                  <th>Приоритет</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {coverageRows.map(row => (
                  <tr key={`${row.market}-${row.name}`} className={coverageName === row.name ? 'bg-red-50/60' : ''}>
                    <td>
                      <strong>{row.name}</strong>
                      {coverageView === 'products' && <small className="mt-0.5 block text-slate-400">{row.market}</small>}
                    </td>
                    <td>
                      <strong>{fmt.format(row.ours)}%</strong>
                      <small className="ml-1 text-slate-400">· {shareToValue(row.ours)}</small>
                      <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full bg-red-500" style={{ width: `${row.ours}%` }} />
                      </div>
                    </td>
                    <td>
                      <strong>{fmt.format(row.others)}%</strong>
                      <small className="ml-1 text-slate-400">· {shareToValue(row.others)}</small>
                      <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full bg-blue-500" style={{ width: `${row.others}%` }} />
                      </div>
                    </td>
                    <td>
                      <strong className="text-red-600">+{fmt.format(row.gap)} п.п.</strong>
                      <small className={`mt-0.5 block ${row.change > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {row.change > 0 ? '▲' : '▼'} {fmt.format(Math.abs(row.change))} п.п. к 2025-05
                      </small>
                    </td>
                    <td>{row.concentrated}</td>
                    <td>
                      <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                        row.priority === 'Высокая' ? 'bg-red-50 text-red-600'
                          : row.priority === 'Средняя' ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {row.priority}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`rounded-lg px-2 py-1.5 text-[9px] font-bold ${
                          coverageName === row.name ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        onClick={() => setCoverageName(row.name)}
                      >
                        {coverageName === row.name ? 'Выбрано' : 'Смотреть'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};
