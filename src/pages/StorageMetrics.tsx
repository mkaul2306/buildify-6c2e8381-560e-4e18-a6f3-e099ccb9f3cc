
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

// Types
interface StorageMetric {
  id: number;
  date: string;
  total_storage_bytes: number;
  storage_used_bytes: number;
  file_count: number;
  avg_file_size_bytes: number;
}

// Helper functions
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Mock data (will be replaced with actual data from Supabase)
const mockStorageData: StorageMetric[] = [
  {
    id: 1,
    date: '2025-07-01',
    total_storage_bytes: 10737418240, // 10GB
    storage_used_bytes: 2147483648, // 2GB
    file_count: 1200,
    avg_file_size_bytes: 1789569
  },
  {
    id: 2,
    date: '2025-07-02',
    total_storage_bytes: 10737418240,
    storage_used_bytes: 2252341248, // 2.1GB
    file_count: 1250,
    avg_file_size_bytes: 1801873
  },
  {
    id: 3,
    date: '2025-07-03',
    total_storage_bytes: 10737418240,
    storage_used_bytes: 2365587456, // 2.2GB
    file_count: 1300,
    avg_file_size_bytes: 1819682
  },
  {
    id: 4,
    date: '2025-07-04',
    total_storage_bytes: 10737418240,
    storage_used_bytes: 2468241408, // 2.3GB
    file_count: 1350,
    avg_file_size_bytes: 1828327
  },
  {
    id: 5,
    date: '2025-07-05',
    total_storage_bytes: 10737418240,
    storage_used_bytes: 2576980992, // 2.4GB
    file_count: 1400,
    avg_file_size_bytes: 1840701
  },
  {
    id: 6,
    date: '2025-07-06',
    total_storage_bytes: 10737418240,
    storage_used_bytes: 2684354560, // 2.5GB
    file_count: 1450,
    avg_file_size_bytes: 1851279
  },
  {
    id: 7,
    date: '2025-07-07',
    total_storage_bytes: 10737418240,
    storage_used_bytes: 2791728128, // 2.6GB
    file_count: 1500,
    avg_file_size_bytes: 1861152
  }
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function StorageMetrics() {
  const [storageData, setStorageData] = useState<StorageMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('7days');

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, we would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('storage_metrics')
        //   .select('*')
        //   .order('date', { ascending: true });
        
        // if (error) throw error;
        
        // For now, use mock data
        setTimeout(() => {
          setStorageData(mockStorageData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching storage data:', error);
        setLoading(false);
      }
    };

    fetchStorageData();
  }, [timeRange]);

  // Calculate metrics
  const latestMetric = storageData.length > 0 ? storageData[storageData.length - 1] : null;
  const storageUsedPercentage = latestMetric 
    ? (latestMetric.storage_used_bytes / latestMetric.total_storage_bytes) * 100 
    : 0;
  
  // Prepare data for pie chart
  const pieData = latestMetric 
    ? [
        { name: 'Used Storage', value: latestMetric.storage_used_bytes },
        { name: 'Free Storage', value: latestMetric.total_storage_bytes - latestMetric.storage_used_bytes }
      ]
    : [];

  // Calculate growth rate
  const calculateGrowthRate = () => {
    if (storageData.length < 2) return 0;
    
    const oldestValue = storageData[0].storage_used_bytes;
    const newestValue = storageData[storageData.length - 1].storage_used_bytes;
    
    return ((newestValue - oldestValue) / oldestValue) * 100;
  };

  const growthRate = calculateGrowthRate();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Storage Metrics</h1>
        <p className="text-muted-foreground">
          Monitor storage usage, file counts, and growth trends
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestMetric ? formatBytes(latestMetric.total_storage_bytes) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum allocated storage
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestMetric ? formatBytes(latestMetric.storage_used_bytes) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {storageUsedPercentage.toFixed(1)}% of total capacity
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestMetric ? latestMetric.file_count.toLocaleString() : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Files stored in the system
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average File Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestMetric ? formatBytes(latestMetric.avg_file_size_bytes) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average size per file
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Time Range Tabs */}
          <Tabs defaultValue="7days" onValueChange={setTimeRange} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="7days">7 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
              <TabsTrigger value="1year">1 Year</TabsTrigger>
            </TabsList>
            
            {/* Charts Section */}
            <TabsContent value="7days" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Storage Usage Trend */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Storage Usage Trend</CardTitle>
                    <CardDescription>
                      Storage usage over the past 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={storageData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                        />
                        <YAxis 
                          tickFormatter={(value) => formatBytes(value, 1)}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatBytes(value), 'Storage Used']}
                          labelFormatter={(label) => formatDate(label as string)}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="storage_used_bytes" 
                          name="Storage Used" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Storage Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Storage Distribution</CardTitle>
                    <CardDescription>
                      Used vs. Available Storage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatBytes(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* File Count Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>File Count Trend</CardTitle>
                    <CardDescription>
                      Number of files over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={storageData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [value.toLocaleString(), 'Files']}
                          labelFormatter={(label) => formatDate(label as string)}
                        />
                        <Legend />
                        <Bar 
                          dataKey="file_count" 
                          name="File Count" 
                          fill="#00C49F" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Insights Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Storage Insights</CardTitle>
                  <CardDescription>
                    Analysis of current storage trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Storage Growth</h4>
                      <p className="text-sm text-muted-foreground">
                        Storage usage has {growthRate >= 0 ? 'increased' : 'decreased'} by {Math.abs(growthRate).toFixed(1)}% 
                        over the past {storageData.length} days. 
                        {growthRate > 10 ? ' This is a significant growth rate that may require attention.' : 
                          growthRate > 5 ? ' This is a moderate growth rate within normal parameters.' : 
                          ' This is a low growth rate indicating stable usage.'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Capacity Planning</h4>
                      <p className="text-sm text-muted-foreground">
                        {storageUsedPercentage > 80 ? 'Storage is nearing capacity. Consider increasing storage allocation or implementing cleanup procedures.' :
                          storageUsedPercentage > 60 ? 'Storage usage is moderate. Monitor growth trends for future planning.' :
                          'Storage usage is well within capacity limits. No immediate action required.'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">File Size Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Average file size is {latestMetric ? formatBytes(latestMetric.avg_file_size_bytes) : 'N/A'}.
                        {latestMetric && latestMetric.avg_file_size_bytes > 5000000 ? ' Large average file size may indicate inefficient storage usage or specific use cases requiring large files.' :
                          latestMetric && latestMetric.avg_file_size_bytes < 100000 ? ' Small average file size suggests efficient storage usage or predominantly text-based content.' :
                          ' Average file size is within normal parameters for mixed content types.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Other time ranges would have similar content but with different data ranges */}
            <TabsContent