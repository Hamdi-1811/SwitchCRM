
import React, { useState, useEffect } from 'react';
import type { Client } from '../types';
import { getSalesSuggestionStream } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface GeminiReviewModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

const GeminiReviewModal: React.FC<GeminiReviewModalProps> = ({ client, isOpen, onClose }) => {
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && client) {
      const fetchSuggestion = async () => {
        setIsLoading(true);
        setSuggestion('');
        try {
          const stream = await getSalesSuggestionStream(client);
          for await (const chunk of stream) {
            // The stream can yield a string (for errors) or a GenerateContentResponse object.
            const chunkText = typeof chunk === 'string' ? chunk : chunk.text;
            setSuggestion((prev) => prev + chunkText);
          }
        } catch (error) {
          console.error('Error fetching sales suggestion:', error);
          setSuggestion('Failed to get suggestion. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSuggestion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, client]);

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 animate-in fade-in-0 zoom-in-95">
        <header className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg">
                <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-300" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Sales Strategy</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">For {client.companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-4 sm:p-6 overflow-y-auto">
          {isLoading && !suggestion && (
            <div className="space-y-4">
              <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
              <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
              <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
              <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
            </div>
          )}
          <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: suggestion.replace(/\n/g, '<br />') }}></div>
        </main>
      </div>
    </div>
  );
};

export default GeminiReviewModal;
