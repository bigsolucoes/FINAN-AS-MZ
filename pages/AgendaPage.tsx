import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import toast from 'react-hot-toast';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, PlusCircleIcon, SettingsIcon } from '../constants';
import { Appointment, AppointmentType, Task, TaskStatus } from '../types';
import { formatDate } from '../utils/formatters';
import Modal from '../components/Modal';
import AppointmentForm from './forms/AppointmentForm';
import { Link } from 'react-router-dom';

type UnifiedEvent = {
  id: string;
  title: string;
  date: string;
  type: AppointmentType | 'Prazo' | 'Tarefa';
  original: Appointment | Task;
};

const AgendaPage: React.FC = () => {
  const { appointments, tasks, settings, updateSettings, loading } = useAppData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = firstDayOfMonth.getDay();

  const unifiedEvents = useMemo(() => {
    const eventsFromAppointments: UnifiedEvent[] = appointments.map(app => ({
      id: app.id,
      title: app.title,
      date: app.date,
      type: app.appointmentType,
      original: app,
    }));
    const eventsFromTasks: UnifiedEvent[] = tasks
      .filter(t => t.status !== TaskStatus.CONCLUIDA)
      .map(task => ({
        id: task.id,
        title: task.title,
        date: task.dueDate,
        type: task.type,
        original: task,
      }));
    return [...eventsFromAppointments, ...eventsFromTasks];
  }, [appointments, tasks]);

  const eventsByDate = useMemo(() => {
    return unifiedEvents.reduce((acc, event) => {
      const eventDate = new Date(event.date).toDateString();
      if (!acc[eventDate]) acc[eventDate] = [];
      acc[eventDate].push(event);
      // Sort events within a day by time
      acc[eventDate].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return acc;
    }, {} as { [key: string]: UnifiedEvent[] });
  }, [unifiedEvents]);

  const daysInMonth = useMemo(() => {
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    return days;
  }, [currentDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentDate(newDate);
  };

  const handleAddAppointment = (date: Date) => {
    setSelectedDate(date);
    setSelectedAppointment(undefined);
    setFormModalOpen(true);
  };
  
  const handleEventClick = (event: UnifiedEvent) => {
    if ('appointmentType' in event.original) {
      setSelectedDate(new Date(event.original.date));
      setSelectedAppointment(event.original as Appointment);
      setFormModalOpen(true);
    } else {
      toast(`Para editar a tarefa "${event.title}", vá para a página de Tarefas e Prazos.`, { icon: 'ℹ️' });
    }
  };
  
  const handleConnectGoogleCalendar = () => {
    console.log("Attempting to connect to Google Calendar...");
    toast('Simulando conexão com Google Calendar...', { icon: '🗓️' });
    setTimeout(() => {
      const success = Math.random() > 0.3;
      if (success) {
        updateSettings({ googleCalendarConnected: true });
        toast.success('Google Calendar conectado (simulado)!');
      } else {
        updateSettings({ googleCalendarConnected: false });
        toast.error('Falha ao conectar com Google Calendar (simulado).');
      }
    }, 1500);
  };
  
  const handleDisconnectGoogleCalendar = () => {
    updateSettings({ googleCalendarConnected: false });
    toast('Google Calendar desconectado.', { icon: 'ℹ️' });
  };

  const getEventColor = (type: AppointmentType | 'Prazo' | 'Tarefa') => {
      switch(type) {
          case AppointmentType.AUDIENCIA: return 'bg-red-100 border-red-400 text-red-800';
          case 'Prazo': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
          case AppointmentType.REUNIAO: return 'bg-blue-100 border-blue-400 text-blue-800';
          case AppointmentType.SUSTENTACAO_ORAL: return 'bg-purple-100 border-purple-400 text-purple-800';
          case AppointmentType.PRAZO_INTERNO: return 'bg-orange-100 border-orange-400 text-orange-800';
          case 'Tarefa': return 'bg-teal-100 border-teal-400 text-teal-800';
          default: return 'bg-slate-100 border-slate-400 text-slate-800';
      }
  }

  if (!settings.googleCalendarConnected) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center bg-card-bg rounded-xl shadow-lg p-8">
        <CalendarIcon size={64} className="text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-text-primary">Sincronize sua Agenda</h1>
        <p className="text-lg text-text-secondary mt-2 max-w-md">Conecte sua conta do Google Calendar para visualizar e gerenciar todos os seus compromissos e prazos em um só lugar.</p>
        <button 
            onClick={handleConnectGoogleCalendar}
            className="mt-6 bg-accent text-white px-6 py-3 rounded-lg shadow hover:brightness-90 transition-all flex items-center mx-auto text-lg"
        >
            <CalendarIcon size={22} className="mr-2"/> Conectar com Google Calendar
        </button>
        <p className="text-xs text-text-secondary mt-4">
            A configuração de integração também está disponível em <Link to="/settings" className="text-accent underline">Ajustes</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center">
          <CalendarIcon size={32} className="text-accent mr-3" />
          <h1 className="text-3xl font-bold text-text-primary">Agenda de Compromissos</h1>
        </div>
        <button 
            onClick={handleDisconnectGoogleCalendar}
            className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg shadow transition-colors flex items-center"
        >
            <SettingsIcon size={16} className="mr-1.5"/> Desconectar Google
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 p-3 bg-slate-50 rounded-lg shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigateDate('prev')} className="p-2 text-slate-600 hover:text-accent rounded-full hover:bg-slate-200 transition-colors" title="Mês Anterior">
            <ChevronLeftIcon size={24} />
          </button>
          <h2 className="text-xl font-semibold text-text-primary mx-4 w-64 text-center capitalize">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => navigateDate('next')} className="p-2 text-slate-600 hover:text-accent rounded-full hover:bg-slate-200 transition-colors" title="Próximo Mês">
            <ChevronRightIcon size={24} />
          </button>
        </div>
        <button onClick={() => handleAddAppointment(new Date())} className="bg-accent text-white px-3 py-1.5 rounded-lg text-sm shadow flex items-center">
          <PlusCircleIcon size={18} className="mr-1.5" /> Novo Compromisso
        </button>
      </div>

      <div className="flex-grow bg-card-bg rounded-lg shadow overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 text-center font-semibold text-text-secondary border-b border-border-color">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} className="py-2">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 grid-rows-5 flex-grow gap-px bg-border-color">
          {daysInMonth.map((day, index) => (
            <div key={index} className="bg-card-bg p-1.5 flex flex-col relative min-h-[120px]">
              {day && (
                <>
                  <span className="font-semibold text-sm">{day.getDate()}</span>
                  <div className="mt-1 space-y-1 overflow-y-auto">
                    {eventsByDate[day.toDateString()]?.map(event => (
                      <div key={event.id} onClick={() => handleEventClick(event)} className={`p-1.5 text-xs rounded-md cursor-pointer border-l-4 hover:shadow-md transition-shadow ${getEventColor(event.type)}`}>
                        <p className="font-semibold truncate">{event.title}</p>
                        <p className="truncate">{event.type}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => handleAddAppointment(day)} className="absolute bottom-1 right-1 text-slate-400 hover:text-accent opacity-0 hover:opacity-100 transition-opacity">
                    <PlusCircleIcon size={20} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <Modal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} title={selectedAppointment ? "Editar Compromisso" : "Novo Compromisso"}>
        <AppointmentForm 
          onSuccess={() => setFormModalOpen(false)}
          appointmentToEdit={selectedAppointment}
          selectedDate={selectedDate}
        />
      </Modal>
    </div>
  );
};

export default AgendaPage;