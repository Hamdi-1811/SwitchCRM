
import React, { useState, useEffect, useCallback } from 'react';
import type { Client, Task } from './types';
import { DealStage, TaskPriority } from './types';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import AddClientModal from './components/AddClientModal';
import GeminiReviewModal from './components/GeminiReviewModal';
import TodoList from './components/TodoList';
import { PlusIcon, MoonIcon, SunIcon } from './components/icons';
import { Logo } from './components/Logo';

const initialClients: Client[] = [
  { id: 'CID-001', companyName: 'Innovate Corp', contactPerson: 'Alice Johnson', email: 'alice@innovate.com', phone: '20123456789', stage: DealStage.PROPOSAL, quoteAmount: 25000, lastContact: '2024-07-15T10:00:00Z', notes: 'Sent proposal, waiting for feedback.' },
  { id: 'CID-002', companyName: 'Data Systems', contactPerson: 'Bob Williams', email: 'bob@datasys.co', phone: '20111222333', stage: DealStage.NEGOTIATION, quoteAmount: 75000, lastContact: '2024-07-20T14:30:00Z', meetingDate: '2024-07-28T11:00:00Z', notes: 'Negotiating terms, follow up next week.' },
  { id: 'CID-003', companyName: 'Creative Solutions', contactPerson: 'Charlie Brown', email: 'charlie@creative.io', phone: '20233344455', stage: DealStage.CONTACTED, quoteAmount: 10000, lastContact: '2024-07-22T09:00:00Z', notes: 'Initial contact made, need to schedule a demo.' },
  { id: 'CID-004', companyName: 'Tech Giants Inc.', contactPerson: 'Diana Prince', email: 'diana@techgiants.com', phone: '20444555666', stage: DealStage.WON, quoteAmount: 120000, lastContact: '2024-06-30T17:00:00Z', notes: 'Deal closed successfully.' },
  { id: 'CID-005', companyName: 'Synergy Group', contactPerson: 'Ethan Hunt', email: 'ethan@synergy.com', phone: '20555666777', stage: DealStage.LEAD, quoteAmount: 40000, lastContact: '2024-07-23T16:00:00Z', notes: 'New lead from marketing campaign.' },
  { id: 'CID-006', companyName: 'Quantum Leap', contactPerson: 'Fiona Glenanne', email: 'fiona@quantum.dev', phone: '20666777888', stage: DealStage.LOST, quoteAmount: 30000, lastContact: '2024-07-10T12:00:00Z', notes: 'Client went with a competitor.' },
];

const initialTasks: Task[] = [
  { id: 'T-001', text: 'Follow up on proposal feedback with Innovate Corp', isDone: false, dueDate: new Date().toISOString(), priority: TaskPriority.HIGH, clientId: 'CID-001', clientName: 'Innovate Corp' },
  { id: 'T-002', text: 'Prepare for negotiation meeting', isDone: false, dueDate: '2024-07-26T10:00:00Z', priority: TaskPriority.HIGH, clientId: 'CID-002', clientName: 'Data Systems' },
  { id: 'T-003', text: 'Schedule a product demo for Creative Solutions', isDone: true, dueDate: '2024-07-24T10:00:00Z', priority: TaskPriority.MEDIUM, clientId: 'CID-003', clientName: 'Creative Solutions' },
];


const App: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDarkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Start with dark mode enabled by default for the new theme
    setDarkMode(true);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };
  
  const handleAddClient = useCallback((newClientData: Omit<Client, 'id'>) => {
    const nextIdNumber = clients.reduce((maxId, client) => {
        const idNum = parseInt(client.id.split('-')[1]);
        return idNum > maxId ? idNum : maxId;
    }, 0) + 1;

    const newClient: Client = {
      ...newClientData,
      id: `CID-${String(nextIdNumber).padStart(3, '0')}`,
    };
    setClients(prevClients => [...prevClients, newClient]);
  }, [clients]);

  const handleAddTask = useCallback((newTaskData: Omit<Task, 'id' | 'clientName'>) => {
    const client = clients.find(c => c.id === newTaskData.clientId);
    if (!client) {
      console.error("Could not find client to link task to");
      return;
    }

    const nextIdNumber = tasks.reduce((maxId, task) => {
        const idNum = parseInt(task.id.split('-')[1]);
        return idNum > maxId ? idNum : maxId;
    }, 0) + 1;

    const newTask: Task = {
        ...newTaskData,
        id: `T-${String(nextIdNumber).padStart(3, '0')}`,
        clientName: client.companyName
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  }, [clients, tasks]);

  const handleToggleTask = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, isDone: !task.isDone } : task
      )
    );
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  const handleSelectClient = (client: Client) => {
    // In a full app, this would open a detail view. For now, we log it.
    console.log('Selected client:', client);
  };

  const handleOpenReview = (client: Client) => {
    setSelectedClient(client);
    setReviewModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111111] text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <header className="bg-white/70 dark:bg-black/50 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                   <Logo className="w-8 h-8" />
                   <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Switch CRM</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        {isDarkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-slate-600" />}
                    </button>
                    <button 
                        onClick={() => setAddModalOpen(true)}
                        className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-black focus:ring-primary-400"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Add Client</span>
                    </button>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard clients={clients} />
        <TodoList 
            clients={clients} 
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
        />
        <ClientList clients={clients} onSelectClient={handleSelectClient} onOpenReview={handleOpenReview} />
      </main>

      <AddClientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        onAddClient={handleAddClient}
      />
      <GeminiReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        client={selectedClient}
      />
    </div>
  );
};

export default App;