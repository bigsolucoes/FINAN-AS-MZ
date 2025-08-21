

import React, { useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Contract, ContractType, TaskStatus, CaseStatus, Client, Case } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';

const ChartCard: React.FC<{ title: string; children: React.ReactNode; size?: 'small' | 'large' }> = ({ title, children, size = 'large' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg ${size === 'small' ? 'md:col-span-1' : 'md:col-span-2'}`}>
    <h2 className="text-xl font-semibold text-slate-800 mb-4">{title}</h2>
    <div className="h-72 md:h-96">
      {children}
    </div>
  </div>
);

const KPICard: React.FC<{ title: string; value: string | number; unit?: string }> = 
  ({ title, value, unit }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg text-center">
    <h3 className="text-md font-medium text-slate-500 mb-1">{title}</h3>
    <p className="text-3xl font-bold text-blue-600">
      {value}
      {unit && <span className="text-lg ml-1">{unit}</span>}
    </p>
  </div>
);

const ReportsPage: React.FC = () => {
  const { contracts, tasks, cases, clients, loading } = useAppData();

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }
  
  const accentColor = '#2563eb'; // blue-600
  const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#d946ef', '#06b6d4', '#f97316'];

  // Data for "Casos Abertos vs. Encerrados por Mês"
  const caseStatusByMonth = useMemo(() => {
    const monthMap: { [key: string]: { opened: number, closed: number } } = {};
    [...cases, ...clients.map(c => ({...c, status: undefined}))].forEach(item => {
        if (!item.createdAt) return;
        const date = new Date(item.createdAt);
        const yearMonthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthMap[yearMonthKey]) monthMap[yearMonthKey] = { opened: 0, closed: 0 };

        if ('status' in item && item.status) { // Is a Case
            monthMap[yearMonthKey].opened++;
            if (item.status === CaseStatus.ENCERRADO_EXITO || item.status === CaseStatus.ENCERRADO_SEM_EXITO) {
                monthMap[yearMonthKey].closed++;
            }
        }
    });
     return Object.entries(monthMap)
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-12);
  }, [cases, clients]);

  // Data for "Novos Clientes por Mês"
  const newClientsByMonth = useMemo(() => {
      const monthMap: { [key: string]: number } = {};
      clients.forEach(client => {
          const date = new Date(client.createdAt);
          const yearMonthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          monthMap[yearMonthKey] = (monthMap[yearMonthKey] || 0) + 1;
      });
      return Object.entries(monthMap)
        .map(([name, value]) => ({ name, "Novos Clientes": value }))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(-12);
  }, [clients]);

  // Data for case status distribution
  const caseStatusDistribution = useMemo(() => {
    const statusMap = cases.reduce((acc, caseItem) => {
        acc[caseItem.status] = (acc[caseItem.status] || 0) + 1;
        return acc;
    }, {} as {[key in CaseStatus]?: number});
    return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  }, [cases]);

   // Data for case type distribution
  const caseTypeDistribution = useMemo(() => {
    const typeMap = cases.reduce((acc, caseItem) => {
        acc[caseItem.caseType] = (acc[caseItem.caseType] || 0) + 1;
        return acc;
    }, {} as {[key in CaseStatus]?: number});
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  }, [cases]);

  // Data for "Tempo Médio de Conclusão de Tarefa"
  const averageTaskCompletionTime = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === TaskStatus.CONCLUIDA && t.completedAt && t.createdAt);
    if (completedTasks.length === 0) return 0;
    const totalTime = completedTasks.reduce((sum, task) => {
      const start = new Date(task.createdAt).getTime();
      const end = new Date(task.completedAt!).getTime();
      return sum + (end - start);
    }, 0);
    const avgMilliseconds = totalTime / completedTasks.length;
    return avgMilliseconds / (1000 * 60 * 60 * 24); // Convert to days
  }, [tasks]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Relatórios de Desempenho</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KPICard title="Total de Processos Ativos" value={cases.filter(c => c.status === CaseStatus.ATIVO).length} />
        <KPICard title="Total de Tarefas Pendentes" value={tasks.filter(t => t.status === TaskStatus.PENDENTE).length} />
        <KPICard title="Tempo Médio de Conclusão de Tarefa" value={averageTaskCompletionTime.toFixed(1)} unit="dias" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Casos Abertos vs. Encerrados por Mês">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={caseStatusByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="opened" fill={accentColor} name="Abertos" />
              <Bar dataKey="closed" fill="#10b981" name="Encerrados" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição de Status dos Processos">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={caseStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                         {caseStatusDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Distribuição de Tipos de Processos">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={caseTypeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} label>
                         {caseTypeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Novos Clientes por Mês">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={newClientsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Novos Clientes" fill="#f59e0b" />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default ReportsPage;