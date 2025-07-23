
import { supabase } from '../lib/supabase';
import { CheckInCount, TimeFilterValue } from '../types';

export const getCheckInCounts = async (timeFilter: TimeFilterValue): Promise<CheckInCount[]> => {
  let dateFormat: string;
  let groupBy: string;
  
  switch (timeFilter) {
    case 'daily':
      dateFormat = 'YYYY-MM-DD';
      groupBy = 'date_trunc(\'day\', check_in_date)';
      break;
    case 'weekly':
      dateFormat = 'YYYY-"W"IW';
      group