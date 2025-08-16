
import React, { useState, useMemo, FormEvent } from 'react';
import type { Client, Task } from '../types';
import { TaskPriority } from '../types';
import { getTaskSuggestions } from '../services/geminiService';
import { TrashIcon, SparklesIcon, PlusIcon } from './icons';

interface TodoListProps {
  clients: Client[];
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'clientName'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

type SuggestedTask = Omit<Task, 'id' | 'isDone' | 'dueDate' | 'clientName'>;

const priorityColorMap = {
  [TaskPriority.HIGH]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300',
  [TaskPriority.MEDIUM]: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-300',
  [TaskPriority.LOW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300',
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    const dateToCompare = new Date(date.valueOf());
    dateToCompare.setHours(0,0,0,0);

    if (dateToCompare.getTime() === today.getTime()) {
        return 'Today';
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateToCompare.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const TodoList: React.FC<TodoListProps> = ({ clients, tasks, onAddTask, onToggleTask, onDeleteTask }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskClient, setNewTaskClient] = useState<string>(clients[0]?.id || '');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedTask[]>([]);
  const [aiError, setAiError] = useState('');
  
  const filteredTasks = useMemo(() => {
    let sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    sortedTasks = sortedTasks.sort((a, b) => (a.isDone === b.isDone) ? 0 : a.isDone ? 1 : -1);

    switch (filter) {
      case 'pending':
        return sortedTasks.filter(task => !task.isDone);
      case 'done':
        return sortedTasks.filter(task => task.isDone);
      default:
        return sortedTasks;
    }
  }, [tasks, filter]);

  const handleAddTaskSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !newTaskClient) return;
    onAddTask({
      text: newTaskText.trim(),
      clientId: newTaskClient,
      priority: TaskPriority.MEDIUM, // Default priority
      isDone: false,
      dueDate: new Date().toISOString(),
    });
    setNewTaskText('');
  };

  const handleSuggestTasks = async () => {
    setIsAiLoading(true);
    setAiSuggestions([]);
    setAiError('');
    const result = await getTaskSuggestions(clients, tasks);
    if (result.suggestions) {
      setAiSuggestions(result.suggestions);
    } else {
      setAiError(result.error || 'An unknown error occurred.');
    }
    setIsAiLoading(false);
  };
  
  const addSuggestedTask = (suggestion: SuggestedTask) => {
    onAddTask({
      ...suggestion,
      isDone: false,
      dueDate: new Date().toISOString(),
    });
    setAiSuggestions(prev => prev.filter(s => s.text !== suggestion.text));
  };


  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-4 sm:p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">To-Do List</h3>
        <div className="flex items-center space-x-2">
            <button onClick={handleSuggestTasks} disabled={isAiLoading} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/50 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900 disabled:opacity-50 transition-colors">
                <SparklesIcon className="w-4 h-4" />
                <span>{isAiLoading ? 'Thinking...' : 'Suggest Tasks'}</span>
            </button>
        </div>
      </div>
      
        {(aiSuggestions.length > 0 || aiError) && (
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">AI Suggestions:</h4>
                {aiError && <p className="text-sm text-red-500">{aiError}</p>}
                <div className="space-y-2">
                    {aiSuggestions.map((s, i) => (
                        <div key={i} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-md">
                            <div className="text-sm">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full mr-2 ${priorityColorMap[s.priority as TaskPriority]}`}>{s.priority}</span>
                                <span className="text-slate-800 dark:text-slate-200">{s.text}</span>
                                <span className="text-slate-500 dark:text-slate-400 ml-2">for {clients.find(c => c.id === s.clientId)?.companyName}</span>
                            </div>
                            <button onClick={() => addSuggestedTask(s)} className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md">
                                <PlusIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <form onSubmit={handleAddTaskSubmit} className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          <select value={newTaskClient} onChange={e => setNewTaskClient(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
            {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Add</button>
        </form>

      <div className="border-b border-slate-200 dark:border-slate-700 mb-2">
        <div className="flex space-x-1">
          {['pending', 'done', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors ${filter === f ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredTasks.length > 0 ? filteredTasks.map(task => (
          <div key={task.id} className={`flex items-center p-2 rounded-md transition-colors ${task.isDone ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
            <input type="checkbox" checked={task.isDone} onChange={() => onToggleTask(task.id)} className="mr-3 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <div className="flex-grow">
              <p className={`text-slate-800 dark:text-slate-200 ${task.isDone ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>{task.text}</p>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-2 mt-0.5">
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${priorityColorMap[task.priority]}`}>{task.priority}</span>
                <span>For: {task.clientName}</span>
                <span>Due: {formatDate(task.dueDate)}</span>
              </div>
            </div>
            <button onClick={() => onDeleteTask(task.id)} className="ml-4 p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )) : <p className="text-center py-4 text-slate-500 dark:text-slate-400">No {filter} tasks.</p>}
      </div>
    </div>
  );
};

export default TodoList;
