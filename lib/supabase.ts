
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key from project settings
const supabaseUrl = 'https://meysnkovejnrjaupzyos.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1leXNua292ZWpucmphdXB6eW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjI3MTAsImV4cCI6MjA4NjM5ODcxMH0.wnjnRVBi_2q1siX5aPAw1y05yzkZygLto8qhim8O3cM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
