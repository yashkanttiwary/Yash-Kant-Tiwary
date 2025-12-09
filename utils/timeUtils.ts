
import { CalculationResult } from '../types';

export const WORK_DURATION_HOURS = 8;
export const WORK_DURATION_MINUTES = 30;
export const TOTAL_WORK_MINUTES = WORK_DURATION_HOURS * 60 + WORK_DURATION_MINUTES;

/**
 * Parses a "HH:mm" string into a Date object.
 * Logic:
 * 1. Uses referenceDate (default: now) for the date.
 * 2. Sets provided Hours/Minutes.
 * 3. Heuristic: If the resulting time is > 6 hours in the future compared to reference,
 *    assume it belongs to the previous day (e.g. entering 13:00 when it's 02:00).
 */
export const parseTimeInput = (timeStr: string, referenceDate: Date = new Date()): Date => {
  if (!timeStr) return new Date(referenceDate);

  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  let minutes = parseInt(minutesStr, 10);

  // Robustness check
  if (isNaN(hours) || isNaN(minutes)) {
    hours = referenceDate.getHours();
    minutes = referenceDate.getMinutes();
  }

  const date = new Date(referenceDate);
  date.setHours(hours, minutes, 0, 0);
  
  // Night Shift / Day Rollover Logic
  // If parsed date is significantly in the future (> 6 hours), assume yesterday.
  const diff = date.getTime() - referenceDate.getTime();
  const thresholdMs = 6 * 60 * 60 * 1000; // 6 hours
  
  if (diff > thresholdMs) {
    date.setDate(date.getDate() - 1);
  }

  return date;
};

/**
 * Formats a Date object to "HH:mm" string for input values.
 */
export const formatTimeForInput = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Formats a Date to a readable 12-hour string (e.g. "06:30 PM").
 */
export const formatDisplayTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Calculates the logout times based on arrival, adjustment, and manual clock offset.
 * 
 * Logic:
 * User Input Time - Manual Offset = ACTUAL Arrival Time
 * ACTUAL Arrival + Work Duration + Adjustment = ACTUAL Logout
 * ACTUAL Logout + Manual Offset = USER CLOCK Logout
 * 
 * @param referenceDate The "current" time context (e.g. Internet Time).
 * @param manualOffsetMinutes The minutes the user's clock is AHEAD (positive) or BEHIND (negative).
 */
export const calculateLogoutTimes = (
  arrivalTimeStr: string,
  adjustmentMinutes: number,
  manualOffsetMinutes: number,
  referenceDate: Date = new Date()
): CalculationResult => {
  if (!arrivalTimeStr) {
    return {
      actualStandardLogout: null,
      actualAdjustedLogout: null,
      userClockStandardLogout: null,
      userClockAdjustedLogout: null,
      totalDurationMinutes: TOTAL_WORK_MINUTES + adjustmentMinutes,
      isNextDayStandard: false,
      isNextDayAdjusted: false,
    };
  }

  // 1. Parse the input string (This is the time ON THE USER'S CLOCK)
  const userClockArrival = parseTimeInput(arrivalTimeStr, referenceDate);
  
  // 2. Calculate ACTUAL Arrival (User Clock Time - Offset)
  // If clock is 5 mins fast (offset 5), seeing 10:05 means it's actually 10:00.
  // 10:05 - 5 = 10:00.
  const actualArrival = new Date(userClockArrival.getTime() - (manualOffsetMinutes * 60000));
  
  // 3. Calculate ACTUAL Logout Times
  const actualStandardLogout = new Date(actualArrival.getTime() + TOTAL_WORK_MINUTES * 60000);
  const actualAdjustedLogout = new Date(actualStandardLogout.getTime() + adjustmentMinutes * 60000);

  // 4. Calculate USER CLOCK Logout Times (Actual + Offset)
  // If actual logout is 18:30, and clock is 5 mins fast, user should leave when clock says 18:35.
  const userClockStandardLogout = new Date(actualStandardLogout.getTime() + (manualOffsetMinutes * 60000));
  const userClockAdjustedLogout = new Date(actualAdjustedLogout.getTime() + (manualOffsetMinutes * 60000));

  return {
    actualStandardLogout,
    actualAdjustedLogout,
    userClockStandardLogout,
    userClockAdjustedLogout,
    totalDurationMinutes: TOTAL_WORK_MINUTES + adjustmentMinutes,
    isNextDayStandard: actualStandardLogout.getDate() !== actualArrival.getDate(),
    isNextDayAdjusted: actualAdjustedLogout.getDate() !== actualArrival.getDate(),
  };
};

/**
 * Calculates progress percentage (0-100)
 * Uses ACTUAL times for progress, so it represents real time.
 */
export const calculateProgress = (
  arrivalStr: string,
  manualOffsetMinutes: number,
  actualAdjustedLogout: Date | null,
  currentInternetTime: Date | null
): number => {
  if (!arrivalStr || !actualAdjustedLogout || !currentInternetTime) return 0;
  
  const userClockArrival = parseTimeInput(arrivalStr, currentInternetTime);
  const actualArrival = new Date(userClockArrival.getTime() - (manualOffsetMinutes * 60000));
  
  const totalMs = actualAdjustedLogout.getTime() - actualArrival.getTime();
  const elapsedMs = currentInternetTime.getTime() - actualArrival.getTime();

  if (totalMs <= 0) return 100;
  
  const percent = (elapsedMs / totalMs) * 100;
  return Math.min(Math.max(percent, 0), 100);
};
