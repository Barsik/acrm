import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { clients as clientRecords } from '../data/mockDatabase';

export const ClientsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return clientRecords.filter((client) => {
      const name = client.name.toLowerCase();
      const inn = client.inn.toLowerCase();
      return name.includes(query) || inn.includes(query);
    });
  }, [searchQuery]);

  return (
    <Layout breadcrumbs={[{ label: 'Клиенты' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Users size={20} className="text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Клиенты</h1>
        </div>
      </div>

      <div className="mb-8 card p-4">
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm font-semibold text-slate-700">Поиск клиента</label>
          <div className="relative max-w-xl">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введите наименование компании или ИНН"
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {searchQuery.trim() && (
          <div>
            {searchResults.length === 0 ? (
              <div className="text-sm text-slate-500">Ничего не найдено</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {searchResults.map((client) => (
                  <Link
                    key={client.id}
                    to={`/clients/${client.id}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="font-semibold text-slate-900">{client.name}</div>
                    <div className="text-sm text-slate-500 mt-1">ИНН: {client.inn}</div>
                    <div className="mt-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${client.status === 'Активный' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>
                        {client.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </Layout>
  );
};
