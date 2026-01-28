/**
 * Date utility functions for workout tracking and statistics
 */

/**
 * Format a date to a specific format string
 * @param date - Date to format
 * @param format - Format string ('YYYY-MM-DD', 'MMM DD', 'DD/MM/YYYY', etc.)
 * @returns Formatted date string
 */
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[date.getMonth()];

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MMM DD':
      return `${monthName} ${day}`;
    case 'MMM DD, YYYY':
      return `${monthName} ${day}, ${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

/**
 * Get ISO week number for a given date
 * @param date - Date to get week number for
 * @returns ISO week number (1-53)
 */
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * Get array of dates between start and end (inclusive)
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of dates
 */
export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * Add days to a date
 * @param date - Starting date
 * @param days - Number of days to add
 * @returns New date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Subtract days from a date
 * @param date - Starting date
 * @param days - Number of days to subtract
 * @returns New date
 */
export const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

/**
 * Get the start of the week (Monday) for a given date
 * @param date - Date to get week start for
 * @returns Date representing start of week
 */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

/**
 * Get the start of the month for a given date
 * @param date - Date to get month start for
 * @returns Date representing start of month
 */
export const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get number of days between two dates
 * @param start - Start date
 * @param end - End date
 * @returns Number of days
 */
export const getDaysBetween = (start: Date, end: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay));
};

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param date - Date to format
 * @returns ISO formatted string
 */
export const formatISODate = (date: Date): string => {
  return formatDate(date, 'YYYY-MM-DD');
};

/**
 * Parse ISO date string to Date
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns Date object
 */
export const parseISODate = (dateStr: string): Date => {
  return new Date(dateStr);
};

/**
 * Get date range for last N weeks
 * @param weeks - Number of weeks
 * @returns Object with startDate and endDate
 */
export const getLastNWeeks = (weeks: number): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = subtractDays(endDate, weeks * 7);
  return { startDate, endDate };
};

/**
 * Get date range for last N months
 * @param months - Number of months
 * @returns Object with startDate and endDate
 */
export const getLastNMonths = (months: number): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - months);
  return { startDate, endDate };
};

/**
 * Get the start of today
 * @returns Date representing start of today
 */
export const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Get the start of yesterday
 * @returns Date representing start of yesterday
 */
export const getYesterday = (): Date => {
  return subtractDays(getToday(), 1);
};

/**
 * Format week identifier (YYYY-WW format)
 * @param date - Date to get week identifier for
 * @returns Week identifier string
 */
export const formatWeekIdentifier = (date: Date): string => {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
};

/**
 * Check if date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Get day of week as string
 * @param date - Date to get day for
 * @returns Day name (Mon, Tue, etc.)
 */
export const getDayOfWeek = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};
