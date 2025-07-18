
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, LineChart, PieChart } from '../components/ui/chart';
import { Skeleton } from '../components/ui/skeleton';

const Dashboard = () => {
  const { data: dailyMetrics, isLoading: isLoadingDailyMetrics } = useQuery({
    queryKey: ['dailyAttachmentMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_attachment_metrics')
        .select('*')
        .order('date', { ascending: true })
        .limit(30);
      
      if (error) throw error;
      return data;
    }
  });

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

  const { data: storageMetrics, isLoading: isLoadingStorageMetrics } = useQuery({
    queryKey: ['storageMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storage_metrics')
        .select('*')
        .order('date', { ascending: true })
        .limit(1);
      
      if (error) throw error;
      return data[0];
    }
  });

  // Format data for charts
  const uploadChartData = dailyMetrics?.map(day => ({
    name: new Date(day.date).toLocaleDateString(),
    uploads: day.total_uploads,
    users: day.unique_users
  })) || [];

  const fileTypeChartData = fileTypes?.map(type => ({
    name: type.file_type,
    value: type.count
  })) || [];

  const successRateData = dailyMetrics?.map(day => ({
    name: new Date(day.date).toLocaleDateString(),
    success: day.successful_uploads,
    failed: day.failed_uploads
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDailyMetrics ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {dailyMetrics?.reduce((sum, day) => sum + day.total_uploads, 0) || 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDailyMetrics ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {dailyMetrics?.reduce((sum, day) => Math.max(sum, day.unique_users), 0) || 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStorageMetrics ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {storageMetrics ? `${(storageMetrics.total_size / (1024 * 1024)).toFixed(2)} MB` : '0 MB'}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDailyMetrics ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {dailyMetrics && dailyMetrics.length > 0
                  ? `${(
                      (dailyMetrics.reduce((sum, day) => sum + day.successful_uploads, 0) /
                        dailyMetrics.reduce((sum, day) => sum + day.total_uploads, 0)) *
                      100
                    ).toFixed(1)}%`
                  : '0%'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="uploads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="uploads">Uploads Over Time</TabsTrigger>
          <TabsTrigger value="filetypes">File Types</TabsTrigger>
          <TabsTrigger value="success">Success Rate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="uploads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Activity</CardTitle>
              <CardDescription>
                Number of uploads and unique users over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingDailyMetrics ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <LineChart 
                  data={uploadChartData}
                  categories={['uploads', 'users']}
                  index="name"
                  colors={['blue', 'green']}
                  valueFormatter={(value) => `${value}`}
                  yAxisWidth={40}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="filetypes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File Type Distribution</CardTitle>
              <CardDescription>
                Breakdown of attachment types by count
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingFileTypes ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <PieChart 
                  data={fileTypeChartData}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value} files`}
                  colors={['blue', 'green', 'yellow', 'purple', 'pink', 'orange']}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="success" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Success vs Failures</CardTitle>
              <CardDescription>
                Daily breakdown of successful and failed uploads
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingDailyMetrics ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <BarChart 
                  data={successRateData}
                  categories={['success', 'failed']}
                  index="name"
                  colors={['green', 'red']}
                  stack={true}
                  valueFormatter={(value) => `${value}`}
                  yAxisWidth={40}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;