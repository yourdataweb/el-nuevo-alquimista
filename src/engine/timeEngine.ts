import type { GameTime } from '../store/types';

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const DAY_NAMES_CA = ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_NAMES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export const MONTH_NAMES_CA = [
  'gener', 'febrer', 'març', 'abril', 'maig', 'juny',
  'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre',
];

export function formatTime(t: GameTime, lang: string = 'en'): string {
  const dayNames = lang === 'ca' ? DAY_NAMES_CA : lang === 'es' ? DAY_NAMES_ES : DAY_NAMES;
  const monthNames = lang === 'ca' ? MONTH_NAMES_CA : lang === 'es' ? MONTH_NAMES_ES : MONTH_NAMES;
  const dayName = dayNames[t.dayOfWeek];
  return `${dayName}, ${t.day} ${monthNames[t.month - 1]} ${t.year} — ${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
}

export function getHoursUntilNight(hour: number): number {
  return Math.max(0, 23 - hour);
}

export function isNightTime(hour: number): boolean {
  return hour >= 23 || hour < 7;
}

export function advanceTime(time: GameTime, hours: number): GameTime {
  const t = { ...time };
  let newHour = t.hour + hours;
  let newMinute = t.minute;
  let newDay = t.day;
  let newMonth = t.month;
  let newYear = t.year;
  let newDayOfWeek = t.dayOfWeek;

  if (newMinute >= 60) {
    newHour += Math.floor(newMinute / 60);
    newMinute = newMinute % 60;
  }

  if (newHour >= 24) {
    const days = Math.floor(newHour / 24);
    newHour = newHour % 24;
    newDay += days;
    newDayOfWeek = (newDayOfWeek + days) % 7;
  }

  const daysInMonth = new Date(newYear, newMonth, 0).getDate();
  if (newDay > daysInMonth) {
    newDay -= daysInMonth;
    newMonth += 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
  }

  const timeLabel = `${String(newDay).padStart(2, '0')}/${String(newMonth).padStart(2, '0')}/${newYear} ${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;

  return {
    day: newDay,
    month: newMonth,
    year: newYear,
    hour: newHour,
    minute: newMinute,
    dayOfWeek: newDayOfWeek,
    timeLabel,
  };
}

export function getDayPhase(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 23) return 'evening';
  return 'night';
}