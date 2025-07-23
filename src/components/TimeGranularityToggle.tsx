
import React from 'react';
import { cn } from '../lib/utils';

export type TimeGranularity = 'daily' | 'monthly' | 'yearly';

interface TimeGranularityToggleProps {
  value: TimeGranularity;
  onChange: (value: TimeGranularity) => void;
  className?: string;
}

export function TimeGranularityToggle({
  value,
  onChange,
  className,
}: TimeGranularityToggleProps) {
  const options: { value: TimeGranularity; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className={cn("flex rounded-md shadow-sm", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "px-4 py-2 text-sm font-medium",
            option.value === value
              ? "bg-primary text-white"
              : "bg-white text-gray-700 hover:bg-gray-50",
            option.value === 'daily' && "rounded-l-md",
            option.value === 'yearly' && "rounded-r-md",
            "border border-gray-300",
            option.value !== 'daily' && "-ml-px"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}