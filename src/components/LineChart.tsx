
import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface DataPoint {
  date: string
  count: number
}

interface LineChartProps {
  data: DataPoint[]
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(value) => format(parseISO(value), 'MMM d')}
        />
        <YAxis />
        <Tooltip 
          labelFormatter={(value) => format(parseISO(value as string), 'MMMM d, yyyy')}
          formatter={(value) => [value, 'Count']}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}