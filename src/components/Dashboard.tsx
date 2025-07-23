
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { LineChart } from './LineChart';
import { TimeGranularityToggle, TimeGranularity } from './TimeGranularityToggle';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';
import { addDays, format, parseISO, subMonths } from 'date-fns';
import { 
  aggregateDataByGranularity, 
  ChartDataPoint,
  searchStartups,
  Startup,
  fetchStartupCheckIns
} from '../lib/database';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

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
  const [startupCheckIns, setStartupCheckIns] = useState<ChartDataPoint[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setError(null);
    try {
      const results = await searchStartups(searchTerm);
      console.log('Search results:', results);
      setSearchResults(results);
      
      if (results.length === 1) {
        // Auto-select if only one result
        handleStartupSelect(results[0]);
      } else if (results.length === 0) {
        setError(`No startups found matching "${searchTerm}". Try a different search term or check your spelling.`);
      }
    } catch (err) {
      console.error('Error searching startups:', err);
      setError('Failed to search startups. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle startup selection
  const handleStartupSelect = async (startup: Startup) => {
    setSelectedStartup(startup);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching check-ins for startup ID:', startup.id);
      const checkIns = await fetchStartupCheckIns(
        startup.id,
        dateRange?.from,
        dateRange?.to
      );
      
      console.log('Fetched check-ins:', checkIns); // Debug log
      
      // Aggregate based on selected granularity
      const aggregatedData = aggregateDataByGranularity(
        checkIns,
        granularity,
        'count'
      );
      
      console.log('Aggregated data:', aggregatedData); // Debug log
      
      setStartupCheckIns(aggregatedData);
      
      if (aggregatedData.length === 0) {
        setError(`No check-in data found for ${startup.name} in the selected date range.`);
      }
    } catch (err) {
      console.error('Error fetching startup check-ins:', err);
      setError('Failed to load check-in data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when date range or granularity changes for selected startup
  useEffect(() => {
    if (selectedStartup) {
      handleStartupSelect(selectedStartup);
    }
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

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search startup by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        
        {searchResults.length > 0 && !selectedStartup && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Search Results:</h3>
            <ul className="space-y-1">
              {searchResults.map(startup => (
                <li key={startup.id}>
                  <button
                    onClick={() => handleStartupSelect(startup)}
                    className="text-primary hover:underline text-left w-full py-1"
                  >
                    {startup.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Selected startup info */}
      {selectedStartup && (
        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center">
            {selectedStartup.name}
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 text-sm" 
              onClick={() => setSelectedStartup(null)}
            >
              (Change)
            </Button>
          </h2>
        </div>
      )}

      {/* Check-in chart */}
      {selectedStartup ? (
        isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Check-In History</h3>
            {startupCheckIns.length > 0 ? (
              <>
                <div className="h-[300px]">
                  <LineChart 
                    data={startupCheckIns} 
                    xAxisKey="date" 
                    yAxisKey="value" 
                    formatXAxis={formatDate}
                    tooltipFormatter={(value) => `${value} check-in${value !== 1 ? 's' : ''}`}
                  />
                </div>
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-1">Insights:</h4>
                  <p>
                    {startupCheckIns.length > 0 ? (
                      `${selectedStartup.name} had a total of ${startupCheckIns.reduce((sum, item) => sum + item.value, 0)} 
                      check-ins over ${startupCheckIns.length} ${granularity === 'daily' ? 'days' : 
                      granularity === 'monthly' ? 'months' : 'years'}.`
                    ) : 'No check-in data available for the selected time period.'}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No check-in data available for the selected time period.
              </div>
            )}
          </Card>
        )
      ) : (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No Startup Selected</h3>
          <p className="text-muted-foreground">
            Search for a startup above to view their check-in history.
          </p>
        </Card>
      )}
    </div>
  );
}