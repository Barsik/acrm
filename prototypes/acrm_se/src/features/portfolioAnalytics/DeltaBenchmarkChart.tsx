import { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList,
} from 'recharts';
import { fmt } from '../ranking/rankingData';
import { yAxisLabel } from './chartUtils';

interface DeltaBenchmarkChartProps {
  months: string[];
  series: Record<'own' | 't' | 'sber' | 'vtb' | 'other', number[]>;
  unit: string;
  ownName: string;
}

/** «Изменение к предыдущему месяцу» — отдельный бенчмарк динамики. */
export const DeltaBenchmarkChart = ({ months, series, unit, ownName }: DeltaBenchmarkChartProps) => {
  const [mode, setMode] = useState<'absolute' | 'percent'>('percent');

  const data = months.map((month, i) => {
    if (i === 0) {
      return { month, own: null, t: null, sber: null, vtb: null, market: null };
    }
    const delta = (cur: number, prev: number) => (mode === 'percent' ? (cur / prev - 1) * 100 : cur - prev);
    const total = (idx: number) => series.own[idx] + series.t[idx] + series.sber[idx] + series.vtb[idx] + series.other[idx];
    return {
      month,
      own: delta(series.own[i], series.own[i - 1]),
      t: delta(series.t[i], series.t[i - 1]),
      sber: delta(series.sber[i], series.sber[i - 1]),
      vtb: delta(series.vtb[i], series.vtb[i - 1]),
      market: delta(total(i), total(i - 1)),
    };
  });

  const suffix = mode === 'percent' ? '%' : ` ${unit}`;

  const barLabel = (
    <LabelList position="top" fill="#475569" fontSize={8} formatter={(v: number) => fmt.format(Number(v))} />
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Изменение к предыдущему месяцу</h4>
          <p className="text-[10px] text-slate-500">Отдельный бенчмарк динамики · первый месяц периода без дельты</p>
        </div>
        <div className="flex self-start rounded-lg bg-slate-200/70 p-1">
          <button
            className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${mode === 'absolute' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setMode('absolute')}
          >
            Δ, {unit}
          </button>
          <button
            className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${mode === 'percent' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setMode('percent')}
          >
            Δ, %
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            width={76}
            label={yAxisLabel(mode === 'percent' ? '%' : unit)}
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => fmt.format(Number(value))}
          />
          <Tooltip formatter={(value) => [`${fmt.format(Number(value ?? 0))}${suffix}`]} />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
          <Bar dataKey="own" name={ownName} fill="#E8001C">{barLabel}</Bar>
          <Bar dataKey="t" name="Т-Инвестиции" fill="#2563EB">{barLabel}</Bar>
          <Bar dataKey="sber" name="СберИнвестиции" fill="#7C3AED">{barLabel}</Bar>
          <Bar dataKey="vtb" name="ВТБ Мои Инвестиции" fill="#0891B2">{barLabel}</Bar>
          <Bar dataKey="market" name="Рынок в целом" fill="#64748B">
            <LabelList position="top" fill="#334155" fontSize={8} fontWeight={700} formatter={(v: number) => fmt.format(Number(v))} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};
