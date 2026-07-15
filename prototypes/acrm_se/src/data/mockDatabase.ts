// =============================================
// MOCK DATABASE — клиенты (NoSQL-документы)
// Extracted from mockData.ts. Реестр клиентов + данные монитора активности.
// =============================================

export interface ClientTag {
  label: string;
  icon?: boolean;
}

// Группы клиентов и категории клиринга (НКЦ) — справочники значений.
export type ClientGroup = 'Банк' | 'Брокер' | 'Корпорат' | 'Нерезидент' | 'УК';
export type ClearingCategory = 'Б' | 'Б2' | 'В';

export const clientGroups: ClientGroup[] = ['Банк', 'Брокер', 'Корпорат', 'Нерезидент', 'УК'];
export const clearingCategories: ClearingCategory[] = ['Б', 'Б2', 'В'];

// Монитор активности — статусы продукта и список отслеживаемых продуктов.
export type ProductStatus =
  | 'Подключен'
  | 'Активно торгует'
  | 'Перспективный'
  | 'Нет интереса'
  | 'Подключен к бою'
  | 'Нет статуса'
  | 'Не торгует'
  | 'Низкая активность';

// Рынки и их продукты. Колонки «Продукт» в мониторе активности зависят от
// выбранного рынка: «все» → колонки = рынки целиком; конкретный рынок →
// колонки = его продукты.
export interface Market {
  id: string;
  name: string;
  products: string[];
}

export const markets: Market[] = [
  { id: 'equity',      name: 'Фондовый рынок', products: ['Акции', 'Облигации', 'ОФЗ', 'БПИФ / ETF'] },
  { id: 'derivatives', name: 'Срочный рынок',  products: ['Фьючерсы', 'Опционы', 'Маркетмейкинг'] },
  { id: 'fx',          name: 'Валютный рынок', products: ['Спот', 'Своп', 'Фиксинг'] },
  { id: 'money',       name: 'Денежный рынок', products: ['Репо с ЦК', 'Депозиты с ЦК', 'КСУ'] },
  { id: 'commodity',   name: 'Товарный рынок', products: ['Драгметаллы', 'Зерно', 'Сахар'] },
];

// Колонки «Продукт» по умолчанию (Рынок: все) — названия рынков.
// productStatuses у каждого клиента соответствует этому списку по позициям.
export const activityProducts: string[] = markets.map(m => m.name);

// Алерты клиента (как в «Тепловой карте» — код + тон + подпись для тултипа).
export type ClientAlertCode =
  | 'inactive' | 'detractor' | 'nps_drop' | 'single_product' | 'birthday' | 'underplan';

export interface ClientAlert {
  type: 'danger' | 'warning' | 'info';
  code: ClientAlertCode;
  label: string;
}

export interface ClientRecord {
  id: number;
  name: string;
  inn: string;
  type: 'Юр. лицо' | 'Физ. лицо';
  status: 'Активный' | 'Неактивный';
  portfolio: string;
  manager: string;
  /** Группа клиента (для юр. лиц — участников клиринга). */
  group?: ClientGroup;
  /** Категория клиринга НКЦ (Б / Б2 / В). */
  clearingCategory?: ClearingCategory;
  logo?: string;
  tags?: ClientTag[];
  // --- Монитор активности ---
  /** Дата последней активности (ISO yyyy-mm-dd). */
  lastActivity?: string;
  /** Сегмент клиента. */
  segment?: string;
  /** Оборот, ₽. */
  turnover?: number;
  /** Ограничения (санкции). */
  restrictions?: 'да' | 'нет';
  /** Открытые алерты клиента (для колонки «Алерты»). */
  alertList?: ClientAlert[];
  /** Статусы по рынкам из activityProducts / markets (по позициям). */
  productStatuses?: ProductStatus[];
  /** Статусы по продуктам внутри рынка, ключ — market.id, массив по позициям market.products. */
  marketStatuses?: Record<string, ProductStatus[]>;
}

