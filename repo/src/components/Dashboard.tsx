
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
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [dateRange, granularity]);

  // Format date for display
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
          Monitoring user attachment activity and storage metrics
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
        <>
          {/* Top metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Total Uploads</h3>
              <p className="text-3xl font-bold">
                {uploadData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">{formatDateRange()}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Active Users</h3>
              <p className="text-3xl font-bold">
                {userCountData.length > 0 
                  ? Math.max(...userCountData.map(d => d.value)).toLocaleString() 
                  : '0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Peak during selected period</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Storage Used</h3>
              <p className="text-3xl font-bold">
                {(storageData.reduce((sum, item) => sum + item.value, 0) / (1024 * 1024)).toFixed(2)} MB
              </p>
              <p className="text-sm text-gray-500 mt-1">Total for selected period</p>
            </Card>
          </div>
          
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h3 className="text-xl font-medium mb-4">Upload Activity</h3>
              <LineChart 
                data={uploadData} 
                xAxisKey="date" 
                yAxisKey="value"
                xAxisLabel="Time Period"
                yAxisLabel="Number of Uploads"
                tooltipLabel="Uploads"
              />
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-medium mb-4">User Activity</h3>
              <LineChart 
                data={userCountData} 
                xAxisKey="date" 
                yAxisKey="value"
                xAxisLabel="Time Period"
                yAxisLabel="Number of Users"
                tooltipLabel="Active Users"
              />
            </Card>
          </div>
          
          {/* Bottom charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-medium mb-4">Storage Usage</h3>
              <BarChart 
                data={storageData} 
                xAxisKey="date" 
                yAxisKey="value"
                xAxisLabel="Time Period"
                yAxisLabel="Storage (KB)"
                tooltipLabel="Storage Used"
                valueFormatter={(value) => `${(value / 1024).toFixed(2)} MB`}
              />
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-medium mb-4">File Type Distribution</h3>
              <PieChart 
                data={fileTypeData} 
                nameKey="file_type" 
                valueKey="count"
                tooltipLabel="Files"
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}