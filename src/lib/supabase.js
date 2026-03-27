import { createClient } from '@supabase/supabase-js'

// Hardcoded credentials (bypassing .env cache issues)
const supabaseUrl = 'https://girrwkfqhokrvbawahys.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcnJ3a2ZxaG9rcnZiYXdhaHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTU0MTUsImV4cCI6MjA5MDA3MTQxNX0.eGiU8WlQxNcdM3Txg6-nO771xUusnf-Sm32XEwDueO8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
