// Тепловая карта — ported from pm_dashboard_b2b.html (test data).
// Kept self-contained: own client shape, helpers and alert rules, so the
// original table columns move over unchanged.

import { formatNumber } from '../utils/numberFormat';

export interface HeatClient {
  id: number;
  name: string;
  seg: 'Банк' | 'Корпорат' | 'Брокер';
  aum: number;
  commMTD: number;
  commPlan: number;
  lastTrade: string;
  nps: number;
  npsPrev: number;
  products: string[];
  bday: string | null;
  action: string;
  restrictions?: string[];
  joinDate?: string;
}

export interface HeatAlert {
  type: 'danger' | 'warning' | 'info';
  code: string;
  label: string;
  icon: string;
}

export const HEAT_TODAY = new Date('2026-06-15');
const DAY_OF_MONTH = HEAT_TODAY.getDate(); // 15

export const heatClients: HeatClient[] = [
  // Банки (10)
  { id: 1,  name: 'ПАО "СеверКомБанк"',          seg: 'Банк',     aum: 48000000000, commMTD: 28800000, commPlan: 32000000, lastTrade: '2026-06-14', nps: 8, npsPrev: 8, products: ['Продукт 2','Продукт 3','Продукт 5','Продукт 4','Продукт 8'], bday: null, action: 'Предложить Продукт 7' },
  { id: 2,  name: 'АО "УральскийБизнесБанк"',     seg: 'Банк',     aum: 21000000000, commMTD: 6300000,  commPlan: 18000000, lastTrade: '2026-05-20', nps: 5, npsPrev: 7, products: ['Продукт 2','Продукт 3'], bday: '2020-06-18', action: 'СРОЧНО: детрактор + 26 дн без сделок + годовщина' },
  { id: 3,  name: 'ПАО "ВосточныйФинБанк"',       seg: 'Банк',     aum: 35000000000, commMTD: 21000000, commPlan: 22000000, lastTrade: '2026-06-13', nps: 9, npsPrev: 9, products: ['Продукт 2','Продукт 3','Продукт 4','Продукт 5','Продукт 6','Продукт 7'], bday: null, action: 'Поддерживающий контакт' },
  { id: 4,  name: 'АО "МежТоргБанк"',             seg: 'Банк',     aum: 12000000000, commMTD: 3600000,  commPlan: 10000000, lastTrade: '2026-05-02', nps: 6, npsPrev: 8, products: ['Продукт 2','Продукт 5'], bday: null, action: 'СРОЧНО: детрактор + неактивен 44 дня', restrictions: ['Санкции'] },
  { id: 5,  name: 'ПАО "СибирскийНародныйБанк"',  seg: 'Банк',     aum: 52000000000, commMTD: 36400000, commPlan: 35000000, lastTrade: '2026-06-15', nps: 9, npsPrev: 8, products: ['Продукт 2','Продукт 3','Продукт 5','Продукт 4','Продукт 6'], bday: null, action: 'Встреча по стратегии Q3' },
  { id: 6,  name: 'АО "КредитИнвестБанк"',        seg: 'Банк',     aum: 8000000000,  commMTD: 2400000,  commPlan: 7000000,  lastTrade: '2026-05-25', nps: 7, npsPrev: 7, products: ['Продукт 2','Продукт 3'], bday: null, action: 'Предложить Продукт 4' },
  { id: 7,  name: 'ПАО "ПоволжскийБанк"',         seg: 'Банк',     aum: 18000000000, commMTD: 9000000,  commPlan: 11000000, lastTrade: '2026-06-11', nps: 8, npsPrev: 7, products: ['Продукт 2','Продукт 3','Продукт 5','Продукт 4'], bday: null, action: 'Обсудить лимиты по Продукт 3' },
  { id: 8,  name: 'АО "ДальнеВосточныйБанк"',     seg: 'Банк',     aum: 9500000000,  commMTD: 950000,   commPlan: 8000000,  lastTrade: '2026-05-10', nps: 4, npsPrev: 6, products: ['Продукт 3'], bday: null, action: 'СРОЧНО: детрактор + 1 продукт + 36 дн', restrictions: ['Отзыв лицензии'] },
  { id: 9,  name: 'ПАО "ЦентрКапиталБанк"',       seg: 'Банк',     aum: 28000000000, commMTD: 16800000, commPlan: 18000000, lastTrade: '2026-06-12', nps: 8, npsPrev: 8, products: ['Продукт 2','Продукт 3','Продукт 4','Продукт 6'], bday: null, action: 'Презентация новых продуктов' },
  { id: 10, name: 'АО "РегионИнвестБанк"',        seg: 'Банк',     aum: 6500000000,  commMTD: 1300000,  commPlan: 5500000,  lastTrade: '2026-06-08', nps: 7, npsPrev: 8, products: ['Продукт 2','Продукт 3'], bday: null, action: 'Предложить Продукт 6', joinDate: '2026-04-18' },
  // Корпораты (12)
  { id: 11, name: 'ПАО "МеталлИнвест Групп"',     seg: 'Корпорат', aum: 9000000000,  commMTD: 4500000,  commPlan: 5400000,  lastTrade: '2026-06-14', nps: 9, npsPrev: 9, products: ['Продукт 2','Продукт 5','Продукт 6','Продукт 4'], bday: null, action: 'Поддерживающий контакт' },
  { id: 12, name: 'АО "НефтеХим Холдинг"',        seg: 'Корпорат', aum: 13200000000, commMTD: 7920000,  commPlan: 8400000,  lastTrade: '2026-06-13', nps: 8, npsPrev: 8, products: ['Продукт 2','Продукт 5','Продукт 6','Продукт 7'], bday: null, action: 'Хеджирование рисков — Продукт 5' },
  { id: 13, name: 'ПАО "АгроПром Капитал"',       seg: 'Корпорат', aum: 4500000000,  commMTD: 1350000,  commPlan: 3600000,  lastTrade: '2026-05-22', nps: 7, npsPrev: 8, products: ['Продукт 2','Продукт 5'], bday: null, action: 'Позвонить — 24 дня без сделок' },
  { id: 14, name: 'АО "ТехноСтрой Девелопмент"',  seg: 'Корпорат', aum: 2880000000,  commMTD: 288000,   commPlan: 2400000,  lastTrade: '2026-05-05', nps: 6, npsPrev: 7, products: ['Продукт 2'], bday: null, action: 'СРОЧНО: детрактор + 1 продукт + 41 день' },
  { id: 15, name: 'ПАО "ЭнергоТрейдинг"',         seg: 'Корпорат', aum: 10800000000, commMTD: 5400000,  commPlan: 5700000,  lastTrade: '2026-06-14', nps: 9, npsPrev: 9, products: ['Продукт 2','Продукт 6','Продукт 5','Продукт 4','Продукт 7'], bday: null, action: 'Предложить Продукт 8' },
  { id: 16, name: 'АО "РосФармацевтика"',         seg: 'Корпорат', aum: 1920000000,  commMTD: 384000,   commPlan: 1680000,  lastTrade: '2026-06-10', nps: 8, npsPrev: 7, products: ['Продукт 2','Продукт 5'], bday: null, action: 'Предложить Продукт 7' },
  { id: 17, name: 'ПАО "МашиноСтрой Концерн"',    seg: 'Корпорат', aum: 6600000000,  commMTD: 1980000,  commPlan: 4200000,  lastTrade: '2026-05-15', nps: 7, npsPrev: 7, products: ['Продукт 2','Продукт 6'], bday: null, action: 'Позвонить — неактивен 31 день' },
  { id: 18, name: 'АО "ТрансЛогистик"',           seg: 'Корпорат', aum: 3360000000,  commMTD: 1008000,  commPlan: 1500000,  lastTrade: '2026-06-12', nps: 8, npsPrev: 8, products: ['Продукт 2','Продукт 5','Продукт 4'], bday: null, action: 'Уточнить программу размещения' },
  { id: 19, name: 'ПАО "РитейлГрупп"',            seg: 'Корпорат', aum: 5340000000,  commMTD: 1602000,  commPlan: 2100000,  lastTrade: '2026-06-11', nps: 7, npsPrev: 7, products: ['Продукт 2','Продукт 5','Продукт 4'], bday: null, action: 'Предложить Продукт 6' },
  { id: 20, name: 'АО "ГорноДобывающий Концерн"', seg: 'Корпорат', aum: 9900000000,  commMTD: 4950000,  commPlan: 5400000,  lastTrade: '2026-06-13', nps: 8, npsPrev: 9, products: ['Продукт 2','Продукт 5','Продукт 6'], bday: '2021-06-20', action: 'Годовщина партнёрства через 5 дней — позвонить' },
  { id: 21, name: 'ПАО "ПищепромХолдинг"',        seg: 'Корпорат', aum: 2520000000,  commMTD: 252000,   commPlan: 2100000,  lastTrade: '2026-05-08', nps: 5, npsPrev: 6, products: ['Продукт 1'], bday: null, action: 'СРОЧНО: детрактор + 1 продукт + 38 дней', restrictions: ['Санкции','Отзыв лицензии'] },
  { id: 22, name: 'АО "ЦифровыеРешения Холдинг"', seg: 'Корпорат', aum: 1680000000,  commMTD: 504000,   commPlan: 720000,   lastTrade: '2026-06-09', nps: 8, npsPrev: 7, products: ['Продукт 2','Продукт 1'], bday: null, action: 'Предложить Продукт 4', joinDate: '2026-05-12' },
  // Брокеры (8)
  { id: 23, name: 'ООО "АльфаБрокер"',            seg: 'Брокер',   aum: 1920000000,  commMTD: 960000,   commPlan: 1200000,  lastTrade: '2026-06-14', nps: 8, npsPrev: 8, products: ['Продукт 1','Продукт 2','Продукт 6'], bday: null, action: 'Расширить лимиты по продуктам' },
  { id: 24, name: 'АО "ПрофИнвест"',              seg: 'Брокер',   aum: 1400000000,  commMTD: 700000,   commPlan: 800000,   lastTrade: '2026-06-13', nps: 9, npsPrev: 9, products: ['Продукт 1','Продукт 2','Продукт 3','Продукт 6','Продукт 5'], bday: null, action: 'Поддерживающий контакт' },
  { id: 25, name: 'ООО "МаркетТрейд Секьюритиз"', seg: 'Брокер',   aum: 880000000,   commMTD: 264000,   commPlan: 800000,   lastTrade: '2026-05-25', nps: 7, npsPrev: 7, products: ['Продукт 1','Продукт 2'], bday: null, action: 'Предложить Продукт 6' },
  { id: 26, name: 'АО "СтратегияКапитал"',        seg: 'Брокер',   aum: 2080000000,  commMTD: 832000,   commPlan: 1000000,  lastTrade: '2026-06-12', nps: 8, npsPrev: 7, products: ['Продукт 1','Продукт 2','Продукт 3','Продукт 6'], bday: null, action: 'Расширить список продуктов' },
  { id: 27, name: 'ООО "ФинансПартнер"',          seg: 'Брокер',   aum: 600000000,   commMTD: 90000,    commPlan: 480000,   lastTrade: '2026-05-12', nps: 3, npsPrev: 5, products: ['Продукт 1'], bday: null, action: 'СРОЧНО: NPS=3 + 1 продукт + 34 дня' },
  { id: 28, name: 'АО "ЮнионСекьюритиз"',         seg: 'Брокер',   aum: 1240000000,  commMTD: 496000,   commPlan: 600000,   lastTrade: '2026-06-11', nps: 8, npsPrev: 8, products: ['Продукт 1','Продукт 2','Продукт 6'], bday: null, action: 'Обсудить комиссионные условия' },
  { id: 29, name: 'ООО "ВекторТрейд"',            seg: 'Брокер',   aum: 720000000,   commMTD: 72000,    commPlan: 400000,   lastTrade: '2026-05-01', nps: 6, npsPrev: 7, products: ['Продукт 2'], bday: '2023-06-17', action: 'СРОЧНО: детрактор + неактивен 45 дн + годовщина' },
  { id: 30, name: 'АО "ПремьерИнвест"',           seg: 'Брокер',   aum: 1680000000,  commMTD: 672000,   commPlan: 720000,   lastTrade: '2026-06-13', nps: 9, npsPrev: 9, products: ['Продукт 1','Продукт 2','Продукт 3','Продукт 6'], bday: null, action: 'Поддерживающий контакт', joinDate: '2026-04-05' },
];