const clientsBase: ClientRecord[] = [
  { id: 1, name: 'ПАО «Газпром»', inn: '7736050003', type: 'Юр. лицо', status: 'Активный', portfolio: '48 200 000 ₽', manager: 'Петров А.И.', group: 'Корпорат', clearingCategory: 'Б2', logo: 'https://companieslogo.com/img/orig/GAZP.ME-56a2073a.png?t=1720244492', lastActivity: '2026-06-18', segment: 'Крупный', turnover: 8_900_000_000, restrictions: 'да', alertList: [{ type: 'warning', code: 'underplan', label: '64% плана' }, { type: 'warning', code: 'nps_drop', label: 'NPS снизился (54→47)' }], productStatuses: ['Активно торгует', 'Подключен', 'Низкая активность', 'Перспективный', 'Нет статуса'] },
  { id: 2, name: 'ООО «Лукойл Трейд»', inn: '5045007699', type: 'Юр. лицо', status: 'Активный', portfolio: '22 750 000 ₽', manager: 'Смирнова Е.В.', group: 'Корпорат', clearingCategory: 'Б2', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/LUK_OIL_Logo.svg/3840px-LUK_OIL_Logo.svg.png', lastActivity: '2026-06-12', segment: 'Крупный', turnover: 12_400_000_000, restrictions: 'да', alertList: [{ type: 'warning', code: 'underplan', label: '72% плана' }], productStatuses: ['Активно торгует', 'Подключен', 'Низкая активность', 'Перспективный', 'Нет статуса'] },
  { id: 3, name: 'ПАО «Сбербанк»', inn: '7707083893', type: 'Юр. лицо', status: 'Активный', portfolio: '130 000 000 ₽', manager: 'Козлов Д.М.', group: 'Банк', clearingCategory: 'Б', logo: 'https://free-png.ru/wp-content/uploads/2020/09/icon_sber-01-370x370.png', tags: [{ label: 'Банк', icon: true }, { label: 'TOP 12' }, { label: 'Розничный > 1 млн.' }], lastActivity: '2026-06-20', segment: 'Стратегический', turnover: 48_500_000_000, restrictions: 'нет', alertList: [], productStatuses: ['Активно торгует', 'Активно торгует', 'Активно торгует', 'Активно торгует', 'Подключен'] },
  { id: 4, name: 'Иванов Сергей Николаевич', inn: '773612349812', type: 'Физ. лицо', status: 'Активный', portfolio: '3 400 000 ₽', manager: 'Петров А.И.', lastActivity: '2026-06-15', segment: 'Розничный', turnover: 3_400_000, restrictions: 'нет', alertList: [], productStatuses: ['Активно торгует', 'Перспективный', 'Нет интереса', 'Нет статуса', 'Не торгует'] },
  { id: 5, name: 'ООО «Ромашка Инвест»', inn: '7714995501', type: 'Юр. лицо', status: 'Неактивный', portfolio: '560 000 ₽', manager: 'Белова Н.С.', group: 'УК', clearingCategory: 'В', lastActivity: '2026-04-20', segment: 'Малый', turnover: 560_000_000, restrictions: 'нет', alertList: [{ type: 'danger', code: 'inactive', label: 'Неактивен 62 дн' }, { type: 'danger', code: 'underplan', label: '31% плана' }], productStatuses: ['Низкая активность', 'Не торгует', 'Нет статуса', 'Нет интереса', 'Нет интереса'] },
  { id: 6, name: 'Кузнецова Анна Петровна', inn: '504500112233', type: 'Физ. лицо', status: 'Активный', portfolio: '1 200 000 ₽', manager: 'Смирнова Е.В.', lastActivity: '2026-06-19', segment: 'Розничный', turnover: 1_200_000, restrictions: 'нет', alertList: [], productStatuses: ['Активно торгует', 'Подключен', 'Перспективный', 'Нет статуса', 'Нет интереса'] },
  { id: 7, name: 'АО «Роснефть»', inn: '7706107510', type: 'Юр. лицо', status: 'Активный', portfolio: '75 000 000 ₽', manager: 'Козлов Д.М.', group: 'Корпорат', clearingCategory: 'Б2', logo: 'https://companieslogo.com/img/orig/ROSN.ME-c66170da.png?t=1720244493', lastActivity: '2026-06-10', segment: 'Крупный', turnover: 22_800_000_000, restrictions: 'да', alertList: [{ type: 'warning', code: 'nps_drop', label: 'NPS снизился (61→55)' }], productStatuses: ['Активно торгует', 'Активно торгует', 'Подключен', 'Перспективный', 'Нет статуса'] },
  { id: 8, name: 'ПАО «Норникель»', inn: '8401005730', type: 'Юр. лицо', status: 'Активный', portfolio: '44 100 000 ₽', manager: 'Белова Н.С.', group: 'Корпорат', clearingCategory: 'Б2', logo: 'https://companieslogo.com/img/orig/GMKN.ME-4b392c20.png?t=1720244492', lastActivity: '2026-05-15', segment: 'Крупный', turnover: 5_400_000_000, restrictions: 'да', alertList: [{ type: 'warning', code: 'inactive', label: 'Неактивен 37 дн' }, { type: 'warning', code: 'underplan', label: '58% плана' }], productStatuses: ['Подключен', 'Низкая активность', 'Не торгует', 'Перспективный', 'Нет интереса'] },
  { id: 9, name: 'Морозов Игорь Васильевич', inn: '771401556677', type: 'Физ. лицо', status: 'Неактивный', portfolio: '890 000 ₽', manager: 'Петров А.И.', lastActivity: '2026-03-10', segment: 'Розничный', turnover: 890_000, restrictions: 'нет', alertList: [{ type: 'danger', code: 'inactive', label: 'Неактивен 103 дн' }], productStatuses: ['Не торгует', 'Нет статуса', 'Нет интереса', 'Нет интереса', 'Нет статуса'] },
  { id: 10, name: 'Банк ВТБ (ПАО)', inn: '7702070139', type: 'Юр. лицо', status: 'Активный', portfolio: '98 500 000 ₽', manager: 'Козлов Д.М.', group: 'Банк', clearingCategory: 'Б', logo: 'https://companieslogo.com/img/orig/VTBR.ME-3f8b6f7e.png?t=1720244500', tags: [{ label: 'Банк', icon: true }, { label: 'TOP 12' }], lastActivity: '2026-06-19', segment: 'Стратегический', turnover: 41_200_000_000, restrictions: 'да', alertList: [{ type: 'danger', code: 'underplan', label: '46% плана' }, { type: 'warning', code: 'nps_drop', label: 'NPS снизился (48→40)' }], productStatuses: ['Активно торгует', 'Активно торгует', 'Низкая активность', 'Подключен', 'Нет интереса'] },
  { id: 11, name: 'ПАО «Яндекс»', inn: '7736207543', type: 'Юр. лицо', status: 'Активный', portfolio: '67 300 000 ₽', manager: 'Смирнова Е.В.', group: 'Корпорат', clearingCategory: 'Б2', logo: 'https://companieslogo.com/img/orig/YNDX.ME-c5b1f1b6.png?t=1720244504', tags: [{ label: 'IT' }, { label: 'TOP 12' }], lastActivity: '2026-06-17', segment: 'Крупный', turnover: 15_600_000_000, restrictions: 'нет', alertList: [], productStatuses: ['Активно торгует', 'Активно торгует', 'Перспективный', 'Подключен', 'Низкая активность'] },
  { id: 12, name: 'ПАО «Магнит»', inn: '2309085638', type: 'Юр. лицо', status: 'Активный', portfolio: '31 900 000 ₽', manager: 'Белова Н.С.', group: 'Корпорат', clearingCategory: 'В', logo: 'https://companieslogo.com/img/orig/MGNT.ME-3a4b1f8c.png?t=1720244508', lastActivity: '2026-06-05', segment: 'Средний', turnover: 4_900_000_000, restrictions: 'нет', alertList: [{ type: 'warning', code: 'nps_drop', label: 'NPS снизился (70→64)' }], productStatuses: ['Подключен', 'Низкая активность', 'Перспективный', 'Нет статуса', 'Нет интереса'] },
  { id: 13, name: 'Соколова Мария Андреевна', inn: '770998877123', type: 'Физ. лицо', status: 'Активный', portfolio: '5 600 000 ₽', manager: 'Смирнова Е.В.', lastActivity: '2026-06-18', segment: 'Розничный', turnover: 5_600_000, restrictions: 'нет', alertList: [], productStatuses: ['Активно торгует', 'Подключен', 'Перспективный', 'Нет статуса', 'Нет интереса'] },
  { id: 14, name: 'ПАО «МТС»', inn: '7740000076', type: 'Юр. лицо', status: 'Активный', portfolio: '28 400 000 ₽', manager: 'Петров А.И.', group: 'Корпорат', clearingCategory: 'Б2', logo: 'https://companieslogo.com/img/orig/MTSS.ME-9e2a3d4f.png?t=1720244512', lastActivity: '2026-06-14', segment: 'Крупный', turnover: 9_800_000_000, restrictions: 'нет', alertList: [{ type: 'info', code: 'birthday', label: 'День рождения ЛПР через 5 дн' }], productStatuses: ['Активно торгует', 'Подключен', 'Перспективный', 'Нет интереса', 'Нет статуса'] },
  { id: 15, name: 'АО «Тинькофф Банк»', inn: '7710140679', type: 'Юр. лицо', status: 'Активный', portfolio: '54 700 000 ₽', manager: 'Козлов Д.М.', group: 'Банк', clearingCategory: 'Б', tags: [{ label: 'Банк', icon: true }, { label: 'Розничный > 1 млн.' }], lastActivity: '2026-06-20', segment: 'Крупный', turnover: 27_300_000_000, restrictions: 'нет', alertList: [], productStatuses: ['Активно торгует', 'Активно торгует', 'Активно торгует', 'Подключен к бою', 'Перспективный'] },
  { id: 16, name: 'ООО «Северсталь Инвест»', inn: '3528000597', type: 'Юр. лицо', status: 'Активный', portfolio: '19 800 000 ₽', manager: 'Белова Н.С.', group: 'Брокер', clearingCategory: 'Б2', lastActivity: '2026-06-18', segment: 'Крупный', turnover: 19_800_000_000, restrictions: 'нет', alertList: [{ type: 'warning', code: 'underplan', label: '67% плана' }], productStatuses: ['Активно торгует', 'Активно торгует', 'Активно торгует', 'Перспективный', 'Подключен к бою'] },
  { id: 17, name: 'Волков Дмитрий Олегович', inn: '504512336699', type: 'Физ. лицо', status: 'Неактивный', portfolio: '720 000 ₽', manager: 'Петров А.И.', lastActivity: '2026-04-02', segment: 'Розничный', turnover: 720_000, restrictions: 'нет', alertList: [{ type: 'danger', code: 'inactive', label: 'Неактивен 80 дн' }], productStatuses: ['Низкая активность', 'Не торгует', 'Нет статуса', 'Нет интереса', 'Нет интереса'] },
  { id: 18, name: 'ПАО «Аэрофлот»', inn: '7712040126', type: 'Юр. лицо', status: 'Активный', portfolio: '12 300 000 ₽', manager: 'Смирнова Е.В.', group: 'Корпорат', clearingCategory: 'В', logo: 'https://companieslogo.com/img/orig/AFLT.ME-7d1c9e2a.png?t=1720244516', lastActivity: '2026-06-03', segment: 'Средний', turnover: 3_200_000_000, restrictions: 'да', alertList: [{ type: 'warning', code: 'inactive', label: 'Неактивен 18 дн' }, { type: 'danger', code: 'underplan', label: '42% плана' }, { type: 'warning', code: 'nps_drop', label: 'NPS снизился (52→44)' }], productStatuses: ['Подключен', 'Низкая активность', 'Не торгует', 'Нет статуса', 'Нет интереса'] },
  { id: 19, name: 'ООО «Инвест Капитал Групп»', inn: '7733556677', type: 'Юр. лицо', status: 'Неактивный', portfolio: '340 000 ₽', manager: 'Белова Н.С.', group: 'УК', clearingCategory: 'В', lastActivity: '2026-03-25', segment: 'Малый', turnover: 340_000_000, restrictions: 'да', alertList: [{ type: 'danger', code: 'inactive', label: 'Неактивен 88 дн' }, { type: 'danger', code: 'underplan', label: '24% плана' }, { type: 'danger', code: 'detractor', label: 'NPS детрактор (5)' }], productStatuses: ['Не торгует', 'Нет статуса', 'Нет интереса', 'Нет интереса', 'Нет статуса'] },
  { id: 20, name: 'АО «Альфа-Банк»', inn: '7728168971', type: 'Юр. лицо', status: 'Активный', portfolio: '61 800 000 ₽', manager: 'Козлов Д.М.', group: 'Банк', clearingCategory: 'Б', tags: [{ label: 'Банк', icon: true }, { label: 'TOP 12' }], lastActivity: '2026-06-16', segment: 'Стратегический', turnover: 33_700_000_000, restrictions: 'нет', alertList: [], productStatuses: ['Активно торгует', 'Активно торгует', 'Подключен', 'Перспективный', 'Нет статуса'] },
  { id: 21, name: 'АО «Россельхозбанк»', inn: '7725114488', type: 'Юр. лицо', status: 'Активный', portfolio: '27 400 000 ₽', manager: 'Петров А.И.', group: 'Банк', clearingCategory: 'Б', tags: [{ label: 'Банк', icon: true }], lastActivity: '2026-05-28', segment: 'Крупный', turnover: 7_900_000_000, restrictions: 'да', alertList: [{ type: 'danger', code: 'inactive', label: 'Неактивен 42 дн' }, { type: 'warning', code: 'underplan', label: '61% плана' }], productStatuses: ['Подключен', 'Низкая активность', 'Не торгует', 'Перспективный', 'Нет интереса'] },
  { id: 22, name: 'АО «ФИНАМ»', inn: '7731038186', type: 'Юр. лицо', status: 'Активный', portfolio: '18 900 000 ₽', manager: 'Смирнова Е.В.', group: 'Брокер', clearingCategory: 'Б2', lastActivity: '2026-06-17', segment: 'Крупный', turnover: 21_500_000_000, restrictions: 'нет', alertList: [{ type: 'warning', code: 'nps_drop', label: 'NPS снизился (58→51)' }], productStatuses: ['Активно торгует', 'Активно торгует', 'Подключен', 'Подключен к бою', 'Перспективный'] },
];

// Полный список статусов — для генерации статусов по продуктам внутри рынка.
const ALL_STATUSES: ProductStatus[] = [
  'Подключен', 'Активно торгует', 'Перспективный', 'Нет интереса',
  'Подключен к бою', 'Нет статуса', 'Не торгует', 'Низкая активность',
];

// Детерминированно раскладываем статус рынка на статусы его продуктов:
// первый продукт наследует статус рынка, остальные — стабильная вариация.
const productStatusFor = (clientId: number, marketIdx: number, productIdx: number, base: ProductStatus): ProductStatus => {
  if (productIdx === 0) return base;
  const h = (clientId * 31 + marketIdx * 17 + productIdx * 13) % 100;
  return h < 45 ? base : ALL_STATUSES[(clientId + marketIdx * 3 + productIdx * 7) % ALL_STATUSES.length];
};

const buildMarketStatuses = (c: ClientRecord): Record<string, ProductStatus[]> => {
  const out: Record<string, ProductStatus[]> = {};
  markets.forEach((m, mi) => {
    const base = c.productStatuses?.[mi] ?? 'Нет статуса';
    out[m.id] = m.products.map((_, pi) => productStatusFor(c.id, mi, pi, base));
  });
  return out;
};

export const clients: ClientRecord[] = clientsBase.map(c => ({ ...c, marketStatuses: buildMarketStatuses(c) }));
