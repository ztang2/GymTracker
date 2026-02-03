import type { TimeRange } from '../types';
import { formatISODate, subtractDays } from '../../utils/dateUtils';

/**
 * Get date range based on TimeRange enum
 */
export function getDateRangeForTimeRange(range: TimeRange): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = formatISODate(today);

  switch (range) {
    case 'week':
      return { startDate: formatISODate(subtractDays(today, 7)), endDate };
    case 'month':
      return { startDate: formatISODate(subtractDays(today, 30)), endDate };
    case '3months':
      return { startDate: formatISODate(subtractDays(today, 90)), endDate };
    case 'year':
      return { startDate: formatISODate(subtractDays(today, 365)), endDate };
    case 'all':
      return { startDate: formatISODate(subtractDays(today, 3650)), endDate };
    default:
      return { startDate: formatISODate(subtractDays(today, 30)), endDate };
  }
}
