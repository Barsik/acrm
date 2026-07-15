import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/layout/Layout';
import { AlertStatusBadge } from '../components/common';
import { alertsService } from '../services';
import { AlertViewModal, alertTypeLabels, severityLabels } from '../features/alerts/AlertViewModal';
import { clientIdForEntity } from '../data/entityToClient';
import { AlertTriangle, Filter } from 'lucide-react';
import type { Alert } from '../types';

// '2026-06-09' → '09-06-2026'
const formatDate = (date: string) => date.split('-').reverse().join('-');

const severityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
};

export const AlertsPage = () => {
  const navigate = useNavigate();
  const { role } = useApp();
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'period'>('all');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const all = alertsService.getAll();

  // Опорная «сегодняшняя» дата прототипа (как на странице задач)
  const REF_DATE_ISO = '2026-06-09';
  // ISO-строки дат сравниваются лексикографически
  const matchesDate = (date: string) => {
    if (dateFilter === 'all') return true;
    if (dateFilter === 'today') return date === REF_DATE_ISO;
    if (periodFrom && date < periodFrom) return false;
    if (periodTo && date > periodTo) return false;
    return true;
  };

  // Открытие нового алерта автоматически переводит его в работу
  const openAlert = (alert: Alert) => {
    if (alert.status === 'new') alertsService.update(alert.id, { status: 'in_progress' });
    setSelectedAlert(alert);
  };

  const byStatus = filter === 'all' ? all : all.filter(a => a.status === filter);
  const displayed = byStatus
    .filter(a =>
      matchesDate(a.date) &&
      (typeFilter === 'all' || a.type === typeFilter) &&
      (severityFilter === 'all' || a.severity === severityFilter)
    )
    // Закрытые алерты опускаются в конец списка (sort стабильный — остальной порядок сохраняется)
    .sort((a, b) => Number(a.status === 'resolved') - Number(b.status === 'resolved'));

  return (
    <Layout breadcrumbs={[{ label: 'Алерты' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <AlertTriangle size={20} className="text-moex-red" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Алерты</h1>
        </div>
      </div>

      {/* Stats — click a tile to filter */}
      <div className="grid grid-cols-4 max-md:grid-cols-2 gap-4 max-sm:gap-3 mb-6">
        {([
          { key: 'all', label: 'Всего алертов', count: all.length, accent: '#5A6478' },
          { key: 'new', label: 'Новых', count: all.filter(a => a.status === 'new').length, accent: '#4A90D9' },
          { key: 'in_progress', label: 'В работе', count: all.filter(a => a.status === 'in_progress').length, accent: '#12A05C' },
          { key: 'resolved', label: 'Закрытых', count: all.filter(a => a.status === 'resolved').length, accent: '#5A6478' },
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
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-sm font-medium text-slate-700">
          {filter === 'all' ? 'Все алерты' : filter === 'new' ? 'Новые' : filter === 'in_progress' ? 'В работе' : 'Закрытые'}
        </span>
        <span className="text-xs text-slate-400">· {displayed.length}</span>
        <div className="ml-auto flex flex-wrap items-center gap-3 max-md:ml-0">
          {/* Дата — segmented control */}
          <div className="flex items-center gap-1">
            <Filter size={13} className="text-slate-400 mr-0.5" />
            {([
              { key: 'all', label: 'Все' },
              { key: 'today', label: 'Сегодня' },
              { key: 'period', label: 'Период' },
            ] as const).map(o => {
              const active = dateFilter === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setDateFilter(o.key)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
                    active
                      ? 'bg-moex-red/5 border-moex-red text-moex-red'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>
                  {o.label}
                </button>
              );
            })}
            {dateFilter === 'period' && (
              <div className="flex items-center gap-1 ml-1">
                <input
                  type="date"
                  value={periodFrom}
                  onChange={e => setPeriodFrom(e.target.value)}
                  className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
                />
                <span className="text-xs text-slate-400">—</span>
                <input
                  type="date"
                  value={periodTo}
                  onChange={e => setPeriodTo(e.target.value)}
                  className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
                />
              </div>
            )}
          </div>

          {/* Статус */}
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as typeof filter)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
          >
            <option value="all">Статус: все</option>
            <option value="new">Новый</option>
            <option value="in_progress">В работе</option>
            <option value="resolved">Закрыт</option>
          </select>

          {/* Тип */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
          >
            <option value="all">Тип: все</option>
            {Object.entries(alertTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Важность */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 hover:border-slate-300 focus:outline-none focus:border-moex-red"
          >
            <option value="all">Важность: любая</option>
            {Object.entries(severityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Алерт</th><th>Клиент/Холдинг</th><th>Дата</th>
              {role !== 'manager' && <th>Ответственный</th>}<th>Важность</th><th>Тип</th><th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openAlert(a)}>
                <td>
                  <div className="text-sm font-medium text-slate-900">{a.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{a.description}</div>
                </td>
                <td>
                  {a.entityId ? (
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={(e) => { e.stopPropagation(); navigate(`/clients/${clientIdForEntity(a.entityId) ?? a.entityId}`); }}
                    >
                      {a.entityName}
                    </button>
                  ) : (
                    <span className="text-sm text-slate-400">{a.entityName}</span>
                  )}
                </td>
                <td className="text-xs font-medium text-slate-600">{formatDate(a.date)}</td>
                {role !== 'manager' && (
                  <td className="text-xs text-slate-600">{a.responsibleName}</td>
                )}
                <td>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${severityColor[a.severity]}`}>
                    {severityLabels[a.severity]}
                  </span>
                </td>
                <td><span className="badge-gray text-xs">{alertTypeLabels[a.type] ?? a.type}</span></td>
                <td><AlertStatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayed.length === 0 && (
          <div className="text-center py-12 text-slate-400">Нет алертов по выбранному фильтру</div>
        )}
      </div>

      <AlertViewModal
        key={selectedAlert?.id ?? 'none'}
        alert={selectedAlert}
        onCancel={() => setSelectedAlert(null)}
        onComplete={result => {
          if (selectedAlert) {
            alertsService.update(selectedAlert.id, { status: 'resolved', result });
          }
          setSelectedAlert(null);
        }}
      />
    </Layout>
  );
};
