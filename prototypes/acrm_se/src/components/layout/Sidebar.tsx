import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, BarChart3, AlertTriangle,
  CheckSquare, TrendingUp, Calendar, FileText, Target, Package, Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SearchBox } from './SearchBox';
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
  { label: 'Холдинги', icon: <Building2 size={ICON} strokeWidth={1.8} />, path: '/holdings', roles: ['ceo', 'block_head', 'market_lead', 'manager'] },
  { label: 'Персоны', icon: <Users size={ICON} strokeWidth={1.8} />, path: '/persons', roles: ['ceo', 'block_head', 'market_lead', 'manager'] },
  { label: 'Алерты', icon: <AlertTriangle size={ICON} strokeWidth={1.8} />, path: '/alerts', badge: 5 },
  { label: 'Задачи', icon: <CheckSquare size={ICON} strokeWidth={1.8} />, path: '/tasks', badge: 8 },
  { label: 'Аналитика доходов', icon: <BarChart3 size={ICON} strokeWidth={1.8} />, path: '/revenue', roles: ['ceo', 'block_head', 'market_lead'] },
  { label: 'Когорты', icon: <Target size={ICON} strokeWidth={1.8} />, path: '/cohorts', roles: ['ceo', 'block_head', 'market_lead'] },
  { label: 'Мероприятия', icon: <Calendar size={ICON} strokeWidth={1.8} />, path: '/events', roles: ['ceo', 'block_head', 'market_lead', 'manager'] },
  { label: 'Стратегия', icon: <TrendingUp size={ICON} strokeWidth={1.8} />, path: '/strategy', roles: ['ceo', 'block_head', 'market_lead'] },
  { label: 'Продукты', icon: <Package size={ICON} strokeWidth={1.8} />, path: '/products', roles: ['market_lead', 'manager'] },
  { label: 'Новости', icon: <Globe size={ICON} strokeWidth={1.8} />, path: '/news' },
  { label: 'Документы', icon: <FileText size={ICON} strokeWidth={1.8} />, path: '/agreements' },
];

const roleHomePath: Record<string, string> = {
  ceo: '/ceo', block_head: '/block-head', market_lead: '/market-lead', manager: '/manager', operations: '/operations',
};

export const Sidebar = () => {
  const { role, menuPosition } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!role) return null;

  const left = menuPosition === 'left';
  const homePath = roleHomePath[role] || '/';
  const filtered = navItems.filter(item => !item.roles || item.roles.includes(role));

  const isActive = (path: string) => {
    const resolved = path === '__role__' ? homePath : path;
    return location.pathname === resolved || location.pathname.startsWith(resolved + '/');
  };

  // ---- LEFT (vertical pill, with text labels; search lives in the header) ----
  if (left) {
    return (
      <nav
        className="float-pill"
        style={{
          position: 'fixed', top: '50%', left: 12, transform: 'translateY(-50%)', zIndex: 50,
          display: 'flex', flexDirection: 'column', gap: 3, padding: 8, width: 196,
          maxHeight: 'calc(100vh - 24px)', overflowY: 'auto',
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
    );
  }

  // ---- TOP (centered horizontal pill, icon-only, collapsible search) ----
  return (
    <nav
      className="float-pill"
      style={{
        position: 'fixed', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 4, padding: 8,
        maxWidth: 'calc(100vw - 360px)',
      }}
    >
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
  );
};
