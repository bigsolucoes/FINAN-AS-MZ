import React, { useState, useCallback, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Job, JobStatus, Client } from '../types';
import { 
    KANBAN_COLUMNS, PlusCircleIcon, PageTrashIcon, BriefcaseIcon, 
    ListBulletIcon, ArchiveIcon, CurrencyDollarIcon // Corrected from DollarSignIcon
} from '../constants';
import Modal from '../components/Modal';
import JobForm from './forms/JobForm';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/formatters';
import JobListTableView from '../components/JobListTableView';
import PaymentRegistrationModal from '../components/modals/PaymentRegistrationModal';
import JobDetailsPanel from '../components/JobDetailsPanel'; 
import TrashModal from '../components/modals/TrashModal'; 
import { useNavigate } from 'react-router-dom';


const JobCard: React.FC<{ 
  job: Job; 
  client?: Client; 
  onClick: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
  isDraggable: boolean;
}> = 
  ({ job, client, onClick, onDragStart, isDraggable }) => {
  const { settings } = useAppData();
  const today = new Date();
  today.setHours(0,0,0,0);
  const deadlineDate = new Date(job.deadline);
  deadlineDate.setHours(0,0,0,0);

  const isOverdue = deadlineDate < today && job.status !== JobStatus.PAID && job.status !== JobStatus.FINALIZED;
  
  return (
    <div 
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart(e, job.id)}
      onClick={onClick}
      className={`p-4 mb-3 rounded-lg shadow-md border border-yellow-200 
                  bg-yellow-50 hover:shadow-lg transition-all duration-200 cursor-pointer 
                  ${isDraggable ? 'active:cursor-grabbing' : 'opacity-80'}`}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-md text-gray-800 mb-1">{job.name}</h4>
        {job.isPrePaid && (
          <span title="Pagamento antecipado registrado">
            <CurrencyDollarIcon className="text-green-500 w-4 h-4 flex-shrink-0" />
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600 mb-1">{client?.name || 'Cliente não encontrado'}</p>
      <p className="text-xs text-gray-600 mb-2">Valor: {formatCurrency(job.value, settings.privacyModeEnabled)}</p>
      <div className={`text-xs px-2 py-0.5 inline-block rounded-full mb-2 ${
        isOverdue ? 'bg-red-100 text-red-700' : `bg-blue-100 text-accent`
      }`}>
        Prazo: {formatDate(job.deadline)} {isOverdue && '(Atrasado)'}
      </div>
      <p className="text-xs text-gray-500">Tipo: {job.serviceType}</p>
    </div>
  );
};

const KanbanColumn: React.FC<{ 
  title: string; 
  status: JobStatus | 'UNCATEGORIZED_COLUMN'; 
  jobsInColumn: Job[]; 
  clients: Client[]; 
  onJobCardClick: (job: Job) => void; 
  onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetStatus: JobStatus | 'UNCATEGORIZED_COLUMN') => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}> = ({ title, status, jobsInColumn, clients, onJobCardClick, onDragStart, onDrop, onDragOver }) => {
  
  const isPaidColumnTarget = status === JobStatus.PAID;

  return (
    <div 
      className={`bg-slate-100 p-4 rounded-lg w-80 flex-shrink-0 min-h-[calc(100vh-250px)] 
                  ${isPaidColumnTarget ? 'border-2 border-dashed border-green-500 bg-green-50' : ''}`} 
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <h3 className={`font-semibold text-lg text-text-primary mb-4 sticky top-0 py-2 z-10 
                      ${isPaidColumnTarget ? 'bg-green-50' : 'bg-slate-100'}`}>{title} ({jobsInColumn.length})</h3>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-310px)]"> 
        {jobsInColumn.length > 0 ? jobsInColumn.map(job => (
          <JobCard 
            key={job.id} 
            job={job} 
            client={clients.find(c => c.id === job.clientId)} 
            onClick={() => onJobCardClick(job)}
            onDragStart={onDragStart}
            isDraggable={true}
          />
        )) : <p className="text-sm text-text-secondary text-center py-4">Nenhum job nesta etapa.</p>}
      </div>
    </div>
  );
};

type ViewMode = 'kanban' | 'list';
const UNCATEGORIZED_COLUMN_ID = 'UNCATEGORIZED_COLUMN' as const;


