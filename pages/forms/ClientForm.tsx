
import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Debtor } from '../../types';
import toast from 'react-hot-toast';

interface DebtorFormProps {
  onSuccess: () => void;
  clientToEdit?: Debtor; // Keep prop name for simplicity, but it's a Debtor
}

const DebtorForm: React.FC<DebtorFormProps> = ({ onSuccess, clientToEdit }) => {
  const { addDebtor, updateDebtor } = useAppData();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setCompany(clientToEdit.company || '');
      setEmail(clientToEdit.email);
      setPhone(clientToEdit.phone || '');
      setCpf(clientToEdit.cpf || '');
      setObservations(clientToEdit.observations || '');
    } else {
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setCpf('');
      setObservations('');
    }
  }, [clientToEdit]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 14) value = value.substring(0, 14); 

    if (value.length <= 11) { // CPF
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else { // CNPJ
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    setCpf(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Nome e Email são obrigatórios.');
      return;
    }
    const rawCpf = cpf.replace(/\D/g, '');
    if (cpf && rawCpf.length !== 11 && rawCpf.length !== 14) {
        toast.error('CPF/CNPJ inválido.');
        return;
    }

    const debtorData = {
      name,
      company: company || undefined,
      email,
      phone: phone || undefined,
      cpf: cpf || undefined,
      observations: observations || undefined,
    };

    if (clientToEdit) {
      updateDebtor({ ...clientToEdit, ...debtorData });
      toast.success('Devedor atualizado com sucesso!');
    } else {
      addDebtor(debtorData);
      toast.success('Devedor adicionado com sucesso!');
    }
    onSuccess();
  };
  
  const commonInputClass = "w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-800 outline-none transition-shadow bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="debtorName" className="block text-sm font-medium text-slate-500 mb-1">Nome <span className="text-red-500">*</span></label>
        <input type="text" id="debtorName" value={name} onChange={(e) => setName(e.target.value)} className={commonInputClass} required />
      </div>
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-slate-500 mb-1">Empresa (Opcional)</label>
        <input type="text" id="company" value={company} onChange={(e) => setCompany(e.target.value)} className={commonInputClass} />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-500 mb-1">Email <span className="text-red-500">*</span></label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={commonInputClass} required />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-500 mb-1">Telefone (Opcional)</label>
        <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={commonInputClass} />
      </div>
      <div>
        <label htmlFor="cpf" className="block text-sm font-medium text-slate-500 mb-1">CPF/CNPJ (Opcional)</label>
        <input 
          type="text" 
          id="cpf" 
          value={cpf} 
          onChange={handleCpfChange} 
          className={commonInputClass} 
          placeholder="000.000.000-00 ou 00.000.000/0001-00"
          maxLength={18}
        />
      </div>
      <div>
        <label htmlFor="observations" className="block text-sm font-medium text-slate-500 mb-1">Observações (Opcional)</label>
        <textarea 
          id="observations" 
          value={observations} 
          onChange={(e) => setObservations(e.target.value)} 
          rows={3} 
          className={commonInputClass} 
          placeholder="Preferências, histórico, etc."
        />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-all">
          {clientToEdit ? 'Salvar Alterações' : 'Adicionar Devedor'}
        </button>
      </div>
    </form>
  );
};

export default DebtorForm;
