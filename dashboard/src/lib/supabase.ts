import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://itzwwompgyjgxkaddxvl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0end3b21wZ3lqZ3hrYWRkeHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzU1NzQsImV4cCI6MjA5OTk1MTU3NH0.LSdpciqk_pRO3LipHC50uX7uOC58GfXC8QRK6FM9plM'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0end3b21wZ3lqZ3hrYWRkeHZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM3NTU3NCwiZXhwIjoyMDk5OTUxNTc0fQ.N2dgZE22Z2t4aHrmzfOjVwwT5YJwawgtCd__twnuUlU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createServerSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
