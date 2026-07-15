import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { personService } from '../services';
import { clientPathFor } from '../data/entityToClient';
import { Search, Users, ChevronRight } from 'lucide-react';

const influenceColors: Record<string, string> = {
  very_high: 'badge-purple', high: 'badge-blue', medium: 'badge-amber', low: 'badge-gray',
};
const influenceLabels: Record<string, string> = {
  very_high: 'Очень высокое', high: 'Высокое', medium: 'Среднее', low: 'Низкое',
};
const roleLabels: Record<string, string> = {
  decision_maker: 'Decision Maker', influencer: 'Influencer',
  sponsor: 'Sponsor', user: 'User', gatekeeper: 'Gatekeeper',
};

export const PersonsListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const all = personService.getAll();
  const filtered = all.filter(p =>
    search === '' ||
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout breadcrumbs={[{ label: 'Персоны' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <Users size={20} className="text-violet-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Персоны 360</h1>
          <p className="text-sm text-slate-500">Представители клиентов · {filtered.length} контактов</p>
        </div>
      </div>

      <div className="relative max-w-sm mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Поиск по ФИО или компании..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Персона</th><th>Компания</th><th>Холдинг</th><th>Роль</th>
              <th>Влияние</th><th>VIP Score</th><th>Последний контакт</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr
                key={p.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => navigate(`/persons/${p.id}`)}
              >
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{p.fullName}</div>
                      <div className="text-xs text-slate-400">{p.title}</div>
                    </div>
                  </div>
                </td>
                <td>
                  {clientPathFor(p.companyId, p.companyName) ? (
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={(e) => { e.stopPropagation(); navigate(clientPathFor(p.companyId, p.companyName)!); }}
                    >
                      {p.companyName}
                    </button>
                  ) : (
                    <span className="text-sm text-slate-600">{p.companyName}</span>
                  )}
                </td>
                <td>
                  {clientPathFor(p.holdingId, p.holdingName) ? (
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={(e) => { e.stopPropagation(); navigate(clientPathFor(p.holdingId, p.holdingName)!); }}
                    >
                      {p.holdingName}
                    </button>
                  ) : (
                    <span className="text-sm text-slate-500">{p.holdingName}</span>
                  )}
                </td>
                <td><span className="badge-blue text-xs">{roleLabels[p.personRole]}</span></td>
                <td><span className={influenceColors[p.influenceLevel]}>{influenceLabels[p.influenceLevel]}</span></td>
                <td>
                  <div className="flex items-center gap-1">
                    <div className="w-12 bg-slate-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${p.vipScore >= 80 ? 'bg-violet-500' : p.vipScore >= 60 ? 'bg-blue-500' : 'bg-slate-400'}`} style={{ width: `${p.vipScore}%` }} />
                    </div>
                    <span className="text-xs font-semibold">{p.vipScore}</span>
                  </div>
                </td>
                <td className="text-xs text-slate-500">{p.lastContact}</td>
                <td><ChevronRight size={14} className="text-slate-300" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};
