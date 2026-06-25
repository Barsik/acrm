import { useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Layout } from '../components/layout/Layout';
import {
  BUSINESS_LINES, MONTHS_SHORT, YEAR_SPLIT, YEAR_PCT,
  CORP_CLIENTS, RETAIL_CLIENTS, CORP_MONTHLY, RETAIL_MONTHLY,
  TRADING_VOL_MONTHLY, AVG_REVENUE, AVG_REVENUE_MONTHLY, ADTV_MONTHLY,
  blFact, blMonthlyRevenue, blPlan, activeLines,
  fmtMoney, fmtMln, fmtThousands, trendInfo,
  type BusinessLine,
} from '../data/markets';

type ToVal = number | 'ytd';

// Помесячный диапазон: «с» (0–11) и «по» (YTD или 0–11). Возвращает индексы.
function resolveRange(from: number, to: ToVal): { from: number; toIdx: number; prevFrom: number; prevTo: number } {
  const toIdx = to === 'ytd' ? 11 : to;
  const len = toIdx - from + 1;
  return { from, toIdx, prevFrom: from - len, prevTo: from - 1 };
}

const sumRange = (arr: number[], from: number, to: number) =>
  arr.slice(from, to + 1).reduce((s, v) => s + v, 0);
const avgRange = (arr: number[], from: number, to: number) => {
  const sl = arr.slice(from, to + 1);
  return sl.length ? sl.reduce((s, v) => s + v, 0) / sl.length : 0;
};

