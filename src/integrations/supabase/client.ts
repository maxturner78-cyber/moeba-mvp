import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dxopznxbmiasneujsbdg.supabase.co";

// TODO: Replace with your actual anon key from Supabase Dashboard → Settings → API
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
