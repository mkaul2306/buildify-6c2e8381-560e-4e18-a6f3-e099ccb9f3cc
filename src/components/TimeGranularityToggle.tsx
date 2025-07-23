
import React from 'react';
import { Button } from './ui/Button';

export type TimeGranularity = 'daily' | 'monthly' | 'yearly';

interface TimeGranularityToggleProps {
  value: TimeGranularity;
  onChange: (value: TimeGranularity) => void;
}

export function TimeGranularityToggle({ value, onChange }: TimeGranularityToggleProps) {
  const options: { value: TimeGranularity; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="flex space-x-1 bg-muted p-1 rounded-md">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}