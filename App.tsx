
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { TimeCard } from './components/TimeCard';
import { ResultDisplay } from './components/ResultDisplay';
import { fetchInternetTime } from './services/timeService';
import { calculateLogoutTimes } from './utils/timeUtils';
import { Theme } from './types';

const App: React.FC = () => {
  // --- State ---
  const [theme, setTheme] = useState<Theme>('light');
  const [arrivalTime, setArrivalTime] = useState<string>('');
  const [adjustmentMinutes, setAdjustmentMinutes] = useState<number>(0);
  
  // User Manual Clock Offset (in minutes)
  // Positive = User clock is Fast (Ahead). Negative = User clock is Slow (Behind).
  const [manualOffset, setManualOffset] = useState<number>(0);

  // Internet Time Sync State
  const [timeOffset, setTimeOffset] = useState<number | null>(null);
  const [timeSource, setTimeSource] = useState<string>('Offline');
  const [isLoadingTime, setIsLoadingTime] = useState<boolean>(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  // --- Effects ---

  // 1. Initialize Theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // 2. Apply Theme Class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // 3. Fetch Internet Time
  const syncTime = useCallback(async () => {
    setIsLoadingTime(true);
    setTimeError(null);
    try {
      // Now returns { now: Date, source: string }
      const { now, source } = await fetchInternetTime();
      const deviceNow = Date.now();
      const offset = now.getTime() - deviceNow;
      
      setTimeOffset(offset);
      setTimeSource(source);
    } catch (err) {
      setTimeError('Could not sync time');
      setTimeOffset(null);
      setTimeSource('Offline');
    } finally {
      setIsLoadingTime(false);
    }
  }, []);

  // Initial Sync
  useEffect(() => {
    syncTime();
  }, [syncTime]);

  // --- Calculations ---
  
  const referenceDate = useMemo(() => {
    return new Date(Date.now() + (timeOffset || 0));
  }, [timeOffset, arrivalTime, adjustmentMinutes, manualOffset]); 

  const calculationResult = useMemo(() => 
    calculateLogoutTimes(arrivalTime, adjustmentMinutes, manualOffset, referenceDate), 
  [arrivalTime, adjustmentMinutes, manualOffset, referenceDate]);

  // --- Handlers ---

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen px-4 pb-12 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main className="grid lg:grid-cols-12 gap-6 md:gap-8 items-start">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7">
          <TimeCard 
            arrivalTime={arrivalTime}
            setArrivalTime={setArrivalTime}
            adjustment={adjustmentMinutes}
            setAdjustment={setAdjustmentMinutes}
            manualOffset={manualOffset}
            setManualOffset={setManualOffset}
            timeOffset={timeOffset}
            isLoadingTime={isLoadingTime}
            timeError={timeError}
            refreshTime={syncTime}
          />
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5 w-full sticky top-6">
          <ResultDisplay 
            result={calculationResult} 
            timeOffset={timeOffset}
            arrivalTime={arrivalTime}
            manualOffset={manualOffset}
          />
        </div>
      </main>
      
      <footer className="mt-16 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Smart Workday Calculator. Internet Time Synced via {timeSource}.</p>
      </footer>
    </div>
  );
};

export default App;
