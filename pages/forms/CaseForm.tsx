import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Case, Client, CaseType, CaseStatus, ContractType } from '../../types';
import { CASE_STATUS_OPTIONS, CASE_TYPE_OPTIONS, CONTRACT_TYPE_OPTIONS } from '../../constants';
import toast from 'react-hot-toast';

interface CaseFormProps {
  onSuccess: () => void;
  caseToEdit?: Case;
}

const CaseForm: React.FC<CaseFormProps> = ({ onSuccess, caseToEdit }) => {
  const { clients, addCase, updateCase } = useAppData();
  const [name, setName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [court, setCourt] = useState('');
  const [caseType, setCaseType] = useState<CaseType>(CaseType.CIVEL);
  const [status, setStatus] = useState<CaseStatus>(CaseStatus.ATIVO);
  const [responsibleLawyers, setResponsibleLawyers] = useState('');
  const [contractType, setContractType] = useState<ContractType | ''>('');
  const [contractValue, setContractValue] = useState<number>(0);
  const [successFeePercentage, setSuccessFeePercentage] = useState<number>(0);

  useEffect(() => {
    if (caseToEdit) {
      setName(caseToEdit.name);
      setCaseNumber(caseToEdit.caseNumber);
      setClientId(caseToEdit.clientId);
      setCourt(caseToEdit.court || '');
      setCaseType(caseToEdit.caseType);
      setStatus(caseToEdit.status);
      setResponsibleLawyers(caseToEdit.responsibleLawyers.join(', '));
      setContractType(caseToEdit.contractType || '');
      setContractValue(caseToEdit.contractValue || 0);
      setSuccessFeePercentage(caseToEdit.successFeePercentage || 0);
    } else {
      // Reset form
      setName('');
      setCaseNumber('');
      setClientId(clients.length > 0 ? clients[0].id : '');
      setCourt('');
      setCaseType(CaseType.CIVEL);
      setStatus(CaseStatus.ATIVO);
      setResponsibleLawyers('');
      setContractType('');
      setContractValue(0);
      setSuccessFeePercentage(0);
    }
  }, [caseToEdit, clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || !responsibleLawyers) {
      toast.error('Preencha Nome, Cliente e Responsável.');
      return;
    }

    const caseDataPayload = {
      name,
      caseNumber,
      clientId,
      court,
      caseType,
      status,
      responsibleLawyers: responsibleLawyers.split(',').map(s => s.trim()).filter(Boolean),
      contractType: contractType || undefined,
      contractValue: contractType && [ContractType.PRO_LABORE, ContractType.RETAINER, ContractType.HOURLY, ContractType.MIXED].includes(contractType) ? Number(contractValue) : undefined,
      successFeePercentage: contractType && [ContractType.AD_EXITUM, ContractType.MIXED].includes(contractType) ? Number(successFeePercentage) : undefined,
    };

    if (caseToEdit) {
      updateCase({ ...caseToEdit, ...caseDataPayload });
      toast.success('Processo atualizado!');
    } else {
      addCase(caseDataPayload);
      toast.success('Processo adicionado!');
    }
    onSuccess();
  };
  
  const commonInputClass = "w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-800 outline-none transition-shadow bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Nome do Processo <span className="text-red-500">*</span></label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={commonInputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Nº do Processo</label>
          <input type="text" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} className={commonInputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-500 mb-1">Cliente <span className="text-red-500">*</span></label>
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={commonInputClass} required>
          <option value="" disabled>Selecione um cliente</option>
          {clients.map((client: Client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Vara / Tribunal</label>
          <input type="text" value={court} onChange={(e) => setCourt(e.target.value)} className={commonInputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Advogado(s) Responsável(is) <span className="text-red-500">*</span></label>
          <input type="text" value={responsibleLawyers} onChange={(e) => setResponsibleLawyers(e.target.value)} placeholder="Separe por vírgulas" className={commonInputClass} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Área do Direito</label>
          <select value={caseType} onChange={(e) => setCaseType(e.target.value as CaseType)} className={commonInputClass}>
            {CASE_TYPE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as CaseStatus)} className={commonInputClass}>
            {CASE_STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>
      
      <fieldset className="border border-slate-200 rounded-md p-4 space-y-4">
        <legend className="text-sm font-medium text-slate-500 px-2">Detalhes do Contrato de Honorários</legend>
        <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Tipo de Contrato</label>
            <select value={contractType} onChange={(e) => setContractType(e.target.value as ContractType)} className={commonInputClass}>
                <option value="">Não definido</option>
                {CONTRACT_TYPE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
        </div>
        
        {(contractType === ContractType.PRO_LABORE || contractType === ContractType.RETAINER || contractType === ContractType.HOURLY || contractType === ContractType.MIXED) && (
            <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">
                    {contractType === ContractType.HOURLY ? 'Valor da Hora (R$)' : 'Valor Fixo (R$)'}
                </label>
                <input type="number" value={contractValue} onChange={(e) => setContractValue(parseFloat(e.target.value))} className={commonInputClass} min="0" step="0.01" />
            </div>
        )}

        {(contractType === ContractType.AD_EXITUM || contractType === ContractType.MIXED) && (
            <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Percentual de Êxito (%)</label>
                <input type="number" value={successFeePercentage} onChange={(e) => setSuccessFeePercentage(parseFloat(e.target.value))} className={commonInputClass} min="0" max="100" step="0.1" />
            </div>
        )}
      </fieldset>

      <div className="flex justify-end pt-2">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-all">
          {caseToEdit ? 'Salvar Alterações' : 'Adicionar Processo'}
        </button>
      </div>
    </form>
  );
};

export default CaseForm;