
import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface LineChartProps {
  data: Array<{ [key: string]: any }>;
  xAxisKey: string;
  yAxisKey: string;
  formatXAxis?: (value: string) => string;
  tooltipFormatter?: (value: number) => string;
}

export function LineChart({
  data,
  xAxisKey,
  yAxisKey,
  formatXAxis = (value) => value,
  tooltipFormatter = (value) => value.toString(),
}: LineChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded shadow-md">
          <p className="font-medium">{formatXAxis(label)}</p>
          <p className="text-primary">
            {tooltipFormatter(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey={xAxisKey} 
          tickFormatter={formatXAxis}
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey={yAxisKey}
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}