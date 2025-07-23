
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { TimeGranularityToggle, TimeGranularity } from './TimeGranularityToggle';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';
import { addDays, format, parseISO, subMonths } from 'date-fns';
import { 
  fetchDailyMetrics, 
  fetchFileTypeDistribution,
  aggregateDataByGranularity, 
  ChartDataPoint,
  FileTypeDistribution,
  searchStartups,
  Startup,
  fetchStartupCheckIns
} from '../lib/database';

export function Dashboard() {
  // Time granularity state
  const [granularity, setGranularity] = useState<TimeGranularity>('monthly');
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date()
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [startupCheckIns, setStartupCheckIns] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Data states
  const [isLoading, setIsLoading] = useState(true);
  const [uploadData, setUploadData] = useState<ChartDataPoint[]>([]);
  const [userCountData, setUserCountData] = useState<ChartDataPoint[]>([]);
  const [storageData, setStorageData] = useState<ChartDataPoint[]>([]);
  const [fileTypeData, setFileTypeData] = useState<FileTypeDistribution[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when date range changes
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const [metrics, fileTypes] = await Promise.all([
          fetchDailyMetrics(
            dateRange?.from || undefined,
            dateRange?.to || undefined
          ),
          fetchFileTypeDistribution()
        ]);
        
        // Process data for different charts
        const uploadChartData = aggregateDataByGranularity(metrics, granularity, 'total_uploads');
        const userChartData = aggregateDataByGranularity(metrics, granularity, 'unique_users');
        const storageChartData = aggregateDataByGranularity(metrics, granularity, 'total_size');
        
        setUploadData(uploadChartData);
        setUserCountData(userChartData);
        setStorageData(storageChartData);
        setFileTypeData(fileTypes);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [dateRange, granularity]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (granularity === 'daily') {
      return format(date, 'MMM d, yyyy');
    } else if (granularity === 'monthly') {
      return format(date, 'MMM yyyy');
    } else {
      return format(date, 'yyyy');
    }
  };

  // Calculate summary metrics
  const getTotalUploads = () => {
    return uploadData.reduce((sum, item) => sum + item.value, 0);
  };

  const getAverageUploadsPerPeriod = () => {
    if (uploadData.length === 0) return 0;
    return Math.round(getTotalUploads() / uploadData.length);
  };

  const getTotalStorage = () => {
    return storageData.reduce((sum, item) => sum + item.value, 0);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <TimeGranularityToggle 
          value={granularity} 
          onChange={setGranularity} 
        />
        <DateRangePicker 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange} 
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Total Uploads</h3>
              <p className="text-3xl font-bold">{getTotalUploads().toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Avg {getAverageUploadsPerPeriod().toLocaleString()} per {granularity.slice(0, -2)}
              </p>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Active Users</h3>
              <p className="text-3xl font-bold">
                {userCountData.length > 0 
                  ? userCountData[userCountData.length - 1].value.toLocaleString() 
                  : '0'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Last {granularity === 'daily' ? 'day' : granularity === 'monthly' ? 'month' : 'year'}
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Total Storage</h3>
              <p className="text-3xl font-bold">{formatBytes(getTotalStorage())}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Across all uploads
              </p>
            </Card>
          </div>

          {/* Charts - Removed Upload Trends and made User Activity full width */}
          <div className="mb-6">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">User Activity</h3>
              <div className="h-[300px]">
                <LineChart 
                  data={userCountData} 
                  xAxisKey="date" 
                  yAxisKey="value" 
                  formatXAxis={formatDate}
                  tooltipFormatter={(value) => value.toLocaleString()}
                />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Storage Usage Over Time</h3>
              <div className="h-[300px]">
                <BarChart 
                  data={storageData} 
                  xAxisKey="date" 
                  yAxisKey="value" 
                  formatXAxis={formatDate}
                  tooltipFormatter={(value) => formatBytes(value)}
                />
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">File Type Distribution</h3>
              <div className="h-[300px]">
                <PieChart 
                  data={fileTypeData.map(item => ({
                    name: item.file_type,
                    value: item.count
                  }))} 
                  tooltipFormatter={(value) => value.toLocaleString()}
                />
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}