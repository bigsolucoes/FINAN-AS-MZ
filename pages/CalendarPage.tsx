

import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import toast from 'react-hot-toast';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, SettingsIcon } from '../constants'; // Page and navigation icons
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatters';

const CalendarPage: React.FC = () => {
  const { settings, updateSettings } = useAppData();
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Placeholder for Google Calendar API interaction
  const handleConnectGoogleCalendar = () => {
    // In a real app, this would initiate OAuth 2.0 flow
    console.log("Attempting to connect to Google Calendar...");
    toast('Simulando conexão com Google Calendar...', { icon: '🗓️' });
    // Simulate connection success/failure for UI update
    setTimeout(() => {
        const success = Math.random() > 0.3; // Simulate API call
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

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const amount = direction === 'prev' ? -1 : 1;
    if (currentView === 'month') newDate.setMonth(currentDate.getMonth() + amount);
    else if (currentView === 'week') newDate.setDate(currentDate.getDate() + (amount * 7));
    else newDate.setDate(currentDate.getDate() + amount);
    setCurrentDate(newDate);
  };

  const formatHeaderDate = () => {
    if (currentView === 'month') return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (currentView === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${formatDate(startOfWeek.toISOString(), {day: 'numeric', month: 'short'})} - ${formatDate(endOfWeek.toISOString(), {day: 'numeric', month: 'short', year: 'numeric'})}`;
    }
    return formatDate(currentDate.toISOString(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };


  // Placeholder calendar grid rendering logic
  const renderCalendarGrid = () => {
    if (!settings.googleCalendarConnected) {
      return (
        <div className="text-center py-10">
          <p className="text-lg text-text-secondary">Conecte sua conta Google Calendar para visualizar seus eventos.</p>
           <button 
                onClick={handleConnectGoogleCalendar}
                className="mt-4 bg-accent text-white px-6 py-3 rounded-lg shadow hover:brightness-90 transition-all flex items-center mx-auto"
            >
                <CalendarIcon size={20} className="mr-2"/> Conectar com Google Calendar
            </button>
            <p className="text-xs text-text-secondary mt-2">
                A configuração de integração também está disponível em <Link to="/settings" className="text-accent underline">Ajustes</Link>.
            </p>
        </div>
      );
    }
    
    // Simple placeholder grid
    const days = currentView === 'month' ? 30 : currentView === 'week' ? 7 : 1;
    return (
      <div className={`grid ${currentView === 'month' ? 'grid-cols-7' : 'grid-cols-1'} gap-px bg-border-color border border-border-color`}>
        {Array.from({ length: days }).map((_, i) => (
          <div key={i} className="bg-card-bg p-2 min-h-[100px] text-sm text-text-primary">
            <span className="font-semibold">{currentView === 'month' ? i + 1 : (currentView === 'week' ? `Dia ${i+1}` : 'Hoje')}</span>
            <p className="text-xs text-text-secondary mt-1">Nenhum evento (placeholder).</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center">
            <CalendarIcon size={32} className="text-accent mr-3" />
            <h1 className="text-3xl font-bold text-text-primary">Calendário</h1>
        </div>
        {settings.googleCalendarConnected && (
            <button 
                onClick={handleDisconnectGoogleCalendar}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg shadow transition-colors flex items-center"
            >
                <SettingsIcon size={16} className="mr-1.5"/> Desconectar Google
            </button>
        )}
      </div>

      {/* Calendar Header: Navigation and View Toggles */}
      <div className="flex flex-wrap justify-between items-center mb-4 p-3 bg-slate-50 rounded-lg shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigateDate('prev')} className="p-2 text-slate-600 hover:text-accent rounded-full hover:bg-slate-200 transition-colors" title="Anterior">
            <ChevronLeftIcon size={24} />
          </button>
          <h2 className="text-xl font-semibold text-text-primary mx-4 w-64 text-center">{formatHeaderDate()}</h2>
          <button onClick={() => navigateDate('next')} className="p-2 text-slate-600 hover:text-accent rounded-full hover:bg-slate-200 transition-colors" title="Próximo">
            <ChevronRightIcon size={24} />
          </button>
        </div>
        <div className="flex items-center space-x-1 p-0.5 bg-slate-200 rounded-lg">
          {(['month', 'week', 'day'] as const).map(view => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                          ${currentView === view ? 'bg-accent text-white shadow' : 'text-slate-700 hover:bg-slate-300'}`}
            >
              {view === 'month' ? 'Mês' : view === 'week' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid Area */}
      <div className="flex-grow bg-card-bg rounded-lg shadow overflow-y-auto">
        {renderCalendarGrid()}
      </div>
       <p className="text-xs text-text-secondary mt-4 text-center">
        A integração com Google Calendar é uma funcionalidade em desenvolvimento. Eventos de jobs serão criados se a opção for marcada.
      </p>
    </div>
  );
};

export default CalendarPage;