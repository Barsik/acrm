import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ScoreBadge, StatusBadge, AlertItem, AIInsightCard, SectionHeader, TrendArrow } from '../components/common';
import {
  alertsService, personService, tasksService,
  aiInsightsService, productService, strategyService, newsService,
} from '../services';
import { clients as clientRecords } from '../data/mockDatabase';
import { formatRevenue, formatVolume } from '../data/mockData';
import { Building, ChevronRight, Brain, Target, Calendar, FileText, Users, AlertTriangle, BarChart3 } from 'lucide-react';

const TABS = ['overview', 'products', 'operations', 'revenue', 'end_clients', 'contacts', 'alerts', 'tasks', 'ratings', 'market_comparison', 'documents'] as const;
type TabId = typeof TABS[number];
const TAB_LABELS: Record<TabId, string> = {
  overview: 'Обзор', products: 'Продукты и сервисы', operations: 'Операции',
  revenue: 'Доходы', end_clients: 'Конечные клиенты', contacts: 'Контакты',
  alerts: 'Алерты', tasks: 'Задачи', ratings: 'Рейтинги', market_comparison: 'Сравнение с рынком', documents: 'Документы',
};

const RATING_PRODUCTS = [
  { value: 'allMarkets', label: 'Все рынки' },
  { value: 'equity', label: 'Акции' },
  { value: 'bonds', label: 'Облигации' },
  { value: 'derivatives', label: 'Срочный рынок' },
  { value: 'fx', label: 'Валюта' },
  { value: 'moneyMarket', label: 'Денежный рынок' },
  { value: 'funds', label: 'Фонды' },
];
const RATING_CLIENT_TYPES = [
  { value: 'fl', label: 'ФЛ' },
  { value: 'ul', label: 'ЮЛ' },
  { value: 'all', label: 'ФЛ + ЮЛ' },
];
const RATING_PRODUCT_DETAILS = [
  { value: 'allProducts', label: 'Все продукты' },
  { value: 'ruStocks', label: 'РФ акции' },
  { value: 'foreignStocks', label: 'Иностр. акции' },
  { value: 'depositaryReceipts', label: 'ДР' },
  { value: 'ofz', label: 'ОФЗ' },
  { value: 'corporateBonds', label: 'Корп. облигации' },
  { value: 'municipalBonds', label: 'Муниц. облигации' },
  { value: 'eurobonds', label: 'Еврообл.' },
  { value: 'floaters', label: 'Флоатеры' },
  { value: 'bpif', label: 'БПИФ' },
  { value: 'etf', label: 'ETF' },
  { value: 'closedFunds', label: 'ЗПИФ' },
  { value: 'fxSpot', label: 'Валюта spot' },
];
const RATING_VALUE_MODES = [
  { value: 'absolute', label: 'Абсолюты' },
  { value: 'share', label: 'Доля рынка' },
];
const BENCHMARK_METRICS = [
  { value: 'turnover', label: 'Обороты' },
  { value: 'auc', label: 'AuC' },
  { value: 'clients', label: 'Клиенты' },
];
const RATING_TREND_METRICS = [
  { value: 'clients', label: 'Клиенты' },
  { value: 'turnover', label: 'Оборот' },
  { value: 'auc', label: 'AuC' },
];
const RATING_TREND_PERIODS = [
  { value: 'current', label: 'Текущий год' },
  { value: 'previous', label: 'Предыдущий год' },
  { value: 'last12', label: 'Последние 12 месяцев' },
];

const RATING_TABLE = [
  { name: 'Тинькофф', note: 'Мы', clients: '178k', turnover: '213 млрд', auc: '6,4 трлн' },
  { name: 'Сбербанк', note: 'TOP', clients: '198k', turnover: '256 млрд', auc: '7,2 трлн' },
  { name: 'Газпромбанк', note: 'Peer', clients: '90k', turnover: '132 млрд', auc: '3,1 трлн' },
  { name: 'ВТБ', note: 'Peer', clients: '106k', turnover: '148 млрд', auc: '4,0 трлн' },
];

const BENCHMARK_ROWS = [
  { name: 'Акции', own: '84,2', market: '113,4', rank: 4 },
  { name: 'Облигации', own: '112,6', market: '98,7', rank: 7 },
  { name: 'AuC', own: '5,8', market: '4,2', rank: 5 },
];

