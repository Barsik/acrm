import { createPortal } from 'react-dom';
import { X, CheckCheck } from 'lucide-react';
import type { NotificationItem } from '../../data/notificationsData';

interface NotificationsPanelProps {
  open: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

export const NotificationsPanel = ({ open, notifications, onClose, onMarkAllRead, onMarkRead }: NotificationsPanelProps) => {
  if (!open) return null;

  const unread = notifications.filter(n => !n.read).length;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/35" onMouseDown={onClose}>
      <aside
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Уведомления</h2>
            <p className="text-xs text-slate-500">
              {unread > 0 ? `Непрочитанных: ${unread}` : 'Все уведомления прочитаны'}
            </p>
          </div>
          <button className="rounded-lg p-2 hover:bg-slate-100" onClick={onClose} title="Закрыть">
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-slate-100 px-5 py-3">
          <button
            className="btn-secondary w-full justify-center text-xs"
            onClick={onMarkAllRead}
            disabled={unread === 0}
          >
            <CheckCheck size={14} /> Отметить все прочитанными
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.map(n => (
            <button
              key={n.id}
              className={`block w-full border-b border-slate-100 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 ${
                n.read ? 'bg-white' : 'bg-blue-50/50'
              }`}
              onClick={() => onMarkRead(n.id)}
            >
              <div className="flex items-center gap-2">
                {!n.read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-moex-red" />}
                <span className={`text-xs font-bold uppercase tracking-wide ${n.read ? 'text-slate-400' : 'text-slate-700'}`}>
                  {n.theme}
                </span>
                <span className="ml-auto text-[10px] text-slate-400">{n.date}</span>
              </div>
              <div className={`mt-1 text-sm ${n.read ? 'text-slate-500' : 'font-medium text-slate-900'}`}>
                {n.subtheme}
              </div>
            </button>
          ))}
          {notifications.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">Нет уведомлений</div>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
};
