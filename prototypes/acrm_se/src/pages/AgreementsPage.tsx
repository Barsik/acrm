import { Layout } from '../components/layout/Layout';
import { StatusBadge } from '../components/common';
import { agreementsService } from '../services';
import { FileText, AlertTriangle } from 'lucide-react';

export const AgreementsPage = () => {
  const agreements = agreementsService.getAll();
  const expiring = agreementsService.getExpiring();

  const typeLabels: Record<string, string> = {
    contract: 'Договор', tariff: 'Тариф', sla: 'SLA',
    key: 'Ключ СКЗИ', certificate: 'Сертификат', protocol: 'Протокол',
  };

  return (
    <Layout breadcrumbs={[{ label: 'Документы и договорённости' }]}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <FileText size={20} className="text-slate-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Документы и договорённости</h1>
      </div>

      {expiring.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-amber-900">Истекающие документы</div>
            <div className="text-xs text-amber-700 mt-1">{expiring.length} документа истекают в ближайшее время. Требуется действие.</div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Документ</th><th>Тип</th><th>Клиент</th>
              <th>Дата подписания</th><th>Дата окончания</th>
              <th>Ответственный</th><th>Статус</th><th></th>
            </tr>
          </thead>
          <tbody>
            {agreements.map(ag => (
              <tr key={ag.id} className={`hover:bg-slate-50 ${ag.status === 'expiring' ? 'bg-amber-50' : ''}`}>
                <td className="font-medium text-slate-900">{ag.title}</td>
                <td><span className="badge-gray text-xs">{typeLabels[ag.type]}</span></td>
                <td className="text-sm text-slate-600">{ag.entityName}</td>
                <td className="text-xs text-slate-500">{ag.signedDate}</td>
                <td className={`text-xs font-semibold ${ag.status === 'expiring' ? 'text-amber-600' : ag.status === 'expired' ? 'text-red-600' : 'text-slate-600'}`}>
                  {ag.expiresDate}
                </td>
                <td className="text-xs text-slate-500">{ag.responsible}</td>
                <td><StatusBadge status={ag.status} /></td>
                <td>
                  {ag.status === 'expiring' && (
                    <button className="text-xs text-amber-600 hover:text-amber-800 px-2 py-1 rounded border border-amber-200 hover:bg-amber-50">
                      Пролонгировать
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};
