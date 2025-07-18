
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { BarChart, LineChart } from '../components/ui/chart';

const UserActivity = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [actionType, setActionType] = useState('all');

  const { data: userActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['userActivity', timeRange, actionType],
    queryFn: async () => {
      let query = supabase
        .from('user_activity')
        .select('*')
        .order('action_timestamp', { ascending: false });
      
      if (actionType !== 'all') {
        query = query.eq('action_type', actionType);
      }
      
      if (timeRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
        query = query.gte('action_timestamp', daysAgo.toISOString());
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: actionTypes } = useQuery({
    queryKey: ['actionTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity')
        .select('action_type')
        .distinct();
      
      if (error) throw error;
      return data.map(item => item.action_type);
    }
  });

  const { data: activityByDay } = useQuery({
    queryKey: ['activityByDay', timeRange, actionType],
    queryFn: async () => {
      // This would typically be a view or a complex query
      // For now, we'll simulate it by grouping the activity data by day
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange === 'all' ? '90' : timeRange));
      
      let query = supabase
        .from('user_activity')
        .select('action_timestamp, action_type')
        .gte('action_timestamp', daysAgo.toISOString());
      
      if (actionType !== 'all') {
        query = query.eq('action_type', actionType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Group by day
      const groupedByDay = data.reduce((acc, item) => {
        const day = new Date(item.action_timestamp).toISOString().split('T')[0];
        if (!acc[day]) {
          acc[day] = { date: day, count: 0 };
        }
        acc[day].count++;
        return acc;
      }, {});
      
      return Object.values(groupedByDay).sort((a: any, b: any) => a.date.localeCompare(b.date));
    }
  });

  const { data: activityByType } = useQuery({
    queryKey: ['activityByType', timeRange],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange === 'all' ? '90' : timeRange));
      
      const { data, error } = await supabase
        .from('user_activity')
        .select('action_type')
        .gte('action_timestamp', daysAgo.toISOString());
      
      if (error) throw error;
      
      // Group by action type
      const groupedByType = data.reduce((acc, item) => {
        if (!acc[item.action_type]) {
          acc[item.action_type] = { type: item.action_type, count: 0 };
        }
        acc[item.action_type].count++;
        return acc;
      }, {});
      
      return Object.values(groupedByType);
    }
  });

  // Format data for charts
  const activityByDayData = activityByDay?.map((day: any) => ({
    name: new Date(day.date).toLocaleDateString(),
    activities: day.count,
  })) || [];

  const activityByTypeData = activityByType?.map((type: any) => ({
    name: type.type,
    count: type.count,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Activity</h1>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="md:max-w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionType} onValueChange={setActionType}>
          <SelectTrigger className="md:max-w-[180px]">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actionTypes?.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="