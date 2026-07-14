import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/layout/Layout';
import { StatusBadge } from '../components/common';
import { tasksService } from '../services';
import { CheckSquare, Plus, Filter } from 'lucide-react';

// '2026-06-09' → '09-06-2026'
const formatDueDate = (date: string) => date.split('-').reverse().join('-');

export const TasksPage = () => {
  const navigate = useNavigate();
  const { role } = useApp();
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'overdue'>('all');
  const [dueFilter, setDueFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const all = tasksService.getAll();

  // Reference "today" — anchored to the page's presented date so Срок buckets contain tasks.
  const REF_DATE = new Date('2026-06-09T00:00:00');
  const dueWithin = (dueDate: string, bucket: 'today' | 'week' | 'month') => {
    const due = new Date(dueDate + 'T00:00:00');
    const end = new Date(REF_DATE);
    if (bucket === 'week') end.setDate(end.getDate() + 7);
    if (bucket === 'month') end.setDate(end.getDate() + 30);
    return due <= end; // cumulative: due on or before the end of the period (includes overdue)
  };

  const byStatus = filter === 'all' ? all
    : filter === 'overdue' ? tasksService.getOverdue()
    : all.filter(t => t.status === filter);
  const displayed = byStatus.filter(t =>
    (dueFilter === 'all' || dueWithin(t.dueDate, dueFilter)) &&
    (typeFilter === 'all' || t.type === typeFilter) &&
    (priorityFilter === 'all' || t.priority === priorityFilter)
  );

  const typeLabels: Record<string, string> = {
    call: 'Звонок', meeting: 'Встреча', document: 'Документ',
    escalation: 'Эскалация', cross_sell: 'Cross-sell', other: 'Прочее',
  };

  const priorityLabels: Record<string, string> = {
    critical: 'Критично', high: 'Высокий', medium: 'Средний', low: 'Низкий',
  };

  const priorityColor: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-amber-100 text-amber-700',
    medium: 'bg-blue-100 text-blue-700',
    low: 'bg-slate-100 text-slate-600',
  };

  // "Инициатива" — программа, в рамках которой ведётся задача
  const initiativeById: Record<string, string> = {
    t1: 'Удержание ключевых клиентов',
    t2: 'Операционная непрерывность',
    t3: 'Реактивация клиентов',
    t4: 'Пролонгация и тарификация',
    t5: 'Развитие кросс-продаж',
  };
  const initiativeByType: Record<string, string> = {
    meeting: 'Удержание ключевых клиентов',
    document: 'Операционная непрерывность',
    call: 'Реактивация клиентов',
    cross_sell: 'Развитие кросс-продаж',
    escalation: 'Управление рисками',
    other: 'Прочие инициативы',
  };
  const initiativeOf = (id: string, type: string) =>
    initiativeById[id] ?? initiativeByType[type] ?? 'Прочие инициативы';
  
  return (
    <Layout breadcrumbs={[{ label: 'Задачи' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <CheckSquare size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Задачи</h1>
        </div>
        <div className="ml-auto">
          <button className="btn-primary text-sm"><Plus size={15} /> Создать задачу</button>
        </div>
      </div>

      {/* Stats — click a tile to filter */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {([
          { key: 'all', label: 'Всего задач', count: all.length, accent: '#5A6478' },
          { key: 'open', label: 'Открытых', count: all.filter(t => t.status === 'open').length, accent: '#4A90D9' },
          { key: 'in_progress', label: 'В работе', count: all.filter(t => t.status === 'in_progress').length, accent: '#F5A623' },
          { key: 'overdue', label: 'Просрочено', count: tasksService.getOverdue().length, accent: '#E8001C' },
        ] as const).map(s => {
          const active = filter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className="card"
              style={{
                textAlign: 'left', cursor: 'pointer', padding: '16px 18px',
                borderColor: active ? s.accent : '#E8EBF0',
                background: active ? `${s.accent}0A` : '#fff',
                boxShadow: active ? `0 4px 16px ${s.accent}1F` : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = '#C0C8D4'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = '#E8EBF0'; }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AABB', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.count}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-sm font-medium text-slate-700">
          {filter === 'all' ? 'Все задачи' : filter === 'open' ? 'Открытые' : filter === 'in_progress' ? 'В работе' : 'Просроченные'}
        </span>
        <span className="text-xs text-slate-400">· {displayed.length}</span>
        <div className="ml-auto flex items-center gap-3">
          {/* Срок — segmented control */}
          <div className="flex items-center gap-1">
            <Filter size={13} className="text-slate-400 mr-0.5" />
            {([
              { key: 'all', label: 'Все' },
              { key: 'today', label: 'Сегодня' },
              { key: 'week', label: 'Следующая неделя' },
              { key: 'month', label: 'Следующий месяц' },
            ] as const).map(o => {
              const active = dueFilter === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setDueFilter(o.key)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
                    active
                      ? 'bg-moex-red/5 border-moex-red text-moex-red'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>
                  {o.label}
                </button>
              );
            })}
          </div>

          {/* Тип */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
          >
            <option value="all">Тип: все</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Приоритет */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
          >
            <option value="all">Приоритет: любой</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Задача</th><th>Клиент/Холдинг</th><th>Срок</th>
              {role !== 'manager' && <th>Ответственный</th>}<th>Приоритет</th><th>Тип</th><th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 cursor-pointer">
                <td>
                  <div className="text-sm font-medium text-slate-900">{t.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{t.description}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                      Инициатива
                    </span>
                    <span className="text-xs font-medium text-slate-600">{initiativeOf(t.id, t.type)}</span>
                  </div>
                </td>
                <td>
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    onClick={(e) => { e.stopPropagation(); navigate(`/holdings/${t.entityId}`); }}
                  >
                    {t.entityName}
                  </button>
                </td>
                <td className={`text-xs font-medium ${new Date(t.dueDate) < new Date() && t.status !== 'done' ? 'text-red-600' : 'text-slate-600'}`}>
                  {formatDueDate(t.dueDate)}
                </td>
                {role !== 'manager' && (
                  <td className="text-xs text-slate-600">{t.assigneeName}</td>
                )}
                <td>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${priorityColor[t.priority]}`}>
                    {priorityLabels[t.priority]}
                  </span>
                </td>
                <td><span className="badge-gray text-xs">{typeLabels[t.type]}</span></td>
                <td><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayed.length === 0 && (
          <div className="text-center py-12 text-slate-400">Нет задач по выбранному фильтру</div>
        )}
      </div>
    </Layout>
  );
};
