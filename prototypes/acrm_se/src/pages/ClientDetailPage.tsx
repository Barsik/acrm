import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { StatusBadge, TaskStatusBadge, AlertItem, AIInsightCard, SectionHeader } from '../components/common';
import {
  alertsService, personService, tasksService,
  aiInsightsService, productService,
} from '../services';
import { clients as clientRecords } from '../data/mockDatabase';
import { clientIdForEntity } from '../data/entityToClient';
import { CompanyRankingTab } from '../features/ranking/CompanyRankingTab';
import { PortfolioAnalyticsTab } from '../features/portfolioAnalytics/PortfolioAnalyticsTab';
import { formatRevenue, formatVolume } from '../data/mockData';
import { Building, ChevronRight, Brain, Target, Calendar, FileText, AlertTriangle, BarChart3 } from 'lucide-react';

const TABS = ['overview', 'products', 'operations', 'revenue', 'end_clients', 'contacts', 'alerts', 'tasks', 'ratings', 'market_comparison', 'documents'] as const;
type TabId = typeof TABS[number];
const TAB_LABELS: Record<TabId, string> = {
  overview: 'Обзор', products: 'Продукты и сервисы', operations: 'Операции',
  revenue: 'Доходы', end_clients: 'Конечные клиенты', contacts: 'Контакты',
  alerts: 'Алерты', tasks: 'Задачи', ratings: 'Рейтинги', market_comparison: 'Аналитика портфеля', documents: 'Документы',
};

