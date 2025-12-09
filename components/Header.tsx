import React from 'react';
import { Moon, Sun, Clock } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="flex justify-between items-center py-6 mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-primary-600 p-2.5 rounded-xl shadow-lg shadow-primary-500/20">
          <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Workday<span className="text-primary-600 dark:text-primary-400">Calc</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Smart Logout Planner
          </p>
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 shadow-sm"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>
    </header>
  );
};