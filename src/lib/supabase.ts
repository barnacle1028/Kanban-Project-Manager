import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Debug logging for Supabase configuration
console.log('🔗 Supabase Configuration:')
console.log('   URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('   Anon Key:', supabaseAnonKey ? `Set (${supabaseAnonKey.length} chars)` : 'Missing')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})