export const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('overview');

  const client = clientRecords.find((item) => item.id === Number(id));
  const persons = personService.getByCompany(String(client?.id ?? ''));
  const alerts = alertsService.getByEntity(String(client?.id ?? ''));
  // Задачи привязаны к холдингам/компаниям mockData (через сопоставление)
  // или напрямую к клиенту (задачи, созданные через форму)
  const tasks = tasksService.getAll().filter(t =>
    t.entityId && (clientIdForEntity(t.entityId) === client?.id || t.entityId === String(client?.id)),
  );
  const insights = aiInsightsService.getByEntity(String(client?.id ?? ''));
  const products = productService.getByCompany(String(client?.id ?? ''));
  const healthScore = client?.id % 3 === 0 ? 72 : 68;
  const primaryStatus = client?.status === 'Активный' ? 'Активен' : 'Неактивен';

  if (!client) {
    return (
      <Layout breadcrumbs={[{ label: 'Клиенты', path: '/clients' }, { label: 'Клиент не найден' }]}>
        <div className="card p-6">
          <div className="text-sm text-slate-500">Клиент не найден</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout breadcrumbs={[{ label: 'Клиенты', path: '/clients' }, { label: client.name }]}> 
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white text-lg font-bold flex items-center justify-center flex-shrink-0">
            {client.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
              <StatusBadge status={client.status === 'Активный' ? 'active' : 'inactive'} />
              <StatusBadge status={client.alertList?.length ? 'declining' : 'on_track'} />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span>ИНН: <strong className="text-slate-700 font-mono">{client.inn}</strong></span>
              <span>ОГРН: <strong className="text-slate-700 font-mono">—</strong></span>
              <span>Менеджер: <strong className="text-slate-700">{client.manager}</strong></span>
              <span>Отрасль: {client.segment ?? '—'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">Клиент</span>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-100">
          {[
            { label: 'Доход YTD', value: formatRevenue(client.turnover ?? 0) },
            { label: 'Оборот YTD', value: formatVolume(client.turnover ?? 0) },
            { label: 'Активных продуктов', value: '3' },
            { label: 'Рынков', value: '3' },
            { label: 'Конечных клиентов', value: '72 000' },
            { label: 'Открытых запросов', value: '7' },
          ].map((k, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-slate-400 mb-0.5">{k.label}</div>
              <div className="text-base font-bold text-slate-900">{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        <button className="btn-primary"><Brain size={14} /> AI-сводка</button>
        <button className="btn-secondary" onClick={() => navigate('/clients')}><Building size={14} /> Открыть холдинг</button>
        <button className="btn-secondary"><Calendar size={14} /> Встреча</button>
        <button className="btn-secondary"><Target size={14} /> Создать задачу</button>
        <button className="btn-secondary"><FileText size={14} /> Brief к встрече</button>
        <button className="btn-secondary" onClick={() => setTab('ratings')}><Target size={14} /> Рейтинги</button>
        <button className="btn-secondary" onClick={() => setTab('market_comparison')}><BarChart3 size={14} /> Сравнение с рынком</button>
      </div>

      <div className="border-b border-slate-200 mb-5 flex overflow-x-auto">
        {TABS.map(t => (
          <button key={t} className={`tab-button ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <SectionHeader title="Продукты и сервисы" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Активные продукты</div>
                  {products.map((p, index) => (
                    <div key={index} className="flex items-center gap-2 py-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{p.productName}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Неактивные / не подключены</div>
                  {['Денежный рынок', 'Товарный рынок'].map((name) => (
                    <div key={name} className="flex items-center gap-2 py-1">
                      <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                      <span className="text-sm text-slate-400">{name}</span>
                      <span className="badge-amber text-xs ml-auto">Потенциал</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {insights.length > 0 ? insights.slice(0, 2).map(ins => (
              <AIInsightCard key={ins.id} title={ins.title} body={ins.body} confidence={ins.confidence} type={ins.type} />
            )) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">AI-сводка</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {client.name} — {client.segment ?? 'Клиент'}. Доход YTD: {formatRevenue(client.turnover ?? 0)}. Health Score: {healthScore}. Конечных клиентов: 72 000. Статус активности: {primaryStatus}.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Алерты</h3>
                <span className="badge-red">{alerts.length}</span>
              </div>
              {alerts.slice(0, 3).map(a => (
                <AlertItem key={a.id} title={a.title} description={a.description.slice(0, 70) + '...'} severity={a.severity} date={a.date} />
              ))}
              {alerts.length === 0 && <div className="text-xs text-slate-400 text-center py-4">Нет алертов</div>}
            </div>

            <div className="card p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Ключевые контакты</h3>
              {persons.slice(0, 3).map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => navigate(`/persons/${p.id}`)}
                >
                  <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900">{p.fullName}</div>
                    <div className="text-xs text-slate-500 truncate">{p.title}</div>
                  </div>
                  <ChevronRight size={12} className="text-slate-300" />
                </div>
              ))}
              {persons.length === 0 && <div className="text-xs text-slate-400 text-center py-3">Нет контактов</div>}
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Задачи</h3>
                <span className="badge-blue">{tasks.length}</span>
              </div>
              {tasks.slice(0, 3).map(t => (
                <div key={t.id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                  <TaskStatusBadge status={t.status} />
                  <span className="text-xs text-slate-700 flex-1 truncate">{t.title}</span>
                  <span className="text-xs text-slate-400">{t.dueDate}</span>
                </div>
              ))}
              {tasks.length === 0 && <div className="text-xs text-slate-400 text-center py-3">Нет задач</div>}
            </div>
          </div>
        </div>
      )}

      {tab === 'contacts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {persons.map(p => (
            <div
              key={p.id}
              className="card p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
              onClick={() => navigate(`/persons/${p.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{p.fullName}</div>
                  <div className="text-xs text-slate-500">{p.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{p.email} · {p.phone}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge-purple text-xs">{p.personRole}</span>
                    <span className="badge-blue text-xs">{p.influenceLevel}</span>
                    <span className="text-xs text-slate-400">VIP: {p.vipScore}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {persons.length === 0 && (
            <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
              <div className="text-slate-400">Нет контактов</div>
            </div>
          )}
        </div>
      )}

      {tab === 'end_clients' && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={14} className="text-amber-500" />
            <p className="text-xs text-amber-800">
              Персональные данные конечных клиентов отображаются только при наличии соответствующих прав доступа.
              Агрегированные данные по сегментам доступны всем авторизованным пользователям.
            </p>
          </div>
          <SectionHeader title="Конечные клиенты" subtitle={`Всего: 72 000 клиентов`} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { seg: 'Квалифицированные инвесторы', count: 25200, assets: '₽ 2.1 трлн' },
              { seg: 'Физические лица (розница)', count: 39600, assets: '₽ 820 млрд' },
              { seg: 'Юридические лица', count: 7200, assets: '₽ 480 млрд' },
            ].map(s => (
              <div key={s.seg} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-sm font-semibold text-slate-900">{s.seg}</div>
                <div className="text-2xl font-bold text-blue-700 mt-2">{s.count.toLocaleString('ru')}</div>
                <div className="text-xs text-slate-500 mt-1">Активы: {s.assets}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'alerts' && (
        <div className="space-y-3">
          {alerts.map(a => (
            <div key={a.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900">{a.title}</h3>
                <StatusBadge status={a.status} />
              </div>
              <p className="text-sm text-slate-600">{a.description}</p>
              <div className="text-xs text-slate-400 mt-2">{a.source} · {a.date}</div>
              <div className="mt-3 p-2.5 bg-blue-50 rounded text-xs text-blue-800">{a.recommendedAction}</div>
              <div className="flex gap-2 mt-3">
                <button className="btn-primary text-xs">Взять в работу</button>
                <button className="btn-secondary text-xs">Передать</button>
              </div>
            </div>
          ))}
          {alerts.length === 0 && <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm text-slate-400">Нет алертов</div>}
        </div>
      )}

      {tab === 'tasks' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="section-title">Задачи</h2>
            <button className="btn-primary text-xs"><Target size={14} /> Создать</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr><th>Задача</th><th>Тип</th><th>Приоритет</th><th>Исполнитель</th><th>Срок</th><th>Статус</th></tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="font-medium text-slate-900">{t.title}</td>
                    <td><span className="badge-gray text-xs">{t.type}</span></td>
                    <td><span className={`text-xs font-medium px-1.5 py-0.5 rounded ${t.priority === 'critical' ? 'bg-red-100 text-red-700' : t.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{t.priority}</span></td>
                    <td className="text-xs text-slate-500">{t.assigneeName}</td>
                    <td className="text-xs text-slate-500">{t.dueDate}</td>
                    <td><TaskStatusBadge status={t.status} /></td>
                  </tr>
                ))}
                {tasks.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">Нет задач</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'ratings' && <CompanyRankingTab companyName={client.name} />}

      {tab === 'market_comparison' && <PortfolioAnalyticsTab companyName={client.name} />}

      {(tab === 'products' || tab === 'operations' || tab === 'revenue' || tab === 'documents') && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="text-slate-400 text-sm">Раздел «{TAB_LABELS[tab]}» — нажмите на вкладку «Обзор» для возврата к полному профилю</div>
          <p className="text-xs text-slate-300 mt-2">В полной версии здесь будут детализированные данные из ЕХД, биллинга и торговой системы</p>
        </div>
      )}
    </Layout>
  );
};
