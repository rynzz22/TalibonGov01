import { createClient } from '@supabase/supabase-js';

// Safe placeholders to prevent the application from crashing at startup
const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

const sanitizeUrl = (url: string | undefined): string | undefined => {
  if (!url) return url;
  let trimmed = url.trim();
  // Remove trailing slashes
  while (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }
  // Strip /rest/v1 if it is at the end of the URL
  if (trimmed.endsWith('/rest/v1')) {
    trimmed = trimmed.slice(0, -8);
  }
  while (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed;
};

const cleanUrl = sanitizeUrl(rawUrl);

export const isSupabaseConfigured = !!cleanUrl && !cleanUrl.includes('placeholder-project');

const supabaseUrl = cleanUrl || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = rawKey ? rawKey.trim() : 'placeholder-anon-key';

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

