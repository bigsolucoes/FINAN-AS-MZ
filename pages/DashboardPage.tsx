import React from 'react';
import { useAppData } from '../hooks/useAppData';
import { CaseStatus } from '../types';
import { PlusCircleIcon, BriefcaseIcon, UsersIcon, CalendarIcon, TaskIcon } from '../constants';
import Modal from '../components/Modal';
import CaseForm from './forms/CaseForm';
import ClientForm from './forms/ClientForm';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskKanbanBoard from '../components/TaskKanbanBoard';

const DashboardPage: React.FC = () => {
  const { cases, clients, tasks, appointments, settings, loading } = useAppData();
  const [isCaseModalOpen, setCaseModalOpen] = React.useState(false);
  const [isClientModalOpen, setClientModalOpen] = React.useState(false);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const activeCasesCount = cases.filter(c => c.status === CaseStatus.ATIVO && !c.isDeleted).length;
  const pendingTasksCount = tasks.filter(t => t.status === 'Pendente').length;

  const appointmentsTodayCount = appointments.filter(a => {
    const appDate = new Date(a.date);
    return appDate.getFullYear() === todayStart.getFullYear() && appDate.getMonth() === todayStart.getMonth() && appDate.getDate() === todayStart.getDate();
  }).length;

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color?: string; linkTo: string; }> = 
    ({ title, value, icon, color = 'text-blue-600', linkTo }) => (
    <Link to={linkTo} className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-20 ${color.replace('text-', 'bg-')} ${color}`}>{icon}</div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">
                {settings.userName ? `Olá, ${settings.userName}!` : 'Painel de Controle'}
            </h1>
            <p className="text-slate-500">Bem-vindo(a) ao seu painel Juristream.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setCaseModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all flex items-center">
            <PlusCircleIcon size={20} /> <span className="ml-2">Novo Processo</span>
          </button>
          <button onClick={() => setClientModalOpen(true)} className="bg-slate-700 text-white px-4 py-2 rounded-lg shadow hover:bg-slate-600 transition-colors flex items-center">
            <PlusCircleIcon size={20} /> <span className="ml-2">Novo Cliente</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Processos Ativos" value={activeCasesCount} icon={<BriefcaseIcon size={24} />} color="text-blue-500" linkTo="/processos" />
        <StatCard title="Tarefas Pendentes" value={pendingTasksCount} icon={<TaskIcon size={24} />} color="text-red-500" linkTo="/tarefas" />
        <StatCard title="Compromissos (Hoje)" value={appointmentsTodayCount} icon={<CalendarIcon size={24} />} color="text-green-500" linkTo="/agenda" />
        <StatCard title="Total Clientes" value={clients.length} icon={<UsersIcon size={24} />} color="text-purple-500" linkTo="/clientes" />
      </div>
      
      <div className="flex-grow min-h-0">
        <TaskKanbanBoard />
      </div>

      <Modal isOpen={isCaseModalOpen} onClose={() => setCaseModalOpen(false)} title="Adicionar Novo Processo">
        <CaseForm onSuccess={() => setCaseModalOpen(false)} />
      </Modal>
      <Modal isOpen={isClientModalOpen} onClose={() => setClientModalOpen(false)} title="Adicionar Novo Cliente">
        <ClientForm onSuccess={() => setClientModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default DashboardPage;