// Мок-данные уведомлений для панели в шапке приложения.

export interface NotificationItem {
  id: string;
  theme: string;
  subtheme: string;
  date: string;
  read: boolean;
}

export const initialNotifications: NotificationItem[] = [
  { id: 'n1', theme: 'Алерты', subtheme: 'ВТБ Капитал: падение оборотов на валютном рынке −18% м/м', date: '09.06.2026 09:42', read: false },
  { id: 'n2', theme: 'Задачи', subtheme: 'Просрочена задача «Перевыпуск СКЗИ для Сбер Инвестиции»', date: '09.06.2026 09:15', read: false },
  { id: 'n3', theme: 'Документы', subtheme: 'Договор ЭДО с Газпромбанком истекает через 14 дней', date: '08.06.2026 18:30', read: false },
  { id: 'n4', theme: 'Клиенты', subtheme: 'НПФ «Достояние» не совершал сделок 30 дней', date: '08.06.2026 12:05', read: false },
  { id: 'n5', theme: 'Рейтинг', subtheme: 'Позиция в рэнкинге по обороту выросла: #6 → #5', date: '07.06.2026 10:20', read: true },
  { id: 'n6', theme: 'Мероприятия', subtheme: 'Завтра встреча с ЛПР Группы Сбербанк в 11:00', date: '06.06.2026 16:45', read: true },
  { id: 'n7', theme: 'AI-рекомендации', subtheme: 'Новая возможность cross-sell: товарный рынок для Сбербанка', date: '06.06.2026 09:00', read: true },
];
