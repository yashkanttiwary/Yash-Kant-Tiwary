
import React, { useMemo } from 'react';
import { Bell, Smartphone, Monitor, Command, Download, Calendar } from 'lucide-react';
import { getPlatform, getPlatformLabel } from '../utils/platformUtils';

interface AlarmButtonProps {
  targetDate: Date | null;
  manualOffset: number;
}

export const AlarmButton: React.FC<AlarmButtonProps> = ({ targetDate, manualOffset }) => {
  const platform = useMemo(() => getPlatform(), []);

  if (!targetDate) return null;

  const handleSetAlarm = () => {
    if (!targetDate) return;

    // Create a "Floating Time" format (YYYYMMDDTHHMMSS) without 'Z'.
    // This forces the device to treat the time as "Local Device Time".
    // This is CRITICAL for users with incorrect clocks. 
    // If their clock is 17 mins fast, we want the alarm at their 17:17, not real 17:00.
    
    const year = targetDate.getFullYear();
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const day = targetDate.getDate().toString().padStart(2, '0');
    const hours = targetDate.getHours().toString().padStart(2, '0');
    const minutes = targetDate.getMinutes().toString().padStart(2, '0');
    const seconds = '00';

    const floatingTime = `${year}${month}${day}T${hours}${minutes}${seconds}`;

    const title = "🏠 Log Out Now!";
    const description = `Time to leave work! (Calculated by Smart Workday Calculator)${manualOffset !== 0 ? ` Note: Includes your ${manualOffset}min clock offset.` : ''}`;

    // Standard .ics format for a calendar event with an audio alarm
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smart Workday Calculator//EN',
      'BEGIN:VEVENT',
      `DTSTART:${floatingTime}`,
      `DTEND:${floatingTime}`, 
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT0M', // Trigger 0 minutes before (at the time of event)
      'ACTION:DISPLAY',
      'DESCRIPTION:Logout Reminder',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'logout_alarm.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getIcon = () => {
    switch (platform) {
      case 'iOS':
      case 'Android':
        return <Smartphone className="w-5 h-5" />;
      case 'Mac':
        return <Command className="w-5 h-5" />;
      case 'Windows':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <button
      onClick={handleSetAlarm}
      className="w-full mt-4 flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm p-4 rounded-xl transition-all active:scale-95 shadow-lg group"
    >
      <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
        {getIcon()}
      </div>
      <div className="text-left">
        <div className="font-bold text-sm">Set {platform === 'Unknown' ? '' : platform} Alarm</div>
        <div className="text-[10px] opacity-80 uppercase tracking-wide font-medium">
          Add to {getPlatformLabel(platform)}
        </div>
      </div>
      <Download className="w-4 h-4 opacity-60 ml-auto" />
    </button>
  );
};
