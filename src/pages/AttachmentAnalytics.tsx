
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { LineChart, BarChart } from '../components/ui/chart';

const AttachmentAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('30');

  const { data: attachments, isLoading: isLoadingAttachments } = useQuery({
    queryKey: ['attachments', searchTerm, fileTypeFilter, timeRange],
    queryFn: async () => {
      let query = supabase
        .from('attachments')
        .select('*')
        .order('upload_timestamp', { ascending: false });
      
      if (searchTerm) {
        query = query.ilike('file_name', `%${searchTerm}%`);
      }
      
      if (fileTypeFilter !== 'all') {
        query = query.eq('file_type', fileTypeFilter);
      }
      
      if (timeRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
        query = query.gte('upload_timestamp', daysAgo.toISOString());
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: fileTypes } = useQuery({
    queryKey: ['fileTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('file_type_distribution')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: dailyMetrics } = useQuery({
    queryKey: ['dailyAttachmentMetrics', timeRange],
    queryFn: async () => {
      let query = supabase
        .from('daily_attachment_metrics')
        .select('*')
        .order('date', { ascending: true });
      
      if (timeRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
        query = query.gte('date', daysAgo.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });

  // Format data for charts
  const uploadsByDayData = dailyMetrics?.map(day => ({
    name: new Date(day.date).toLocaleDateString(),
    uploads: day.total_uploads,
  })) || [];

  const sizeByTypeData = fileTypes?.map(type => ({
    name: type.file_type,
    size: type.total_size / (1024 * 1024), // Convert to MB
  })) || [];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Attachment Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Uploads by Day</CardTitle>
            <CardDescription>
              Number of attachments uploaded over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <LineChart 
              data={uploadsByDayData}
              categories={['uploads']}
              index="name"
              colors={['blue']}
              valueFormatter={(value) => `${value}`}
              yAxisWidth={40}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage by File Type</CardTitle>
            <CardDescription>
              Total storage used by each file type (MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <BarChart 
              data={sizeByTypeData}
              categories={['size']}
              index="name"
              colors={['purple']}
              valueFormatter={(value) => `${value.toFixed(2)} MB`}
              yAxisWidth={60}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attachment List</CardTitle>
          <CardDescription>
            Browse and filter recent attachments
          </CardDescription>
          <div className="flex flex-col gap-4 pt-2 md:flex-row">
            <Input
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-[250px]"
            />
            <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
              <SelectTrigger className="md:max-w-[180px]">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {fileTypes?.map((type) => (
                  <SelectItem key={type.file_type} value={type.file_type}>
                    {type.file_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAttachments ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Upload Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attachments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No attachments found
                    </TableCell>
                  </TableRow>
                ) : (
                  attachments?.map((attachment) => (
                    <TableRow key={attachment.id}>
                      <TableCell className="font-medium">{attachment.file_name}</TableCell>
                      <TableCell>{attachment.file_type}</TableCell>
                      <TableCell>{formatFileSize(attachment.file_size)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={attachment.upload_status === 'success' ? 'success' : 'destructive'}
                        >
                          {attachment.upload_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attachment.upload_timestamp
                          ? new Date(attachment.upload_timestamp).toLocaleString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttachmentAnalytics;