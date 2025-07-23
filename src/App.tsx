
import React, { useState, useMemo } from 'react'
import { LineChart } from './components/LineChart'
import { Card } from './components/ui/Card'
import { TimeGranularityToggle, TimeGranularity } from './components/TimeGranularityToggle'
import { DateRangePicker } from './components/DateRangePicker'
import { DateRange } from 'react-day-picker'
import { addDays, format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, isBefore, isAfter, subMonths, subYears } from 'date-fns'

function App() {
  // Time granularity state
  const [granularity, setGranularity] = useState<TimeGranularity>('monthly')
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date()
  })

  // Dummy data for the line chart
  const allData = [
    { date: '2025-01-01', count: 12 },
    { date: '2025-01-15', count: 15 },
    { date: '2025-02-01', count: 19 },
    { date: '2025-02-15', count: 21 },
    { date: '2025-03-01', count: 15 },
    { date: '2025-03-15', count: 18 },
    { date: '2025-04-01', count: 25 },
    { date: '2025-04-15', count: 27 },
    { date: '2025-05-01', count: 32 },
    { date: '2025-05-15', count: 30 },
    { date: '2025-06-01', count: 28 },
    { date: '2025-06-15', count: 29 },
    { date: '2025-07-01', count: 40 },
    { date: '2025-07-15', count: 45 },
  ]

  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (!dateRange?.from) return allData
    
    return allData.filter(item => {
      const itemDate = parseISO(item.date)
      if (dateRange.from && dateRange.to) {
        return isAfter(itemDate, dateRange.from) && isBefore(itemDate, dateRange.to)
      }
      return isAfter(itemDate, dateRange.from)
    })
  }, [allData, dateRange])

  // Aggregate data based on granularity
  const aggregatedData = useMemo(() => {
    if (granularity === 'daily') {
      return filteredData
    }
    
    const aggregated: Record<string, { date: string, count: number }> = {}
    
    filteredData.forEach(item => {
      const date = parseISO(item.date)
      let key: string
      
      if (granularity === 'monthly') {
        key = format(date, 'yyyy-MM')
      } else { // yearly
        key = format(date, 'yyyy')
      }
      
      if (!aggregated[key]) {
        aggregated[key] = {
          date: granularity === 'monthly' 
            ? format(startOfMonth(date), 'yyyy-MM-dd')
            : format(startOfYear(date), 'yyyy-MM-dd'),
          count: 0
        }
      }
      
      aggregated[key].count += item.count
    })
    
    return Object.values(aggregated)
  }, [filteredData, granularity])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Analytics Dashboard
        </h1>
        
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">Startup Check-Ins</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <TimeGranularityToggle 
                value={granularity} 
                onChange={setGranularity} 
              />
              <DateRangePicker 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange} 
              />
            </div>
          </div>
          
          <div className="h-80">
            <LineChart data={aggregatedData} />
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-md font-medium text-blue-800 mb-2">Insights</h3>
            <p className="text-sm text-blue-700">
              {aggregatedData.length > 0 ? (
                `There were a total of ${aggregatedData.reduce((sum, item) => sum + item.count, 0)} 
                check-ins in the selected period. The highest activity was on 
                ${format(parseISO(aggregatedData.sort((a, b) => b.count - a.count)[0].date), 'MMMM d, yyyy')}.`
              ) : (
                'No data available for the selected time period.'
              )}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default App