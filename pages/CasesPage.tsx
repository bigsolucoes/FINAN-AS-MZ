

import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Case, Client, CaseStatus, Task } from '../types';
import { PlusCircleIcon, TrashIcon, ArchiveFolderIcon } from '../constants';
import Modal from '../components/Modal';
import CaseForm from './forms/CaseForm';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import CaseCard from '../components/CaseCard';
import { Link, useParams } from 'react-router-dom';
import { formatDate } from '../utils/formatters';

const CasesPage: React.FC = () => {
    const { cases, clients, tasks, softDeleteCase, restoreCase, toggleCaseArchive, permanentlyDeleteCase, loading } = useAppData();
    const { view } = useParams<{ view: 'lixeira' | 'arquivados' }>();

    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<Case | undefined>(undefined);

    const activeCases = useMemo(() => cases.filter(c => !c.isDeleted && !c.isArchived), [cases]);
    const trashedCases = useMemo(() => cases.filter(c => c.isDeleted), [cases]);
    const archivedCases = useMemo(() => cases.filter(c => !c.isDeleted && c.isArchived), [cases]);

    const casesToDisplay = view === 'lixeira' ? trashedCases : view === 'arquivados' ? archivedCases : activeCases;
    const pageTitle = view === 'lixeira' ? 'Lixeira de Processos' : view === 'arquivados' ? 'Processos Arquivados' : 'Gerenciamento de Processos';

    const handleAddCase = () => {
        setSelectedCase(undefined);
        setFormModalOpen(true);
    };

    const handleEditCase = (caseToEdit: Case) => {
        setSelectedCase(caseToEdit);
        setDetailsModalOpen(false); // Close details if open
        setFormModalOpen(true);
    };

    const handleViewCase = (caseToView: Case) => {
        setSelectedCase(caseToView);
        setDetailsModalOpen(true);
    }
    
    const handleSoftDelete = (caseId: string) => {
        if (window.confirm('Tem certeza que deseja mover este processo para a lixeira?')) {
            softDeleteCase(caseId);
            toast.success('Processo movido para a lixeira!');
            if (selectedCase?.id === caseId) setDetailsModalOpen(false);
        }
    };
    
    const handlePermanentDelete = (caseId: string) => {
        if (window.confirm('Esta ação é irreversível. Deseja excluir permanentemente este processo?')) {
            permanentlyDeleteCase(caseId);
            toast.success('Processo excluído permanentemente.');
            if (selectedCase?.id === caseId) setDetailsModalOpen(false);
        }
    }

    const handleRestore = (caseId: string) => {
        restoreCase(caseId);
        toast.success('Processo restaurado!');
    }

    const handleToggleArchive = (caseId: string) => {
        toggleCaseArchive(caseId);
        toast.success('Status de arquivamento do processo alterado!');
    }

    const handleFormSuccess = () => {
        setFormModalOpen(false);
        setSelectedCase(undefined);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    }

    return(
        <div className="h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">{pageTitle}</h1>
                 <div className="flex items-center space-x-3">
                    <Link to="/processos/lixeira" className={`flex items-center space-x-1.5 text-sm p-2 rounded-lg ${view === 'lixeira' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><TrashIcon size={16}/><span>Lixeira</span></Link>
                    <Link to="/processos/arquivados" className={`flex items-center space-x-1.5 text-sm p-2 rounded-lg ${view === 'arquivados' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><ArchiveFolderIcon size={16}/><span>Arquivados</span></Link>
                    <button
                        onClick={handleAddCase}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all flex items-center"
                    >
                        <PlusCircleIcon size={20} /> <span className="ml-2">Novo Processo</span>
                    </button>
                </div>
            </div>

             {view && <Link to="/processos" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Voltar para Processos Ativos</Link>}

            <div className="flex-grow overflow-y-auto">
                 {casesToDisplay.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {casesToDisplay.map((c) => (
                           <CaseCard 
                             key={c.id}
                             caseData={c}
                             client={clients.find(cl => cl.id === c.clientId)}
                             tasks={tasks.filter(t => t.caseId === c.id)}
                             onView={handleViewCase}
                             onEdit={handleEditCase}
                             onSoftDelete={handleSoftDelete}
                             onToggleArchive={handleToggleArchive}
                             onRestore={handleRestore}
                             onPermanentDelete={handlePermanentDelete}
                             isArchivedView={!!view}
                           />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white rounded-xl shadow">
                        <p className="text-xl text-slate-500">Nenhum processo encontrado nesta visualização.</p>
                        {!view && <p className="mt-2 text-slate-500">Clique em "Adicionar Processo" para começar.</p>}
                    </div>
                )}
            </div>

            {selectedCase && (
                 <Modal isOpen={isDetailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="Detalhes do Processo" size="lg">
                    <div className="space-y-4">
                         <div>
                            <h3 className="text-2xl font-bold text-slate-900">{selectedCase.name}</h3>
                            <p className="text-slate-500">{clients.find(c => c.id === selectedCase.clientId)?.name || 'Cliente não encontrado'}</p>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p><strong>Nº do Processo:</strong> {selectedCase.caseNumber || 'N/A'}</p>
                            <p><strong>Vara/Tribunal:</strong> {selectedCase.court || 'N/A'}</p>
                            <p><strong>Área:</strong> {selectedCase.caseType}</p>
                            <p><strong>Status:</strong> {selectedCase.status}</p>
                            <p><strong>Responsáveis:</strong> {selectedCase.responsibleLawyers.join(', ')}</p>
                            <p><strong>Criado em:</strong> {formatDate(selectedCase.createdAt)}</p>
                        </div>
                         <div className="flex justify-end pt-4 border-t mt-4">
                             <button onClick={() => setDetailsModalOpen(false)} className="bg-slate-500 text-white px-4 py-2 rounded-lg shadow mr-2">Fechar</button>
                         </div>
                    </div>
                 </Modal>
            )}

            <Modal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} title={selectedCase ? 'Editar Processo' : 'Adicionar Novo Processo'} size="lg">
                <CaseForm onSuccess={handleFormSuccess} caseToEdit={selectedCase} />
            </Modal>
        </div>
    );
}

export default CasesPage;