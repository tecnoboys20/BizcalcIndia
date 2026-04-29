import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Insert a lead (email capture from popup)
export const recordLead = async (leadData) => {
  const { data, error } = await supabase
    .from('leads')
    .insert([{ ...leadData, created_at: new Date().toISOString() }]);
  if (error) console.error('Lead insert error:', error.message);
  return { data, error };
}

// Insert or update a user profile
export const upsertProfile = async (profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert([profileData], { onConflict: 'email' });
  if (error) console.error('Profile upsert error:', error.message);
  return { data, error };
}

// Get a user profile by email
export const getProfile = async (email) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  return { data, error };
}
