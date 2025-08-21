
import React from 'react';
import { useAppData } from '../hooks/useAppData';
import { Job, Client, ServiceType, JobStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h2 className="text-xl font-semibold text-slate-800 mb-4">{title}</h2>
    <div className="h-72 md:h-96"> {/* Fixed height for chart containers */}
      {children}
    </div>
  </div>
);

const KPICard: React.FC<{ title: string; value: string | number; unit?: string; isCurrency?: boolean; privacyModeEnabled?: boolean }> = 
  ({ title, value, unit, isCurrency = false, privacyModeEnabled = false }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg text-center">
    <h3 className="text-md font-medium text-slate-500 mb-1">{title}</h3>
    <p className="text-3xl font-bold text-blue-600">
      {isCurrency 
        ? formatCurrency(typeof value === 'number' ? value : parseFloat(value.toString()), privacyModeEnabled, unit || 'R$') 
        : (typeof value === 'number' ? value.toLocaleString('pt-BR', {minimumFractionDigits: unit === 'dias' ? 0 : 0 , maximumFractionDigits: unit === 'dias' ? 0 : 1}) : value)
      }
      {!isCurrency && unit && <span className="text-lg ml-1">{unit}</span>}
    </p>
  </div>
);


const PerformancePage: React.FC = () => {
  const { jobs, clients, settings, loading } = useAppData();

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }
  const privacyMode = settings.privacyModeEnabled || false;
  const accentColor = '#2563eb'; // blue-600
  const activeJobs = jobs.filter(job => !job.isDeleted); // Use non-deleted jobs for performance metrics

  // Faturamento Mensal (últimos 12 meses)
  const monthlyRevenueMap = activeJobs
    .filter(job => job.paymentDate || job.paidAt) 
    .reduce((acc, job) => {
      try {
        const date = new Date(job.paymentDate || job.paidAt!);
        if (isNaN(date.getTime())) return acc; 
        const yearMonthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        acc[yearMonthKey] = (acc[yearMonthKey] || 0) + job.value;
      } catch (e) { console.warn("Error processing revenue date", job.id, e); }
      return acc;
    }, {} as { [key: string]: number });

  const revenueData = Object.entries(monthlyRevenueMap)
    .map(([yearMonthKey, revenue]) => {
      const [yearStr, monthStr] = yearMonthKey.split('-');
      const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
      return { key: yearMonthKey, name: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }), Receita: revenue };
    })
    .sort((a, b) => a.key.localeCompare(b.key)).slice(-12);

  // Projetos Concluídos (Pagos) por Mês
  const monthlyCompletedJobsMap = activeJobs
    .filter(job => job.paymentDate || job.paidAt) // Consider jobs as "completed" for this chart once paid
    .reduce((acc, job) => {
        try {
            const date = new Date(job.paymentDate || job.paidAt!);
            if (isNaN(date.getTime())) return acc;
            const yearMonthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            acc[yearMonthKey] = (acc[yearMonthKey] || 0) + 1;
        } catch(e) { console.warn("Error processing completed job date", job.id, e); }
        return acc;
    }, {} as {[key: string]: number});
  
  const completedJobsData = Object.entries(monthlyCompletedJobsMap)
    .map(([yearMonthKey, count]) => {
        const [yearStr, monthStr] = yearMonthKey.split('-');
        const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
        return { key: yearMonthKey, name: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }), Quantidade: count };
    })
    .sort((a,b) => a.key.localeCompare(b.key)).slice(-12);


  // Top Clientes por Receita
  const clientRevenue = clients.map(client => {
    const total = activeJobs
      .filter(job => job.clientId === client.id && (job.paymentDate || job.paidAt))
      .reduce((sum, job) => sum + job.value, 0);
    return { name: client.name, value: total };
  }).filter(c => c.value > 0).sort((a,b) => b.value - a.value).slice(0,5); 

  // Receita por Categoria de Serviço
  const serviceRevenue = Object.values(ServiceType).map(service => {
    const total = activeJobs
      .filter(job => job.serviceType === service && (job.paymentDate || job.paidAt))
      .reduce((sum, job) => sum + job.value, 0);
    return { name: service, value: total };
  }).filter(s => s.value > 0).sort((a,b) => b.value - a.value); // Sort for better viz
  
  const PIE_COLORS = [accentColor, '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#A0522D', '#D2691E', '#8A2BE2'].filter((c, i, arr) => arr.indexOf(c) === i);

  // Valor Médio por Job (Pago)
  const paidJobsList = activeJobs.filter(job => job.paymentDate || job.paidAt);
  const averageJobValue = paidJobsList.length > 0 ? paidJobsList.reduce((sum, job) => sum + job.value, 0) / paidJobsList.length : 0;

  // Tempo Médio de Conclusão (do createdAt até paymentDate/paidAt para jobs pagos)
  const completedJobsWithTimes = paidJobsList.filter(job => job.createdAt && (job.paymentDate || job.paidAt));
  const averageCompletionTime = completedJobsWithTimes.length > 0 
    ? completedJobsWithTimes.reduce((sum, job) => {
        try {
          const start = new Date(job.createdAt!).getTime();
          const end = new Date(job.paymentDate || job.paidAt!).getTime();
          if (isNaN(start) || isNaN(end) || end < start) return sum; 
          return sum + (end - start);
        } catch (e) {
          console.warn("Error calculating completion time for job", job.id, e);
          return sum;
        }
      }, 0) / completedJobsWithTimes.length / (1000 * 60 * 60 * 24) 
    : 0;

  const currencyTooltipFormatter = (value: number) => [formatCurrency(value, privacyMode), "Receita"];
  const countTooltipFormatter = (value: number) => [value.toString(), "Quantidade"];
  const currencyAxisTickFormatter = (value: number) => privacyMode ? 'R$•••' : `R$${value/1000}k`;
  const countAxisTickFormatter = (value: number) => value.toString();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Painel de Desempenho</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <KPICard title="Valor Médio por Projeto (Pago)" value={averageJobValue} isCurrency={true} privacyModeEnabled={privacyMode} unit="R$" />
        <KPICard title="Tempo Médio de Pagamento" value={averageCompletionTime.toFixed(1)} unit="dias" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Faturamento Mensal (Últimos 12 meses)">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickFormatter={currencyAxisTickFormatter} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip formatter={currencyTooltipFormatter} />
                <Legend wrapperStyle={{fontSize: "14px"}} />
                <Bar dataKey="Receita" fill={accentColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center pt-10">Dados insuficientes.</p>}
        </ChartCard>

        <ChartCard title="Projetos Concluídos (Pagos) por Mês">
          {completedJobsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completedJobsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickFormatter={countAxisTickFormatter} allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip formatter={countTooltipFormatter} />
                <Legend wrapperStyle={{fontSize: "14px"}} />
                <Bar dataKey="Quantidade" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center pt-10">Dados insuficientes.</p>}
        </ChartCard>

        <ChartCard title="Top 5 Clientes (por Receita)">
           {clientRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                    data={clientRevenue} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" cy="50%" 
                    outerRadius={100} 
                    labelLine={false} 
                    label={({ name, percent }) => privacyMode ? `${name} (•••%)` : `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {clientRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value, privacyMode)}/>
                <Legend wrapperStyle={{fontSize: "14px"}}/>
              </PieChart>
            </ResponsiveContainer>
           ) : <p className="text-slate-500 text-center pt-10">Dados insuficientes.</p>}
        </ChartCard>

        <ChartCard title="Receita por Tipo de Serviço">
          {serviceRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={serviceRevenue} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={currencyAxisTickFormatter} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip formatter={currencyTooltipFormatter} />
                <Legend wrapperStyle={{fontSize: "14px"}}/>
                <Bar dataKey="value" fill={accentColor} radius={[0, 4, 4, 0]} barSize={20}>
                    {serviceRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ): <p className="text-slate-500 text-center pt-10">Dados insuficientes.</p>}
        </ChartCard>
      </div>
    </div>
  );
};

export default PerformancePage;