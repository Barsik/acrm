import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { StatusBadge } from '../components/common';
import { personService } from '../services';
import { mockPersons } from '../data/mockData';
import {
  Mail, Phone, Building, Calendar, Star, Award, MessageSquare,
  ChevronRight, Edit, Brain, Users, Briefcase,
} from 'lucide-react';

const roleLabels: Record<string, string> = {
  decision_maker: 'Decision Maker',
  influencer: 'Influencer',
  sponsor: 'Sponsor',
  user: 'User',
  gatekeeper: 'Gatekeeper',
};
const influenceLabels: Record<string, string> = {
  very_high: 'Очень высокое',
  high: 'Высокое',
  medium: 'Среднее',
  low: 'Низкое',
};
const influenceColors: Record<string, string> = {
  very_high: 'bg-purple-100 text-purple-700 border border-purple-200',
  high: 'bg-blue-100 text-blue-700 border border-blue-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  low: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export const PersonPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'events'>('profile');

  const person = personService.getById(id || 'p1') || mockPersons[0];

  const age = new Date().getFullYear() - new Date(person.birthDate).getFullYear();
  const daysToBirthday = () => {
    const today = new Date();
    const birth = new Date(person.birthDate);
    const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < today) next.setFullYear(today.getFullYear() + 1);
    return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const vipColor = person.vipScore >= 80 ? 'text-violet-700 bg-violet-100' :
    person.vipScore >= 60 ? 'text-blue-700 bg-blue-100' : 'text-slate-600 bg-slate-100';

  return (
    <Layout breadcrumbs={[
      { label: 'Холдинги', path: '/holdings' },
      { label: person.holdingName, path: `/holdings/${person.holdingId}` },
      { label: person.companyName, path: `/companies/${person.companyId}` },
      { label: person.fullName },
    ]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Profile card */}
        <div className="space-y-4">
          {/* Main card */}
          <div className="card p-5">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-violet-700 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3">
                {person.firstName[0]}{person.lastName[0]}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{person.fullName}</h2>
              <p className="text-sm text-slate-500">{person.title}</p>
              <button
                className="text-sm text-blue-600 hover:text-blue-800 mt-0.5"
                onClick={() => navigate(`/companies/${person.companyId}`)}
              >
                {person.companyName}
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={14} className="text-slate-400 flex-shrink-0" />
                <a href={`mailto:${person.email}`} className="text-blue-600 hover:underline truncate">{person.email}</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400 flex-shrink-0" />
                <span>{person.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building size={14} className="text-slate-400 flex-shrink-0" />
                <span>{person.department}</span>
              </div>
              {person.assistant && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users size={14} className="text-slate-400 flex-shrink-0" />
                  <span>Помощник: {person.assistant}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                <span>Д.р.: {person.birthDate} ({age} лет)</span>
                {daysToBirthday() <= 30 && (
                  <span className="badge-amber text-xs">Через {daysToBirthday()} дн.</span>
                )}
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className={`p-2 rounded-lg text-center ${vipColor}`}>
                <div className="text-xs font-semibold uppercase tracking-wide">VIP Score</div>
                <div className="text-2xl font-bold">{person.vipScore}</div>
              </div>
              <div className={`p-2 rounded-lg text-center ${influenceColors[person.influenceLevel]}`}>
                <div className="text-xs font-semibold uppercase tracking-wide">Влияние</div>
                <div className="text-sm font-bold mt-0.5">{influenceLabels[person.influenceLevel]}</div>
              </div>
            </div>

            {/* Role */}
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <div className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-0.5">Роль в принятии решений</div>
              <div className="text-sm font-bold text-blue-800">{roleLabels[person.personRole]}</div>
            </div>

            {/* Last contact */}
            <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs text-slate-500">Последний контакт</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{person.lastContact}</div>
              {(() => {
                const days = Math.floor((new Date().getTime() - new Date(person.lastContact).getTime()) / (1000 * 60 * 60 * 24));
                return <div className={`text-xs mt-0.5 ${days > 30 ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>{days} дней назад</div>;
              })()}
            </div>
          </div>

          {/* Actions */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Действия</h3>
            <div className="space-y-1.5">
              {[
                { label: 'Запланировать встречу', icon: <Calendar size={13} /> },
                { label: 'Обновить договорённость', icon: <Edit size={13} /> },
                { label: 'История коммуникаций', icon: <MessageSquare size={13} /> },
                { label: 'Сформировать brief', icon: <Briefcase size={13} /> },
                { label: 'AI-анализ персоны', icon: <Brain size={13} /> },
                { label: 'Добавить в мероприятие', icon: <Star size={13} />, path: '/events' },
              ].map(a => (
                <button key={a.label} className="btn-secondary w-full justify-start text-xs" onClick={() => a.path && navigate(a.path)}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="border-b border-slate-200 flex">
            {[
              { id: 'profile', label: 'Деловой профиль' },
              { id: 'history', label: 'История встреч' },
              { id: 'events', label: 'Мероприятия' },
            ].map(t => (
              <button
                key={t.id}
                className={`tab-button ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id as any)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Business profile */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Деловой профиль</h3>
                <div className="grid grid-cols-2 gap-4">
                  {person.publicRole && (
                    <div className="col-span-2">
                      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Публичная роль</div>
                      <div className="text-sm text-slate-900">{person.publicRole}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Отраслевая значимость</div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${influenceColors[person.industrySignificance]}`}>
                      {influenceLabels[person.industrySignificance]}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Значимость для Группы МБ</div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${influenceColors[person.groupRelationship]}`}>
                      {influenceLabels[person.groupRelationship]}
                    </span>
                  </div>
                </div>

                {person.industryCommittees.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Участие в отраслевых советах и комитетах</div>
                    <div className="flex flex-wrap gap-2">
                      {person.industryCommittees.map(c => (
                        <span key={c} className="badge-blue">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {person.publicSpeaking && (
                  <div className="mt-4 flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                    <Award size={14} className="text-blue-600" />
                    <span className="text-xs text-blue-800 font-medium">Публичный спикер — регулярно выступает на отраслевых мероприятиях</span>
                  </div>
                )}
              </div>

              {/* Products of interest */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Интересующие продукты</h3>
                <div className="flex flex-wrap gap-2">
                  {person.interestedProducts.map(p => (
                    <span key={p} className="badge-purple">{p}</span>
                  ))}
                </div>
              </div>

              {/* Manager notes */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Заметки менеджера</h3>
                  <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Edit size={12} /> Изменить</button>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{person.managerNotes}</p>
              </div>

              {/* Event recommendation */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={15} className="text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Рекомендация для мероприятий</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Уровень приоритета</div>
                    <div className="text-sm font-bold text-amber-800">
                      {person.vipScore >= 90 ? 'VIP — обязательно пригласить' : person.vipScore >= 70 ? 'Высокий приоритет' : 'Стандартный'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Кто должен пригласить</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {person.influenceLevel === 'very_high' ? 'CEO / Правление' : person.influenceLevel === 'high' ? 'Руководитель блока' : 'Клиентский менеджер'}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Релевантные темы</div>
                  <div className="flex flex-wrap gap-1.5">
                    {person.interestedProducts.map(t => <span key={t} className="badge-blue text-xs">{t}</span>)}
                  </div>
                </div>
                <button className="btn-primary text-xs mt-3 w-full justify-center" onClick={() => navigate('/events')}>
                  <Star size={13} /> Добавить в список гостей мероприятия
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {person.meetingHistory.length > 0 ? person.meetingHistory.map(m => (
                <div key={m.id} className="card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{m.topic}</div>
                      <div className="text-xs text-slate-500">{m.date}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Участники</div>
                      <div className="text-slate-700">{m.participants.join(', ')}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Итог</div>
                      <div className="text-slate-700">{m.outcome}</div>
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 bg-blue-50 rounded-lg text-xs text-blue-800">
                    <span className="font-semibold">Next steps:</span> {m.nextSteps}
                  </div>
                </div>
              )) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
                  <div className="text-slate-400">История встреч пуста</div>
                  <button className="btn-primary text-xs mt-3"><Calendar size={13} /> Запланировать встречу</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Участие в мероприятиях</h3>
              <div className="space-y-3">
                {[
                  { event: 'MOEX Forum 2025', date: '2025-11-14', status: 'attended', role: 'Спикер' },
                  { event: 'Финансовый конгресс ЦБ', date: '2025-07-03', status: 'attended', role: 'Участник' },
                ].map((e, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                      <Award size={15} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{e.event}</div>
                      <div className="text-xs text-slate-500">{e.date} · {e.role}</div>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                ))}
              </div>
              <button className="btn-primary text-xs mt-4" onClick={() => navigate('/events')}>
                <Star size={13} /> Добавить в новое мероприятие
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
