// Рэнкинг клиентов по рынкам (для страницы «Клиенты», нижняя панель).
// Прототипные данные: общий рэнкинг + позиция в выбранном рынке.
import type { ClientGroup } from './mockDatabase';

export type RankMarketKey = 'fx' | 'money' | 'commodity';

export const RANK_MARKETS: { key: RankMarketKey; label: string; full: string }[] = [
  { key: 'fx', label: 'Валютный', full: 'Валютный рынок' },
  { key: 'money', label: 'Денежный', full: 'Денежный рынок' },
  { key: 'commodity', label: 'Драг мет.', full: 'Рынок драгметаллов' },
];

export type RankSegment = 'STRATEGIC' | 'PREMIUM' | 'STANDARD';

export interface ClientRankRow {
  id: string;
  name: string;
  logo?: string;
  tags?: string[];
  group: ClientGroup;
  segment: RankSegment;
  // Общий рэнкинг (правый блок) — не зависит от выбранного рынка.
  overallRank: number;
  overallDelta: number;     // изменение позиции: <0 — рост (зелёный), >0 — падение (красный)
  commission2026: string;
  clientsActive: string;
  clientsTotal: string;
  marketShare: string;
  volumeYoY: number;        // общий объём г/г, %
  // Позиция в каждом рынке (левый блок) — зависит от переключателя рынка.
  byMarket: Record<RankMarketKey, { rank: number; volYoY: number }>;
}

export const clientRanking: ClientRankRow[] = [
  {
    id: 'r-rosneft',
    name: 'АО «Роснефть»',
    logo: 'https://companieslogo.com/img/orig/ROSN.ME-c66170da.png?t=1720244493',
    group: 'Корпорат',
    segment: 'STRATEGIC',
    overallRank: 1,
    overallDelta: -1,
    commission2026: '12,1 млрд',
    clientsActive: '3,4 млн акт.',
    clientsTotal: '11,2 млн всего',
    marketShare: '14%',
    volumeYoY: 8,
    byMarket: { fx: { rank: 2, volYoY: 312 }, money: { rank: 3, volYoY: 120 }, commodity: { rank: 5, volYoY: 60 } },
  },
  {
    id: 'r-sber',
    name: 'ПАО «Сбербанк»',
    logo: 'https://free-png.ru/wp-content/uploads/2020/09/icon_sber-01-370x370.png',
    tags: ['Банк', 'TOP 12', 'Розничный > 1 млн.'],
    group: 'Банк',
    segment: 'STRATEGIC',
    overallRank: 3,
    overallDelta: 1,
    commission2026: '8,2 млрд',
    clientsActive: '2,1 млн акт.',
    clientsTotal: '8,3 млн всего',
    marketShare: '9%',
    volumeYoY: 31,
    byMarket: { fx: { rank: 7, volYoY: 45 }, money: { rank: 1, volYoY: 22 }, commodity: { rank: 8, volYoY: -5 } },
  },
  {
    id: 'r-gazprom',
    name: 'ПАО «Газпром»',
    logo: 'https://companieslogo.com/img/orig/GAZP.ME-56a2073a.png?t=1720244492',
    group: 'Корпорат',
    segment: 'PREMIUM',
    overallRank: 5,
    overallDelta: 2,
    commission2026: '5 млрд',
    clientsActive: '1 млн акт.',
    clientsTotal: '4,5 млн всего',
    marketShare: '5%',
    volumeYoY: 19,
    byMarket: { fx: { rank: 4, volYoY: 258 }, money: { rank: 6, volYoY: 88 }, commodity: { rank: 2, volYoY: 140 } },
  },
  {
    id: 'r-nornickel',
    name: 'ПАО «Норникель»',
    logo: 'https://companieslogo.com/img/orig/GMKN.ME-4b392c20.png?t=1720244492',
    group: 'Корпорат',
    segment: 'PREMIUM',
    overallRank: 9,
    overallDelta: 0,
    commission2026: '3,8 млрд',
    clientsActive: '0,7 млн акт.',
    clientsTotal: '2,9 млн всего',
    marketShare: '3.5%',
    volumeYoY: -4,
    byMarket: { fx: { rank: 11, volYoY: -12 }, money: { rank: 14, volYoY: -8 }, commodity: { rank: 1, volYoY: 210 } },
  },
];
