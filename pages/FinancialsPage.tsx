
import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { DebtorAgreement, Installment, Payment, InstallmentStatus, Debtor, Contract, AgreementUpdate } from '../types';
import { WalletIcon, ChevronDownIcon, ChevronRightIcon, PlusCircleIcon, PencilIcon, TrashIcon, ArchiveFolderIcon, RestoreIcon, ArchiveActionIcon, TrashActionIcon, PlusIcon, DownloadIcon } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { Link, useParams } from 'react-router-dom';
import AgreementUpdateMessage from '../components/AgreementUpdateMessage';
import DebtorAgreementForm from './forms/DebtorAgreementForm';
import ContractForm from './forms/ContractForm';
import { DollarSign, BarChartBig, AlertCircle, CheckCircle } from 'lucide-react';

const KPICard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = 
  ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full bg-opacity-20 ${color.replace('text-', 'bg-')} ${color}`}>{icon}</div>
    </div>
  </div>
);

const RegisterPaymentForm: React.FC<{ installment: Installment; agreement: DebtorAgreement; onSuccess: () => void; }> = ({ installment, agreement, onSuccess }) => {
    const { registerInstallmentPayment } = useAppData();
    const [amount, setAmount] = useState<number>(installment.value - installment.paidAmount);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0) {
            toast.error("O valor do pagamento deve ser positivo.");
            return;
        }
        if (amount > (installment.value - installment.paidAmount + 0.001)) { // Tolerance for float
            toast.error("O valor do pagamento não pode ser maior que o saldo devedor da parcela.");
            return;
        }
        registerInstallmentPayment(agreement.id, installment.id, amount);
        const fees = (amount * (agreement.feePercentage / 100));
        toast.success(`Pagamento de ${formatCurrency(amount, false)} registrado! Honorários: ${formatCurrency(fees, false)}.`);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Valor do Pagamento</label>
                <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    max={installment.value - installment.paidAmount}
                    min="0.01"
                    step="0.01"
                />
                <p className="text-xs text-slate-400 mt-1">Saldo devedor da parcela: {formatCurrency(installment.value - installment.paidAmount, false)}</p>
            </div>
            <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow">Registrar</button>
            </div>
        </form>
    )
}

const AgreementRow: React.FC<{ 
    agreement: DebtorAgreement; 
    debtor?: Debtor;
    settings: any; 
    onEdit: (agreement: DebtorAgreement) => void;
    onArchive: (id: string) => void;
    onDelete: (id: string) => void;
    onSoftDeleteUpdate: (agreementId: string, updateId: string) => void;
    onRestoreUpdate: (agreementId: string, updateId: string) => void;
}> = ({ agreement, debtor, settings, onEdit, onArchive, onDelete, onSoftDeleteUpdate, onRestoreUpdate }) => {
    const { addAgreementUpdate, contracts, softDeleteContract } = useAppData();
    const [isOpen, setIsOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
    const [newUpdateText, setNewUpdateText] = useState('');
    const [isContractModalOpen, setContractModalOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | undefined>(undefined);

    const linkedContracts = useMemo(() => contracts.filter(c => c.agreementId === agreement.id && !c.isDeleted), [contracts, agreement.id]);

    const handleRegisterPaymentClick = (installment: Installment) => {
        setSelectedInstallment(installment);
        setPaymentModalOpen(true);
    };

    const handleAddUpdate = () => {
        if (!newUpdateText.trim()) return;
        addAgreementUpdate(agreement.id, { text: newUpdateText });
        setNewUpdateText('');
        toast.success('Atualização adicionada!');
    };
    
    const handleAddContract = () => {
        setEditingContract(undefined);
        setContractModalOpen(true);
    };

    const handleEditContract = (contract: Contract) => {
        setEditingContract(contract);
        setContractModalOpen(true);
    };

    const handleDeleteContract = (contractId: string) => {
        if (window.confirm('Mover este contrato para a lixeira?')) {
            softDeleteContract(contractId);
            toast.success('Contrato movido para a lixeira.');
        }
    };
    
    const handleDownloadContract = (contract: Contract) => {
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
    };
    
    const getInstallmentStatusClass = (status: InstallmentStatus) => {
      switch(status) {
        case InstallmentStatus.PAGA: return 'bg-green-100 text-green-800';
        case InstallmentStatus.PAGA_PARCIALMENTE: return 'bg-yellow-100 text-yellow-800';
        case InstallmentStatus.PENDENTE: return 'bg-slate-100 text-slate-800';
        case InstallmentStatus.ATRASADA: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
    
    const getAgreementStatusClass = (status: DebtorAgreement['status']) => {
        switch(status) {
            case 'Ativo': return 'bg-blue-100 text-blue-800';
            case 'Quitado': return 'bg-green-100 text-green-800';
            case 'Inadimplente': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <>
            <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-800 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <div className="flex items-center">
                        {agreement.status === 'Inadimplente' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2 flex-shrink-0" title="Inadimplente"></div>}
                        {isOpen ? <ChevronDownIcon size={16} className="mr-2"/> : <ChevronRightIcon size={16} className="mr-2"/>}
                        {debtor?.name || 'Devedor não encontrado'}
                    </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{formatCurrency(agreement.agreementValue, settings.privacyModeEnabled)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{agreement.installments.filter(i => i.status === InstallmentStatus.PAGA).length}/{agreement.installments.length}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAgreementStatusClass(agreement.status)}`}>
                        {agreement.status}
                    </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => onEdit(agreement)} className="p-1 text-blue-600" title="Editar"><PencilIcon size={18}/></button>
                    <button onClick={() => onArchive(agreement.id)} className="p-1 text-yellow-600" title={agreement.isArchived ? "Desarquivar" : "Arquivar"}><ArchiveActionIcon size={18}/></button>
                    <button onClick={() => onDelete(agreement.id)} className="p-1 text-red-600" title="Mover para Lixeira"><TrashActionIcon size={18}/></button>
                </td>
            </tr>
            {isOpen && (
                <tr className="bg-slate-50">
                    <td colSpan={5} className="p-4 space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2 text-slate-700">Detalhes das Parcelas</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg shadow-inner">
                                    <thead className="bg-slate-200 text-xs text-slate-600">
                                        <tr>
                                            <th className="p-2 text-left">Nº</th>
                                            <th className="p-2 text-left">Vencimento</th>
                                            <th className="p-2 text-left">Valor</th>
                                            <th className="p-2 text-left">Valor Pago</th>
                                            <th className="p-2 text-left">Status</th>
                                            <th className="p-2 text-left">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agreement.installments.map(inst => (
                                            <tr key={inst.id} className="border-b border-slate-200">
                                                <td className="p-2 text-sm">{inst.installmentNumber}</td>
                                                <td className="p-2 text-sm">{formatDate(inst.dueDate)}</td>
                                                <td className="p-2 text-sm">{formatCurrency(inst.value, false)}</td>
                                                <td className="p-2 text-sm">{formatCurrency(inst.paidAmount, false)}</td>
                                                <td className="p-2 text-sm">
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getInstallmentStatusClass(inst.status)}`}>
                                                        {inst.status}
                                                    </span>
                                                </td>
                                                <td className="p-2 text-sm">
                                                    {inst.status !== InstallmentStatus.PAGA && (
                                                        <button onClick={() => handleRegisterPaymentClick(inst)} className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-sm hover:bg-blue-600">
                                                            Registrar Pagamento
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-slate-700">Atualizações do Acordo</h4>
                            <div className="space-y-2 mb-2 max-h-48 overflow-y-auto pr-2">
                                {(agreement.updates || []).length > 0 ? (
                                    agreement.updates
                                        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                        .map(update => (
                                        <AgreementUpdateMessage 
                                            key={update.id} 
                                            agreementId={agreement.id} 
                                            update={update}
                                            onSoftDelete={onSoftDeleteUpdate}
                                            onRestore={onRestoreUpdate}
                                        />
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400">Nenhuma atualização para este acordo.</p>
                                )}
                            </div>
                            <div className="flex items-start space-x-2">
                                <textarea value={newUpdateText} onChange={e => setNewUpdateText(e.target.value)} placeholder="Adicionar uma atualização..." rows={2}
                                    className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                                <button onClick={handleAddUpdate} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors self-stretch">Enviar</button>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-slate-700">Contratos Vinculados</h4>
                                <button onClick={handleAddContract} className="bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded shadow-sm hover:bg-slate-300 flex items-center">
                                    <PlusIcon size={14} className="mr-1"/> Adicionar Contrato
                                </button>
                            </div>
                            <div className="space-y-2">
                                {linkedContracts.length > 0 ? linkedContracts.map(contract => (
                                    <div key={contract.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-sm text-slate-800">{contract.name}</p>
                                            <p className="text-xs text-slate-500">{contract.contractType} - {contract.status}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {contract.attachmentData && (
                                                <button onClick={() => handleDownloadContract(contract)} className="p-1 text-blue-600" title="Baixar"><DownloadIcon size={18}/></button>
                                            )}
                                            <button onClick={() => handleEditContract(contract)} className="p-1 text-blue-600" title="Editar"><PencilIcon size={18}/></button>
                                            <button onClick={() => handleDeleteContract(contract.id)} className="p-1 text-red-600" title="Mover para Lixeira"><TrashActionIcon size={18}/></button>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-400 text-center py-2">Nenhum contrato vinculado a este acordo.</p>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
            {selectedInstallment && (
                <Modal 
                    isOpen={isPaymentModalOpen} 
                    onClose={() => setPaymentModalOpen(false)}
                    title={`Registrar Pagamento - Parcela ${selectedInstallment.installmentNumber}`}
                >
                    <RegisterPaymentForm 
                        installment={selectedInstallment} 
                        agreement={agreement} 
                        onSuccess={() => setPaymentModalOpen(false)} 
                    />
                </Modal>
            )}
            {isContractModalOpen && (
                <Modal
                    isOpen={isContractModalOpen}
                    onClose={() => setContractModalOpen(false)}
                    title={editingContract ? "Editar Contrato" : "Adicionar Contrato ao Acordo"}
                >
                    <ContractForm
                        onSuccess={() => setContractModalOpen(false)}
                        contractToEdit={editingContract}
                        preSelectedAgreementId={agreement.id}
                    />
                </Modal>
            )}
        </>
    );
}

const FinancialsPage: React.FC = () => {
    const { 
        debtors, debtorAgreements, settings, loading,
        softDeleteDebtorAgreement, toggleDebtorAgreementArchive, restoreDebtorAgreement, permanentlyDeleteDebtorAgreement,
        softDeleteAgreementUpdate, restoreAgreementUpdate
    } = useAppData();
    const { view } = useParams<{ view: 'lixeira' | 'arquivados' }>();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingAgreement, setEditingAgreement] = useState<DebtorAgreement | undefined>(undefined);

    const activeAgreements = useMemo(() => debtorAgreements.filter(a => !a.isDeleted && !a.isArchived), [debtorAgreements]);
    const trashedAgreements = useMemo(() => debtorAgreements.filter(a => a.isDeleted), [debtorAgreements]);
    const archivedAgreements = useMemo(() => debtorAgreements.filter(a => !a.isDeleted && a.isArchived), [debtorAgreements]);

    const agreementsToDisplay = view === 'lixeira' ? trashedAgreements : view === 'arquivados' ? archivedAgreements : activeAgreements;

    // KPI Calculations
    const kpiData = useMemo(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalToReceive = 0;
        let receivedThisMonth = 0;
        
        activeAgreements.forEach(agreement => {
            agreement.installments.forEach(inst => {
                totalToReceive += inst.value - inst.paidAmount;
                inst.paymentHistory.forEach(payment => {
                    if (new Date(payment.date) >= firstDayOfMonth) {
                        receivedThisMonth += payment.amount;
                    }
                });
            });
        });

        return {
            totalToReceive,
            receivedThisMonth,
            activeCount: activeAgreements.filter(a => a.status === 'Ativo').length,
            delinquentCount: activeAgreements.filter(a => a.status === 'Inadimplente').length,
        };
    }, [activeAgreements]);
    
    const handleAdd = () => {
        setEditingAgreement(undefined);
        setFormModalOpen(true);
    }
    const handleEdit = (agreement: DebtorAgreement) => {
        setEditingAgreement(agreement);
        setFormModalOpen(true);
    }
    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja mover este acordo para a lixeira?')) {
            softDeleteDebtorAgreement(id);
            toast.success('Acordo movido para a lixeira!');
        }
    }
    const handleArchive = (id: string) => {
        toggleDebtorAgreementArchive(id);
        toast.success('Status de arquivamento alterado!');
    }
    const handleRestore = (id: string) => {
        restoreDebtorAgreement(id);
        toast.success('Acordo restaurado da lixeira!');
    }
    const handlePermanentDelete = (id: string) => {
        if (window.confirm('Esta ação é irreversível. Deseja excluir permanentemente este acordo?')) {
            permanentlyDeleteDebtorAgreement(id);
            toast.success('Acordo excluído permanentemente.');
        }
    }
    const handleFormSuccess = () => {
        setFormModalOpen(false);
        setEditingAgreement(undefined);
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Painel Financeiro</h1>
            <p className="text-slate-500">Acompanhe seus acordos financeiros e recebimentos.</p>
        </div>
        <div className="flex space-x-3">
             <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all flex items-center">
                <PlusCircleIcon size={20} /> <span className="ml-2">Novo Acordo</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total a Receber" value={formatCurrency(kpiData.totalToReceive, settings.privacyModeEnabled)} icon={<BarChartBig size={24} />} color="text-blue-500" />
        <KPICard title="Recebido no Mês" value={formatCurrency(kpiData.receivedThisMonth, settings.privacyModeEnabled)} icon={<DollarSign size={24} />} color="text-green-500" />
        <KPICard title="Acordos Ativos" value={kpiData.activeCount} icon={<CheckCircle size={24} />} color="text-teal-500" />
        <KPICard title="Inadimplentes" value={kpiData.delinquentCount} icon={<AlertCircle size={24} />} color="text-red-500" />
      </div>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-200 flex-wrap gap-3">
            <h2 className="text-xl font-semibold text-slate-800 ">Controle de Acordos</h2>
             <div className="flex items-center space-x-3">
                <Link to="/financeiro/lixeira" className={`flex items-center space-x-1.5 text-sm p-2 rounded-lg ${view === 'lixeira' ? 'bg-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}><TrashIcon size={16}/><span>Lixeira</span></Link>
                <Link to="/financeiro/arquivados" className={`flex items-center space-x-1.5 text-sm p-2 rounded-lg ${view === 'arquivados' ? 'bg-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}><ArchiveFolderIcon size={16}/><span>Arquivados</span></Link>
            </div>
        </div>
        {view && <Link to="/financeiro" className="text-blue-600 hover:underline m-4 inline-block">&larr; Voltar para Acordos Ativos</Link>}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
                <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Devedor</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valor do Acordo</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Parcelas Pagas</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
            </thead>
            <tbody className="bg-white">
                 {agreementsToDisplay.length > 0 ? agreementsToDisplay.map((agreement) => (
                     view === 'lixeira' ? (
                        <tr key={agreement.id} className="border-b border-slate-200">
                             <td className="px-4 py-4">{debtors.find(d => d.id === agreement.debtorId)?.name || 'Devedor não encontrado'}</td>
                             <td className="px-4 py-4">{formatCurrency(agreement.agreementValue, false)}</td>
                             <td className="px-4 py-4">{agreement.status}</td>
                             <td className="px-4 py-4" colSpan={1}>-</td>
                             <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button onClick={() => handleRestore(agreement.id)} className="p-1 text-green-600" title="Restaurar"><RestoreIcon size={18}/></button>
                                <button onClick={() => handlePermanentDelete(agreement.id)} className="p-1 text-red-600" title="Excluir Permanentemente"><TrashActionIcon size={18}/></button>
                             </td>
                        </tr>
                     ) : (
                        <AgreementRow 
                          key={agreement.id} 
                          agreement={agreement} 
                          debtor={debtors.find(d => d.id === agreement.debtorId)} 
                          settings={settings} 
                          onEdit={handleEdit} 
                          onArchive={handleArchive} 
                          onDelete={handleDelete}
                          onSoftDeleteUpdate={softDeleteAgreementUpdate}
                          onRestoreUpdate={restoreAgreementUpdate}
                        />
                     )
                 )) : (
                    <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                        Nenhum acordo nesta visualização.
                        </td>
                    </tr>
                 )}
            </tbody>
            </table>
        </div>
      </div>
       <Modal isOpen={isFormModalOpen} onClose={handleFormSuccess} title={editingAgreement ? "Editar Acordo" : "Novo Acordo de Devedor"} size="lg">
            <DebtorAgreementForm onSuccess={handleFormSuccess} agreementToEdit={editingAgreement} />
        </Modal>
    </div>
  );
};

export default FinancialsPage;