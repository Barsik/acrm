import { useSyncExternalStore } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, AlertTriangle, CheckSquare,
  Calendar, Package, Globe, Activity, Filter, Gauge, Lightbulb,
  BookOpen, Sparkles, Briefcase,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SearchBox } from './SearchBox';
import { tasksService, alertsService } from '../../services';
import type { UserRole } from '../../types';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: UserRole[];
  badge?: number;
}

const ICON = 18;

const navItems: NavItem[] = [
  { label: 'Главная', icon: <LayoutDashboard size={ICON} strokeWidth={1.8} />, path: '__role__' },
  { label: 'Задачи', icon: <CheckSquare size={ICON} strokeWidth={1.8} />, path: '/tasks' },
  { label: 'Алерты', icon: <AlertTriangle size={ICON} strokeWidth={1.8} />, path: '/alerts' },
  { label: 'Клиенты', icon: <Users size={ICON} strokeWidth={1.8} />, path: '/clients' },
  { label: 'Мой портфель', icon: <Briefcase size={ICON} strokeWidth={1.8} />, path: '/manager', roles: ['manager'] },
  { label: 'Монитор активности', icon: <Activity size={ICON} strokeWidth={1.8} />, path: '/activity' },
  { label: 'Продукты', icon: <Package size={ICON} strokeWidth={1.8} />, path: '/products' },
  { label: 'Воронка продаж', icon: <Filter size={ICON} strokeWidth={1.8} />, path: '/funnel' },
  { label: 'Рынки', icon: <Globe size={ICON} strokeWidth={1.8} />, path: '/markets' },
  { label: 'Персоны', icon: <Users size={ICON} strokeWidth={1.8} />, path: '/persons' },
  { label: 'Мероприятия', icon: <Calendar size={ICON} strokeWidth={1.8} />, path: '/events' },
  { label: 'KPI', icon: <Gauge size={ICON} strokeWidth={1.8} />, path: '/kpi' },
  { label: 'Инициативы', icon: <Lightbulb size={ICON} strokeWidth={1.8} />, path: '/initiatives' },
  { label: 'База знаний', icon: <BookOpen size={ICON} strokeWidth={1.8} />, path: '/knowledge' },
  { label: 'AI', icon: <Sparkles size={ICON} strokeWidth={1.8} />, path: '/ai' },
];

const roleHomePath: Record<string, string> = {
  ceo: '/ceo', block_head: '/block-head', market_lead: '/market-lead', manager: '/tasks', operations: '/operations',
};

export const Sidebar = () => {
  const { role, menuPosition } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Живые счётчики: новые задачи и новые алерты, пересчитываются при create/update
  const newTasksCount = useSyncExternalStore(
    tasksService.subscribe,
    () => tasksService.getAll().filter(t => t.status === 'open').length,
  );
  const newAlertsCount = useSyncExternalStore(
    alertsService.subscribe,
    () => alertsService.getAll().filter(a => a.status === 'new').length,
  );

  if (!role) return null;

  const left = menuPosition === 'left';
  const homePath = roleHomePath[role] || '/';
  const filtered = navItems
    .filter(item => (
      (!item.roles || item.roles.includes(role))
      // hide "Главная" (path '__role__') for manager in all layouts
      && !(role === 'manager' && item.path === '__role__')
    ))
    .map(item => {
      if (item.path === '/tasks') return { ...item, badge: newTasksCount || undefined };
      if (item.path === '/alerts') return { ...item, badge: newAlertsCount || undefined };
      return item;
    });

  const isActive = (path: string) => {
    const resolved = path === '__role__' ? homePath : path;
    return location.pathname === resolved || location.pathname.startsWith(resolved + '/');
  };

  // Горизонтальная пилюля (иконки + поиск).
  // Внешний контейнер зафиксирован ровно в свободной зоне шапки — между логотипом
  // (слева) и блоком настроек/профиля (справа), поэтому пилюля центруется в этой
  // зоне и не может заехать на соседей; при нехватке места содержимое скроллится.
  // < md пилюля опускается под шапку и растягивается на всю ширину.
  const horizontalPill = (extra: string) => (
    <div
      className={`pointer-events-none fixed z-50 top-2 left-[130px] right-[280px] justify-center
        max-md:top-[70px] max-md:left-3 max-md:right-3 ${extra}`}
    >
      <nav className="float-pill pointer-events-auto flex items-center gap-1 p-2 max-w-full overflow-x-auto">
        <SearchBox variant="pill" />

      {filtered.map(item => {
        const path = item.path === '__role__' ? homePath : item.path;
        const active = isActive(item.path);
        return (
          <button
            key={item.path}
            title={item.label}
            onClick={() => navigate(path)}
            style={{
              position: 'relative', width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
              background: active ? '#E2E5EA' : 'transparent',
              color: active ? '#3A4255' : '#A0AABB',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F0F2F5'; e.currentTarget.style.color = '#5A6478'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A0AABB'; } }}
          >
            {item.icon}
            {item.badge && (
              <span style={{
                position: 'absolute', top: 3, right: 3, minWidth: 15, height: 15, padding: '0 3px',
                borderRadius: 99, background: '#E8001C', color: '#fff', fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{item.badge}</span>
            )}
          </button>
        );
      })}
      </nav>
    </div>
  );

  // ---- LEFT (vertical pill, with text labels; search lives in the header) ----
  // На экранах < lg вертикальная пилюля скрывается, вместо неё — горизонтальная.
  if (left) {
    return (
      <>
        <nav
          className="float-pill flex flex-col max-lg:hidden"
          style={{
            // Центр области под шапкой (62px): пилюля не поднимается выше логотипа
            position: 'fixed', top: 'calc(50% + 31px)', left: 12, transform: 'translateY(-50%)', zIndex: 50,
            gap: 3, padding: 8, width: 196,
            maxHeight: 'calc(100vh - 86px)', overflowY: 'auto',
          }}
        >
          {filtered.map(item => {
            const path = item.path === '__role__' ? homePath : item.path;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '9px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s, color 0.15s',
                  background: active ? '#E2E5EA' : 'transparent',
                  color: active ? '#1E2535' : '#5A6478',
                  fontWeight: active ? 700 : 600,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F0F2F5'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ flexShrink: 0, display: 'flex', color: active ? '#3A4255' : '#A0AABB' }}>{item.icon}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    minWidth: 18, height: 18, padding: '0 5px', borderRadius: 99, background: '#E8001C', color: '#fff',
                    fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
        {horizontalPill('hidden max-lg:flex')}
      </>
    );
  }

  // ---- TOP (centered horizontal pill, icon-only, collapsible search) ----
  return horizontalPill('flex');
};
