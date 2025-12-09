
export type Platform = 'iOS' | 'Android' | 'Windows' | 'Mac' | 'Linux' | 'Unknown';

export const getPlatform = (): Platform => {
  const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'iOS';
  }

  // Android detection
  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  // Windows detection
  if (/Win/.test(userAgent)) {
    return 'Windows';
  }

  // Mac detection
  if (/Mac/.test(userAgent)) {
    return 'Mac';
  }

  // Linux detection
  if (/Linux/.test(userAgent)) {
    return 'Linux';
  }

  return 'Unknown';
};

export const getPlatformLabel = (platform: Platform): string => {
  switch (platform) {
    case 'iOS': return 'iPhone/iPad Calendar';
    case 'Android': return 'Android Calendar';
    case 'Windows': return 'Outlook/Calendar';
    case 'Mac': return 'Apple Calendar';
    default: return 'Calendar';
  }
};
