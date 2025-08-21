
import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Debtor, DebtorAgreement } from '../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, WalletIcon, UsersIcon, ArchiveFolderIcon, RestoreIcon } from '../constants';
import Modal from '../components/Modal';
import ClientForm from './forms/ClientForm'; // Conceptually now DebtorForm
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ClientCard from '../components/ClientCard'; // Conceptually now DebtorCard
import { formatDate, formatCurrency } from '../utils/formatters';

const DebtorsPage: React.FC = () => {
  const { debtors, debtorAgreements, softDeleteDebtor, restoreDebtor, toggleDebtorArchive, permanentlyDeleteDebtor, loading } = useAppData();
  const { view } = useParams<{ view: 'lixeira' | 'arquivados' }>();
  const navigate = useNavigate();
  
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | undefined>(undefined);
  
  const handleAddDebtor = () => {
    setSelectedDebtor(undefined);
    setFormModalOpen(true);
  };

  const handleEditDebtor = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setDetailsModalOpen(false);
    setFormModalOpen(true);
  };
  
  const handleViewDebtor = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setDetailsModalOpen(true);
  };

  const handleSoftDelete = (debtorId: string) => {
    if (window.confirm('Tem certeza que deseja mover este devedor para a lixeira?')) {
      softDeleteDebtor(debtorId);
      toast.success('Devedor movido para a lixeira!');
      if(selectedDebtor?.id === debtorId) setDetailsModalOpen(false);
    }
  };
  
  const handlePermanentDelete = (debtorId: string) => {
     if (window.confirm('Esta ação é irreversível. Deseja excluir permanentemente este devedor?')) {
      permanentlyDeleteDebtor(debtorId);
      toast.success('Devedor excluído permanentemente.');
      if(selectedDebtor?.id === debtorId) setDetailsModalOpen(false);
    }
  }

  const handleRestore = (debtorId: string) => {
      restoreDebtor(debtorId);
      toast.success('Devedor restaurado!');
  }

  const handleToggleArchive = (debtorId: string) => {
      toggleDebtorArchive(debtorId);
      toast.success('Status de arquivamento do devedor alterado!');
  }
  
  const handleFormSuccess = () => {
    setFormModalOpen(false);
    setSelectedDebtor(undefined);
  };

  const handleAgreementClick = () => {
      setDetailsModalOpen(false);
      navigate('/financeiro');
  }

  const activeDebtors = useMemo(() => debtors.filter(c => !c.isDeleted && !c.isArchived), [debtors]);
  const trashedDebtors = useMemo(() => debtors.filter(c => c.isDeleted), [debtors]);
  const archivedDebtors = useMemo(() => debtors.filter(c => !c.isDeleted && c.isArchived), [debtors]);

  const debtorsToDisplay = view === 'lixeira' ? trashedDebtors : view === 'arquivados' ? archivedDebtors : activeDebtors;
  const pageTitle = view === 'lixeira' ? 'Lixeira de Devedores' : view === 'arquivados' ? 'Devedores Arquivados' : 'Devedores';
  
  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">{pageTitle}</h1>
        <div className="flex items-center space-x-3">
            <Link to="/devedores/lixeira" className={`flex items-center space-x-1.5 text-sm p-2 rounded-lg ${view === 'lixeira' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><TrashIcon size={16}/><span>Lixeira</span></Link>
            <Link to="/devedores/arquivados" className={`flex items-center space-x-1.5 text-sm p-2 rounded-lg ${view === 'arquivados' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><ArchiveFolderIcon size={16}/><span>Arquivados</span></Link>
             <button onClick={handleAddDebtor} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all flex items-center">
                <PlusCircleIcon size={20} /> <span className="ml-2">Novo Devedor</span>
            </button>
        </div>
      </div>
      
      {view && <Link to="/devedores" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Voltar para Devedores Ativos</Link>}

      {debtorsToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debtorsToDisplay.sort((a,b) => a.name.localeCompare(b.name)).map(debtor => (
            <ClientCard 
              key={debtor.id} 
              client={debtor} 
              cases={debtorAgreements.filter(a => a.debtorId === debtor.id) as any} // Using as any to avoid changing component props
              onView={handleViewDebtor}
              onEdit={handleEditDebtor}
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
          <UsersIcon size={48} className="mx-auto text-slate-300 mb-4"/>
          <p className="text-xl text-slate-500">Nenhum devedor encontrado nesta visualização.</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedDebtor && (
         <Modal isOpen={isDetailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="Detalhes do Devedor" size="lg">
            <div className="space-y-4">
                 <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedDebtor.name}</h3>
                    <p className="text-slate-500">{selectedDebtor.company}</p>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                    <p><strong>Email:</strong> {selectedDebtor.email}</p>
                    <p><strong>Telefone:</strong> {selectedDebtor.phone || 'N/A'}</p>
                    <p><strong>CPF/CNPJ:</strong> {selectedDebtor.cpf || 'N/A'}</p>
                    <p><strong>Registrado desde:</strong> {formatDate(selectedDebtor.createdAt)}</p>
                </div>
                {selectedDebtor.observations && (
                    <div>
                        <h4 className="font-semibold text-slate-700">Observações:</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md mt-1 whitespace-pre-wrap">{selectedDebtor.observations}</p>
                    </div>
                )}
                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Acordos Vinculados:</h4>
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {debtorAgreements.filter(a => a.debtorId === selectedDebtor.id && !a.isDeleted).map(a => (
                            <li key={a.id}>
                                <div onClick={handleAgreementClick} className="text-sm p-2 bg-slate-100 rounded-md flex items-center hover:bg-blue-100 hover:text-blue-800 cursor-pointer transition-colors">
                                    <WalletIcon size={14} className="mr-2 text-slate-500" />
                                    <span className="flex-grow">Acordo de {formatCurrency(a.agreementValue, false)}</span>
                                </div>
                            </li>
                        ))}
                         {debtorAgreements.filter(a => a.debtorId === selectedDebtor.id).length === 0 && <li className="text-sm text-slate-400">Nenhum acordo vinculado.</li>}
                    </ul>
                </div>
                 <div className="flex justify-end pt-4 border-t mt-4">
                     <button onClick={() => setDetailsModalOpen(false)} className="bg-slate-500 text-white px-4 py-2 rounded-lg shadow mr-2">Fechar</button>
                     <button onClick={() => handleEditDebtor(selectedDebtor)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow flex items-center">
                        <PencilIcon size={16} className="mr-1" /> Editar
                     </button>
                 </div>
            </div>
        </Modal>
      )}

      {/* Form Modal */}
      <Modal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} title={selectedDebtor ? 'Editar Devedor' : 'Adicionar Novo Devedor'} size="lg">
        <ClientForm onSuccess={handleFormSuccess} clientToEdit={selectedDebtor} />
      </Modal>
    </div>
  );
};

export default DebtorsPage;
