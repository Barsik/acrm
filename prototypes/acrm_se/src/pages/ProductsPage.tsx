import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { Layout } from '../components/layout/Layout';
import { activityMonitorService } from '../services';
import { clientGroups } from '../data/mockDatabase';
import { Package } from 'lucide-react';
import { ProductAnalyticsTable } from './ProductAnalyticsTable';

// Плоская палитра (flat UI) для статусов продукта.
const STATUS_COLOR: Record<string, string> = {
  'Активно торгует': '#2ecc71',
  'Подключен к бою': '#1abc9c',
  'Подключен': '#3498db',
  'Перспективный': '#9b59b6',
  'Низкая активность': '#f39c12',
  'Не торгует': '#e74c3c',
  'Нет интереса': '#e67e22',
  'Нет статуса': '#95a5a6',
};

const STATUS_ORDER = Object.keys(STATUS_COLOR);

// Подпись внутри сегмента — процент белым; скрываем для мелких долей.
const RAD = Math.PI / 180;
const renderSliceLabel = (props: PieLabelRenderProps) => {
  const percent = Number(props.percent ?? 0);
  if (percent < 0.05) return null;
  const cx = Number(props.cx);
  const cy = Number(props.cy);
  const midAngle = Number(props.midAngle ?? 0);
  const innerRadius = Number(props.innerRadius ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const r = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="#fff" fontSize={12} fontWeight={700} textAnchor="middle" dominantBaseline="central">
      {Math.round(percent * 100)}%
    </text>
  );
};

const GROUPS = clientGroups;

export const ProductsPage = () => {
  const markets = activityMonitorService.getMarkets();
  const all = activityMonitorService.getClients();

  const segments = useMemo(
    () => Array.from(new Set(all.map(c => c.segment).filter(Boolean))) as string[],
    [all],
  );

  const [market, setMarket] = useState<string>('all');
  const [product, setProduct] = useState<string>('all');
  const [group, setGroup] = useState<string>('all');
  const [segment, setSegment] = useState<string>('all');

  const selectedMarket = markets.find(m => m.id === market);
  const products = useMemo(() => selectedMarket?.products ?? [], [selectedMarket]);

  // Группа и сегмент сужают набор клиентов.
  const filtered = useMemo(() => all.filter(c =>
    (group === 'all' || c.group === group) &&
    (segment === 'all' || c.segment === segment)
  ), [all, group, segment]);

  // Разбивка круговой диаграммы — всегда по статусу продукта:
  //   — рынок + конкретный продукт → статус этого продукта;
  //   — рынок + «все продукты» → статус рынка;
  //   — рынок не выбран → статусы по всем рынкам клиента (агрегат).
  const chartData = useMemo(() => {
    const counts = new Map<string, number>();
    const bump = (k?: string) => { if (k) counts.set(k, (counts.get(k) ?? 0) + 1); };

    if (!selectedMarket) {
      filtered.forEach(c => c.productStatuses?.forEach(bump));
      return orderBy(counts, STATUS_ORDER);
    }

    const marketIdx = markets.findIndex(m => m.id === selectedMarket.id);
    const productIdx = products.indexOf(product);

    filtered.forEach(c => {
      const status = product !== 'all' && productIdx >= 0
        ? c.marketStatuses?.[selectedMarket.id]?.[productIdx]
        : c.productStatuses?.[marketIdx];
      bump(status);
    });
    return orderBy(counts, STATUS_ORDER);
  }, [filtered, selectedMarket, markets, products, product]);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  const chartTitle = !selectedMarket
    ? 'Клиенты по статусу — все рынки'
    : product !== 'all'
      ? `Клиенты по статусу — ${product}`
      : `Клиенты по статусу — ${selectedMarket.name}`;

  return (
    <Layout breadcrumbs={[{ label: 'Продукты' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Package size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Продукты</h1>
          <p className="text-sm text-slate-500">Распределение клиентов по продуктам · 22.06.2026</p>
        </div>
      </div>

      <div className="card p-5">
        {/* Title */}
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-900">{chartTitle}</h2>
          <span className="text-xs text-slate-400">{selectedMarket ? 'Клиентов' : 'Записей'}: {total}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
          {/* Column 1 — filters */}
          <div className="flex flex-col gap-4 w-full lg:w-64 lg:flex-shrink-0">
            <FilterSelect
              label="Рынок"
              value={market}
              onChange={v => { setMarket(v); setProduct('all'); }}
              options={[{ value: 'all', label: 'Все рынки' }, ...markets.map(m => ({ value: m.id, label: m.name }))]}
            />
            <FilterSelect
              label="Продукт"
              value={product}
              onChange={setProduct}
              disabled={!selectedMarket}
              options={[{ value: 'all', label: 'Все продукты' }, ...products.map(p => ({ value: p, label: p }))]}
            />
            <FilterSelect
              label="Группа"
              value={group}
              onChange={setGroup}
              options={[{ value: 'all', label: 'Все группы' }, ...GROUPS.map(g => ({ value: g, label: g }))]}
            />
            <FilterSelect
              label="Сегмент"
              value={segment}
              onChange={setSegment}
              options={[{ value: 'all', label: 'Все сегменты' }, ...segments.map(s => ({ value: s, label: s }))]}
            />
          </div>

          {/* Column 2 — pie chart */}
          <div className="flex-1 min-w-0">
            {total === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">Нет клиентов по выбранному фильтру</div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart margin={{ top: -30, right: 0, bottom: -30, left: 0 }}>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    paddingAngle={0}
                    labelLine={false}
                    label={renderSliceLabel}
                  >
                    {chartData.map(d => (
                      <Cell key={d.name} fill={STATUS_COLOR[d.name] ?? '#A0AABB'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, name: string) => [`${v} (${Math.round((v / total) * 100)}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Column 3 — legend */}
          {total > 0 && (
            <div className="w-full lg:w-60 lg:flex-shrink-0 flex flex-col justify-center gap-2.5">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-2.5 text-sm">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[d.name] ?? '#A0AABB' }} />
                  <span className="text-slate-700 flex-1 min-w-0 truncate">{d.name}</span>
                  <span className="text-slate-500 font-medium tabular-nums">{d.value}</span>
                  <span className="text-slate-400 text-xs tabular-nums w-9 text-right">{Math.round((d.value / total) * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductAnalyticsTable marketId={market} product={product} group={group} segment={segment} />
    </Layout>
  );
};

// Упорядочиваем срезы по заданному порядку справочника, отбрасывая пустые.
function orderBy(counts: Map<string, number>, order: string[]): { name: string; value: number }[] {
  const known = order.filter(k => counts.has(k)).map(k => ({ name: k, value: counts.get(k)! }));
  const rest = [...counts.keys()].filter(k => !order.includes(k)).map(k => ({ name: k, value: counts.get(k)! }));
  return [...known, ...rest];
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

const FilterSelect = ({ label, value, onChange, options, disabled }: FilterSelectProps) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
    <select
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md px-2.5 py-2 hover:border-slate-300 focus:outline-none focus:border-moex-red disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </label>
);
