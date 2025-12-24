import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { TimeCard, InputType } from './components/TimeCard';
import { ResultDisplay } from './components/ResultDisplay';
import { fetchInternetTime } from './services/timeService';
import { calculateLogoutTimes, DEFAULT_WORK_HOURS, DEFAULT_WORK_MINUTES } from './utils/timeUtils';
import { Theme } from './types';

const App: React.FC = () => {
  // --- State ---
  const [theme, setTheme] = useState<Theme>('light');
  const [arrivalTime, setArrivalTime] = useState<string>('');
  const [adjustmentMinutes, setAdjustmentMinutes] = useState<number>(0);
  
  // Shift Duration State (Default 8h 30m)
  const [workHours, setWorkHours] = useState<number>(DEFAULT_WORK_HOURS);
  const [workMinutes, setWorkMinutes] = useState<number>(DEFAULT_WORK_MINUTES);
  
  // Input Mode: 'actual' (Real World) or 'device' (Modified/Offset)
  const [inputType, setInputType] = useState<InputType>('actual');

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
  
  // Determine effective offset for calculation
  // If user says "Actual Time", then their "clock offset" is irrelevant for the arrival calculation (effectively 0).
  // If user says "Device Time", we use their manual offset.
  const effectiveOffset = inputType === 'device' ? manualOffset : 0;

  const referenceDate = useMemo(() => {
    return new Date(Date.now() + (timeOffset || 0));
  }, [timeOffset, arrivalTime, adjustmentMinutes, effectiveOffset, workHours, workMinutes]); 

  // Calculate total minutes for the current shift duration config
  const totalWorkMinutes = useMemo(() => workHours * 60 + workMinutes, [workHours, workMinutes]);
  
  const calculationResult = useMemo(() => 
    calculateLogoutTimes(arrivalTime, adjustmentMinutes, effectiveOffset, totalWorkMinutes, referenceDate), 
  [arrivalTime, adjustmentMinutes, effectiveOffset, totalWorkMinutes, referenceDate]);

  const workDurationLabel = `${workHours}h${workMinutes > 0 ? ` ${workMinutes}m` : ''}`;

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
            workHours={workHours}
            setWorkHours={setWorkHours}
            workMinutes={workMinutes}
            setWorkMinutes={setWorkMinutes}
            inputType={inputType}
            setInputType={setInputType}
          />
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5 w-full sticky top-6">
          <ResultDisplay 
            result={calculationResult} 
            timeOffset={timeOffset}
            arrivalTime={arrivalTime}
            manualOffset={effectiveOffset}
            workDurationLabel={workDurationLabel}
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