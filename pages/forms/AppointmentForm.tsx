import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Appointment, AppointmentType } from '../../types';
import toast from 'react-hot-toast';
import { CalendarIcon } from '../../constants';

interface AppointmentFormProps {
    onSuccess: () => void;
    appointmentToEdit?: Appointment;
    selectedDate?: Date;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, appointmentToEdit, selectedDate }) => {
    const { addAppointment, updateAppointment, cases, clients, settings } = useAppData();
    
    const [title, setTitle] = useState('');
    const [appointmentType, setAppointmentType] = useState<AppointmentType>(AppointmentType.REUNIAO);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('09:00');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [caseId, setCaseId] = useState<string | undefined>(undefined);
    const [clientId, setClientId] = useState<string | undefined>(undefined);
    const [createCalendarEvent, setCreateCalendarEvent] = useState(false);

    useEffect(() => {
        if (appointmentToEdit) {
            setTitle(appointmentToEdit.title);
            setAppointmentType(appointmentToEdit.appointmentType);
            const d = new Date(appointmentToEdit.date);
            setDate(d.toISOString().split('T')[0]);
            setTime(d.toTimeString().substring(0,5));
            setLocation(appointmentToEdit.location || '');
            setNotes(appointmentToEdit.notes || '');
            setCaseId(appointmentToEdit.caseId);
            setClientId(appointmentToEdit.clientId);
            setCreateCalendarEvent(appointmentToEdit.createCalendarEvent || false);
        } else if (selectedDate) {
            setTitle('');
            setAppointmentType(AppointmentType.REUNIAO);
            setDate(selectedDate.toISOString().split('T')[0]);
            setTime('09:00');
            setLocation('');
            setNotes('');
            setCaseId(undefined);
            setClientId(undefined);
            setCreateCalendarEvent(false);
        }
    }, [appointmentToEdit, selectedDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !date || !time) {
            toast.error("Título, data e hora são obrigatórios.");
            return;
        }

        const [hours, minutes] = time.split(':');
        const finalDate = new Date(date);
        finalDate.setUTCHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        const appointmentData = {
            title,
            appointmentType,
            date: finalDate.toISOString(),
            location: location || undefined,
            notes: notes || undefined,
            caseId: caseId || undefined,
            clientId: clientId || undefined,
            createCalendarEvent,
        };

        if(appointmentToEdit) {
            updateAppointment({ ...appointmentToEdit, ...appointmentData });
            toast.success("Compromisso atualizado!");
        } else {
            addAppointment(appointmentData);
            toast.success("Compromisso adicionado!");
        }
        
        if (createCalendarEvent && settings.googleCalendarConnected) {
            toast('Compromisso sendo sincronizado com Google Calendar (simulado).', { icon: '🗓️' });
        } else if (createCalendarEvent && !settings.googleCalendarConnected) {
            toast.error('Conecte ao Google Calendar na Agenda para sincronizar eventos.');
        }

        onSuccess();
    };
    
    const commonInputClass = "w-full p-2 border border-border-color rounded-md focus:ring-2 focus:ring-accent focus:border-accent text-text-primary outline-none transition-shadow bg-card-bg";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Título <span className="text-red-500">*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={commonInputClass} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Compromisso</label>
                    <select value={appointmentType} onChange={e => setAppointmentType(e.target.value as AppointmentType)} className={commonInputClass}>
                        {Object.values(AppointmentType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Local</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={commonInputClass} placeholder="Ex: Fórum, Escritório"/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Data <span className="text-red-500">*</span></label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className={commonInputClass} required/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Hora <span className="text-red-500">*</span></label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className={commonInputClass} required/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Vincular ao Processo (Opcional)</label>
                    <select value={caseId || ''} onChange={e => setCaseId(e.target.value)} className={commonInputClass}>
                        <option value="">Nenhum</option>
                        {cases.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Vincular ao Cliente (Opcional)</label>
                    <select value={clientId || ''} onChange={e => setClientId(e.target.value)} className={commonInputClass}>
                        <option value="">Nenhum</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Anotações (Opcional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={commonInputClass} />
            </div>

            <div className="flex items-center space-x-2 mt-2">
                <input
                type="checkbox"
                id="createCalendarEvent"
                checked={createCalendarEvent}
                onChange={(e) => setCreateCalendarEvent(e.target.checked)}
                className="h-4 w-4 text-accent border-border-color rounded focus:ring-accent"
                />
                <label htmlFor="createCalendarEvent" className="text-sm font-medium text-text-secondary flex items-center">
                    <CalendarIcon size={16} className="mr-1 text-accent" /> Adicionar ao Google Calendar
                </label>
            </div>

            <div className="flex justify-end pt-2">
                <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg shadow hover:brightness-90 transition-all">
                {appointmentToEdit ? 'Salvar Alterações' : 'Adicionar Compromisso'}
                </button>
            </div>
        </form>
    )
}

export default AppointmentForm;