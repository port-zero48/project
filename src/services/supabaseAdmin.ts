// src/lib/supabaseAdmin.ts (or wherever you keep it)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase Admin Config Check:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceRoleKey,
  serviceKeyPrefix: supabaseServiceRoleKey?.substring(0, 20) + '...'
});

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL');
}

if (!supabaseServiceRoleKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY is missing!');
  throw new Error('Missing VITE_SUPABASE_SERVICE_ROLE_KEY - Check your .env file');
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('✅ Supabase Admin client created');