export const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('overview');
  const [ratingProduct, setRatingProduct] = useState(RATING_PRODUCTS[0].value);
  const [ratingClientType, setRatingClientType] = useState(RATING_CLIENT_TYPES[0].value);
  const [ratingProductDetail, setRatingProductDetail] = useState(RATING_PRODUCT_DETAILS[0].value);
  const [ratingValueMode, setRatingValueMode] = useState(RATING_VALUE_MODES[0].value);
  const [benchmarkMetric, setBenchmarkMetric] = useState(BENCHMARK_METRICS[0].value);
  const [ratingTrendMetric, setRatingTrendMetric] = useState(RATING_TREND_METRICS[0].value);
  const [ratingTrendPeriod, setRatingTrendPeriod] = useState(RATING_TREND_PERIODS[0].value);

  const client = clientRecords.find((item) => item.id === Number(id));
  const persons = personService.getByCompany(String(client?.id ?? ''));
  const alerts = alertsService.getByEntity(String(client?.id ?? ''));
  const tasks = tasksService.getByEntity(String(client?.id ?? ''));
  const insights = aiInsightsService.getByEntity(String(client?.holdingId ?? ''));
  const products = productService.getByCompany(String(client?.id ?? ''));
  const strategy = strategyService.getByEntity(String(client?.holdingId ?? ''));
  const news = newsService.getByEntity(String(client?.holdingId ?? ''));
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
                  <StatusBadge status={t.status} />
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
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
                {tasks.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">Нет задач</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'ratings' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Параметры рейтинга</h2>
                <p className="text-sm text-slate-500">Сначала выбирается клиентский тип и рынок/продукт. Дальше таблица показывает первые 4 брокера, разрыв и ближайших конкурентов.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">12 участников сравнения</div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Тип клиента</h3>
                  <div className="flex flex-wrap gap-2">
                    {RATING_CLIENT_TYPES.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setRatingClientType(item.value)}
                        className={`metric-control ${ratingClientType === item.value ? 'active' : ''} rounded-full border px-3 py-2 text-sm ${ratingClientType === item.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border-slate-200'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Рынок / продукт</h3>
                  <div className="flex flex-wrap gap-2">
                    {RATING_PRODUCTS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setRatingProduct(item.value)}
                        className={`metric-control ${ratingProduct === item.value ? 'active' : ''} rounded-full border px-3 py-2 text-sm ${ratingProduct === item.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border-slate-200'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Детализация продукта</h3>
                <div className="flex flex-wrap gap-2">
                  {RATING_PRODUCT_DETAILS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRatingProductDetail(item.value)}
                      className={`detail-pill ${ratingProductDetail === item.value ? 'active' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Таблица рейтинга брокеров</h2>
                <p className="text-sm text-slate-500">Без ручной сортировки видны первые 4 брокера, разрыв и ближайшие конкуренты.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {RATING_VALUE_MODES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRatingValueMode(item.value)}
                    className={`metric-control ${ratingValueMode === item.value ? 'active' : ''} rounded-full border px-3 py-2 text-sm ${ratingValueMode === item.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-[0.18em] border-b border-slate-200">
                    <th className="py-3">Брокер</th>
                    <th className="py-3">Кол-во клиентов</th>
                    <th className="py-3">Оборот</th>
                    <th className="py-3">AuC</th>
                  </tr>
                </thead>
                <tbody>
                  {RATING_TABLE.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50">
                      <td className="py-3 align-top">
                        <div className="font-semibold text-slate-900">{row.name}</div>
                        <small className="text-xs text-slate-500">{row.note}</small>
                      </td>
                      <td className="py-3 text-slate-700">{row.clients}</td>
                      <td className="py-3 text-slate-700">{row.turnover}</td>
                      <td className="py-3 text-slate-700">{row.auc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Сравнение с рынком и группой</h2>
                <p className="text-sm text-slate-500">Основные показатели по рынкам: значение клиента, рынок и место.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {BENCHMARK_METRICS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setBenchmarkMetric(item.value)}
                    className={`metric-control ${benchmarkMetric === item.value ? 'active' : ''} rounded-full border px-3 py-2 text-sm ${benchmarkMetric === item.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-[0.18em] border-b border-slate-200">
                    <th className="py-3">Класс актива</th>
                    <th className="py-3">Мы</th>
                    <th className="py-3">Рынок</th>
                    <th className="py-3">Место</th>
                  </tr>
                </thead>
                <tbody>
                  {BENCHMARK_ROWS.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-900">{row.name}</td>
                      <td className="py-3 text-slate-700">{row.own}</td>
                      <td className="py-3 text-slate-700">{row.market}</td>
                      <td className="py-3 text-slate-700">{row.rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Динамика рейтинга</h2>
                <p className="text-sm text-slate-500">Место клиента, абсолютное значение и доля рынка по выбранному показателю.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {RATING_TREND_METRICS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRatingTrendMetric(item.value)}
                    className={`metric-control ${ratingTrendMetric === item.value ? 'active' : ''} rounded-full border px-3 py-2 text-sm ${ratingTrendMetric === item.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    {item.label}
                  </button>
                ))}
                {RATING_TREND_PERIODS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRatingTrendPeriod(item.value)}
                    className={`metric-control ${ratingTrendPeriod === item.value ? 'active' : ''} rounded-full border px-3 py-2 text-sm ${ratingTrendPeriod === item.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">{ratingTrendMetric === 'clients' ? 'Клиенты' : ratingTrendMetric === 'turnover' ? 'Оборот' : 'AuC'} · {ratingTrendPeriod === 'current' ? 'Текущий год' : ratingTrendPeriod === 'previous' ? 'Предыдущий год' : 'Последние 12 месяцев'}</div>
                <div className="text-base font-semibold text-slate-900">Фильтр: {RATING_PRODUCTS.find((item) => item.value === ratingProduct)?.label} · {ratingClientType.toUpperCase()}</div>
                <div className="text-sm text-slate-500">Место, абсолют, доля рынка.</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-2">Место в рейтинге</div>
                  <div className="text-2xl font-semibold text-slate-900">3</div>
                  <div className="text-xs text-slate-500 mt-1">лучше на 2 места за период</div>
                </div>
                <div className="rounded-2xl bg-white p-4 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-2">Абсолютное значение</div>
                  <div className="text-2xl font-semibold text-slate-900">₽ 213 млрд</div>
                  <div className="text-xs text-slate-500 mt-1">+12,8 млрд за период</div>
                </div>
                <div className="rounded-2xl bg-white p-4 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-2">Доля рынка</div>
                  <div className="text-2xl font-semibold text-slate-900">14,8%</div>
                  <div className="text-xs text-slate-500 mt-1">+1,3 п.п. за период</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'market_comparison' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Сравнение с рынком и группой</h2>
                <p className="text-sm text-slate-500 max-w-2xl">Основные показатели по рынкам: значение клиента, рынок и место. Переключите метрику, чтобы сразу увидеть, где клиент опережает рынок, а где отстает.</p>
              </div>
              <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">Метрика: {BENCHMARK_METRICS.find((item) => item.value === benchmarkMetric)?.label}</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {BENCHMARK_METRICS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setBenchmarkMetric(item.value)}
                  className={`metric-control ${benchmarkMetric === item.value ? 'active' : ''} rounded-full border px-3 py-2 text-sm ${benchmarkMetric === item.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border-slate-200'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-[0.18em] border-b border-slate-200">
                    <th className="py-3">Класс актива</th>
                    <th className="py-3">Мы</th>
                    <th className="py-3">Рынок</th>
                    <th className="py-3">Место</th>
                  </tr>
                </thead>
                <tbody>
                  {BENCHMARK_ROWS.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-900">{row.name}</td>
                      <td className="py-3 text-slate-700">{row.own}</td>
                      <td className="py-3 text-slate-700">{row.market}</td>
                      <td className="py-3 text-slate-700">{row.rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {[{
                label: 'Клиент',
                title: client.name,
                detail: `${client.segment ?? 'Корпоративный'} · ${client.status}`,
              }, {
                label: 'Пир',
                title: 'Peer группа',
                detail: 'Сравнение ближайших конкурентов по тем же рынкам',
              }, {
                label: 'Рынок',
                title: 'Рынок выбранных клиентов',
                detail: 'Все брокеры, тот же период и продуктовый контур',
              }].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3">{item.label}</div>
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="text-sm text-slate-500 mt-2">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(tab === 'products' || tab === 'operations' || tab === 'revenue' || tab === 'documents') && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="text-slate-400 text-sm">Раздел «{TAB_LABELS[tab]}» — нажмите на вкладку «Обзор» для возврата к полному профилю</div>
          <p className="text-xs text-slate-300 mt-2">В полной версии здесь будут детализированные данные из ЕХД, биллинга и торговой системы</p>
        </div>
      )}
    </Layout>
  );
};
