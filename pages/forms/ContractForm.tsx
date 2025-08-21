



import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Contract, ContractType, ContractStatus } from '../../types';
import toast from 'react-hot-toast';
import { CONTRACT_TYPE_OPTIONS } from '../../constants';
import { formatCurrency } from '../../utils/formatters';

interface ContractFormProps {
  onSuccess: () => void;
  contractToEdit?: Contract;
  preSelectedAgreementId?: string;
}

const ContractForm: React.FC<ContractFormProps> = ({ onSuccess, contractToEdit, preSelectedAgreementId }) => {
    const { debtorAgreements, debtors, addContract, updateContract } = useAppData();
    const [name, setName] = useState('');
    const [agreementId, setAgreementId] = useState('');
    const [clientId, setClientId] = useState('');
    const [contractType, setContractType] = useState<ContractType>(ContractType.PRO_LABORE);
    const [status, setStatus] = useState<ContractStatus>(ContractStatus.DRAFT);
    const [value, setValue] = useState<number | undefined>();
    const [successFeePercentage, setSuccessFeePercentage] = useState<number | undefined>();
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState<{name: string, mimeType: string, data: string} | null>(null);

    useEffect(() => {
        if (contractToEdit) {
            setName(contractToEdit.name);
            setAgreementId(contractToEdit.agreementId);
            setClientId(contractToEdit.clientId);
            setContractType(contractToEdit.contractType);
            setStatus(contractToEdit.status);
            setValue(contractToEdit.value);
            setSuccessFeePercentage(contractToEdit.successFeePercentage);
            setStartDate(new Date(contractToEdit.startDate).toISOString().split('T')[0]);
            setDescription(contractToEdit.description || '');
            if (contractToEdit.attachmentData) {
                setAttachment({
                    name: contractToEdit.attachmentName || 'arquivo',
                    mimeType: contractToEdit.attachmentMimeType || 'application/octet-stream',
                    data: contractToEdit.attachmentData
                });
            } else {
                setAttachment(null);
            }
        } else {
            // Reset form
            setName('');
            const initialAgreementId = preSelectedAgreementId || (debtorAgreements.length > 0 ? debtorAgreements[0].id : '');
            setAgreementId(initialAgreementId);
            setContractType(ContractType.PRO_LABORE);
            setStatus(ContractStatus.DRAFT);
            setValue(undefined);
            setSuccessFeePercentage(undefined);
            setStartDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setAttachment(null);
        }
    }, [contractToEdit, debtorAgreements, debtors, preSelectedAgreementId]);

    useEffect(() => {
        // Auto-select client when agreement changes
        const selectedAgreement = debtorAgreements.find(c => c.id === agreementId);
        if (selectedAgreement) {
            setClientId(selectedAgreement.debtorId);
        }
    }, [agreementId, debtorAgreements]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error("Arquivo muito grande. Máximo 10MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachment({
                    name: file.name,
                    mimeType: file.type,
                    data: reader.result as string,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !agreementId || !clientId) {
            toast.error("Nome, Acordo e Devedor são obrigatórios.");
            return;
        }

        const contractData = {
            name, agreementId, clientId, contractType, status, startDate,
            value: [ContractType.PRO_LABORE, ContractType.RETAINER, ContractType.HOURLY, ContractType.MIXED].includes(contractType) ? value : undefined,
            successFeePercentage: [ContractType.AD_EXITUM, ContractType.MIXED].includes(contractType) ? successFeePercentage : undefined,
            description,
            attachmentName: attachment?.name,
            attachmentMimeType: attachment?.mimeType,
            attachmentData: attachment?.data,
        };

        if (contractToEdit) {
            updateContract({ ...contractToEdit, ...contractData });
            toast.success("Contrato atualizado!");
        } else {
            addContract(contractData);
            toast.success("Contrato criado!");
        }
        onSuccess();
    };

    const commonInputClass = "w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-800 outline-none transition-shadow bg-white";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Nome do Contrato" value={name} onChange={e => setName(e.target.value)} className={commonInputClass} required />
            
            <select value={agreementId} onChange={e => setAgreementId(e.target.value)} className={commonInputClass} required disabled={!!preSelectedAgreementId}>
                <option value="">Selecione um Acordo de Dívida</option>
                {debtorAgreements.filter(a => !a.isDeleted).map(a => {
                    const debtor = debtors.find(d => d.id === a.debtorId);
                    return (<option key={a.id} value={a.id}>
                        {`Acordo: ${debtor?.name || 'Devedor desconhecido'} - ${formatCurrency(a.agreementValue, false)}`}
                    </option>)
                })}
            </select>
            
            <select value={clientId} onChange={e => setClientId(e.target.value)} className={commonInputClass} required disabled>
                <option value="">Devedor (automático)</option>
                {debtors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            
            <select value={contractType} onChange={e => setContractType(e.target.value as ContractType)} className={commonInputClass}>
                {CONTRACT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
             {(contractType === ContractType.PRO_LABORE || contractType === ContractType.RETAINER || contractType === ContractType.HOURLY || contractType === ContractType.MIXED) && (
                <input type="number" placeholder="Valor (R$)" value={value || ''} onChange={e => setValue(Number(e.target.value))} className={commonInputClass} />
            )}
            {(contractType === ContractType.AD_EXITUM || contractType === ContractType.MIXED) && (
                <input type="number" placeholder="% de Êxito" value={successFeePercentage || ''} onChange={e => setSuccessFeePercentage(Number(e.target.value))} className={commonInputClass} />
            )}
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={commonInputClass} />
            <select value={status} onChange={e => setStatus(e.target.value as ContractStatus)} className={commonInputClass}>
                {Object.values(ContractStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div>
                 <label className="block text-sm font-medium text-slate-500 mb-1">Anexo do Contrato (Opcional, máx 10MB)</label>
                 <input type="file" onChange={handleFileChange} className={`${commonInputClass} file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700`} />
                 {attachment && !contractToEdit?.attachmentData && <p className="text-xs text-slate-500 mt-1">Anexo atual: {attachment.name}</p>}
                 {contractToEdit?.attachmentName && <p className="text-xs text-slate-500 mt-1">Anexo salvo: {contractToEdit.attachmentName}</p>}
            </div>
            <textarea placeholder="Descrição (opcional)" value={description} onChange={e => setDescription(e.target.value)} className={commonInputClass} rows={3}></textarea>
            <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow">{contractToEdit ? 'Salvar' : 'Criar'}</button>
            </div>
        </form>
    );
};

export default ContractForm;
