
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
  FileTypeDistribution
} from '../lib/database';

export function Dashboard() {
  // Time granularity state
  const [granularity, setGranularity] = useState<TimeGranularity>('monthly');
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date()
  });

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
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [dateRange, granularity]);

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange?.from) return 'All time';
    
    const fromDate = format(dateRange.from, 'MMM d, yyyy');
    const toDate = dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : 'Present';
    
    return `${fromDate} - ${toDate}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Attachment Analytics Dashboard</h1>
        <p className="text-gray-600">
          Monitoring attachment usage and performance metrics
        </p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Trend Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Upload Activity</h2>
            <p className="text-sm text-gray-500 mb-4">{formatDateRange()}</p>
            <div className="h-80">
              <LineChart 
                data={uploadData} 
                xKey="date" 
                yKey="value" 
                label="Uploads" 
              />
            </div>
          </Card>
          
          {/* User Activity Chart */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Active Users</h2>
            <div className="h-64">
              <LineChart 
                data={userCountData} 
                xKey="date" 
                yKey="value" 
                label="Users" 
              />
            </div>
          </Card>
          
          {/* Storage Usage Chart */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Storage Usage</h2>
            <div className="h-64">
              <BarChart 
                data={storageData} 
                xKey="date" 
                yKey="value" 
                label="Storage (MB)" 
              />
            </div>
          </Card>
          
          {/* File Type Distribution */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">File Type Distribution</h2>
            <div className="h-64">
              <PieChart 
                data={fileTypeData.map(item => ({
                  name: item.file_type,
                  value: item.count
                }))} 
              />
            </div>
          </Card>
          
          {/* Key Metrics Summary */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Uploads</p>
                <p className="text-2xl font-bold">
                  {uploadData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold">
                  {userCountData.length > 0 
                    ? Math.max(...userCountData.map(d => d.value)).toLocaleString() 
                    : '0'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Storage Used</p>
                <p className="text-2xl font-bold">
                  {(storageData.reduce((sum, item) => sum + item.value, 0) / 1024).toFixed(2)} GB
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">File Types</p>
                <p className="text-2xl font-bold">
                  {fileTypeData.length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}