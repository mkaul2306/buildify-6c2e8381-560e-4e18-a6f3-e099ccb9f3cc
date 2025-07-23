
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

  // Get all startup names from StartupCheckIns table
  const { data, error } = await supabase
    .from('StartupCheckIns')
    .select('StartupName')
    .ilike('StartupName', `%${searchTerm}%`)
    .order('StartupName');

  if (error) {
    console.error('Error searching startups:', error);
    return [];
  }

  // Get unique startup names
  const uniqueStartupNames = Array.from(new Set(data.map(item => item.StartupName)));
  
  // Transform the data to match the Startup interface
  return uniqueStartupNames.map((name, index) => ({
    id: index, // Using index as ID since we don't have a real ID
    name: name,
    industry: 'N/A', // We don't have this information in StartupCheckIns
    founded_date: new Date().toISOString(), // Placeholder
    created_at: new Date().toISOString() // Placeholder
  })) as Startup[];
}

// Fetch check-ins for a specific startup
export async function fetchStartupCheckIns(
  startupId: number,
  fromDate?: Date,
  toDate?: Date
) {
  // Since we're using the search results directly, we need to get the startup name
  // from our searchResults array which is passed via the startupId parameter
  const { data: startupData } = await supabase
    .from('StartupCheckIns')
    .select('StartupName')
    .order('StartupName')
    .limit(100);
  
  if (!startupData || startupData.length === 0) {
    console.error('No startups found');
    return [];
  }
  
  // Get unique startup names
  const uniqueStartups = Array.from(new Set(startupData.map(s => s.StartupName)));
  
  if (startupId >= uniqueStartups.length) {
    console.error('Startup ID out of range:', startupId);
    return [];
  }
  
  const startupName = uniqueStartups[startupId];
  
  // Query check-ins for this startup name
  let query = supabase
    .from('StartupCheckIns')
    .select('*')
    .eq('StartupName', startupName)
    .order('CheckInTime', { ascending: true });

  if (fromDate) {
    query = query.gte('CheckInTime', format(fromDate, 'yyyy-MM-dd'));
  }

  if (toDate) {
    // Add one day to include the end date
    const nextDay = new Date(toDate);
    nextDay.setDate(nextDay.getDate() + 1);
    query = query.lt('CheckInTime', format(nextDay, 'yyyy-MM-dd'));
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching startup check-ins:', error);
    return [];
  }

  console.log('Raw check-in data:', data); // Debug log

  // Transform the data to the format expected by the chart
  return data.map(item => ({
    date: format(new Date(item.CheckInTime), 'yyyy-MM-dd'),
    status: item.CheckInType?.toString() || 'Unknown',
    notes: item.LastWorkedOn || ''
  }));
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
  if (!data || data.length === 0) {
    console.log('No data to aggregate');
    return [];
  }

  console.log('Aggregating data with granularity:', granularity);
  console.log('Sample data item:', data[0]);

  if (granularity === 'daily') {
    return data.map(item => ({
      date: item.date,
      value: item[valueField] || 0
    }));
  }

  const aggregated: Record<string, number> = {};
  
  data.forEach(item => {
    try {
      // Handle different date formats
      let date;
      if (item.date.includes('T') || item.date.includes(' ')) {
        // If it's a full timestamp, parse it
        date = parseISO(item.date);
      } else {
        // If it's just a date (YYYY-MM-DD), parse it
        date = parseISO(item.date);
      }
      
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
    } catch (err) {
      console.error('Error aggregating data for item:', item, err);
    }
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