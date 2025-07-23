
import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
  data: {
    name: string;
    value: number;
    [key: string]: any;
  }[];
  xAxisDataKey?: string;
  barDataKey?: string;
  barColor?: string;
  secondaryDataKey?: string;
  secondaryBarColor?: string;
}

export function BarChart({
  data,
  xAxisDataKey = 'name',
  barDataKey = 'value',
  barColor = '#3b82f6',
  secondaryDataKey,
  secondaryBarColor = '#10b981'
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey={xAxisDataKey} 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: 'rgba(107, 114, 128, 0.5)' }}
          axisLine={{ stroke: 'rgba(107, 114, 128, 0.5)' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: 'rgba(107, 114, 128, 0.5)' }}
          axisLine={{ stroke: 'rgba(107, 114, 128, 0.5)' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: 'none'
          }}
        />
        {secondaryDataKey && <Legend />}
        <Bar 
          dataKey={barDataKey} 
          fill={barColor} 
          radius={[4, 4, 0, 0]}
          name={barDataKey}
        />
        {secondaryDataKey && (
          <Bar 
            dataKey={secondaryDataKey} 
            fill={secondaryBarColor} 
            radius={[4, 4, 0, 0]}
            name={secondaryDataKey}
          />
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}