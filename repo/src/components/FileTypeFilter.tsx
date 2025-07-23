
import React from 'react';

interface FileTypeFilterProps {
  fileTypes: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function FileTypeFilter({ 
  fileTypes, 
  selectedType, 
  onTypeChange 
}: FileTypeFilterProps) {
  