export const MarketsPage = () => {
  const [bl, setBL] = useState<string>('');
  const lines = useMemo(() => activeLines(bl), [bl]);

  return (
    <Layout breadcrumbs={[{ label: 'Рынки' }]}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Globe size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Рынки</h1>
          <p className="text-sm text-slate-500">Доход, объёмы и активные клиенты по рынкам · Данные на 15 июня 2026</p>
        </div>
      </div>

      {/* Фильтр по рынку */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[{ name: '', short: 'Все' }, ...BUSINESS_LINES.map(b => ({ name: b.name, short: b.short }))].map(b => {
          const active = bl === b.name;
          return (
            <button
              key={b.name || 'all'}
              onClick={() => setBL(b.name)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                active ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-900'
              }`}
            >
              {b.short}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-5">
        <IncomeSection lines={lines} />
        <TradingVolSection lines={lines} />
        <ActiveClientsTables lines={lines} />
        <AvgRevenueSection lines={lines} />
        <RevenueMonthlySection lines={lines} />
        <AdtvSection lines={lines} />
        <ActiveClientsDynamics lines={lines} />
      </div>
    </Layout>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* 1 · Доход                                                         */
/* ─────────────────────────────────────────────────────────────── */
const IncomeSection = ({ lines }: { lines: BusinessLine[] }) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState<ToVal>('ytd');
  const isYTD = to === 'ytd';
  const { from: f, toIdx, prevFrom, prevTo } = resolveRange(from, to);

  const donutData = lines.map(l => {
    const fact = isYTD ? blFact(l) : sumRange(blMonthlyRevenue(l), f, toIdx) * 1e6;
    return { name: l.short, value: fact, color: l.color };
  });
  const total = donutData.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <SectionHead
        title="Доход"
        subtitle={isYTD
          ? 'Годовой план vs факт YTD · Данные на 15 июня 2026'
          : `${monthLabel(from)} — ${monthLabel(toIdx)} · % к пред. периоду`}
        right={<PeriodSelect from={from} to={to} setFrom={setFrom} setTo={setTo} />}
      />
      <div className="flex flex-col lg:flex-row items-stretch">
        <div className="flex-1 min-w-0 overflow-x-auto">
          <table className="atable">
            <thead>
              {isYTD ? (
                <tr>
                  <Th left>Рынок</Th><Th>План (год)</Th><Th>Факт YTD</Th><Th>% выполнения</Th><Th>Прогноз (год)</Th>
                </tr>
              ) : (
                <tr><Th left>Рынок</Th><Th>Факт за период</Th><Th>% к пред. периоду</Th></tr>
              )}
            </thead>
            <tbody>
              {lines.map(l => {
                if (isYTD) {
                  const fact = blFact(l);
                  const plan = blPlan(l.name);
                  const pct = plan > 0 ? (fact / plan) * 100 : 0;
                  const forecast = YEAR_PCT > 0 ? fact / YEAR_PCT : 0;
                  const expected = YEAR_PCT * 100;
                  const pctColor = pct >= expected * 0.95 ? '#187A40' : pct >= expected * 0.8 ? '#C85A08' : '#E30613';
                  return (
                    <tr key={l.name}>
                      <Td left bold color={l.color}>{l.name}</Td>
                      <Td>{fmtMoney(plan)}</Td>
                      <Td>{fmtMoney(Math.round(fact))}</Td>
                      <Td><b style={{ color: pctColor }}>{pct.toFixed(1)}%</b></Td>
                      <Td muted>{fmtMoney(Math.round(forecast))}</Td>
                    </tr>
                  );
                }
                const monthly = blMonthlyRevenue(l).map(v => v * 1e6);
                const cur = sumRange(monthly, f, toIdx);
                const prev = prevFrom >= 0 ? sumRange(monthly, prevFrom, prevTo) : null;
                return (
                  <tr key={l.name}>
                    <Td left bold color={l.color}>{l.name}</Td>
                    <Td>{fmtMoney(Math.round(cur))}</Td>
                    <Td><Pct cur={cur} prev={prev} /></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Donut data={donutData} centerLabel={isYTD ? 'ДОХОД YTD' : 'ДОХОД'} centerValue={fmtMln(total)} />
      </div>
    </Card>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* 2 · Объем торгов                                                  */
/* ─────────────────────────────────────────────────────────────── */
const TradingVolSection = ({ lines }: { lines: BusinessLine[] }) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState<ToVal>('ytd');
  const isYTD = to === 'ytd';
  const { from: f, toIdx, prevFrom, prevTo } = resolveRange(from, to);

  const seg = (l: BusinessLine, s: 'total' | 'corp' | 'retail') => {
    const arr = TRADING_VOL_MONTHLY[l.name][s];
    const cur = sumRange(arr, f, toIdx);
    const prev = prevFrom >= 0 ? sumRange(arr, prevFrom, prevTo) : null;
    return { cur, prev };
  };

  const donutData = lines.map(l => ({ name: l.short, value: seg(l, 'total').cur, color: l.color }));
  const total = donutData.reduce((s, d) => s + d.value, 0);
  const volLabel = total >= 1000 ? `${(Math.round(total / 100) / 10)} трлн` : `${Math.round(total)} млрд`;

  return (
    <Card>
      <SectionHead
        title="Объем торгов"
        subtitle={isYTD
          ? 'Факт YTD · млрд ₽ · Данные на 15 июня 2026'
          : `${monthLabel(from)} — ${monthLabel(toIdx)} · млрд ₽ · % к предыд. периоду`}
        right={<PeriodSelect from={from} to={to} setFrom={setFrom} setTo={setTo} />}
      />
      <div className="flex flex-col lg:flex-row items-stretch">
        <div className="flex-1 min-w-0 overflow-x-auto">
          <table className="atable">
            <thead>
              <tr>
                <Th left rowSpan={2}>Рынок</Th>
                <ThGroup color="#DADADA">Всего</ThGroup>
                <ThGroup color="#C85A08">Корп. клиенты</ThGroup>
                <ThGroup color="#2B63B8">Физ. лица</ThGroup>
              </tr>
              <tr>
                <Th>Факт</Th><Th>% — Прирост</Th>
                <Th>Факт</Th><Th>% — Прирост</Th>
                <Th>Факт</Th><Th>% — Прирост</Th>
              </tr>
            </thead>
            <tbody>
              {lines.map(l => {
                const t = seg(l, 'total'), c = seg(l, 'corp'), r = seg(l, 'retail');
                return (
                  <tr key={l.name}>
                    <Td left bold color={l.color}>{l.name}</Td>
                    <Td bold>{fmtThousands(t.cur)}</Td><Td><Pct cur={t.cur} prev={t.prev} /></Td>
                    <Td>{fmtThousands(c.cur)}</Td><Td><Pct cur={c.cur} prev={c.prev} /></Td>
                    <Td>{fmtThousands(r.cur)}</Td><Td><Pct cur={r.cur} prev={r.prev} /></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Donut data={donutData} centerLabel="ОБЪЕМ" centerValue={volLabel} />
      </div>
    </Card>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* 3 · Корп. клиенты + Физические лица                               */
/* ─────────────────────────────────────────────────────────────── */
const ActiveClientsTables = ({ lines }: { lines: BusinessLine[] }) => {
  const table = (title: string, subtitle: string, data: typeof CORP_CLIENTS) => (
    <Card className="flex-1 min-w-0">
      <div className="px-5 pt-4">
        <div className="text-[15px] font-extrabold text-slate-900">{title}</div>
        <div className="text-[11px] text-slate-500">{subtitle}</div>
      </div>
      <table className="atable mt-2">
        <thead>
          <tr><Th left>Рынок</Th><Th>На начало года</Th><Th>Факт YTD</Th><Th>% — Прирост</Th><Th>Прогноз</Th></tr>
        </thead>
        <tbody>
          {lines.map(l => {
            const d = data[l.name];
            const growth = d.start > 0 ? ((d.ytd - d.start) / d.start) * 100 : 0;
            const gColor = growth > 0 ? '#187A40' : growth < 0 ? '#E30613' : '#717171';
            return (
              <tr key={l.name}>
                <Td left bold color={l.color}>{l.name}</Td>
                <Td>{fmtThousands(d.start)}</Td>
                <Td bold>{fmtThousands(d.ytd)}</Td>
                <Td><b style={{ color: gColor }}>{growth > 0 ? '+' : ''}{growth.toFixed(1)}%</b></Td>
                <Td muted>{fmtThousands(d.forecast)}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {table('Корп. клиенты', 'Юридические лица по рынкам · Данные на 15 июня 2026', CORP_CLIENTS)}
      {table('Физические лица', 'Розничные клиенты по рынкам · Данные на 15 июня 2026', RETAIL_CLIENTS)}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* 4 · Средний доход на клиента                                      */
/* ─────────────────────────────────────────────────────────────── */
const AvgRevenueSection = ({ lines }: { lines: BusinessLine[] }) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState<ToVal>('ytd');
  const isYTD = to === 'ytd';
  const { from: f, toIdx, prevFrom, prevTo } = resolveRange(from, to);
  const factHdr = isYTD ? 'Факт YTD' : 'Ср. за период';

  return (
    <Card>
      <SectionHead
        title="Средний доход на клиента"
        subtitle={isYTD
          ? 'Факт YTD · тыс. ₽ · Данные на 15 июня 2026'
          : `${monthLabel(from)} — ${monthLabel(toIdx)} · тыс. ₽ · % к пред. периоду`}
        right={<PeriodSelect from={from} to={to} setFrom={setFrom} setTo={setTo} />}
      />
      <div className="overflow-x-auto">
        <table className="atable">
          <thead>
            <tr>
              <Th left rowSpan={2}>Рынок</Th>
              <ThGroup color="#DADADA">Всего</ThGroup>
              <ThGroup color="#C85A08">Корп. клиенты</ThGroup>
              <ThGroup color="#2B63B8">Физ. лица</ThGroup>
            </tr>
            <tr>
              <Th>{factHdr}</Th><Th>% — Прирост</Th>
              <Th>{factHdr}</Th><Th>% — Прирост</Th>
              <Th>{factHdr}</Th><Th>% — Прирост</Th>
            </tr>
          </thead>
          <tbody>
            {lines.map(l => {
              let tCur: number, tPrev: number | null, cCur: number, cPrev: number | null, rCur: number, rPrev: number | null;
              if (isYTD) {
                const d = AVG_REVENUE[l.name];
                tCur = d.total.ytd; tPrev = d.total.prev;
                cCur = d.corp.ytd; cPrev = d.corp.prev;
                rCur = d.retail.ytd; rPrev = d.retail.prev;
              } else {
                const m = AVG_REVENUE_MONTHLY[l.name];
                tCur = avgRange(m.total, f, toIdx); tPrev = prevFrom >= 0 ? avgRange(m.total, prevFrom, prevTo) : null;
                cCur = avgRange(m.corp, f, toIdx); cPrev = prevFrom >= 0 ? avgRange(m.corp, prevFrom, prevTo) : null;
                rCur = avgRange(m.retail, f, toIdx); rPrev = prevFrom >= 0 ? avgRange(m.retail, prevFrom, prevTo) : null;
              }
              const v = (x: number, corp: boolean) => (corp ? fmtThousands(x) : x.toFixed(1));
              return (
                <tr key={l.name}>
                  <Td left bold color={l.color}>{l.name}</Td>
                  <Td>{v(tCur, false)}</Td><Td><Pct cur={tCur} prev={tPrev} /></Td>
                  <Td bold>{v(cCur, true)}</Td><Td><Pct cur={cCur} prev={cPrev} /></Td>
                  <Td>{v(rCur, false)}</Td><Td><Pct cur={rCur} prev={rPrev} /></Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* 5 · Доход по месяцам                                              */
/* ─────────────────────────────────────────────────────────────── */
const RevenueMonthlySection = ({ lines }: { lines: BusinessLine[] }) => {
  const series = lines.map(l => ({ name: l.name, color: l.color, values: blMonthlyRevenue(l) }));
  return (
    <MonthlySection
      title="Доход по месяцам"
      subtitle="Июл 2025 – Июн 2026 · млн ₽"
      chartTitle="Динамика дохода по рынкам"
      chartSubtitle="Июл 2025 – Июн 2026 · фактические данные · млн ₽"
      series={series}
      format={v => v.toFixed(1)}
      yLabel="млн ₽"
    />
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* 6 · Среднесуточный объем торгов                                   */
/* ─────────────────────────────────────────────────────────────── */
const AdtvSection = ({ lines }: { lines: BusinessLine[] }) => {
  const series = lines.map(l => ({ name: l.name, color: l.color, values: ADTV_MONTHLY[l.name] }));
  return (
    <MonthlySection
      title="Среднесуточный объем торгов"
      subtitle="Июл 2025 – Июн 2026 · млрд ₽/день"
      chartTitle="Динамика среднесуточного объема торгов"
      chartSubtitle="Июл 2025 – Июн 2026 · млрд ₽/день"
      series={series}
      format={v => v.toFixed(0)}
      yLabel="млрд ₽/день"
    />
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* 7 · Динамика количества активных клиентов                         */
/* ─────────────────────────────────────────────────────────────── */
const ActiveClientsDynamics = ({ lines }: { lines: BusinessLine[] }) => {
  const [type, setType] = useState<'corp' | 'retail'>('corp');
  const isRetail = type === 'retail';
  const data = isRetail ? RETAIL_MONTHLY : CORP_MONTHLY;
  const series = lines.map(l => ({ name: l.name, color: l.color, values: data[l.name] }));
  const scale = isRetail ? 1000 : 1;

  return (
    <MonthlySection
      title="Динамика количества активных клиентов"
      subtitle={`Июл 2025 – Июн 2026 · ${isRetail ? 'физ. лица' : 'корп. клиенты'}`}
      chartTitle="Динамика количества активных клиентов по рынкам"
      chartSubtitle={`Июл 2025 – Июн 2026 · ${isRetail ? 'физ. лица' : 'корп. клиенты'}`}
      series={series}
      format={v => fmtThousands(v)}
      chartScale={scale}
      yLabel={isRetail ? 'тыс.' : 'клиентов'}
      headRight={
        <div className="flex gap-1.5">
          {(['corp', 'retail'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                type === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {t === 'corp' ? 'Корп. клиенты' : 'Физ. лица'}
            </button>
          ))}
        </div>
      }
    />
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* Общий блок: помесячная таблица + сворачиваемый линейный график     */
/* ─────────────────────────────────────────────────────────────── */
interface MarketSeries { name: string; color: string; values: number[] }

const MonthlySection = ({
  title, subtitle, chartTitle, chartSubtitle, series, format, yLabel, chartScale = 1, headRight,
}: {
  title: string; subtitle: string; chartTitle: string; chartSubtitle: string;
  series: MarketSeries[]; format: (v: number) => string; yLabel: string;
  chartScale?: number; headRight?: React.ReactNode;
}) => {
  const [showChart, setShowChart] = useState(false);
  return (
    <>
      <Card>
        <div className="px-5 pt-4 pb-2 flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-[15px] font-extrabold text-slate-900">{title}</div>
            <div className="text-[11px] text-slate-500">{subtitle}</div>
          </div>
          {headRight}
        </div>
        <div className="overflow-x-auto">
          <table className="atable" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <Th left rowSpan={2}>Рынок</Th>
                <ThGroup color="#DADADA" span={YEAR_SPLIT}>2025</ThGroup>
                <ThGroup color="#DADADA" span={MONTHS_SHORT.length - YEAR_SPLIT}>2026</ThGroup>
                <Th rowSpan={2}>Тренд</Th>
              </tr>
              <tr>{MONTHS_SHORT.map(m => <Th key={m} right>{m}</Th>)}</tr>
            </thead>
            <tbody>
              {series.map(s => {
                const { arrow, color } = trendInfo(s.values);
                return (
                  <tr key={s.name}>
                    <Td left bold color={s.color}>{s.name}</Td>
                    {s.values.map((v, i) => {
                      const up = i > 0 && v > s.values[i - 1];
                      const down = i > 0 && v < s.values[i - 1];
                      return (
                        <td key={i} className="atd" style={{ textAlign: 'right', paddingRight: 12 }}>
                          {format(v)}
                          {up && <span style={{ color: '#187A40', fontSize: 10, marginLeft: 2 }}>↑</span>}
                          {down && <span style={{ color: '#E30613', fontSize: 10, marginLeft: 2 }}>↓</span>}
                        </td>
                      );
                    })}
                    <td className="atd" style={{ textAlign: 'center' }}>
                      <Sparkline values={s.values} color={color} />
                      <span style={{ color, fontWeight: 900, marginLeft: 6 }}>{arrow}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3">
          <button
            onClick={() => setShowChart(v => !v)}
            className="px-5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            {showChart ? 'Скрыть график' : 'Показать график'}
          </button>
        </div>
      </Card>

      {showChart && (
        <Card>
          <div className="px-5 pt-4 pb-3">
            <div className="text-[15px] font-extrabold text-slate-900">{chartTitle}</div>
            <div className="text-[11px] text-slate-500">{chartSubtitle}</div>
          </div>
          <div className="px-3 pb-4">
            <MarketLineChart series={series} yLabel={yLabel} scale={chartScale} />
          </div>
        </Card>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* Линейный график по рынкам (recharts)                              */
/* ─────────────────────────────────────────────────────────────── */
const MarketLineChart = ({ series, yLabel, scale }: { series: MarketSeries[]; yLabel: string; scale: number }) => {
  const data = MONTHS_SHORT.map((m, i) => {
    const row: Record<string, number | string> = { month: m };
    series.forEach(s => { row[s.name] = s.values[i] / scale; });
    return row;
  });
  return (
    <>
      <div className="flex flex-wrap gap-x-5 gap-y-1 px-2 mb-2">
        {series.map(s => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <span style={{ width: 22, height: 3, borderRadius: 2, background: s.color, display: 'inline-block' }} />
            {s.name}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="#EBEBEB" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#717171' }} tickLine={false} axisLine={{ stroke: '#DADADA' }} />
          <YAxis
            tick={{ fontSize: 11, fill: '#ADADAD' }} tickLine={false} axisLine={false} width={48}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10, fill: '#ADADAD' }}
          />
          <Tooltip />
          <ReferenceLine x={MONTHS_SHORT[YEAR_SPLIT - 1]} stroke="#C8C8C8" strokeDasharray="3 3"
            label={{ value: '2025 | 2026', position: 'top', fontSize: 9, fill: '#ADADAD' }} />
          {series.map(s => (
            <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={1.8} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* Кольцевая диаграмма (recharts) + легенда                          */
/* ─────────────────────────────────────────────────────────────── */
const Donut = ({ data, centerLabel, centerValue }: {
  data: { name: string; value: number; color: string }[]; centerLabel: string; centerValue: string;
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex items-center gap-4 px-6 py-5 border-t lg:border-t-0 lg:border-l border-slate-200 flex-shrink-0">
      <div className="relative" style={{ width: 180, height: 180 }}>
        <PieChart width={180} height={180}>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={54} outerRadius={82} startAngle={90} endAngle={-270} stroke="none">
            {data.map(d => <Cell key={d.name} fill={d.color} />)}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[9px] font-bold text-slate-400 tracking-wide">{centerLabel}</span>
          <span className="text-[13px] font-black text-slate-900">{centerValue}</span>
        </div>
      </div>
      <div style={{ minWidth: 130 }}>
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2 mb-2.5">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span className="text-[11px] text-slate-500 flex-1">{d.name}</span>
            <span className="text-[12px] font-extrabold text-slate-900">{total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0'}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* Мелкие переиспользуемые элементы                                  */
/* ─────────────────────────────────────────────────────────────── */
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden ${className}`}>{children}</div>
);

const SectionHead = ({ title, subtitle, right }: { title: string; subtitle: string; right?: React.ReactNode }) => (
  <div className="px-5 pt-4 pb-2 flex items-start justify-between flex-wrap gap-3">
    <div>
      <div className="text-[15px] font-extrabold text-slate-900">{title}</div>
      <div className="text-[11px] text-slate-500">{subtitle}</div>
    </div>
    {right}
  </div>
);

const monthLabel = (i: number) => `${MONTHS_SHORT[i]} ${i < YEAR_SPLIT ? '2025' : '2026'}`;

const PeriodSelect = ({ from, to, setFrom, setTo }: {
  from: number; to: ToVal; setFrom: (v: number) => void; setTo: (v: ToVal) => void;
}) => {
  const opts = MONTHS_SHORT.map((m, i) => ({ value: i, label: monthLabel(i) }));
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
        С
        <select
          value={from}
          onChange={e => { const v = +e.target.value; setFrom(v); if (to !== 'ytd' && to < v) setTo(v); }}
          className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
        >
          {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
        По
        <select
          value={String(to)}
          onChange={e => setTo(e.target.value === 'ytd' ? 'ytd' : Math.max(from, +e.target.value))}
          className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
        >
          <option value="ytd">YTD</option>
          {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    </div>
  );
};

const Pct = ({ cur, prev }: { cur: number; prev: number | null }) => {
  if (prev == null || prev === 0) return <span className="text-slate-400">—</span>;
  const p = ((cur - prev) / prev) * 100;
  const color = p > 0 ? '#187A40' : p < 0 ? '#E30613' : '#717171';
  return <b style={{ color }}>{p > 0 ? '+' : ''}{p.toFixed(1)}%</b>;
};

const Sparkline = ({ values, color }: { values: number[]; color: string }) => {
  const w = 54, h = 18, sp = 2;
  const mn = Math.min(...values), mx = Math.max(...values), rng = mx - mn || 0.001;
  const step = (w - sp * 2) / (values.length - 1);
  const pts = values.map((v, i) => `${(sp + i * step).toFixed(1)},${(sp + (1 - (v - mn) / rng) * (h - sp * 2)).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

const Th = ({ children, left, right, rowSpan }: { children: React.ReactNode; left?: boolean; right?: boolean; rowSpan?: number }) => (
  <th className="ath" rowSpan={rowSpan} style={{ textAlign: left ? 'left' : right ? 'right' : 'center', paddingLeft: left ? 20 : undefined, paddingRight: right ? 12 : undefined }}>
    {children}
  </th>
);

const ThGroup = ({ children, color, span = 2 }: { children: React.ReactNode; color: string; span?: number }) => (
  <th colSpan={span} className="ath" style={{ textAlign: 'center', borderBottom: `2px solid ${color}`, color: '#ADADAD', fontWeight: 900 }}>
    {children}
  </th>
);

const Td = ({ children, left, bold, muted, color }: {
  children: React.ReactNode; left?: boolean; bold?: boolean; muted?: boolean; color?: string;
}) => (
  <td className="atd" style={{
    textAlign: left ? 'left' : 'center',
    paddingLeft: left ? 20 : undefined,
    fontWeight: bold ? 700 : undefined,
    color: color ?? (muted ? '#717171' : undefined),
  }}>
    {children}
  </td>
);
