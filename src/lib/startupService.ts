
import { supabase } from './supabase';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';

export interface StartupCheckIn {
  Id: number;
  StartupName: string;
  CheckInTime: string;
  CheckInRole: string;
  AcceleratorName: string;
}

export interface CheckInDataPoint {
  date: string;
  count: number;
}

export async function fetchStartupCheckIns(
  startupName: string = '',
  fromDate?: Date,
  toDate?: Date
): Promise<StartupCheckIn[]> {
  let query = supabase
    .from('StartupCheckIns')
    .select('Id, StartupName, CheckInTime, CheckInRole, AcceleratorName');

  // Apply startup name filter if provided
  if (startupName) {
    query = query.ilike('StartupName', `%${startupName}%`);
  }

  // Apply date range filters if provided
  if (fromDate) {
    query = query.gte('CheckInTime', startOfDay(fromDate).toISOString());
  }
  
  if (toDate) {
    query = query.lte('CheckInTime', endOfDay(toDate).toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching startup check-ins:', error);
    throw new Error('Failed to fetch startup check-ins');
  }

  return data || [];
}

export function aggregateCheckInsByDay(checkIns: StartupCheckIn[]): CheckInDataPoint[] {
  const aggregated: Record<string, number> = {};

  // Group check-ins by day
  checkIns.forEach(checkIn => {
    const date = format(parseISO(checkIn.CheckInTime), 'yyyy-MM-dd');
    aggregated[date] = (aggregated[date] || 0) + 1;
  });

  // Convert to array format for the chart
  return Object.entries(aggregated)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateCheckInsByMonth(checkIns: StartupCheckIn[]): CheckInDataPoint[] {
  const aggregated: Record<string, number> = {};

  // Group check-ins by month
  checkIns.forEach(checkIn => {
    const date = format(parseISO(checkIn.CheckInTime), 'yyyy-MM');
    aggregated[date] = (aggregated[date] || 0) + 1;
  });

  // Convert to array format for the chart
  return Object.entries(aggregated)
    .map(([date, count]) => ({ date: `${date}-01`, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateCheckInsByYear(checkIns: StartupCheckIn[]): CheckInDataPoint[] {
  const aggregated: Record<string, number> = {};

  // Group check-ins by year
  checkIns.forEach(checkIn => {
    const date = format(parseISO(checkIn.CheckInTime), 'yyyy');
    aggregated[date] = (aggregated[date] || 0) + 1;
  });

  // Convert to array format for the chart
  return Object.entries(aggregated)
    .map(([date, count]) => ({ date: `${date}-01-01`, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateCheckInsByGranularity(
  checkIns: StartupCheckIn[],
  granularity: 'daily' | 'monthly' | 'yearly'
): CheckInDataPoint[] {
  switch (granularity) {
    case 'daily':
      return aggregateCheckInsByDay(checkIns);
    case 'monthly':
      return aggregateCheckInsByMonth(checkIns);
    case 'yearly':
      return aggregateCheckInsByYear(checkIns);
    default:
      return aggregateCheckInsByDay(checkIns);
  }
}