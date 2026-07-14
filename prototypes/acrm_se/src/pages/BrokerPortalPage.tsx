import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BarChart3, Building2, LogOut, ShieldCheck } from 'lucide-react';
import { BrokerPortfolioView, BrokerRankingView } from '../components/broker-analytics/BrokerAnalytics';

type PortalTab = 'ranking' | 'portfolio';

export const BrokerPortalPage = () => {
  const { companyId = 'c4' } = useParams<{ companyId: string }>();
  const [tab, setTab] = useState<PortalTab>('ranking');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-8 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white"><BarChart3 size={20} /></div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">Аналитика для брокеров</div>
            <div className="text-xs text-slate-500">Московская Биржа · Альфа-Банк</div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex"><ShieldCheck size={14} />Защищённый кабинет</span>
          <Link to={`/companies/${companyId}?tab=ranking`} className="btn-secondary text-xs"><Building2 size={14} />CRM-режим</Link>
          <button className="btn-secondary text-xs"><LogOut size={14} />Выйти</button>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-8 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-900">Аналитика Альфа-Банка</h1>
          <p className="mt-1 text-sm text-slate-500">Позиция на рынке, динамика и точки роста портфеля</p>
        </div>
        <div className="mb-5 flex border-b border-slate-200">
          <button className={`tab-button ${tab === 'ranking' ? 'active' : ''}`} onClick={() => setTab('ranking')}>Рейтинг</button>
          <button className={`tab-button ${tab === 'portfolio' ? 'active' : ''}`} onClick={() => setTab('portfolio')}>Аналитика портфеля</button>
        </div>
        {tab === 'ranking'
          ? <BrokerRankingView companyId={companyId} audience="broker" />
          : <BrokerPortfolioView audience="broker" />}
      </main>
    </div>
  );
};
