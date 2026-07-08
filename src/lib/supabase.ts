import { createClient } from '@supabase/supabase-js';

// Safe placeholders to prevent the application from crashing at startup
const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!rawUrl && !rawUrl.includes('placeholder-project');

const supabaseUrl = rawUrl || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder-anon-key';

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Missing or placeholder environment variables. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to enable live database integrations.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

