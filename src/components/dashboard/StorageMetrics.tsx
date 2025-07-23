
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, LineChart, PieChart } from '../ui/chart';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';

// Helper function to format bytes to human-readable format
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const StorageMetrics: React.FC = () => {
  // Fetch storage metrics history
  const { data: storageHistory, isLoading: isLoadingStorageHistory } = useQuery({
    queryKey: ['storageMetricsHistory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storage_metrics')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch file type distribution
  const { data: fileTypes, isLoading: isLoadingFileTypes } = useQuery({
    queryKey: ['fileTypeDistribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('file_type_distribution')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Get the latest storage metrics
  const latestStorageMetrics = storageHistory && storageHistory.length > 0 
    ? storageHistory[storageHistory.length - 1] 
    : null;

  // Format data for charts
  const storageUsageChartData = storageHistory?.map(item => ({
    name: new Date(item.date).toLocaleDateString(),
    used: item.total_size - item.available_size,
    available: item.available_size
  })) || [];

  const fileCountChartData = storageHistory?.map(item => ({
    name: new Date(item.date).toLocaleDateString(),
    count: item.file_count
  })) || [];

  const fileTypeChartData = fileTypes?.map(type => ({
    name: type.file_type,
    size: type.total_size,
    count: type.count
  })) || [];

  const fileTypeSizeData = fileTypes?.map(type => ({
    name: type.file_type,
    value: type.total_size
  })) || [];

  const fileTypeCountData = fileTypes?.map(type => ({
    name: type.file_type,
    value: type.count
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Storage Metrics</h1>
      </div>

      {/* Storage Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items