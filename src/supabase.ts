import { createClient } from '@supabase/supabase-js'

// Get credentials from localStorage or .env
const getSupabaseUrl = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('bd_custom_sb_url')
    if (custom) return custom
  }
  return import.meta.env.VITE_SUPABASE_URL || ''
}

const getSupabaseKey = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('bd_custom_sb_key')
    if (custom) return custom
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || ''
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseKey()

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey !== 'your-anon-public-key'
)

// Initialize Supabase Client with fallback client for offline/local resilience
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://xyzcompany.supabase.co', 'dummy-key-for-offline-fallback', {
      auth: {
        persistSession: true,
        autoRefreshToken: false,
      }
    })
