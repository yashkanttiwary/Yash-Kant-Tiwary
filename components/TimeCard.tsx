
import React, { useState, useEffect } from 'react';
import { Wifi, RefreshCw, AlertCircle, Clock, Settings, HelpCircle } from 'lucide-react';
import { formatTimeForInput } from '../utils/timeUtils';

const LiveClock = ({ offset }: { offset: number | null }) => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    if (offset === null) {
      setTime(null);
      return;
    }
    const tick = () => setTime(new Date(Date.now() + offset));
    tick(); 
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [offset]);

  if (!time) return <span>--:--:--</span>;
  return (
    <span>
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
};

interface TimeCardProps {
  arrivalTime: string;
  setArrivalTime: (time: string) => void;
  adjustment: number;
  setAdjustment: (min: number) => void;
  manualOffset: number;
  setManualOffset: (min: number) => void;
  timeOffset: number | null;
  isLoadingTime: boolean;
  timeError: string | null;
  refreshTime: () => void;
}

export const TimeCard: React.FC<TimeCardProps> = React.memo(({
  arrivalTime,
  setArrivalTime,
  adjustment,
  setAdjustment,
  manualOffset,
  setManualOffset,
  timeOffset,
  isLoadingTime,
  timeError,
  refreshTime,
}) => {
  
  const [showOffsetControls, setShowOffsetControls] = useState(false);

  const handleUseCurrentTime = () => {
    if (timeOffset !== null) {
      // Get Actual Internet Time
      const now = new Date(Date.now() + timeOffset);
      
      // If the user's clock is 5 mins fast (manualOffset = 5), and they hit "Use Current Time",
      // we should fill the box with the time ON THEIR CLOCK, not the actual time.
      // e.g. Actual 10:00 -> Fill 10:05.
      const userClockTime = new Date(now.getTime() + (manualOffset * 60000));
      
      setArrivalTime(formatTimeForInput(userClockTime));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 p-6 md:p-8 space-y-8 relative overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      {/* Arrival Input Section */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-baseline">
          <label htmlFor="arrival-time" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Arrival Time
          </label>
          <span className="text-xs text-slate-400 font-medium">
            (On Your Clock)
          </span>
        </div>
        
        <div className="relative">
          <input
            id="arrival-time"
            type="time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-3xl font-bold rounded-xl p-4 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:border-primary-500 transition-all outline-none cursor-pointer"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={handleUseCurrentTime}
            disabled={timeOffset === null || isLoadingTime}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-50 dark:bg-slate-700/50 hover:bg-primary-100 dark:hover:bg-slate-700 text-primary-700 dark:text-primary-300 font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoadingTime ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            <span>Use Internet Time</span>
          </button>
          
          <button 
            onClick={refreshTime}
            className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-600 transition-colors"
            title="Sync Internet Time"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingTime ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium min-h-[1.5em]">
          {isLoadingTime ? (
            <span className="text-slate-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Syncing official time...
            </span>
          ) : timeError ? (
            <span className="text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {timeError}
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              Actual Internet Time: <LiveClock offset={timeOffset} />
            </span>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-700"></div>

      {/* Manual Clock Offset Section */}
      <div className="space-y-3 relative z-10">
        <button 
          onClick={() => setShowOffsetControls(!showOffsetControls)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider hover:text-primary-600 dark:hover:text-primary-400 transition-colors w-full"
        >
          <Settings className="w-4 h-4" />
          <span>My Clock Is Incorrect</span>
          <span className="ml-auto text-xs font-normal bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">
            {manualOffset === 0 ? 'Off' : `${manualOffset > 0 ? '+' : ''}${manualOffset} min`}
          </span>
        </button>

        {showOffsetControls && (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
             <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
               <HelpCircle className="w-3 h-3" />
               <span>If your clock is 5 mins fast, set to "+5 min". We will adjust calculations so you leave at the right time on <strong>your</strong> clock.</span>
             </div>
             
             <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-16">
                  {manualOffset === 0 ? 'Exact' : manualOffset > 0 ? 'Fast' : 'Slow'}
                </span>
                
                <div className="flex-1 flex items-center gap-2">
                  <button
                    onClick={() => setManualOffset(manualOffset - 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-primary-400 transition-colors text-lg font-bold"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-mono font-medium text-lg text-slate-800 dark:text-slate-200">
                    {manualOffset > 0 ? '+' : ''}{manualOffset} <span className="text-xs text-slate-400">min</span>
                  </div>
                  <button
                    onClick={() => setManualOffset(manualOffset + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-primary-400 transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-700"></div>

      {/* Adjustment Input Section */}
      <div className="space-y-3 relative z-10">
        <label htmlFor="adjustment" className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span className="uppercase tracking-wider">Adjustment</span>
          <span className="text-xs font-normal bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-500 dark:text-slate-400">
            Minutes
          </span>
        </label>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAdjustment(adjustment - 5)}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-xl transition-colors"
            aria-label="Decrease 5 minutes"
          >
            -
          </button>
          
          <div className="flex-1 relative">
             <input
              id="adjustment"
              type="number"
              value={adjustment}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setAdjustment(isNaN(val) ? 0 : val);
              }}
              className="w-full text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-2xl font-bold rounded-xl py-3 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          <button
            onClick={() => setAdjustment(adjustment + 5)}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-xl transition-colors"
            aria-label="Increase 5 minutes"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
});

TimeCard.displayName = 'TimeCard';
