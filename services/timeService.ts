
const GITHUB_API = 'https://api.github.com';
const TIMEAPI_IO = 'https://timeapi.io/api/Time/current/zone?timeZone=UTC';
const WORLDTIME_API = 'https://worldtimeapi.org/api/ip';

/**
 * Fetches the current time from highly reliable internet sources.
 * Strategy:
 * 1. GitHub API (HEAD request) - Extremely high availability, fast, returns Date header.
 * 2. TimeAPI.io (JSON) - Robust fallback.
 * 3. WorldTimeAPI (JSON) - Final fallback.
 */
export const fetchInternetTime = async (): Promise<Date> => {
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

  // 1. GitHub API (HEAD request)
  try {
    // We strictly use HEAD to save bandwidth and reduce latency
    const response = await fetchWithTimeout(GITHUB_API, { method: 'HEAD', cache: 'no-store' });
    if (!response.ok) throw new Error('GitHub API Error');
    
    const dateHeader = response.headers.get('date');
    if (!dateHeader) throw new Error('No Date header in GitHub response');
    
    return new Date(dateHeader);
  } catch (error) {
    console.warn('Primary (GitHub) time source failed, switching to fallback.', error);
  }

  // 2. TimeAPI.io
  try {
    const response = await fetchWithTimeout(TIMEAPI_IO);
    if (!response.ok) throw new Error('TimeAPI Error');
    const data = await response.json();
    
    let dateStr = data.dateTime;
    if (typeof dateStr === 'string' && !dateStr.endsWith('Z')) {
        dateStr += 'Z';
    }
    return new Date(dateStr);
  } catch (error) {
    console.warn('Secondary (TimeAPI) source failed, switching to tertiary.', error);
  }

  // 3. WorldTimeAPI
  try {
    const response = await fetchWithTimeout(WORLDTIME_API);
    if (!response.ok) throw new Error('WorldTimeAPI Error');
    const data = await response.json();
    return new Date(data.datetime);
  } catch (error) {
    console.error('All time sources failed.', error);
    throw new Error('Could not fetch internet time. Please check your connection.');
  }
};
