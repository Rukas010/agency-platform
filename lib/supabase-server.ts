import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('=== SUPABASE SERVER DEBUG ===')
console.log('URL exists:', !!supabaseUrl)
console.log('Service key exists:', !!serviceRoleKey)
console.log('ENV keys with SUPABASE:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
console.log('============================')

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || 'placeholder-key'
)