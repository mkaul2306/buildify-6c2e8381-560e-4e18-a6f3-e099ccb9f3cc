
import { supabase } from '@/lib/supabase';

// Types
export interface Attachment {
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

export interface UserActivity {
  id: number;
  user_id: string;
  action_type: string;
  action_timestamp: string;
  details: Record<string, any>;
}

export interface StorageMetric {
  id: number;
  snapshot_date: string;
  total_storage_used: number;
  attachment_count: number;
  active_users_count: number;
  created_at: string;
}

export interface DailyAttachmentMetric {
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

// Dashboard summary
export async function fetchDashboardSummary() {
  // Get latest storage metrics
  const { data: latestMetrics } = await supabase
    .from('analytics.storage_metrics')
    .select('*')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  // Get attachment metrics for the last 7 days
  const { data: recentMetrics } = await supabase
    .from('analytics.daily_attachment_metrics')
    .select('*')
    .order('date', { ascending: false })
    .limit(7);

  // Get file type distribution
  const { data: fileTypes } = await supabase
    .from('analytics.file_type_distribution')
    .select('*')
    .order('count', { ascending: false });

  return {
    latestMetrics,
    recentMetrics: recentMetrics || [],
    fileTypes: fileTypes || []
  };
}

// Attachments
export async function fetchAttachments(limit = 100, offset = 0) {
  const { data, error, count } = await supabase
    .from('analytics.attachments')
    .select('*', { count: 'exact' })
    .order('upload_timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  
  return { data: data || [], count: count || 0 };
}

export async function fetchAttachmentMetrics() {
  const { data, error } = await supabase
    .from('analytics.daily_attachment_metrics')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  
  return data || [];
}

export async function fetchFileTypeDistribution() {
  const { data, error } = await supabase
    .from('analytics.file_type_distribution')
    .select