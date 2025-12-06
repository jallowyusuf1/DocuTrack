import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const getRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getDateStatus = (date: string | Date): 'past' | 'today' | 'tomorrow' | 'upcoming' => {
  const dateObj = new Date(date);
  if (isPast(dateObj) && !isToday(dateObj)) return 'past';
  if (isToday(dateObj)) return 'today';
  if (isTomorrow(dateObj)) return 'tomorrow';
  return 'upcoming';
};

export const getDaysUntil = (date: string | Date): number => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

