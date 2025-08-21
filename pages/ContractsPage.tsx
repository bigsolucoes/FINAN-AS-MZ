



import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Contract } from '../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, ContractIcon, ArchiveFolderIcon, RestoreIcon, DownloadIcon } from '../constants';
import Modal from '../components/Modal';
import ContractForm from './forms/ContractForm';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { formatDate, formatCurrency } from '../utils/formatters';

const ContractsPage: React.FC = () => {
    const { contracts, debtors, debtorAgreements, softDeleteContract, restoreContract, toggleContractArchive, permanentlyDeleteContract, loading, settings } = useAppData();
    const { view } = useParams<{ view: 'lixeira' | 'arquivados' }>();

    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | undefined>(undefined);

    const activeContracts = useMemo(() => contracts.filter(c => !c.isDeleted && !c.isArchived), [contracts]);
    const trashedContracts = useMemo(() => contracts.filter(c => c.isDeleted), [contracts]);
    const archivedContracts = useMemo(() => contracts.filter(c => !c.isDeleted && c.isArchived), [contracts]);

    const contractsToDisplay = view === 'lixeira' ? trashedContracts : view === 'arquivados' ? archivedContracts : activeContracts;
    const pageTitle = view === 'lixeira' ? 'Lixeira de Contratos' : view === 'arquivados' ? 'Contratos Arquivados' : 'Gerenciamento de Contratos';

    const handleAddContract = () => {
        setEditingContract(undefined);
        setFormModalOpen(true);
    };

    const handleEditContract = (contract: Contract) => {
        setEditingContract(contract);
        setFormModalOpen(true);
    };

    const handleFormSuccess = () => {
        setFormModalOpen(false);
        setEditingContract(undefined);
    };

    const handleDownload = (contract: Contract) => {
        if(contract.attachmentData && contract.attachmentName) {
            const link = document.createElement('a');
            link.href = contract.attachmentData;
            link.download = contract.attachmentName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            toast.error("Nenhum anexo encontrado para este contrato.");
        }
    }


    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">{pageTitle}</h1>
                <div className="flex items-center space-x-3">
                    <Link to="/contratos/lixeira" className={`flex items-center space-x-1.5 text-sm p-2 rounded-lg ${view === 'lixeira' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><TrashIcon size={16}/><span>Lixeira</span></Link>
                    <Link to="/contratos/arquivados" className={`flex items-center space-x-1.5 text-sm p-2 rounded-lg ${view === 'arquivados' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><ArchiveFolderIcon size={16}/><span>Arquivados</span></Link>
                    <button onClick={handleAddContract} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all flex items-center">
                        <PlusCircleIcon size={20} /> <span className="ml-2">Novo Contrato</span>
                    </button>
                </div>
            </div>

            {view && <Link to="/contratos" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Voltar para Contratos Ativos</Link>}
            
            <div className="flex-grow overflow-x-auto bg-white rounded-xl shadow">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nome / Acordo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Devedor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor / % Êxito</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {contractsToDisplay.length > 0 ? contractsToDisplay.map(contract => {
                            const debtor = debtors.find(c => c.id === contract.clientId);
                            const agreement = debtorAgreements.find(c => c.id === contract.agreementId);
                            return (
                                <tr key={contract.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-slate-900 flex items-center">
                                            {contract.name}
                                            {contract.attachmentData && (
                                                <button onClick={() => handleDownload(contract)} className="ml-2 text-blue-500 hover:text-blue-700" title={`Baixar ${contract.attachmentName}`}>
                                                    <DownloadIcon size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {agreement ? `Acordo de ${formatCurrency(agreement.agreementValue, false)}` : 'Acordo não encontrado'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{debtor?.name || 'Devedor não encontrado'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{contract.contractType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {contract.value ? formatCurrency(contract.value, settings.privacyModeEnabled) : `${contract.successFeePercentage || 0}%`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{contract.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                         {view === 'lixeira' ? (
                                             <>
                                                <button onClick={() => restoreContract(contract.id)} className="p-1 text-green-600" title="Restaurar"><RestoreIcon size={18}/></button>
                                                <button onClick={() => permanentlyDeleteContract(contract.id)} className="p-1 text-red-600" title="Excluir Permanentemente"><TrashIcon size={18}/></button>
                                             </>
                                         ) : (
                                             <>
                                                <button onClick={() => handleEditContract(contract)} className="p-1 text-blue-600" title="Editar"><PencilIcon size={18}/></button>
                                                <button onClick={() => toggleContractArchive(contract.id)} className="p-1 text-yellow-600" title={contract.isArchived ? "Desarquivar" : "Arquivar"}><ArchiveFolderIcon size={18}/></button>
                                                <button onClick={() => softDeleteContract(contract.id)} className="p-1 text-red-600" title="Mover para Lixeira"><TrashIcon size={18}/></button>
                                             </>
                                         )}
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr><td colSpan={6} className="text-center p-8 text-slate-500">Nenhum contrato nesta visualização.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} title={editingContract ? "Editar Contrato" : "Novo Contrato"} size="lg">
                <ContractForm onSuccess={handleFormSuccess} contractToEdit={editingContract} />
            </Modal>
        </div>
    );
};

export default ContractsPage;
