
import React from 'react';
import type { Client } from '../types';
import { DealStage } from '../types';
import { SparklesIcon } from './icons';

interface ClientListProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onOpenReview: (client: Client) => void;
}

const stageColorMap: Record<DealStage, string> = {
  [DealStage.LEAD]: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  [DealStage.CONTACTED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [DealStage.PROPOSAL]: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  [DealStage.NEGOTIATION]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  [DealStage.WON]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [DealStage.LOST]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const ClientList: React.FC<ClientListProps> = ({ clients, onSelectClient, onOpenReview }) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-4 sm:p-6 mt-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Client Pipeline</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 dark:border-slate-700">
            <tr className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              <th className="p-3">Company Name</th>
              <th className="p-3 hidden md:table-cell">Contact Person</th>
              <th className="p-3">Stage</th>
              <th className="p-3 hidden lg:table-cell">Quote Amount</th>
              <th className="p-3 hidden sm:table-cell">Last Contact</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td className="p-3 font-medium text-slate-800 dark:text-slate-100">{client.companyName}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300 hidden md:table-cell">{client.contactPerson}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stageColorMap[client.stage]}`}>
                    {client.stage}
                  </span>
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-300 hidden lg:table-cell">${client.quoteAmount.toLocaleString()}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300 hidden sm:table-cell">{new Date(client.lastContact).toLocaleDateString()}</td>
                <td className="p-3 text-right space-x-2">
                   <button
                    onClick={() => onOpenReview(client)}
                    className="p-2 text-primary-600 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-slate-700 rounded-full transition-colors"
                    title="AI Strategy Review"
                  >
                    <SparklesIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onSelectClient(client)}
                    className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientList;
