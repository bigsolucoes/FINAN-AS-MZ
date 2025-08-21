
import React from 'react';
import { Case, Client, Task, TaskStatus, CaseStatus } from '../types';
import { Clock } from 'lucide-react';
import { PencilIcon, TrashIcon, TaskIcon as CheckCircle, ArchiveIcon, RestoreIcon } from '../constants';
import { formatCurrency, formatDate } from '../utils/formatters';

interface CaseCardProps {
  caseData: Case;
  client?: Client;
  tasks: Task[];
  onView: (caseData: Case) => void;
  onEdit: (caseData: Case) => void;
  onSoftDelete: (caseId: string) => void;
  onToggleArchive: (caseId: string) => void;
  onRestore: (caseId: string) => void;
  onPermanentDelete: (caseId: string) => void;
  isArchivedView: boolean;
}

const getStatusClass = (status: CaseStatus) => {
  switch (status) {
    case CaseStatus.ATIVO: return 'bg-blue-100 text-blue-800';
    case CaseStatus.SUSPENSO: return 'bg-yellow-100 text-yellow-800';
    case CaseStatus.ENCERRADO_EXITO: return 'bg-green-100 text-green-800';
    case CaseStatus.ENCERRADO_SEM_EXITO: return 'bg-red-100 text-red-800';
    case CaseStatus.ARQUIVADO: return 'bg-slate-100 text-slate-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const CaseCard: React.FC<CaseCardProps> = ({ caseData, client, tasks, onView, onEdit, onSoftDelete, onToggleArchive, onRestore, onPermanentDelete, isArchivedView }) => {
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.CONCLUIDA);
  const completedTasks = tasks.filter(t => t.status === TaskStatus.CONCLUIDA);
  const cardIsClickable = !isArchivedView;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Prevent click-through from buttons
      if ((e.target as HTMLElement).closest('button')) return;
      if (cardIsClickable) onView(caseData);
  }

  return (
    <div 
        onClick={handleCardClick}
        className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between ${cardIsClickable ? 'cursor-pointer' : ''}`}
    >
      <div>
        <div className="flex justify-between items-start">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(caseData.status)}`}>
            {caseData.status}
          </span>
          <div className="flex space-x-2 flex-shrink-0">
            {caseData.isDeleted ? (
                 <>
                    <button onClick={() => onRestore(caseData.id)} className="text-green-500 hover:text-green-700 p-1" title="Restaurar Processo"><RestoreIcon size={18} /></button>
                    <button onClick={() => onPermanentDelete(caseData.id)} className="text-red-500 hover:text-red-700 p-1" title="Excluir Permanentemente"><TrashIcon size={18} /></button>
                 </>
            ) : (
                <>
                    <button onClick={() => onToggleArchive(caseData.id)} className="text-slate-500 hover:text-blue-600 p-1" title={caseData.isArchived ? "Desarquivar" : "Arquivar"}><ArchiveIcon size={18} /></button>
                    <button onClick={() => onEdit(caseData)} className="text-slate-500 hover:text-blue-600 p-1" title="Editar Processo"><PencilIcon size={18} /></button>
                    <button onClick={() => onSoftDelete(caseData.id)} className="text-slate-500 hover:text-red-500 p-1" title="Mover para Lixeira"><TrashIcon size={18} /></button>
                </>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-slate-800 mt-2">{caseData.name}</h3>
        <p className="text-sm text-slate-500">{client?.name || 'Cliente não encontrado'}</p>
        <p className="text-xs text-slate-400 mt-1">Nº: {caseData.caseNumber || 'N/A'}</p>

        <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-slate-700 mb-2">Tarefas Vinculadas ({tasks.length})</h4>
            {tasks.length > 0 ? (
                <div className="space-y-1 max-h-28 overflow-y-auto pr-2">
                    {pendingTasks.map(task => (
                        <div key={task.id} className="flex items-center text-sm text-yellow-700">
                            <Clock size={14} className="mr-2 flex-shrink-0"/>
                            <span className="truncate" title={task.title}>{task.title}</span>
                        </div>
                    ))}
                    {completedTasks.map(task => (
                        <div key={task.id} className="flex items-center text-sm text-green-700">
                            <CheckCircle size={14} className="mr-2 flex-shrink-0"/>
                            <span className="truncate line-through" title={task.title}>{task.title}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500">Nenhuma tarefa vinculada.</p>
            )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600">
        <p>Área: {caseData.caseType}</p>
        <p>Responsável: {caseData.responsibleLawyers.join(', ')}</p>
      </div>
    </div>
  );
};

export default CaseCard;
