
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Client } from '../types';
import { DealStage } from '../types';
import { DollarIcon, UsersIcon, ChartBarIcon } from './icons';

interface DashboardProps {
  clients: Client[];
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-5 flex items-center space-x-4">
    <div className={`rounded-full p-3 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const stageColors: Record<DealStage, string> = {
    [DealStage.LEAD]: '#94a3b8',
    [DealStage.CONTACTED]: '#60a5fa',
    [DealStage.PROPOSAL]: '#f59e0b',
    [DealStage.NEGOTIATION]: '#a855f7',
    [DealStage.WON]: '#22c55e',
    [DealStage.LOST]: '#ef4444',
}

const Dashboard: React.FC<DashboardProps> = ({ clients }) => {
  const stats = useMemo(() => {
    const totalClients = clients.length;
    const potentialValue = clients
      .filter(c => c.stage !== DealStage.WON && c.stage !== DealStage.LOST)
      .reduce((sum, client) => sum + client.quoteAmount, 0);
    const totalRevenue = clients
      .filter(c => c.stage === DealStage.WON)
      .reduce((sum, client) => sum + client.quoteAmount, 0);

    return { totalClients, potentialValue, totalRevenue };
  }, [clients]);

  const { pipelineData, wonThisMonth, lostThisMonth, negotiationTotal } = useMemo(() => {
    const stages = Object.values(DealStage);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let wonThisMonth = 0;
    let lostThisMonth = 0;
    let negotiationTotal = 0;

    clients.forEach(client => {
      const stageDate = new Date(client.lastContact); // Assume lastContact date determines when the stage was set
      
      if (client.stage === DealStage.WON && stageDate.getMonth() === currentMonth && stageDate.getFullYear() === currentYear) {
        wonThisMonth += client.quoteAmount;
      }
      if (client.stage === DealStage.LOST && stageDate.getMonth() === currentMonth && stageDate.getFullYear() === currentYear) {
        lostThisMonth += client.quoteAmount;
      }
      if (client.stage === DealStage.NEGOTIATION) {
        negotiationTotal += client.quoteAmount;
      }
    });

    const pipelineData = stages.map(stage => ({
      name: stage,
      count: clients.filter(client => client.stage === stage).length,
      color: stageColors[stage],
    }));

    return { pipelineData, wonThisMonth, lostThisMonth, negotiationTotal };
  }, [clients]);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];

        let additionalInfo = null;
        if (label === DealStage.WON) {
            additionalInfo = <p className="text-sm text-green-700 dark:text-green-300">Won This Month: ${wonThisMonth.toLocaleString()}</p>;
        } else if (label === DealStage.LOST) {
            additionalInfo = <p className="text-sm text-red-700 dark:text-red-300">Lost This Month: ${lostThisMonth.toLocaleString()}</p>;
        } else if (label === DealStage.NEGOTIATION) {
            additionalInfo = <p className="text-sm text-purple-700 dark:text-purple-300">E.C.D.A: ${negotiationTotal.toLocaleString()}</p>;
        }

        return (
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl">
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1" style={{ color: data.payload.color }}>{`${label}: ${data.value}`}</p>
                {additionalInfo}
            </div>
        );
    }
    return null;
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Clients" value={stats.totalClients.toString()} icon={<UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-300"/>} color="bg-blue-100 dark:bg-blue-900/50" />
        <StatCard title="Pipeline Value" value={`$${stats.potentialValue.toLocaleString()}`} icon={<ChartBarIcon className="w-6 h-6 text-amber-600 dark:text-amber-300"/>} color="bg-amber-100 dark:bg-amber-900/50" />
        <StatCard title="Total Revenue (Won)" value={`$${stats.totalRevenue.toLocaleString()}`} icon={<DollarIcon className="w-6 h-6 text-green-600 dark:text-green-300"/>} color="bg-green-100 dark:bg-green-900/50" />
      </div>

      <div className="mt-8 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Sales Pipeline Stages</h3>
         <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={pipelineData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} className="stroke-slate-300 dark:stroke-slate-700" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--recharts-text-fill)' }} className="text-xs fill-slate-500 dark:fill-slate-400" />
                    <YAxis allowDecimals={false} tick={{ fill: 'var(--recharts-text-fill)' }} className="text-xs fill-slate-500 dark:fill-slate-400"/>
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                    />
                    <Bar dataKey="count">
                        {pipelineData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
