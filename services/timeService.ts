
import { TimeResponse } from '../types';

const SOURCES = [
  { 
    name: 'TimeAPI.io', 
    url: 'https://timeapi.io/api/Time/current/zone?timeZone=UTC',
    type: 'timeapi'
  },
  { 
    name: 'WorldTimeAPI', 
    url: 'https://worldtimeapi.org/api/timezone/Etc/UTC',
    type: 'worldtime'
  },
  {
    name: 'Jsontest.com',
    url: 'http://date.jsontest.com/',
    type: 'jsontest'
  }
];

/**
 * Fetches the current time from highly reliable internet sources.
 * Returns both the Date and the Source Name.
 */
export const fetchInternetTime = async (): Promise<TimeResponse> => {
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  for (const source of SOURCES) {
    try {
      console.log(`Attempting to fetch time from ${source.name}...`);
      const response = await fetchWithTimeout(source.url);
      if (!response.ok) throw new Error(`${source.name} returned ${response.status}`);
      
      const data = await response.json();
      let date: Date | null = null;

      // Parser logic based on API type
      if (source.type === 'timeapi') {
        let dateStr = data.dateTime;
        // Fix missing Z if necessary
        if (typeof dateStr === 'string' && !dateStr.endsWith('Z')) {
            dateStr += 'Z';
        }
        date = new Date(dateStr);
      } else if (source.type === 'worldtime') {
        date = new Date(data.datetime);
      } else if (source.type === 'jsontest') {
        // Returns milliseconds_since_epoch
        date = new Date(data.milliseconds_since_epoch);
      }

      if (date && !isNaN(date.getTime())) {
        return { now: date, source: source.name };
      }
    } catch (error) {
      console.warn(`${source.name} failed:`, error);
      // Continue to next source
    }
  }

  throw new Error('All internet time sources failed. Please check your connection.');
};
