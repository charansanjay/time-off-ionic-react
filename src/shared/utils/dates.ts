import { eachDayOfInterval, format, isWeekend, parseISO } from 'date-fns';

export const todayString = () => format(new Date(), 'yyyy-MM-dd');

export const countWorkingDays = (startDate: string, endDate: string) =>
  eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) }).filter(
    (day) => !isWeekend(day),
  ).length;

// "Mon 2 Nov" or "Mon 2 Nov – Fri 6 Nov"
export const formatDateRange = (startDate: string, endDate: string) => {
  const start = format(parseISO(startDate), 'EEE d MMM');
  if (startDate === endDate) return start;
  return `${start} – ${format(parseISO(endDate), 'EEE d MMM')}`;
};

// "1 Oct 2026, 10:00" in the user's local time (for moments like createdAt)
export const formatDateTime = (isoMoment: string) =>
  format(parseISO(isoMoment), 'd MMM yyyy, HH:mm');
