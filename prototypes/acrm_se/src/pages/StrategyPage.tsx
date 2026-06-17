import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Layout } from '../components/layout/Layout';
import { SectionHeader, StatusBadge, ProgressBar } from '../components/common';
import { strategyService } from '../services';
import { formatRevenue, formatVolume } from '../data/mockData';
import { TrendingUp } from 'lucide-react';

export const StrategyPage = () => {
  const navigate = useNavigate();
  const strategy = strategyService.getAll();

  const chartData = strategy.map(s => ({
    name: s.entityName.replace('Группа ', ''),
    market: s.marketLabel,
    actual: s.revenueActual,
    target: s.revenueTarget,
  }));

  return (
    <Layout breadcrumbs={[{ label: 'Стратегия' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <TrendingUp size={20} className="text-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Стратегия работы с клиентами</h1>
          <p className="text-sm text-slate-500">Цели по рынкам · Факт vs план · 09.06.2026</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-5 mb-6">
        <SectionHeader title="Доход факт vs цель по инициативам" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `${(v / 1e9).toFixed(1)}млрд`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any) => formatRevenue(Number(v))} />
            <Bar dataKey="actual" fill="#2196F3" name="Факт" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" fill="#CBD5E1" name="Цель" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Strategy table */}
      <div className="card overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Клиент</th><th>Рынок</th><th>Оборот факт</th><th>Оборот цель</th>
              <th>Доход факт</th><th>Доход цель</th><th>Gap</th>
              <th>Инициатива</th><th>Владелец</th><th>Статус</th><th>%</th>
            </tr>
          </thead>
          <tbody>
            {strategy.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/holdings/${s.entityId}`)}>
                <td className="font-semibold text-slate-900">{s.entityName}</td>
                <td className="text-slate-600">{s.marketLabel}</td>
                <td>{formatVolume(s.currentVolume)}</td>
                <td className="text-slate-400">{formatVolume(s.targetVolume)}</td>
                <td className="font-semibold">{formatRevenue(s.revenueActual)}</td>
                <td className="text-slate-400">{formatRevenue(s.revenueTarget)}</td>
                <td className={`font-semibold ${s.gap < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {s.gap > 0 ? '+' : ''}{formatRevenue(s.gap)}
                </td>
                <td className="text-xs text-slate-600 max-w-[150px]">{s.initiative}</td>
                <td className="text-xs text-slate-500">{s.owner}</td>
                <td><StatusBadge status={s.status} /></td>
                <td className="min-w-[90px]">
                  <div className="flex items-center gap-1.5">
                    <ProgressBar value={s.progress} color={s.status === 'on_track' ? 'green' : s.status === 'at_risk' ? 'amber' : 'red'} />
                    <span className="text-xs font-semibold text-slate-600 w-8 text-right">{s.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};
