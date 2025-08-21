import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Job, Client, ServiceType, JobStatus } from '../../types';
import { JOB_STATUS_OPTIONS, SERVICE_TYPE_OPTIONS, LinkIcon, RemoveLinkIcon, CalendarIcon } from '../../constants';
import toast from 'react-hot-toast';

interface JobFormProps {
  onSuccess: () => void;
  jobToEdit?: Job;
}

const JobForm: React.FC<JobFormProps> = ({ onSuccess, jobToEdit }) => {
  const { clients, addJob, updateJob } = useAppData();
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.VIDEO);
  const [value, setValue] = useState<number>(0);
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<JobStatus>(JobStatus.BRIEFING);
  const [cloudLinks, setCloudLinks] = useState<string[]>(['', '', '']);
  const [notes, setNotes] = useState('');
  const [createCalendarEvent, setCreateCalendarEvent] = useState(false);

  useEffect(() => {
    if (jobToEdit) {
      setName(jobToEdit.name);
      setClientId(jobToEdit.clientId);
      setServiceType(jobToEdit.serviceType);
      setValue(jobToEdit.value);
      try {
        setDeadline(jobToEdit.deadline ? new Date(jobToEdit.deadline).toISOString().split('T')[0] : '');
      } catch (e) {
        setDeadline(''); toast.error("Erro ao carregar prazo.");
      }
      setStatus(jobToEdit.status);
      const currentLinks = jobToEdit.cloudLinks || [];
      setCloudLinks([
        currentLinks[0] || '',
        currentLinks[1] || '',
        currentLinks[2] || '',
      ]);
      setNotes(jobToEdit.notes || '');
      setCreateCalendarEvent(jobToEdit.createCalendarEvent || false);
    } else {
      setName('');
      setClientId(clients.length > 0 ? clients[0].id : '');
      setServiceType(ServiceType.VIDEO);
      setValue(0);
      setDeadline('');
      setStatus(JobStatus.BRIEFING);
      setCloudLinks(['', '', '']);
      setNotes('');
      setCreateCalendarEvent(false);
    }
  }, [jobToEdit, clients]);

  const handleCloudLinkChange = (index: number, val: string) => {
    const newLinks = [...cloudLinks];
    newLinks[index] = val;
    setCloudLinks(newLinks);
  };
  
  const removeCloudLink = (index: number) => {
    handleCloudLinkChange(index, '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || !deadline) {
      toast.error('Preencha Nome, Cliente e Prazo.');
      return;
    }
    const deadlineDate = new Date(deadline + "T23:59:59"); // Set to end of day
    if (isNaN(deadlineDate.getTime())) {
      toast.error('Data de prazo inválida.');
      return;
    }

    const finalCloudLinks = cloudLinks.filter(link => link.trim() !== '');

    const jobDataPayload = {
      name,
      clientId,
      serviceType,
      value: Number(value),
      deadline: deadlineDate.toISOString(),
      status,
      cloudLinks: finalCloudLinks.length > 0 ? finalCloudLinks : undefined,
      notes: notes || undefined,
      createCalendarEvent,
    };

    if (jobToEdit) {
      updateJob({ 
        ...jobToEdit, 
        ...jobDataPayload, 
        observationsLog: jobToEdit.observationsLog || [],
        isDeleted: jobToEdit.isDeleted || false,
        isPrePaid: jobToEdit.isPrePaid || false,
        prePaymentDate: jobToEdit.prePaymentDate,
       });
      toast.success('Job atualizado!');
      if (createCalendarEvent) {
          console.log(`Simulating: Create/Update Google Calendar event for job "${jobDataPayload.name}" on ${jobDataPayload.deadline}`);
          toast('Evento do Google Calendar seria criado/atualizado (simulado).', {icon: '🗓️'});
      }
    } else {
      addJob(jobDataPayload as Omit<Job, 'id'|'createdAt'|'isDeleted'|'isPrePaid'|'paidAt'|'observationsLog'>);
      toast.success('Job adicionado!');
       if (createCalendarEvent) {
          console.log(`Simulating: Create Google Calendar event for job "${jobDataPayload.name}" on ${jobDataPayload.deadline}`);
          toast('Evento do Google Calendar seria criado (simulado).', {icon: '🗓️'});
      }
    }
    onSuccess();
  };
  
  const commonInputClass = "w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-800 outline-none transition-shadow bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="jobName" className="block text-sm font-medium text-slate-500 mb-1">Nome do Job <span className="text-red-500">*</span></label>
        <input type="text" id="jobName" value={name} onChange={(e) => setName(e.target.value)} className={commonInputClass} required />
      </div>

      <div>
        <label htmlFor="client" className="block text-sm font-medium text-slate-500 mb-1">Cliente <span className="text-red-500">*</span></label>
        <select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)} className={commonInputClass} required>
          <option value="" disabled>Selecione um cliente</option>
          {clients.map((client: Client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-slate-500 mb-1">Tipo de Serviço</label>
            <select id="serviceType" value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)} className={commonInputClass}>
            {SERVICE_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
            </select>
        </div>
        <div>
            <label htmlFor="value" className="block text-sm font-medium text-slate-500 mb-1">Valor (R$)</label>
            <input type="number" id="value" value={value} onChange={(e) => setValue(parseFloat(e.target.value))} className={commonInputClass} min="0" step="0.01" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-slate-500 mb-1">Prazo de Entrega <span className="text-red-500">*</span></label>
            <input type="date" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={commonInputClass} required/>
        </div>
        <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-500 mb-1">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as JobStatus)} className={commonInputClass}>
            {JOB_STATUS_OPTIONS.filter(opt => opt.value !== JobStatus.PAID).map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
            </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-500 mb-1">Links da Nuvem (Opcional, até 3)</label>
        {cloudLinks.map((link, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <LinkIcon size={18} />
            <input 
              type="url" 
              value={link} 
              onChange={(e) => handleCloudLinkChange(index, e.target.value)} 
              className={commonInputClass} 
              placeholder={`Link ${index + 1}`}
            />
            {link && (
                 <button type="button" onClick={() => removeCloudLink(index)} className="p-1 text-red-500 hover:text-red-700">
                    <RemoveLinkIcon size={18} />
                 </button>
            )}
          </div>
        ))}
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-500 mb-1">Notas Gerais (Opcional)</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={commonInputClass} placeholder="Detalhes adicionais sobre o job..."></textarea>
      </div>

      <div className="flex items-center space-x-2 mt-2">
        <input
          type="checkbox"
          id="createCalendarEvent"
          checked={createCalendarEvent}
          onChange={(e) => setCreateCalendarEvent(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-slate-200 rounded focus:ring-blue-600"
        />
        <label htmlFor="createCalendarEvent" className="text-sm font-medium text-slate-500 flex items-center">
            <CalendarIcon size={16} className="mr-1 text-blue-600" /> Criar evento no Google Calendar para o prazo
        </label>
      </div>


      <div className="flex justify-end pt-2">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-all">
          {jobToEdit ? 'Salvar Alterações' : 'Adicionar Job'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;