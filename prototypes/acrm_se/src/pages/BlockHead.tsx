import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { Layout } from '../components/layout/Layout';
import { KPICard, ScoreBadge, AIInsightCard, SectionHeader, StatusBadge, ProgressBar, TrendArrow, PageTitle } from '../components/common';
import { portfolioService, alertsService, tasksService, revenueService, aiInsightsService, holdingService, opportunitiesService } from '../services';
import { formatRevenue, formatVolume } from '../data/mockData';
import { Briefcase, AlertTriangle, Target, TrendingUp, ChevronRight, Users, CheckSquare } from 'lucide-react';

export const BlockHeadPage = () => {
  const navigate = useNavigate();
  const portfolios = portfolioService.getAll();
  const alerts = alertsService.getCritical();
  const tasks = tasksService.getAll().slice(0, 5);
  const revenue = revenueService.getMonthly();
  const insights = aiInsightsService.getAll();
  const holdings = holdingService.getAll();
  const opportunities = opportunitiesService.getTopOpportunities(4);

  const totalRevenue = portfolios.reduce((s, p) => s + p.revenueYTD, 0);
  const totalPrev = portfolios.reduce((s, p) => s + p.revenuePrev, 0);
  const avgPlan = Math.round(portfolios.reduce((s, p) => s + p.planFulfillment, 0) / portfolios.length);

  return (
    <Layout breadcrumbs={[{ label: 'Руководитель блока' }]}>
      <PageTitle
        icon={<Briefcase size={22} />}
        accent="#E8001C"
        title="Портфель блока"
        subtitle="Клиентский блок · 09.06.2026"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPICard label="Доход блока YTD" value={formatRevenue(totalRevenue)} change={{ current: totalRevenue, prev: totalPrev }} icon={<TrendingUp size={16} />} accent="blue" />
        <KPICard label="Выполнение плана" value={`${avgPlan}%`} sub="Среднее по командам" icon={<Target size={16} />} accent="violet" />
        <KPICard label="Клиенты в риске" value={String(portfolios.reduce((s, p) => s + p.clientsAtRisk, 0))} icon={<AlertTriangle size={16} />} accent="red" onClick={() => navigate('/alerts')} />
        <KPICard label="Возможности роста" value={String(portfolios.reduce((s, p) => s + p.clientsWithOpportunity, 0))} icon={<Target size={16} />} accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Team portfolios */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <SectionHeader title="Портфели команд" subtitle="KPI менеджеров" actions={
                <button className="btn-secondary text-xs" onClick={() => navigate('/holdings')}>
                  <Users size={14} /> Менеджеры
                </button>
              } />
            </div>
            <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Менеджер</th><th>Холдингов</th><th>Доход YTD</th><th>Тренд</th>
                  <th>План %</th><th>В риске</th><th>Открытых задач</th>
                </tr>
              </thead>
              <tbody>
                {portfolios.map(p => (
                  <tr key={p.managerId}>
                    <td className="font-semibold text-slate-900">{p.managerName}</td>
                    <td>{p.holdingsCount}</td>
                    <td>{formatRevenue(p.revenueYTD)}</td>
                    <td><TrendArrow current={p.revenueYTD} prev={p.revenuePrev} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={p.planFulfillment} color={p.planFulfillment >= 80 ? 'green' : p.planFulfillment >= 60 ? 'amber' : 'red'} />
                        <span className="text-xs font-semibold w-9 text-right">{p.planFulfillment}%</span>
                      </div>
                    </td>
                    <td>
                      {p.clientsAtRisk > 0 ? (
                        <span className="badge-red">{p.clientsAtRisk}</span>
                      ) : (
                        <span className="badge-green">0</span>
                      )}
                    </td>
                    <td><span className="badge-blue">{p.openTasks}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Revenue trend */}
          <div className="card p-5">
            <SectionHeader title="Динамика доходов блока" subtitle="YTD vs прошлый год" />
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v / 1e9).toFixed(1)}млрд`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => formatRevenue(Number(v))} />
                <Line dataKey="revenue" stroke="#2196F3" strokeWidth={2} name="2026" dot={false} />
                <Line dataKey="prevRevenue" stroke="#CBD5E1" strokeWidth={2} name="2025" dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Holdings at risk */}
          <div className="card p-5">
            <SectionHeader title="Холдинги в риске" subtitle="Требуют вмешательства руководителя блока"
              actions={<button className="text-xs text-red-600 hover:text-red-800" onClick={() => navigate('/alerts')}>Все риски →</button>}
            />
            <div className="space-y-3">
              {holdings.filter(h => h.riskScore > 30 || h.activityStatus === 'declining').map(h => (
                <div key={h.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/holdings/${h.id}`)}>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">{h.shortName[0]}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">{h.name}</div>
                    <div className="text-xs text-slate-500">{h.managerName}</div>
                  </div>
                  <StatusBadge status={h.activityStatus} />
                  <ScoreBadge score={h.riskScore} type="risk" size="sm" />
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* AI Summary */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">AI-сводка по блоку</h3>
            <AIInsightCard title={insights[0].title} body={insights[0].body} confidence={insights[0].confidence} type={insights[0].type} />
          </div>

          {/* Opportunities */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Возможности роста</h3>
            {opportunities.map(o => (
              <div key={o.id} className="p-2.5 rounded-lg bg-green-50 border border-green-100 mb-2">
                <div className="text-xs font-semibold text-slate-900">{o.entityName}</div>
                <div className="text-xs text-slate-600">{o.product}</div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-green-700 font-semibold">+{formatRevenue(o.potentialRevenue)}</span>
                  <span className="text-xs text-slate-400">{o.probability}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tasks */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Задачи команд</h3>
              <button className="text-xs text-blue-600" onClick={() => navigate('/tasks')}>Все →</button>
            </div>
            {tasks.map(t => (
              <div key={t.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 border-b border-slate-50 last:border-0">
                <StatusBadge status={t.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">{t.title}</div>
                  <div className="text-xs text-slate-400">{t.assigneeName} · {t.dueDate}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Block Actions */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Действия</h3>
            <div className="space-y-2">
              {[
                { label: 'Посмотреть отклонения KPI', path: '/strategy', icon: <TrendingUp size={14} /> },
                { label: 'Назначить контрольную задачу', path: '/tasks', icon: <CheckSquare size={14} /> },
                { label: 'Сформировать отчёт по блоку', path: '/revenue', icon: <Target size={14} /> },
              ].map(a => (
                <button key={a.path} className="btn-secondary w-full justify-start text-xs" onClick={() => navigate(a.path)}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
