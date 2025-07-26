
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { LineChart } from './LineChart';
import { TimeGranularityToggle, TimeGranularity } from './TimeGranularityToggle';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';
import { addDays, format, parseISO, subMonths } from 'date-fns';
import { SearchInput } from './SearchInput';
import { 
  fetchStartupCheckIns, 
  aggregateCheckInsByGranularity,
  CheckInDataPoint,
  StartupCheckIn
} from '../lib/startupService';

export function StartupCheckInChart() {
  // Time granularity state
  const [granularity, setGranularity] = useState<TimeGranularity>('monthly');
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date()
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [isLoading, setIsLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<StartupCheckIn[]>([]);
  const [chartData, setChartData] = useState<CheckInDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when date range or search query changes
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchStartupCheckIns(
          searchQuery,
          dateRange?.from || undefined,
          dateRange?.to || undefined
        );
        
        setCheckIns(data);
      } catch (err) {
        console.error('Error loading check-in data:', err);
        setError('Failed to load check-in data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [dateRange, searchQuery]);

  // Process data when check-ins or granularity changes
  useEffect(() => {
    const aggregatedData = aggregateCheckInsByGranularity(checkIns, granularity);
    setChartData(aggregatedData);
  }, [checkIns, granularity]);

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
  const getTotalCheckIns = () => {
    return checkIns.length;
  };

  const getAverageCheckInsPerPeriod = () => {
    if (chartData.length === 0) return 0;
    return Math.round(getTotalCheckIns() / chartData.length);
  };

  const getUniqueStartups = () => {
    const uniqueStartups = new Set(checkIns.map(checkIn => checkIn.StartupName));
    return uniqueStartups.size;
  };

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <TimeGranularityToggle 
            value={granularity} 
            onChange={setGranularity} 
          />
          <SearchInput 
            onSearch={setSearchQuery}
            placeholder="Search startup name..."
            className="w-full sm:w-64"
          />
        </div>
        <DateRangePicker 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange} 
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Check-in chart */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">
          {searchQuery ? `Check-Ins for "${searchQuery}"` : 'All Startup Check-Ins'}
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : chartData.length > 0 ? (
          <>
            <div className="h-[300px]">
              <LineChart 
                data={chartData} 
                xAxisKey="date" 
                yAxisKey="count" 
                formatXAxis={formatDate}
                tooltipFormatter={(value) => `${value} check-in${value !== 1 ? 's' : ''}`}
              />
              {/* Debug info - remove in production */}
              <div className="text-xs text-gray-500 mt-2">
                Data points: {chartData.length} | 
                Sample: {chartData.length > 0 ? JSON.stringify(chartData[0]) : 'No data'}
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-md">
              <h4 className="font-medium mb-1">Insights:</h4>
              <p>
                {searchQuery ? (
                  `Startups matching "${searchQuery}" had a total of ${getTotalCheckIns()} 
                  check-ins over ${chartData.length} ${granularity === 'daily' ? 'days' : 
                  granularity === 'monthly' ? 'months' : 'years'}.`
                ) : (
                  `There were ${getTotalCheckIns()} check-ins from ${getUniqueStartups()} 
                  unique startups over ${chartData.length} ${granularity === 'daily' ? 'days' : 
                  granularity === 'monthly' ? 'months' : 'years'}.`
                )}
              </p>
              <p className="mt-2">
                Average of {getAverageCheckInsPerPeriod()} check-ins per {
                  granularity === 'daily' ? 'day' : 
                  granularity === 'monthly' ? 'month' : 'year'
                }.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? 
              `No check-ins found for startups matching "${searchQuery}" in the selected time period.` : 
              'No check-in data available for the selected time period.'}
          </div>
        )}
      </Card>
    </div>
  );
}