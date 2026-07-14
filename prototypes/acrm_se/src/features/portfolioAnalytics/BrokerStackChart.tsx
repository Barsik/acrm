import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList,
} from 'recharts';
import { fmt } from '../ranking/rankingData';
import { yAxisLabel } from './chartUtils';

export interface BrokerStackRow {
  month: string;
  own: number;
  t: number;
  sber: number;
  vtb: number;
  other: number;
  total: number;
}

interface BrokerStackChartProps {
  data: BrokerStackRow[];
  ownName: string;
  axisLabel: string;
  /** суффикс значения в подписях/тултипе, например ' тыс.' или '%' */
  valueSuffix: string;
  isShare: boolean;
  stackId: string;
  height?: number;
}

/** Стек «мы + ближайшие конкуренты + остальной рынок» по месяцам. */
export const BrokerStackChart = ({ data, ownName, axisLabel, valueSuffix, isShare, stackId, height = 330 }: BrokerStackChartProps) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 28, right: 8, left: 0, bottom: 0 }}>
      <CartesianGrid vertical={false} stroke="#E2E8F0" />
      <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
      <YAxis
        width={82}
        label={yAxisLabel(axisLabel)}
        tick={{ fontSize: 10 }}
        axisLine={false}
        tickLine={false}
        ticks={isShare ? [0, 25, 50, 75, 100] : undefined}
        domain={isShare ? [0, 106] : [0, (max: number) => Math.ceil(max * 1.08)]}
        tickFormatter={(value) => fmt.format(Number(value))}
      />
      <Tooltip formatter={(value) => [`${fmt.format(Number(value ?? 0))}${valueSuffix}`]} />
      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
      <Bar dataKey="own" stackId={stackId} name={ownName} fill="#E8001C">
        <LabelList dataKey="own" position="center" fill="#fff" fontSize={9} formatter={(v: number) => fmt.format(Number(v))} />
      </Bar>
      <Bar dataKey="t" stackId={stackId} name="Т-Инвестиции" fill="#2563EB">
        <LabelList dataKey="t" position="center" fill="#fff" fontSize={9} formatter={(v: number) => fmt.format(Number(v))} />
      </Bar>
      <Bar dataKey="sber" stackId={stackId} name="СберИнвестиции" fill="#7C3AED">
        <LabelList dataKey="sber" position="center" fill="#fff" fontSize={9} formatter={(v: number) => fmt.format(Number(v))} />
      </Bar>
      <Bar dataKey="vtb" stackId={stackId} name="ВТБ Мои Инвестиции" fill="#0891B2">
        <LabelList dataKey="vtb" position="center" fill="#fff" fontSize={9} formatter={(v: number) => fmt.format(Number(v))} />
      </Bar>
      <Bar dataKey="other" stackId={stackId} name="Остальной рынок" fill="#CBD5E1" radius={[4, 4, 0, 0]}>
        <LabelList dataKey="other" position="center" fill="#475569" fontSize={9} formatter={(v: number) => fmt.format(Number(v))} />
        <LabelList dataKey="total" position="top" fill="#334155" fontSize={10} fontWeight={700} formatter={(v: number) => `${fmt.format(Number(v))}${valueSuffix}`} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);
