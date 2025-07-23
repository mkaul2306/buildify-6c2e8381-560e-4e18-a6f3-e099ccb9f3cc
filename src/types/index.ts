
export interface Startup {
  id: number;
  name: string;
  industry: string;
  founded_date: string;
  created_at: string;
}

export interface CheckIn {
  id: number;
  startup_id: number;
  check_in_date: string;
  notes: string;
  status: string;
  created_at: string;
}

export interface CheckInCount {
  date: string;
  count: number;
}

export interface TimeFilterOption {
  label: string;
  value: string;
}

export type TimeFilterValue = 'daily' | 'weekly' | 'monthly' | 'quarterly';