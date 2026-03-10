import { supabase } from './supabase';

export async function signUp(email: string, password: string, agencyName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('No user returned');

  // Update the agency name
  const { error: updateError } = await supabase
    .from('resellers')
    .update({ agency_name: agencyName })
    .eq('user_id', data.user.id);

  if (updateError) throw updateError;

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getReseller() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('resellers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
