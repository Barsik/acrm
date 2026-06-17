import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MoexLogo } from '../components/MoexLogo';
import type { UserRole } from '../types';
import {
  Crown, Briefcase, BarChart2, UserCheck, Settings,
  Database, Zap, Brain,
} from 'lucide-react';

interface RoleCard {
  id: UserRole;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  decisions: string[];
  data: string[];
  path: string;
  accent: string;
  level: string;
  badge?: string;
}

const roles: RoleCard[] = [
  {
    id: 'ceo',
    icon: <Crown size={20} />,
    title: 'CEO / Правление',
    subtitle: 'Стратегический контур',
    description: 'Управление клиентским бизнесом всей Группы Московская Биржа. Стратегические решения, портфельный анализ, рейтинги.',
    decisions: ['Стратегия работы с ключевыми клиентами', 'Оценка портфеля Группы', 'Управление рисками клиентского бизнеса'],
    data: ['Топ-20 холдингов Группы', 'Доход и оборот по Группе', 'AI-сводка по портфелю'],
    path: '/ceo',
    accent: '#9B59B6',
    level: 'Уровень 6',
    badge: 'CEO',
  },
  {
    id: 'block_head',
    icon: <Briefcase size={20} />,
    title: 'Руководитель блока',
    subtitle: 'Блоковый контур',
    description: 'Управление портфелем блока, контроль KPI команд, выявление отклонений и возможностей роста.',
    decisions: ['KPI блока и команд', 'Отклонения от стратегии', 'Эскалации и контроль'],
    data: ['Портфели команд', 'Клиенты в риске', 'Выполнение плана блока'],
    path: '/block-head',
    accent: '#E8001C',
    level: 'Уровень 5',
  },
  {
    id: 'market_lead',
    icon: <BarChart2 size={20} />,
    title: 'Рынки / PM / CX',
    subtitle: 'Рыночный контур',
    description: 'Управление рынком, продуктом и командой продаж. Запуск кампаний, воронка клиентов, продуктовая аналитика.',
    decisions: ['Продуктовые кампании', 'Cross-sell и up-sell', 'Клиенты с потенциалом'],
    data: ['Воронка клиентов', 'Активность по рынку', 'AI-инсайты по продукту'],
    path: '/market-lead',
    accent: '#4A90D9',
    level: 'Уровень 4',
  },
  {
    id: 'manager',
    icon: <UserCheck size={20} />,
    title: 'Клиентский менеджер',
    subtitle: 'Операционно-аналитический контур',
    description: 'Управление портфелем клиентов и холдингов. Задачи, алерты, договорённости, next best actions.',
    decisions: ['Ежедневный план работы', 'Встречи и коммуникации', 'Кросс-продажи клиентам'],
    data: ['Мой портфель холдингов', 'Health/Risk/Growth scores', 'Next Best Actions'],
    path: '/manager',
    accent: '#12A05C',
    level: 'Уровень 3',
  },
  {
    id: 'operations',
    icon: <Settings size={20} />,
    title: 'Операционный контур',
    subtitle: 'oCRM — операционный контур',
    description: 'Обработка обращений, заявок, документов. Маршрутизация задач, SLA, операционные процессы.',
    decisions: ['Приоритизация обращений', 'Маршрутизация по подразделениям', 'Контроль SLA'],
    data: ['Входящие обращения', 'Статусы задач', 'Просрочки по SLA'],
    path: '/operations',
    accent: '#5A6478',
    level: 'Уровень 1–2',
  },
];

export const RoleSelect = () => {
  const { setRole } = useApp();
  const navigate = useNavigate();

  const handleSelect = (r: RoleCard) => {
    setRole(r.id);
    navigate(r.path);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7FA', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-4 bg-white border-b border-slate-200">
        <MoexLogo height={28} />
        <div className="w-px h-6 bg-slate-200" />
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1E2535' }}>aCRM · Аналитический фронт Группы</div>
        <div className="ml-auto flex items-center gap-4" style={{ fontSize: 12, color: '#A0AABB' }}>
          <span className="flex items-center gap-1.5"><Database size={12} />ЕХД</span>
          <span className="flex items-center gap-1.5"><Zap size={12} />CRM</span>
          <span className="flex items-center gap-1.5"><Brain size={12} />AI</span>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center px-4 md:px-8 py-8 md:py-10">
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
          background: '#F0F2F5', color: '#5A6478', borderRadius: 99, fontSize: 13, fontWeight: 700, marginBottom: 16,
        }}>
          aCRM + oCRM + ЕХД · От аналитики — к действию
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1E2535', marginBottom: 8 }}>Выберите рабочий контур</h1>
        <p style={{ color: '#5A6478', maxWidth: 560, margin: '0 auto', fontSize: 14, lineHeight: 1.55 }}>
          Одна платформа — разные входы по ролям. Каждый уровень управления получает
          свои данные, своё рабочее пространство и свои управленческие действия.
        </p>
      </div>

      {/* Role Cards */}
      <div className="flex-1 px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {roles.map((r) => (
            <div
              key={r.id}
              className="card"
              onClick={() => handleSelect(r)}
              style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.16s, box-shadow 0.16s, transform 0.16s' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = r.accent;
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E8EBF0';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${r.accent}14`, color: r.accent, border: `1.5px solid ${r.accent}26`,
                }}>
                  {r.icon}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AABB', textTransform: 'uppercase', letterSpacing: 0.5 }}>{r.level}</div>
                  {r.badge && (
                    <span style={{
                      display: 'inline-block', marginTop: 5, padding: '2px 8px', borderRadius: 99,
                      background: `${r.accent}14`, color: r.accent, fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
                    }}>{r.badge}</span>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E2535', marginBottom: 2 }}>{r.title}</h3>
              <div style={{ fontSize: 11, fontWeight: 700, color: r.accent, marginBottom: 10 }}>{r.subtitle}</div>
              <p style={{ fontSize: 12.5, color: '#5A6478', lineHeight: 1.5, marginBottom: 14 }}>{r.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <RoleList title="Решения" items={r.decisions} />
                <RoleList title="Данные" items={r.data} />
              </div>
            </div>
          ))}
        </div>

        {/* Architecture label */}
        <div className="mt-8 text-center">
          <div className="card" style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 16, padding: '12px 18px', fontSize: 12, color: '#5A6478' }}>
            <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: 99, background: '#E8001C' }} />aCRM — аналитический контур</span>
            <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: 99, background: '#A0AABB' }} />oCRM — операционный контур</span>
            <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: 99, background: '#9B59B6' }} />ЕХД — единое хранилище</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleList = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AABB', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{title}</div>
    <ul style={{ display: 'flex', flexDirection: 'column', gap: 5, margin: 0, padding: 0, listStyle: 'none' }}>
      {items.map((d, i) => (
        <li key={i} style={{ fontSize: 12, color: '#5A6478', display: 'flex', alignItems: 'flex-start', gap: 7, lineHeight: 1.4 }}>
          <span style={{ width: 4, height: 4, borderRadius: 99, background: '#C0C8D4', marginTop: 6, flexShrink: 0 }} />
          {d}
        </li>
      ))}
    </ul>
  </div>
);
