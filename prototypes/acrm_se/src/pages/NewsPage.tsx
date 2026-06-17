import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { newsService } from '../services';
import { Globe } from 'lucide-react';

export const NewsPage = () => {
  const navigate = useNavigate();
  const news = newsService.getAll();
  return (
    <Layout breadcrumbs={[{ label: 'Новости и события' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Globe size={20} className="text-blue-700" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Новости и бизнес-сигналы</h1>
      </div>
      <div className="space-y-4">
        {news.map(n => (
          <div key={n.id} className={`bg-white rounded-xl border p-5 shadow-sm ${n.sentiment === 'negative' ? 'border-red-200' : n.sentiment === 'positive' ? 'border-green-200' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${n.sentiment === 'negative' ? 'bg-red-100 text-red-700' : n.sentiment === 'positive' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {n.sentiment === 'negative' ? '↓ Негативный' : n.sentiment === 'positive' ? '↑ Позитивный' : 'Нейтральный'}
              </span>
              <span className="text-xs text-slate-400">{n.source} · {n.date}</span>
              <span className="text-xs font-semibold text-slate-500 ml-auto">{n.category}</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">{n.title}</h3>
            <p className="text-sm text-slate-600">{n.summary}</p>
            {n.entityIds.length > 0 && (
              <div className="flex gap-2 mt-3">
                {n.entityIds.map(eid => (
                  <button
                    key={eid}
                    className="badge-blue text-xs cursor-pointer hover:bg-blue-200"
                    onClick={() => navigate(`/holdings/${eid}`)}
                  >
                    Перейти к клиенту
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};
