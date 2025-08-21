
import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { DebtorAgreement, Installment, InstallmentStatus } from '../../types';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency } from '../../utils/formatters';

interface DebtorAgreementFormProps {
  onSuccess: () => void;
  agreementToEdit?: DebtorAgreement;
}

const DebtorAgreementForm: React.FC<DebtorAgreementFormProps> = ({ onSuccess, agreementToEdit }) => {
    const { debtors, addDebtorAgreement, updateDebtorAgreement } = useAppData();
    
    const [debtorId, setDebtorId] = useState('');
    const [caseNumberLink, setCaseNumberLink] = useState('');
    const [originalDebt, setOriginalDebt] = useState(0);
    const [agreementValue, setAgreementValue] = useState(0);
    const [feePercentage, setFeePercentage] = useState(20);
    const [status, setStatus] = useState<'Ativo' | 'Quitado' | 'Inadimplente'>('Ativo');
    const [notes, setNotes] = useState('');
    
    const [numInstallments, setNumInstallments] = useState(1);
    const [firstDueDate, setFirstDueDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (agreementToEdit) {
            setDebtorId(agreementToEdit.debtorId);
            setCaseNumberLink(agreementToEdit.caseNumberLink || '');
            setOriginalDebt(agreementToEdit.originalDebt);
            setAgreementValue(agreementToEdit.agreementValue);
            setFeePercentage(agreementToEdit.feePercentage);
            setStatus(agreementToEdit.status);
            setNotes(agreementToEdit.notes || '');
            setNumInstallments(agreementToEdit.installments.length);
            if (agreementToEdit.installments.length > 0) {
              setFirstDueDate(new Date(agreementToEdit.installments[0].dueDate).toISOString().split('T')[0]);
            }
        } else {
            setDebtorId(debtors.length > 0 ? debtors[0].id : '');
            setCaseNumberLink('');
            setOriginalDebt(0);
            setAgreementValue(0);
            setFeePercentage(20);
            setStatus('Ativo');
            setNotes('');
            setNumInstallments(1);
            setFirstDueDate(new Date().toISOString().split('T')[0]);
        }
    }, [agreementToEdit, debtors]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!debtorId || agreementValue <= 0 || numInstallments <= 0) {
            toast.error("Devedor, valor do acordo e número de parcelas são obrigatórios.");
            return;
        }

        const installmentValue = agreementValue / numInstallments;
        const generatedInstallments: Installment[] = Array.from({ length: numInstallments }, (_, i) => {
            const dueDate = new Date(firstDueDate + 'T12:00:00Z'); // Use UTC to avoid timezone issues
            dueDate.setUTCMonth(dueDate.getUTCMonth() + i);
            return {
                id: uuidv4(),
                installmentNumber: i + 1,
                dueDate: dueDate.toISOString(),
                value: installmentValue,
                paidAmount: 0,
                status: InstallmentStatus.PENDENTE,
                paymentHistory: [],
            };
        });

        const agreementData = {
            debtorId,
            caseNumberLink,
            originalDebt,
            agreementValue,
            installments: generatedInstallments,
            status,
            notes,
            feePercentage,
        };

        if (agreementToEdit) {
            updateDebtorAgreement({ ...agreementToEdit, ...agreementData, installments: agreementToEdit.installments }); // Keep old installments on edit
            toast.success("Acordo atualizado com sucesso!");
        } else {
            addDebtorAgreement(agreementData as Omit<DebtorAgreement, 'id'|'createdAt'|'isDeleted'|'isArchived'|'updates'>);
            toast.success("Acordo criado com sucesso!");
        }
        onSuccess();
    };

    const commonInputClass = "w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-800 outline-none transition-shadow bg-white";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Devedor <span className="text-red-500">*</span></label>
                    <select value={debtorId} onChange={e => setDebtorId(e.target.value)} className={commonInputClass} required>
                        <option value="" disabled>Selecione um devedor</option>
                        {debtors.filter(d => !d.isDeleted).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Nº Processo de Origem (Opcional)</label>
                     <input type="text" value={caseNumberLink} onChange={e => setCaseNumberLink(e.target.value)} className={commonInputClass} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Dívida Original (R$)</label>
                    <input type="number" value={originalDebt} onChange={e => setOriginalDebt(Number(e.target.value))} className={commonInputClass} min="0" step="0.01"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Valor do Acordo (R$) <span className="text-red-500">*</span></label>
                    <input type="number" value={agreementValue} onChange={e => setAgreementValue(Number(e.target.value))} className={commonInputClass} required min="0.01" step="0.01" />
                </div>
            </div>

            <fieldset className="border border-slate-200 rounded-md p-4 space-y-4">
                <legend className="text-sm font-medium text-slate-500 px-2">Configuração das Parcelas</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Nº de Parcelas <span className="text-red-500">*</span></label>
                        <input type="number" value={numInstallments} onChange={e => setNumInstallments(Number(e.target.value))} className={commonInputClass} required min="1" step="1" disabled={!!agreementToEdit} />
                        {!!agreementToEdit && <p className="text-xs text-slate-400 mt-1">A estrutura de parcelas não pode ser alterada na edição.</p>}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Vencimento da 1ª Parcela <span className="text-red-500">*</span></label>
                        <input type="date" value={firstDueDate} onChange={e => setFirstDueDate(e.target.value)} className={commonInputClass} required disabled={!!agreementToEdit} />
                     </div>
                 </div>
                 <p className="text-sm text-slate-600">Valor da parcela: <span className="font-semibold">{formatCurrency(numInstallments > 0 ? agreementValue / numInstallments : 0, false)}</span></p>
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Honorários do Acordo (%)</label>
                    <input type="number" value={feePercentage} onChange={e => setFeePercentage(Number(e.target.value))} className={commonInputClass} min="0" max="100" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Status do Acordo</label>
                    <select value={status} onChange={e => setStatus(e.target.value as 'Ativo' | 'Quitado' | 'Inadimplente')} className={commonInputClass}>
                        <option value="Ativo">Ativo</option>
                        <option value="Quitado">Quitado</option>
                        <option value="Inadimplente">Inadimplente</option>
                    </select>
                </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-slate-500 mb-1">Notas (Opcional)</label>
                 <textarea value={notes} onChange={e => setNotes(e.target.value)} className={commonInputClass} rows={3}></textarea>
            </div>
            
            <div className="flex justify-end pt-2">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-all">
                {agreementToEdit ? 'Salvar Alterações' : 'Criar Acordo'}
                </button>
            </div>
        </form>
    );
};

export default DebtorAgreementForm;
