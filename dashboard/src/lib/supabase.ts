import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://itzwwompgyjgxkaddxvl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0end3b21wZ3lqZ3hrYWRkeHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzU1NzQsImV4cCI6MjA5OTk1MTU3NH0.LSdpciqk_pRO3LipHC50uX7uOC58GfXC8QRK6FM9plM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
