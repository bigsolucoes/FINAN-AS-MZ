import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Job, JobStatus } from '../../types';
import toast from 'react-hot-toast';

interface PaymentRegistrationFormProps {
  jobToPay: Job;
  onSuccess: () => void;
}

const PaymentRegistrationForm: React.FC<PaymentRegistrationFormProps> = ({ jobToPay, onSuccess }) => {
  const { updateJob } = useAppData();

  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentAttachment, setPaymentAttachment] = useState<File | null>(null);
  const [paymentAttachmentName, setPaymentAttachmentName] = useState<string>(jobToPay.paymentAttachmentName || '');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  useEffect(() => {
    // Pre-fill with today's date if new, or existing payment date
    if (jobToPay.paymentDate) {
        setPaymentDate(new Date(jobToPay.paymentDate).toISOString().split('T')[0]);
    } else if (jobToPay.paidAt) { // Fallback to paidAt if paymentDate is not set
        setPaymentDate(new Date(jobToPay.paidAt).toISOString().split('T')[0]);
    } else {
        setPaymentDate(new Date().toISOString().split('T')[0]);
    }
    setPaymentMethod(jobToPay.paymentMethod || '');
    setPaymentNotes(jobToPay.paymentNotes || '');
    setPaymentAttachmentName(jobToPay.paymentAttachmentName || '');
    // Note: Can't pre-fill file input for security reasons
  }, [jobToPay]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // Max 5MB for attachment
        toast.error('Arquivo de anexo muito grande. Máximo 5MB.');
        setPaymentAttachment(null);
        setPaymentAttachmentName('');
        e.target.value = ''; // Clear file input
        return;
      }
      setPaymentAttachment(file);
      setPaymentAttachmentName(file.name);
    } else {
      setPaymentAttachment(null);
      // If user clears selection, keep existing name if jobToPay had one, otherwise clear
      setPaymentAttachmentName(jobToPay.paymentAttachmentName && !e.target.files?.length ? jobToPay.paymentAttachmentName : '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDate) {
      toast.error('Data do Pagamento é obrigatória.');
      return;
    }

    const updatedJobData: Partial<Job> = {
      status: JobStatus.PAID,
      paidAt: new Date(paymentDate + "T00:00:00.000Z").toISOString(), // Ensure paidAt is also updated if it's the primary timestamp for "paid"
      paymentDate: new Date(paymentDate + "T00:00:00.000Z").toISOString(),
      paymentMethod: paymentMethod || undefined,
      paymentNotes: paymentNotes || undefined,
      paymentAttachmentName: paymentAttachmentName || undefined,
      // paymentAttachmentData: If storing base64, process `paymentAttachment` here
    };

    updateJob({ ...jobToPay, ...updatedJobData });
    // toast.success('Pagamento registrado com sucesso!'); // Toast moved to FinancialsPage onSuccess
    onSuccess();
  };
  
  const commonInputClass = "w-full p-2 border border-border-color rounded-md focus:ring-2 focus:ring-accent focus:border-accent text-text-primary outline-none transition-shadow bg-card-bg";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="paymentDate" className="block text-sm font-medium text-text-secondary mb-1">Data do Pagamento <span className="text-red-500">*</span></label>
        <input 
          type="date" 
          id="paymentDate" 
          value={paymentDate} 
          onChange={(e) => setPaymentDate(e.target.value)} 
          className={commonInputClass} 
          required 
        />
      </div>

      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-text-secondary mb-1">Método de Pagamento</label>
        <input 
          type="text" 
          id="paymentMethod" 
          value={paymentMethod} 
          onChange={(e) => setPaymentMethod(e.target.value)} 
          className={commonInputClass}
          placeholder="Ex: PIX, Transferência Bancária"
        />
      </div>

      <div>
        <label htmlFor="paymentAttachment" className="block text-sm font-medium text-text-secondary mb-1">Anexo (Comprovante - Opcional, máx 5MB)</label>
        <input 
          type="file" 
          id="paymentAttachment" 
          onChange={handleFileChange} 
          className={`${commonInputClass} file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:brightness-90`}
        />
        {paymentAttachmentName && !paymentAttachment && <p className="text-xs text-text-secondary mt-1">Anexo atual: {paymentAttachmentName}</p>}
      </div>

      <div>
        <label htmlFor="paymentNotes" className="block text-sm font-medium text-text-secondary mb-1">Observações do Pagamento</label>
        <textarea 
          id="paymentNotes" 
          value={paymentNotes} 
          onChange={(e) => setPaymentNotes(e.target.value)} 
          rows={3} 
          className={commonInputClass} 
          placeholder="Detalhes adicionais sobre o pagamento..."
        />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg shadow hover:brightness-90 transition-all">
          Salvar Pagamento
        </button>
      </div>
    </form>
  );
};

export default PaymentRegistrationForm;