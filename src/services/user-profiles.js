import { supabase } from './supabase';

const defaultPhotoUrl = 'https://yjqstwwltjefqtsxlbsa.supabase.co/storage/v1/object/public/profile-picture//default-avatar-2.png'

export async function createUserProfile(data) {
  const profileData = {
    ...data,
    photo: data.photo || defaultPhotoUrl
  };

  const { error } = await supabase.from('user_profiles').insert(profileData);

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
    .select(`
      id,
      email,
      bio,
      display_name,
      sector,
      equipo,
      rustdesk,
      ip_pc,
      interno_telefono,
      ip_telefono,
      sistema_operativo,
      microprocesador,
      tipo_memoria,
      tamano_memoria,
      tipo_disco,
      tamano_disco,
      notas,
      is_admin,
      empresa_id,
      photo
    `)
    .eq('id', id);

  if (error) {
    console.error('[user-profiles.js getUserProfileById] Error al traer el usuario: ', error);
    throw error;
  }

  const profile = data[0];
  if (!profile) return null;

  return {
    ...profile,
    photo: profile.photo || defaultPhotoUrl
  };
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

  return data.map(profile => ({
    ...profile,
    photo: profile.photo || defaultPhotoUrl
  }));
}

export async function getUserProfilesPaginated(limit = 10, page = 1) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('user_profiles')
    .select(`
      *,
      empresas (
        nombre,
        plan:plan_id (
          nombre
        )
      )
    `, { count: 'exact' })
    .order('display_name', { ascending: true })
    .range(from, to);

  if (error) {
    console.error('[user-profiles.js getUserProfilesPaginated] Error al paginar usuarios:', error);
    throw error;
  }

  return {
    data: data.map(profile => ({
      ...profile,
      empresa_nombre: profile.empresas?.nombre || null,
      plan_nombre: profile.empresas?.plan?.nombre || null, // ✅ acá está el plan
      photo: profile.photo || defaultPhotoUrl
    })),
    count
  };
}


