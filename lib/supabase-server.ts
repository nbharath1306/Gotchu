import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Use anon key for user-facing requests, and pass Auth0 JWT for RLS
export const createClient = async (jwt?: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
      }
    }
  })
}

export const createServiceRoleClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations will fail.");
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