const JobsPage: React.FC = () => {
  const { jobs, clients, updateJob, deleteJob, settings, loading } = useAppData();
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ViewMode>('kanban');
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [jobForPaymentModal, setJobForPaymentModal] = useState<Job | undefined>(undefined);

  const [selectedJobForPanel, setSelectedJobForPanel] = useState<Job | undefined>(undefined);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const navigate = useNavigate();

  const activeJobs = useMemo(() => {
    return jobs.filter(job => !job.isDeleted && job.status !== JobStatus.PAID);
  }, [jobs]);

  const handleAddJob = () => {
    setEditingJob(undefined);
    setFormModalOpen(true);
  };

  const handleEditJobFromPanel = (job: Job) => {
    setEditingJob(job);
    setIsDetailsPanelOpen(false); 
    setFormModalOpen(true); 
  };

  const handleDeleteJobFromPanel = (jobId: string) => {
    if (window.confirm('Tem certeza que deseja mover este job para a lixeira?')) {
      deleteJob(jobId); 
      toast.success('Job movido para a lixeira!');
      setIsDetailsPanelOpen(false);
    }
  };

  const handleFormSuccess = () => {
    setFormModalOpen(false);
    setEditingJob(undefined);
    if(selectedJobForPanel){ 
        const updatedJob = jobs.find(j => j.id === selectedJobForPanel.id);
        if(updatedJob && !updatedJob.isDeleted && updatedJob.status !== JobStatus.PAID){
            setSelectedJobForPanel(updatedJob);
            setIsDetailsPanelOpen(true);
        } else {
            setIsDetailsPanelOpen(false); 
        }
    }
  };
  
  const onDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, jobId: string) => {
    e.dataTransfer.setData('jobId', jobId);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetStatusValue: JobStatus | typeof UNCATEGORIZED_COLUMN_ID) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    const jobToMove = jobs.find(j => j.id === jobId);

    if (jobToMove && !jobToMove.isDeleted && jobToMove.status !== JobStatus.PAID) {
      if (targetStatusValue === JobStatus.PAID) {
        if (jobToMove.isPrePaid) {
          updateJob({ 
            ...jobToMove, 
            status: JobStatus.PAID, 
            paidAt: new Date().toISOString(), // Mark as officially paid now
          });
          toast.success(`Job "${jobToMove.name}" (pré-pago) arquivado.`);
          if (jobToMove.id === selectedJobForPanel?.id) {
            setIsDetailsPanelOpen(false);
          }
        } else {
          setJobForPaymentModal(jobToMove);
          setPaymentModalOpen(true);
        }
      } else {
        let finalStatus: JobStatus = targetStatusValue === UNCATEGORIZED_COLUMN_ID ? JobStatus.BRIEFING : targetStatusValue as JobStatus;
        let targetColumnName = KANBAN_COLUMNS.find(col => col.status === finalStatus)?.title || "Não Categorizado";
        
        if (jobToMove.status !== finalStatus) {
          updateJob({ ...jobToMove, status: finalStatus });
          toast.success(`Job "${jobToMove.name}" movido para ${targetColumnName}!`);
        }
      }
    }
  }, [jobs, updateJob, selectedJobForPanel?.id]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
  }, []);

  const handlePaymentModalSuccess = () => {
    setPaymentModalOpen(false);
    toast.success('Pagamento registrado! Job movido para Financeiro/Arquivo.');
    if (jobForPaymentModal?.id === selectedJobForPanel?.id) {
        setIsDetailsPanelOpen(false); 
    }
    setJobForPaymentModal(undefined);
  };

  const handleRegisterPrePaymentSuccess = (updatedJob: Job) => {
    if (selectedJobForPanel?.id === updatedJob.id) {
        setSelectedJobForPanel(updatedJob); // Refresh panel with pre-paid status
    }
    toast.success('Pagamento antecipado registrado!');
  };

  const handleJobCardClick = (job: Job) => {
    setSelectedJobForPanel(job);
    setIsDetailsPanelOpen(true);
  };
  
  const handleCloseDetailsPanel = () => {
    setIsDetailsPanelOpen(false);
    setSelectedJobForPanel(undefined);
  };


  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  const standardStatuses = KANBAN_COLUMNS.map(col => col.status).filter(s => s !== JobStatus.PAID); 
  const uncategorizedActiveJobs = activeJobs.filter(job => !standardStatuses.includes(job.status));

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-text-primary">Gerenciamento de Jobs</h1>
        <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 p-1 bg-slate-200 rounded-lg">
            <button
                onClick={() => setCurrentView('kanban')}
                title="Visualização Kanban"
                className={`p-2 rounded-md transition-colors filter hover:brightness-100 ${currentView === 'kanban' ? 'bg-accent text-white shadow-sm' : 'hover:bg-slate-300'}`}
            >
                <BriefcaseIcon size={20} />
            </button>
            <button
                onClick={() => setCurrentView('list')}
                title="Visualização Lista Geral"
                className={`p-2 rounded-md transition-colors filter hover:brightness-100 ${currentView === 'list' ? 'bg-accent text-white shadow-sm' : 'hover:bg-slate-300'}`}
            >
                <ListBulletIcon size={20} />
            </button>
            </div>
            <button
            onClick={handleAddJob}
            className="bg-accent text-white px-4 py-2 rounded-lg shadow hover:brightness-90 transition-all flex items-center"
            >
            <PlusCircleIcon size={20} /> <span className="ml-2">Adicionar Job</span>
            </button>
        </div>
      </div>

      {currentView === 'kanban' ? (
        <div className="flex-grow overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max">
            {KANBAN_COLUMNS.map(column => (
              <KanbanColumn
                key={column.id}
                title={column.title}
                status={column.status}
                jobsInColumn={column.status === JobStatus.PAID ? [] : activeJobs.filter(job => job.status === column.status)}
                clients={clients}
                onJobCardClick={handleJobCardClick}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onDragOver={onDragOver}
              />
            ))}
            <KanbanColumn
                key={UNCATEGORIZED_COLUMN_ID}
                title="Não Categorizado"
                status={UNCATEGORIZED_COLUMN_ID}
                jobsInColumn={uncategorizedActiveJobs}
                clients={clients}
                onJobCardClick={handleJobCardClick}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onDragOver={onDragOver}
            />
          </div>
        </div>
      ) : (
        <JobListTableView 
            jobs={activeJobs} 
            clients={clients} 
            onEditJob={(job) => { 
                setEditingJob(job);
                setFormModalOpen(true);
            }}
            onDeleteJob={(jobId) => { 
                 if (window.confirm('Tem certeza que deseja mover este job para a lixeira?')) {
                    deleteJob(jobId);
                    toast.success('Job movido para a lixeira!');
                }
            }}
            privacyModeEnabled={settings.privacyModeEnabled || false}
        />
      )}

      {/* Modals and Panels */}
      <Modal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} title={editingJob ? 'Editar Job' : 'Adicionar Novo Job'} size="lg">
        <JobForm onSuccess={handleFormSuccess} jobToEdit={editingJob} />
      </Modal>

      {jobForPaymentModal && (
        <PaymentRegistrationModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setJobForPaymentModal(undefined); 
          }}
          job={jobForPaymentModal}
          onSuccess={handlePaymentModalSuccess}
        />
      )}

      {selectedJobForPanel && (
        <JobDetailsPanel
            job={selectedJobForPanel}
            client={clients.find(c => c.id === selectedJobForPanel.clientId)}
            isOpen={isDetailsPanelOpen}
            onClose={handleCloseDetailsPanel}
            onEdit={handleEditJobFromPanel}
            onDelete={handleDeleteJobFromPanel} 
            onRegisterPayment={() => {
                setJobForPaymentModal(selectedJobForPanel);
                setIsDetailsPanelOpen(false); 
                setPaymentModalOpen(true);
            }}
            onRegisterPrePayment={handleRegisterPrePaymentSuccess} // New prop
        />
      )}
      
      <Modal isOpen={isTrashModalOpen} onClose={() => setIsTrashModalOpen(false)} title="Lixeira de Jobs" size="xl">
        <TrashModal onClose={() => setIsTrashModalOpen(false)} />
      </Modal>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        <button
          onClick={() => navigate('/archive')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
          title="Abrir Arquivo Morto"
        >
          <ArchiveIcon size={24}/>
        </button>
        <button
          onClick={() => setIsTrashModalOpen(true)}
          className="bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
          title="Abrir Lixeira"
        >
          <PageTrashIcon size={24}/>
        </button>
      </div>
    </div>
  );
};

export default JobsPage;