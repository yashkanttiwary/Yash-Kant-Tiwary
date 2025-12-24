import React, { useMemo } from 'react';
import { Bell, Smartphone, Monitor, Command, Calendar, Clock, ArrowRight } from 'lucide-react';
import { getPlatform, getPlatformLabel } from '../utils/platformUtils';

interface AlarmButtonProps {
  targetDate: Date | null;
  manualOffset: number;
}

export const AlarmButton: React.FC<AlarmButtonProps> = ({ targetDate, manualOffset }) => {
  const platform = useMemo(() => getPlatform(), []);

  if (!targetDate) return null;

  const handleAndroidAlarm = () => {
    if (!targetDate) return;

    const hour = targetDate.getHours();
    const minute = targetDate.getMinutes();
    const message = `Log Out Now!${manualOffset !== 0 ? ` (Offset: ${manualOffset}m)` : ''}`;

    // Android Intent to open the native Clock app and set an alarm
    // uses the 'intent:' scheme which works in Chrome on Android
    const intentUrl = `intent:#Intent;action=android.intent.action.SET_ALARM;i.hour=${hour};i.minutes=${minute};S.message=${encodeURIComponent(message)};B.skipUi=true;end`;
    
    window.location.href = intentUrl;
  };

  const handleICSDownload = () => {
    if (!targetDate) return;

    // Create a "Floating Time" format (YYYYMMDDTHHMMSS) without 'Z'.
    // This forces the device to treat the time as "Local Device Time".
    const year = targetDate.getFullYear();
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const day = targetDate.getDate().toString().padStart(2, '0');
    const hours = targetDate.getHours().toString().padStart(2, '0');
    const minutes = targetDate.getMinutes().toString().padStart(2, '0');
    const seconds = '00';

    const floatingTime = `${year}${month}${day}T${hours}${minutes}${seconds}`;

    const title = "🏠 Log Out Now!";
    const description = `Time to leave work! (Calculated by Smart Workday Calculator)${manualOffset !== 0 ? ` Note: Includes your ${manualOffset}min clock offset.` : ''}`;

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
      'TRIGGER:-PT0M', // Trigger 0 minutes before
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

  const isAndroid = platform === 'Android';

  const handleClick = () => {
    if (isAndroid) {
      handleAndroidAlarm();
    } else {
      handleICSDownload();
    }
  };

  const getButtonContent = () => {
    if (isAndroid) {
      return {
        icon: <Clock className="w-5 h-5 text-emerald-100" />,
        title: "Set Alarm on Device",
        subtitle: "Opens your Clock app directly",
        actionIcon: <ArrowRight className="w-4 h-4 opacity-60 ml-auto" />
      };
    }
    
    // Fallback for iOS / Desktop
    const label = getPlatformLabel(platform);
    let Icon = Calendar;
    if (platform === 'iOS') Icon = Smartphone;
    if (platform === 'Mac') Icon = Command;
    if (platform === 'Windows') Icon = Monitor;

    return {
      icon: <Icon className="w-5 h-5 text-white" />,
      title: "Add to Calendar",
      subtitle: `Reminder for ${label}`,
      actionIcon: <Calendar className="w-4 h-4 opacity-60 ml-auto" />
    };
  };

  const content = getButtonContent();

  return (
    <button
      onClick={handleClick}
      className={`w-full mt-4 flex items-center justify-start gap-3 p-4 rounded-xl transition-all active:scale-95 shadow-lg group border backdrop-blur-sm ${
        isAndroid 
          ? 'bg-emerald-600/30 hover:bg-emerald-600/40 border-emerald-400/30 text-white' 
          : 'bg-white/20 hover:bg-white/30 border-white/20 text-white'
      }`}
    >
      <div className={`p-2 rounded-full transition-colors ${isAndroid ? 'bg-emerald-500/30' : 'bg-white/20 group-hover:bg-white/30'}`}>
        {content.icon}
      </div>
      
      <div className="text-left">
        <div className="font-bold text-sm">{content.title}</div>
        <div className="text-[10px] opacity-80 uppercase tracking-wide font-medium">
          {content.subtitle}
        </div>
      </div>
      
      {content.actionIcon}
    </button>
  );
};