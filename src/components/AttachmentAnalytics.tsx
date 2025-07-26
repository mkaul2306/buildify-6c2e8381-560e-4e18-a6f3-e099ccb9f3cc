
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  fetchAttachments, 
  fetchFileTypeDistribution,
  FileTypeDistribution
} from '../lib/database';
import { formatBytes } from '../lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#6B66FF'];

export function AttachmentAnalytics() {
  const [fileTypeData, setFileTypeData] = useState<FileTypeDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const fileTypes = await fetchFileTypeDistribution();
        setFileTypeData(fileTypes);
      } catch (err) {
        console.error('Error loading attachment analytics data:', err);
        setError('Failed to load attachment analytics data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Prepare data for pie chart
  const pieData = fileTypeData.map((item, index) => ({
    name: item.file_type,
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare data for bar chart
  const barData = fileTypeData.map((item) => ({
    name: item.file_type,
    count: item.count,
    size: item.total_size / (1024 * 1024) // Convert to MB
  }));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Attachment Analytics</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Type Distribution Pie Chart */}
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">File Type Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} files`, 'Count']}
                    labelFormatter={(label) => `File Type: ${label}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* File Size by Type Bar Chart */}
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">File Size by Type (MB)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} MB`, 'Size']}
                  />
                  <Legend />
                  <Bar dataKey="size" fill="#8884d8" name="Total Size (MB)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Summary Card */}
          <Card className="p-4 lg:col-span-2">
            <h3 className="text-lg font-medium mb-2">Attachment Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-primary">Total Attachments</h4>
                <p className="text-2xl font-bold">
                  {fileTypeData.reduce((sum, item) => sum + item.count, 0)}
                </p>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-primary">Total Storage</h4>
                <p className="text-2xl font-bold">
                  {formatBytes(fileTypeData.reduce((sum, item) => sum + item.total_size, 0))}
                </p>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-primary">Most Common Type</h4>
                <p className="text-2xl font-bold">
                  {fileTypeData.length > 0 
                    ? fileTypeData.sort((a, b) => b.count - a.count)[0].file_type 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}