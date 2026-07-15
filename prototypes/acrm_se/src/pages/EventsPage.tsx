import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { SectionHeader } from '../components/common';
import { eventIntelligenceService } from '../services';
import { clientPathFor } from '../data/entityToClient';
import { Calendar, Star, UserPlus, Download, ChevronRight, Filter } from 'lucide-react';

const influenceLabels: Record<string, string> = {
  very_high: 'Очень высокое', high: 'Высокое', medium: 'Среднее', low: 'Низкое',
};
const influenceColors: Record<string, string> = {
  very_high: 'badge-purple', high: 'badge-blue', medium: 'badge-amber', low: 'badge-gray',
};
const statusColors: Record<string, string> = {
  recommended: 'badge-amber', invited: 'badge-blue', confirmed: 'badge-green',
  declined: 'badge-red', attended: 'badge-green',
};
const statusLabels: Record<string, string> = {
  recommended: 'Рекомендован', invited: 'Приглашён', confirmed: 'Подтверждён',
  declined: 'Отказал', attended: 'Участвовал',
};

export const EventsPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [segment, setSegment] = useState('all');
  const [minVip, setMinVip] = useState(0);
  const participants = eventIntelligenceService.getParticipants();

  const filtered = participants.filter(p => {
    if (minVip > 0 && p.vipScore < minVip) return false;
    return true;
  });

  return (
    <Layout breadcrumbs={[{ label: 'Event Intelligence' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <Calendar size={20} className="text-violet-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Подбор гостей для мероприятий</h1>
          <p className="text-sm text-slate-500">Event Intelligence · Персонализированные списки гостей</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="btn-secondary text-sm"><Download size={14} /> Экспортировать список</button>
          <button className="btn-primary text-sm"><Star size={14} /> Сформировать brief по гостям</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Параметры подбора</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-500 font-medium uppercase tracking-wide block mb-1">Тема мероприятия</label>
            <input
              type="text"
              placeholder="Фондовый рынок, AI, ..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium uppercase tracking-wide block mb-1">Сегмент</label>
            <select
              value={segment}
              onChange={e => setSegment(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все сегменты</option>
              <option value="STRATEGIC">STRATEGIC</option>
              <option value="PREMIUM">PREMIUM</option>
              <option value="STANDARD">STANDARD</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium uppercase tracking-wide block mb-1">Мин. VIP Score</label>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={minVip}
              onChange={e => setMinVip(Number(e.target.value))}
              className="w-full mt-1"
            />
            <div className="text-xs text-slate-500 text-center">{minVip}+</div>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium uppercase tracking-wide block mb-1">Уровень должности</label>
            <select className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Все уровни</option>
              <option>C-level</option>
              <option>VP / Director</option>
              <option>Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="kpi-card">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Рекомендовано</div>
          <div className="text-2xl font-bold text-slate-900">{filtered.length}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">VIP персоны</div>
          <div className="text-2xl font-bold text-violet-700">{filtered.filter(p => p.priorityLevel === 'vip').length}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Приглашены</div>
          <div className="text-2xl font-bold text-blue-700">{filtered.filter(p => p.invitationStatus === 'invited' || p.invitationStatus === 'confirmed').length}</div>
        </div>
      </div>

      {/* Participants table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <SectionHeader title="Рекомендованные гости" subtitle={`${filtered.length} персон`} />
        </div>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Персона</th><th>Компания / Должность</th><th>Влияние</th>
              <th>VIP Score</th><th>Релевантность</th><th>Последний контакт</th>
              <th>Рекомендует</th><th>Статус</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${p.priorityLevel === 'vip' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                      {p.personName.split(' ')[0][0]}{p.personName.split(' ')[1]?.[0] || ''}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{p.personName}</div>
                      {p.priorityLevel === 'vip' && <span className="badge-purple text-xs">VIP</span>}
                    </div>
                  </div>
                </td>
                <td>
                  {clientPathFor(undefined, p.companyName) ? (
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={(e) => { e.stopPropagation(); navigate(clientPathFor(undefined, p.companyName)!); }}
                    >
                      {p.companyName}
                    </button>
                  ) : (
                    <div className="text-sm text-slate-700">{p.companyName}</div>
                  )}
                  <div className="text-xs text-slate-400">{p.title}</div>
                </td>
                <td><span className={influenceColors[p.influenceLevel]}>{influenceLabels[p.influenceLevel]}</span></td>
                <td>
                  <div className="flex items-center gap-1">
                    <div className="w-16 bg-slate-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${p.vipScore >= 80 ? 'bg-violet-500' : p.vipScore >= 60 ? 'bg-blue-500' : 'bg-slate-400'}`} style={{ width: `${p.vipScore}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{p.vipScore}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <div className="w-16 bg-slate-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${p.relevanceScore}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{p.relevanceScore}%</span>
                  </div>
                </td>
                <td className="text-xs text-slate-500">{p.lastContact}</td>
                <td className="text-xs text-slate-600">{p.recommendedBy}</td>
                <td><span className={statusColors[p.invitationStatus]}>{statusLabels[p.invitationStatus]}</span></td>
                <td>
                  <div className="flex gap-1">
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                      onClick={() => navigate(`/persons/${p.personId}`)}
                    >
                      Профиль
                    </button>
                    {p.invitationStatus === 'recommended' && (
                      <button className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded border border-green-200 hover:bg-green-50 flex items-center gap-1">
                        <UserPlus size={11} /> Пригласить
                      </button>
                    )}
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