export const heatDaysAgo = (ds: string | null): number => {
  if (!ds) return 999;
  return Math.floor((HEAT_TODAY.getTime() - new Date(ds).getTime()) / 86400000);
};

export const heatDaysToBday = (ds: string | null): number | null => {
  if (!ds) return null;
  const d = new Date(ds);
  const next = new Date(HEAT_TODAY.getFullYear(), d.getMonth(), d.getDate());
  if (next < HEAT_TODAY) next.setFullYear(HEAT_TODAY.getFullYear() + 1);
  return Math.floor((next.getTime() - HEAT_TODAY.getTime()) / 86400000);
};

export const heatFmt = (n: number): string => {
  if (n >= 1e9) return `${formatNumber(n / 1e9)} млрд ₽`;
  if (n >= 1e6) return `${formatNumber(n / 1e6)} млн ₽`;
  if (n >= 1e3) return `${formatNumber(n / 1e3)} тыс ₽`;
  return `${formatNumber(n)} ₽`;
};

export const getHeatAlerts = (c: HeatClient): HeatAlert[] => {
  const res: HeatAlert[] = [];
  const d = heatDaysAgo(c.lastTrade);
  const pct = (c.commMTD / c.commPlan) * 100;
  const bd = heatDaysToBday(c.bday);
  if (d >= 30) res.push({ type: 'danger', code: 'inactive', label: `Неактивен ${d} дн`, icon: '⏰' });
  else if (d >= 20) res.push({ type: 'warning', code: 'inactive', label: `Неактивен ${d} дн`, icon: '⏰' });
  if (c.nps <= 6) res.push({ type: 'danger', code: 'detractor', label: `NPS детрактор (${c.nps})`, icon: '😞' });
  if (c.nps < c.npsPrev) res.push({ type: 'warning', code: 'nps_drop', label: `NPS снизился (${c.npsPrev}→${c.nps})`, icon: '📉' });
  if (c.products.length === 1) res.push({ type: 'warning', code: 'single_product', label: 'Только 1 продукт', icon: '📦' });
  if (bd !== null && bd <= 7) res.push({ type: 'info', code: 'birthday', label: `День рождения ЛПР через ${bd} дн`, icon: '🎂' });
  if (pct < 50 && DAY_OF_MONTH >= 15) res.push({ type: 'danger', code: 'underplan', label: `${Math.round(pct)}% плана`, icon: '📊' });
  else if (pct < 70 && DAY_OF_MONTH >= 20) res.push({ type: 'warning', code: 'underplan', label: `${Math.round(pct)}% плана`, icon: '📊' });
  return res;
};

export const heatAlertScore = (c: HeatClient): number =>
  getHeatAlerts(c).reduce((s, a) => s + (a.type === 'danger' ? 10 : a.type === 'warning' ? 3 : 1), 0);
