import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dxopznxbmiasneujsbdg.supabase.co";

// TODO: Replace with your actual anon key from Supabase Dashboard → Settings → API
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4b3B6bnhibWlhc25ldWpzYmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjYxOTcsImV4cCI6MjA5MTcwMjE5N30.OBR8NWlD7rO9jApBcv84fNtWZKnwbWFIiquFnHl8B88";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
