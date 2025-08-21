
import React from 'react';
import { useAppData } from '../hooks/useAppData';
import { Job, Client, JobStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArchiveIcon } from '../constants'; // Page icon

const ArchivePage: React.FC = () => {
  const { jobs, clients, settings, loading } = useAppData();

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  const archivedJobs = jobs
    .filter(job => job.status === JobStatus.PAID && !job.isDeleted)
    .sort((a, b) => {
        try { // Sort by payment date, most recent first
            const dateA = new Date(a.paymentDate || a.paidAt || 0).getTime();
            const dateB = new Date(b.paymentDate || b.paidAt || 0).getTime();
            return dateB - dateA;
        } catch { return 0; }
    });

  return (
    <div>
      <div className="flex items-center mb-6">
        <ArchiveIcon size={32} className="text-accent mr-3" />
        <h1 className="text-3xl font-bold text-text-primary">Arquivo Morto</h1>
      </div>
      
      <p className="text-text-secondary mb-6">
        Esta seção lista todos os jobs que foram concluídos e marcados como pagos.
      </p>

      {archivedJobs.length === 0 ? (
        <div className="text-center py-10 bg-card-bg rounded-xl shadow">
          <ArchiveIcon size={48} className="text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-text-secondary">Nenhum job arquivado ainda.</p>
          <p className="mt-2 text-text-secondary">Jobs movidos para a coluna "Pago" aparecerão aqui.</p>
        </div>
      ) : (
        <div className="bg-card-bg shadow-lg rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Nome do Job</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Data Pagamento</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tipo Serviço</th>
                </tr>
              </thead>
              <tbody className="bg-card-bg divide-y divide-border-color">
                {archivedJobs.map((job) => {
                  const client = clients.find(c => c.id === job.clientId);
                  return (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{job.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{client?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatCurrency(job.value, settings.privacyModeEnabled)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatDate(job.paymentDate || job.paidAt, { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{job.serviceType}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivePage;
