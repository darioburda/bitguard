import { supabase } from './supabase';

export async function createUserProfile(data) {
  const { error } = await supabase.from('user_profiles').insert(data);

  if (error) {
    console.error('[user-profiles.js createUserProfile] Error al crear perfil de usuario: ', error);
    throw error;
  }
}

export async function updateUserProfile(id, data) {
  const { error } = await supabase
    .from('user_profiles')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('[user-profiles.js updateUserProfile] Error al actualizar el perfil de usuario: ', error);
    throw error;
  }
}

export async function getUserProfileById(id) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select()
    .eq('id', id);

  if (error) {
    console.error('[user-profiles.js getUserProfileById] Error al traer el usuario: ', error);
    throw error;
  }

  return data[0];
}

export async function getAllUserProfiles() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('display_name', { ascending: true });

  if (error) {
    console.error('[user-profiles.js getAllUserProfiles] Error al traer todos los perfiles:', error);
    throw error;
  }

  return data;
}

export async function getUserProfilesPaginated(limit = 10, page = 1) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact' })
    .order('display_name', { ascending: true })
    .range(from, to);

  if (error) {
    console.error('[user-profiles.js getUserProfilesPaginated] Error al paginar usuarios:', error);
    throw error;
  }

  return { data, count };
}
