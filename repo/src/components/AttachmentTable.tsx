
import React, { useState } from 'react';
import { AttachmentData } from '../lib/database';
import { format, parseISO } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

interface AttachmentTableProps {
  data: AttachmentData[];
  isLoading: boolean;
}

export function AttachmentTable({ data, isLoading }: AttachmentTableProps) {
  const [sortField, setSortField] = useState<keyof AttachmentData>('upload_timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof AttachmentData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortField === 'upload_timestamp') {
      const dateA = new Date(a[sortField] as string).getTime();
      const dateB = new Date(b[sortField] as string).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (sortField === 'file_size') {
      const numA = a[sortField] as number;
      const numB = b[sortField] as number;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    }
    
    const valueA = String(a[sortField] || '');
    const valueB = String(b[sortField] || '');
    return sortDirection === 'asc' 
      ? valueA.localeCompare(valueB) 
      : valueB.localeCompare(valueA);
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderSortIcon = (field: keyof AttachmentData) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Attachments</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th 
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-primary"
                    onClick={() => handleSort('file_name')}
                  >
                    File Name{renderSortIcon('file_name')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-primary"
                    onClick={() => handleSort('file_type')}
                  >
                    Type{renderSortIcon('file_type')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-primary"
                    onClick={() => handleSort('file_size')}
                  >
                    Size{renderSortIcon('file_size')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-primary"
                    onClick={() => handleSort('upload_status')}
                  >
                    Status{renderSortIcon('upload_status')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-primary"
                    onClick={() => handleSort('upload_timestamp')}
                  >
                    Upload Date{renderSortIcon('upload_timestamp')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-primary"
                    onClick={() => handleSort('user_id')}
                  >
                    User{renderSortIcon('user_id')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No attachment data available
                    </td>
                  </tr>
                ) : (
                  sortedData.map((item) => (
                    <tr 
                      key={item.id} 
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">{item.file_name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {item.file_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatFileSize(item.file_size)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.upload_status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.upload_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {format(parseISO(item.upload_timestamp), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-4 py-3">{item.user_id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}