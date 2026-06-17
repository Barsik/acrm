import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ScoreBadge, StatusBadge, TrendArrow } from '../components/common';
import { holdingService } from '../services';
import { formatRevenue, formatVolume } from '../data/mockData';
import { Building2, Filter, Search, ChevronRight } from 'lucide-react';

export const HoldingsListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [segFilter, setSegFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'revenue' | 'health' | 'risk'>('revenue');

  const all = holdingService.getAll();
  const filtered = all
    .filter(h =>
      (search === '' || h.name.toLowerCase().includes(search.toLowerCase()) || h.shortName.toLowerCase().includes(search.toLowerCase())) &&
      (segFilter === 'all' || h.segment === segFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'revenue') return b.revenueYTD - a.revenueYTD;
      if (sortBy === 'health') return b.healthScore - a.healthScore;
      return b.riskScore - a.riskScore;
    });

  return (
    <Layout breadcrumbs={[{ label: 'Холдинги' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Building2 size={20} className="text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Холдинги</h1>
          <p className="text-sm text-slate-500">Все холдинги в портфеле · {filtered.length} из {all.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden text-xs">
          {['all', 'STRATEGIC', 'PREMIUM', 'STANDARD'].map(s => (
            <button
              key={s}
              className={`px-3 py-2 font-medium transition-colors ${segFilter === s ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              onClick={() => setSegFilter(s)}
            >
              {s === 'all' ? 'Все' : s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Сортировка:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none"
          >
            <option value="revenue">По доходу</option>
            <option value="health">По Health Score</option>
            <option value="risk">По Risk Score</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Холдинг</th>
              <th>Сегмент</th>
              <th>Отрасль</th>
              <th>Доход YTD</th>
              <th>Тренд</th>
              <th>Оборот YTD</th>
              <th>Health</th>
              <th>Risk</th>
              <th>Growth</th>
              <th>Менеджер</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h, i) => (
              <tr
                key={h.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => navigate(`/holdings/${h.id}`)}
              >
                <td className="text-slate-400 font-mono text-xs w-8">{i + 1}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {h.shortName[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{h.name}</div>
                      <div className="text-xs text-slate-400">{h.companiesCount} компаний</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge-blue">{h.segment}</span></td>
                <td className="text-sm text-slate-600">{h.industry}</td>
                <td className="font-semibold">{formatRevenue(h.revenueYTD)}</td>
                <td><TrendArrow current={h.revenueYTD} prev={h.revenuePrevYTD} /></td>
                <td>{formatVolume(h.volumeYTD)}</td>
                <td><ScoreBadge score={h.healthScore} type="health" size="sm" showLabel={false} /></td>
                <td><ScoreBadge score={h.riskScore} type="risk" size="sm" showLabel={false} /></td>
                <td><ScoreBadge score={h.growthPotential} type="growth" size="sm" showLabel={false} /></td>
                <td className="text-xs text-slate-500">{h.managerName}</td>
                <td><StatusBadge status={h.activityStatus} /></td>
                <td><ChevronRight size={14} className="text-slate-300" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">Ничего не найдено</div>
        )}
        </div>
      </div>
    </Layout>
  );
};
