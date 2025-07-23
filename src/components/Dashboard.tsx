
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
        setUser