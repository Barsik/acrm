import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { SectionHeader } from '../components/common';
import { cohortsService } from '../services';
import { formatRevenue, formatVolume } from '../data/mockData';
import { Target, Plus, Download, Filter, Save } from 'lucide-react';

export const CohortsPage = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const cohorts = cohortsService.getAll();

  return (
    <Layout breadcrumbs={[{ label: 'Когорты и сегменты' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <Target size={20} className="text-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Когорты и сегменты</h1>
          <p className="text-sm text-slate-500">Конструктор когорт · Группировка клиентов по критериям</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="btn-secondary text-sm" onClick={() => setShowBuilder(!showBuilder)}>
            <Filter size={14} /> {showBuilder ? 'Скрыть конструктор' : 'Конструктор когорт'}
          </button>
          <button className="btn-primary text-sm"><Plus size={14} /> Новая когорта</button>
        </div>
      </div>

      {/* Builder */}
      {showBuilder && (
        <div className="card p-5 mb-6">
          <SectionHeader title="Конструктор когорт" subtitle="Задайте критерии для формирования выборки клиентов" />
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Сегмент', options: ['STRATEGIC', 'PREMIUM', 'STANDARD', 'SME'] },
              { label: 'Категория', options: ['BROKER', 'BANK', 'INSURANCE', 'PENSION_FUND', 'CORPORATION'] },
              { label: 'Статус активности', options: ['active', 'declining', 'inactive'] },
              { label: 'Рынок', options: ['Фондовый', 'Срочный', 'Валютный', 'Денежный', 'Товарный'] },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1">{f.label}</label>
                <select className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Все</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1">Доход YTD от (млн ₽)</label>
              <input type="number" placeholder="0" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1">Risk Score до</label>
              <input type="number" placeholder="100" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1">Менеджер</label>
              <select className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Все менеджеры</option>
                <option>Алексей Воронов</option>
                <option>Мария Соколова</option>
                <option>Дмитрий Козлов</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn-primary text-xs"><Filter size={13} /> Применить фильтры</button>
            <button className="btn-secondary text-xs"><Save size={13} /> Сохранить когорту</button>
            <button className="btn-secondary text-xs"><Download size={13} /> Экспортировать</button>
            <button className="btn-secondary text-xs ml-auto">Передать список менеджерам →</button>
          </div>
        </div>
      )}

      {/* Saved cohorts */}
      <div className="space-y-4">
        <h2 className="section-title">Сохранённые когорты</h2>
        {cohorts.map(c => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{c.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{c.description}</p>
                <div className="text-xs text-slate-400 mt-1">Создана: {c.createdBy} · {c.createdAt}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-blue">{c.clientsCount} клиентов</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 py-3 border-t border-b border-slate-100 mb-3">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-0.5">Клиентов</div>
                <div className="text-lg font-bold text-slate-900">{c.clientsCount}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-0.5">Средний доход</div>
                <div className="text-lg font-bold text-slate-900">{formatRevenue(c.avgRevenue)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-0.5">Средний оборот</div>
                <div className="text-lg font-bold text-slate-900">{formatVolume(c.avgVolume)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-0.5">Критерии</div>
                <div className="text-sm font-medium text-slate-700">
                  {Object.keys(c.criteria).filter(k => (c.criteria as any)[k]).length} фильтров
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn-secondary text-xs">Открыть когорту</button>
              <button className="btn-secondary text-xs">Сравнить</button>
              <button className="btn-primary text-xs">Сформировать кампанию</button>
              <button className="btn-secondary text-xs ml-auto"><Download size={13} /> Экспорт</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};
