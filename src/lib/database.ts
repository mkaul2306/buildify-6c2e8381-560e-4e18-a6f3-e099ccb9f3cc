
import { supabase } from './supabase';
import { format, parseISO } from 'date-fns';

export interface AttachmentData {
  id: number;
  attachment_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_status: string;
  upload_timestamp: string;
  storage_path: string | null;
}

export interface DailyMetrics {
  date: string;
  total_uploads: number;
  unique_users: number;
  total_size: number;
  successful_uploads: number;
  failed_uploads: number;
}

export interface FileTypeDistribution {
  file_type: string;
  count: number;
  total_size: number;
}

export interface StorageMetrics {
  date: string;
  total_storage: number;
  storage_growth: number;
}

export interface UserActivity {
  user_id: string;
  upload_count: number;
  last_activity: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

// Fetch attachments with optional filtering
export async function fetchAttachments(limit = 100, offset = 0) {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .range(offset, offset + limit - 1)
    .order('upload_timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching attachments:', error);
    return [];
  }

  return data as AttachmentData[];
}

// Fetch daily attachment metrics within a date range
export async function fetchDailyMetrics(fromDate?: Date, toDate?: Date) {
  let query = supabase
    .from('daily_attachment_metrics')
    .select('*')
    .order('date', { ascending: true });

  if (fromDate) {
    query = query.gte('date', format(fromDate, 'yyyy-MM-dd'));
  }

  if (toDate) {
    query = query.lte('date', format(toDate, 'yyyy-MM-dd'));
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching daily metrics:', error);
    return [];
  }

  return data as DailyMetrics[];
}

// Fetch file type distribution
export async function fetchFileTypeDistribution() {
  const { data, error } = await supabase
    .from('file_type_distribution')
    .select('*')
    .order('count', { ascending: false });

  if (error) {
    console.error('Error fetching file type distribution:', error);
    return [];
  }

  return data as FileTypeDistribution[];
}

// Fetch storage metrics within a date range
export async function fetchStorageMetrics(fromDate?: Date, toDate?: Date) {
  let query = supabase
    .from('storage_metrics')
    .select('*')
    .order('date', { ascending: true });

  if (fromDate) {
    query = query.gte('date', format(fromDate, 'yyyy-MM-dd'));
  }

  if (toDate) {
    query = query.lte('date', format(toDate, 'yyyy-MM-dd'));
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching storage metrics:', error);
    return [];
  }

  return data as StorageMetrics[];
}

// Fetch user activity
export async function fetchUserActivity(limit = 10) {
  const { data, error } = await supabase
    .from('user_activity')
    .select('*')
    .order('upload_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }

  return data as UserActivity[];
}

// Aggregate data based on time granularity
export function aggregateDataByGranularity(
  data: { date: string; [key: string]: any }[],
  granularity: 'daily' | 'monthly' | 'yearly',
  valueField: string
): ChartDataPoint[] {
  if (granularity === 'daily') {
    return data.map(item => ({
      date: item.date,
      value: item[valueField] || 0
    }));
  }

  const aggregated: Record<string, number> = {};
  
  data.forEach(item => {
    const date = parseISO(item.date);
    let key: string;
    
    if (granularity === 'monthly') {
      key = format(date, 'yyyy-MM');
    } else { // yearly
      key = format(date, 'yyyy');
    }
    
    if (!aggregated[key]) {
      aggregated[key] = 0;
    }
    
    aggregated[key] += (item[valueField] || 0);
  });
  
  return Object.entries(aggregated).map(([key, value]) => {
    let formattedDate: string;
    const [year, month] = key.split('-');
    
    if (granularity === 'monthly') {
      formattedDate = `${year}-${month}-01`;
    } else {
      formattedDate = `${year}-01-01`;
    }
    
    return {
      date: formattedDate,
      value
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}