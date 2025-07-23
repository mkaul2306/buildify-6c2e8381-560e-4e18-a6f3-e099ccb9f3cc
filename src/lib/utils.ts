
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addDays, format, isAfter, isBefore, parseISO, startOfDay, startOfMonth, startOfYear } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface DataPoint {
  date: string;
  count: number;
}

export type TimeGranularity = 'daily' | 'monthly' | 'yearly';

export function aggregateDataByGranularity(
  data: DataPoint[],
  granularity: TimeGranularity
): DataPoint[] {
  if (!data.length) return [];

  const aggregatedData: Record<string, number> = {};

  data.forEach((item) => {
    const date = parseISO(item.date);
    let key: string;

    switch (granularity) {
      case 'daily':
        key = format(date, 'yyyy-MM-dd');
        break;
      case 'monthly':
        key = format(date, 'yyyy-MM');
        break;
      case 'yearly':
        key = format(date, 'yyyy');
        break;
      default:
        key = item.date;
    }

    if (aggregatedData[key]) {
      aggregatedData[key] += item.count;
    } else {
      aggregatedData[key] = item.count;
    }
  });

  return Object.entries(aggregatedData).map(([date, count]) => {
    // Format the date based on granularity
    let formattedDate: string;
    switch (granularity) {
      case 'daily':
        formattedDate = date; // Already in yyyy-MM-dd format
        break;
      case 'monthly':
        formattedDate = `${date}-01`; // Convert yyyy-MM to yyyy-MM-01
        break;
      case 'yearly':
        formattedDate = `${date}-01-01`; // Convert yyyy to yyyy-01-01
        break;
      default:
        formattedDate = date;
    }
    
    return { date: formattedDate, count };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function filterDataByDateRange(
  data: DataPoint[],
  startDate: Date | undefined,
  endDate: Date | undefined
): DataPoint[] {
  if (!startDate && !endDate) return data;

  return data.filter((item) => {
    const itemDate = parseISO(item.date);
    
    if (startDate && endDate) {
      return !isBefore(itemDate, startOfDay(startDate)) && 
             !isAfter(itemDate, addDays(endDate, 1));
    }
    
    if (startDate && !endDate) {
      return !isBefore(itemDate, startOfDay(startDate));
    }
    
    if (!startDate && endDate) {
      return !isAfter(itemDate, addDays(endDate, 1));
    }
    
    return true;
  });
}

export function getFormattedDateByGranularity(
  dateStr: string,
  granularity: TimeGranularity
): string {
  const date = parseISO(dateStr);
  
  switch (granularity) {
    case 'daily':
      return format(date, 'MMM d');
    case 'monthly':
      return format(date, 'MMM yyyy');
    case 'yearly':
      return format(date, 'yyyy');
    default:
      return format(date, 'MMM d, yyyy');
  }
}

export function getLongFormattedDateByGranularity(
  dateStr: string,
  granularity: TimeGranularity
): string {
  const date = parseISO(dateStr);
  
  switch (granularity) {
    case 'daily':
      return format(date, 'MMMM d, yyyy');
    case 'monthly':
      return format(date, 'MMMM yyyy');
    case 'yearly':
      return format(date, 'yyyy');
    default:
      return format(date, 'MMMM d, yyyy');
  }
}