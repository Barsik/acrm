import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MoexLogo } from '../MoexLogo';
import { NotificationsPanel } from './NotificationsPanel';
import { initialNotifications } from '../../data/notificationsData';

const roleLabels: Record<string, string> = {
  ceo: 'CEO / Правление',
  block_head: 'Руководитель блока',
  market_lead: 'Рынки / PM / CX',
  manager: 'Клиентский менеджер',
  operations: 'Операционный контур',
};

const roleInitials: Record<string, string> = {
  ceo: 'CEO', block_head: 'РБ', market_lead: 'PM', manager: 'КМ', operations: 'ОП',
};

/**
 * AppHeader — 62px bar (client-portal-front approach): MOEX wordmark on the left,
 * a floating white action pill (bell + role/avatar dropdown) on the right. The
 * centered navigation lives in the separate floating SideNav pill.
 */
export const Header = () => {
  const { role, setRole, menuPosition, profilePhoto } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setRole(null);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="px-7 max-sm:px-4" style={{
      height: 62, background: '#F6F7FA', flexShrink: 0,
      display: 'flex', alignItems: 'center',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      {/* MOEX logo. In left-menu mode the logo occupies a fixed zone so the search
          that follows lines up with the work-area content column (left-clearance
          220 + 32 content padding − 28 header padding = 224). < lg зона не нужна —
          левой пилюли там нет. */}
      <div
        className={menuPosition === 'left' ? 'lg:w-[224px]' : ''}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
        onClick={() => navigate('/')}
      >
        <MoexLogo height={26} />
      </div>

      {/* Floating action pill */}
      <div className="float-pill" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, padding: 8 }}>
        <button style={iconBtn} title="Настройки" onClick={() => navigate('/settings')}
          onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <Settings size={18} strokeWidth={1.8} />
        </button>
        <button style={iconBtn} title="Уведомления" onClick={() => setNotificationsOpen(true)}
          onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <Bell size={18} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4, width: 15, height: 15, borderRadius: '50%',
              background: '#E8001C', color: '#fff', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{unreadCount}</span>
          )}
        </button>

        {role && (
          <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              title="Профиль"
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, height: 36, paddingLeft: 6, paddingRight: 6,
                borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
              }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#E8EBF0', color: '#3A4255', fontSize: 11, fontWeight: 700,
              }}>
                {profilePhoto
                  ? <img src={profilePhoto} alt="Профиль" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : roleInitials[role]}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#5A6478' }} className="hidden sm:inline">{roleLabels[role]}</span>
            </button>
            <button
              title="Меню"
              onClick={() => setMenuOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', height: 36, padding: '0 8px',
                borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
              }}
            >
              <ChevronDown size={14} style={{ color: '#A0AABB' }} />
            </button>
            {menuOpen && (
              <div className="card" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 180, padding: 6, zIndex: 50 }}>
                <button onClick={handleLogout} style={menuItem} onMouseEnter={menuHoverIn} onMouseLeave={menuHoverOut}>
                  <LogOut size={15} /> Сменить роль
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <NotificationsPanel
        open={notificationsOpen}
        notifications={notifications}
        onClose={() => setNotificationsOpen(false)}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onMarkRead={id => setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))}
      />
    </header>
  );
};

const iconBtn: React.CSSProperties = {
  position: 'relative', width: 36, height: 36, borderRadius: 12,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', background: 'transparent', color: '#A0AABB', cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
};
const menuItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
  padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent',
  color: '#3A4255', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
};
function hoverIn(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.background = '#F0F2F5'; e.currentTarget.style.color = '#5A6478'; }
function hoverOut(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A0AABB'; }
function menuHoverIn(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.background = '#F0F2F5'; }
function menuHoverOut(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.background = 'transparent'; }
