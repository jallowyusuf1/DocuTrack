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
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  // Use Math.floor instead of Math.ceil for accurate day count
  // This ensures days decrease correctly each day
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export type UrgencyLevel = 'urgent' | 'soon' | 'upcoming';

export const getUrgencyLevel = (expirationDate: string | Date): UrgencyLevel => {
  const daysUntil = getDaysUntil(expirationDate);
  if (daysUntil <= 7) return 'urgent';
  if (daysUntil <= 14) return 'soon';
  return 'upcoming';
};

export const getUrgencyColor = (level: UrgencyLevel): string => {
  switch (level) {
    case 'urgent':
      return 'red';
    case 'soon':
      return 'orange';
    case 'upcoming':
      return 'yellow';
    default:
      return 'gray';
  }
};

export const getUrgencyBgColor = (level: UrgencyLevel): string => {
  switch (level) {
    case 'urgent':
      return 'bg-red-50';
    case 'soon':
      return 'bg-orange-50';
    case 'upcoming':
      return 'bg-yellow-50';
    default:
      return 'bg-gray-50';
  }
};

export const getUrgencyBorderColor = (level: UrgencyLevel): string => {
  switch (level) {
    case 'urgent':
      return 'border-red-500';
    case 'soon':
      return 'border-orange-500';
    case 'upcoming':
      return 'border-yellow-500';
    default:
      return 'border-gray-300';
  }
};

export const getUrgencyTextColor = (level: UrgencyLevel): string => {
  switch (level) {
    case 'urgent':
      return 'text-red-600';
    case 'soon':
      return 'text-orange-600';
    case 'upcoming':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};
