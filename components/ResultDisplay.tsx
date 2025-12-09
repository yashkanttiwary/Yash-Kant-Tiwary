
import React, { useState, useEffect } from 'react';
import { CalculationResult } from '../types';
import { formatDisplayTime, calculateProgress } from '../utils/timeUtils';
import { LogOut, ArrowRight, Hourglass, Clock, CheckCircle } from 'lucide-react';

interface ResultDisplayProps {
  result: CalculationResult;
  timeOffset: number | null;
  arrivalTime: string;
  manualOffset: number;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, timeOffset, arrivalTime, manualOffset }) => {
  const { 
    userClockAdjustedLogout, 
    actualAdjustedLogout,
    actualStandardLogout,
    totalDurationMinutes, 
    isNextDayAdjusted 
  } = result;
  
  const [progress, setProgress] = useState(0);

  // Internal tick for progress bar
  useEffect(() => {
    if (!arrivalTime || timeOffset === null) {
      setProgress(0);
      return;
    }

    const updateProgress = () => {
      const now = new Date(Date.now() + timeOffset);
      const p = calculateProgress(arrivalTime, manualOffset, actualAdjustedLogout, now);
      setProgress(p);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [arrivalTime, actualAdjustedLogout, timeOffset, manualOffset]);

  const hours = Math.floor(totalDurationMinutes / 60);
  const minutes = totalDurationMinutes % 60;

  if (!arrivalTime) {
    return (
      <div className="bg-slate-200 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <Hourglass className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">Ready to calculate</h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-xs">
          Enter your arrival time above to see your exact logout schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* Primary Result Card - ON YOUR CLOCK */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary-600/20 relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary-100 mb-1">
            <Clock className="w-5 h-5" />
            <span className="font-medium text-sm uppercase tracking-wider">Time on Your Clock</span>
          </div>
          
          <div className="mt-2 flex items-baseline gap-3">
             <span className="text-5xl md:text-6xl font-bold tracking-tight">
              {userClockAdjustedLogout ? formatDisplayTime(userClockAdjustedLogout) : '--:--'}
            </span>
            {isNextDayAdjusted && (
              <span className="px-2 py-1 bg-white/20 rounded text-xs font-semibold">
                +1 Day
              </span>
            )}
          </div>
          
          {manualOffset !== 0 && (
             <p className="text-primary-200 text-sm mt-2 flex items-center gap-1">
               <span className="bg-white/20 px-1.5 rounded text-xs font-bold">{manualOffset > 0 ? '+' : ''}{manualOffset} min</span> 
               offset applied to match your device.
             </p>
          )}

          <div className="mt-6 flex items-center gap-3 text-sm text-primary-100 bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
            <Hourglass className="w-4 h-4" />
            <span>
              Total: <span className="font-bold text-white">{hours}h {minutes > 0 ? `${minutes}m` : ''}</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
             <div className="flex justify-between text-xs font-medium text-primary-200 mb-2">
               <span>Shift Progress</span>
               <span>{Math.round(progress)}%</span>
             </div>
             <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-white/90 rounded-full transition-all duration-1000 ease-out"
                 style={{ width: `${progress}%` }}
               ></div>
             </div>
          </div>
        </div>
      </div>

      {/* Secondary Result Card - ACTUAL TIME */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 space-y-4">
        
        {/* Actual Logout Row */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
           <div>
             <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
               <CheckCircle className="w-3 h-3" /> Actual Logout Time
             </div>
             <div className="text-xl font-bold text-slate-700 dark:text-slate-200">
               {actualAdjustedLogout ? formatDisplayTime(actualAdjustedLogout) : '--:--'}
             </div>
           </div>
           <div className="text-right">
             <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
               Standard (8.5h)
             </div>
             <div className="text-xl font-bold text-slate-500 dark:text-slate-400">
                {actualStandardLogout ? formatDisplayTime(actualStandardLogout) : '--:--'}
             </div>
           </div>
        </div>

        {manualOffset !== 0 ? (
          <p className="text-xs text-slate-400 text-center">
            * 'Actual' is the real-world time. 'Your Clock' includes your {manualOffset} min offset.
          </p>
        ) : (
          <p className="text-xs text-slate-400 text-center">
            Your clock matches actual time.
          </p>
        )}
      </div>

    </div>
  );
};
