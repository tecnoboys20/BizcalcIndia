import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Leads table insert
export const recordLead = async (leadData) => {
  // If keys are placeholder, mock success
  if (supabaseUrl.includes('placeholder')) {
    console.log('Mock: Lead recorded', leadData);
    return { data: leadData, error: null };
  }
  
  const { data, error } = await supabase
    .from('leads')
    .insert([
      { ...leadData, created_at: new Date().toISOString() }
    ]);
  return { data, error };
}
