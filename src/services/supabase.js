

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yjqstwwltjefqtsxlbsa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqcXN0d3dsdGplZnF0c3hsYnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1Nzg2MjQsImV4cCI6MjA2MzE1NDYyNH0.IcuoapYZBJ1Wl61pBpQFyzAcxZepNhAP4mSNOtSe_z4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export default supabase;