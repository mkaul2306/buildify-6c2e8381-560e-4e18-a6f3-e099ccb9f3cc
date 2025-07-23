
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

export interface Startup {
  id: number;
  name: string;
  industry: string;
  founded_date: string;
  created_at: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

// Fetch startups by name search
export async function searchStartups(searchTerm: string): Promise<Startup[]> {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }

  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('name')
    .limit(10);

  if (error) {
    console.error('Error searching startups:', error);
    return [];
  }

  return data as Startup[];
}

// Fetch check-ins for a specific startup
export async function fetchStartupCheckIns(
  startupId: number,
  fromDate?: Date,
  toDate?: Date
) {
  let query = supabase
    .from('check_ins')
    .select('*')
    .eq('startup_id', startupId)
    .order('check_in_date', { ascending: true });

  if (fromDate) {
    query = query.gte('check_in_date', format(fromDate, 'yyyy-MM-dd'));
  }

  if (toDate) {
    query = query.lte('check_in_date', format(toDate, 'yyyy-MM-dd'));
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching startup check-ins:', error);
    return [];
  }

  return data.map(item => ({
    date: item.check_in_date,
    status: item.status,
    notes: item.notes
  }));
}

// Fetch attachments with optional filtering
export async function fetchAttachments(
  limit = 100, 
  offset = 0, 
  searchTerm?: string,
  fileType?: string,
  fromDate?: Date,
  toDate?: Date
) {
  let query = supabase
    .from('attachments')
    .select('*');

  // Apply filters if provided
  if (searchTerm && searchTerm.trim() !== '') {
    query = query.or(`file_name.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%`);
  }

  if (fileType && fileType !== 'all') {
    query = query.eq('file_type', fileType);
  }

  if (fromDate) {
    query = query.gte('upload_timestamp', format(fromDate, 'yyyy-MM-dd'));
  }

  if (toDate) {
    // Add one day to include the end date fully
    const nextDay = new Date(toDate);
    nextDay.setDate(nextDay.getDate() + 1);
    query = query.lt('upload_timestamp', format(nextDay, 'yyyy-MM-dd'));
  }

  // Apply pagination and sorting
  query = query
    .range(offset, offset + limit - 1)
    .order('upload_timestamp', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching attachments:', error);
    return { data: [], count: 0 };
  }

  return { 
    data: data as AttachmentData[],
    count: count || 0
  };
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

// Fetch all available file types for filtering
export async function fetchFileTypes() {
  const { data, error } = await supabase
    .from('file_type_distribution')
    .select('file_type')
    .order('file_type', { ascending: true });

  if (error) {
    console.error('Error fetching file types:', error);
    return [];
  }

  return data.map(item => item.file_type);
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