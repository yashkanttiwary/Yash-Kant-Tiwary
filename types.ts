
export interface TimeState {
  arrivalTime: string; // HH:mm format
  adjustmentMinutes: number;
}

export interface CalculationResult {
  // The objective, real-world times
  actualStandardLogout: Date | null;
  actualAdjustedLogout: Date | null;
  
  // The times as they would appear on the user's specific clock (with offset applied)
  userClockStandardLogout: Date | null;
  userClockAdjustedLogout: Date | null;
  
  totalDurationMinutes: number;
  
  // Day rollover flags
  isNextDayStandard: boolean;
  isNextDayAdjusted: boolean;
}

export type Theme = 'light' | 'dark';
