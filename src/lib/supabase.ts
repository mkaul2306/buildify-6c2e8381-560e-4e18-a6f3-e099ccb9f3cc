
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twvtvdcyoevsnjssckrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dnR2ZGN5b2V2c25qc3Nja3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTY4MTIsImV4cCI6MjA2ODQzMjgxMn0.3jrJNcaq-jf5QymRdF68hU6X-ohoFFQM7ygvGtW-IMM';

export const supabase = createClient(supabaseUrl, supabaseKey);