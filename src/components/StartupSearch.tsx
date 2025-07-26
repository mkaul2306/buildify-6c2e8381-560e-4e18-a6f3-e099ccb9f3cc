
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart } from './LineChart';
import { TimeGranularity } from './TimeGranularityToggle';
import { format, parseISO } from 'date-fns';

interface StartupSearchProps {
  granularity: TimeGranularity;
  dateFrom?: Date;
  dateTo?: Date;
}

interface CheckInDataPoint {
  date: string;
  value: number;
}

export function StartupSearch({ granularity, dateFrom, dateTo }: StartupSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [chartData, setChartData] = useState<CheckInDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and fetch data when search term changes
  useEffect(() => {
    const searchStartups = async () => {
      if (!searchTerm.trim()) {
        setChartData([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Query the StartupCheckIns table with the search term
        let query = supabase
          .from('StartupCheckIns')
          .select('*')
          .ilike('StartupName', `%${searchTerm}%`)
          .order('CheckInTime', { ascending: true });

        // Apply date filters if provided
        if (dateFrom) {
          query = query.gte('CheckInTime', dateFrom.toISOString());
        }

        if (dateTo) {
          // Add one day to include the end date
          const nextDay = new Date(dateTo);
          nextDay.setDate(nextDay.getDate() + 1);
          query = query.lt('CheckInTime', nextDay.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error searching startups:', error);
          setError('Failed to search startups. Please try again.');
          setChartData([]);
          return;
        }

        if (!data || data.length === 0) {
          setChartData([]);
          setError(`No startups found matching "${searchTerm}"`);
          return;
        }

        // Aggregate the data based on granularity
        const aggregatedData = aggregateCheckInsByGranularity(data, granularity);
        setChartData(aggregatedData);
      } catch (err) {
        console.error('Unexpected error in searchStartups:', err);
        setError('An unexpected error occurred. Please try again.');
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search to avoid too many requests
    const timer = setTimeout(() => {
      searchStartups();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, granularity, dateFrom, dateTo]);

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

  // Aggregate check-ins based on granularity
  function aggregateCheckInsByGranularity(
    checkIns: any[],
    granularity: TimeGranularity
  ): CheckInDataPoint[] {
    const aggregated: Record<string, number> = {};

    checkIns.forEach(checkIn => {
      let dateKey: string;
      const date = new Date(checkIn.CheckInTime);

      if (granularity === 'daily') {
        dateKey = format(date, 'yyyy-MM-dd');
      } else if (granularity === 'monthly') {
        dateKey = format(date, 'yyyy-MM') + '-01'; // First day of month
      } else {
        dateKey = format(date, 'yyyy') + '-01-01'; // First day of year
      }

      if (!aggregated[dateKey]) {
        aggregated[dateKey] = 0;
      }
      aggregated[dateKey] += 1;
    });

    return Object.entries(aggregated)
      .map(([date, count]) => ({ date, value: count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            className="w-4 h-4 text-gray-500" 
            aria-hidden="true" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 20 20"
          >
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search startup name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : chartData.length > 0 ? (
        <div>
          <div className="h-[300px]">
            <LineChart 
              data={chartData} 
              xAxisKey="date" 
              yAxisKey="value" 
              formatXAxis={formatDate}
              tooltipFormatter={(value) => `${value} check-in${value !== 1 ? 's' : ''}`}
            />
          </div>
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <h4 className="font-medium mb-1">Insights:</h4>
            <p>
              {`Found ${chartData.reduce((sum, item) => sum + item.value, 0)} 
              check-ins for "${searchTerm}" over ${chartData.length} ${
                granularity === 'daily' ? '