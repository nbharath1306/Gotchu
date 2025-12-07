import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const createClient = async () => {
  // Use Service Role Key to bypass RLS since we are managing auth via Auth0
  // and enforcing permissions in our application logic.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSupabaseClient(supabaseUrl, supabaseKey)
}
