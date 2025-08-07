import { getFileURL, uploadFile, BUCKETS } from "./storage";
import { supabase } from './supabase';
import { createUserProfile, getUserProfileById, updateUserProfile } from "./user-profiles";



let user = {
  id: null,
  email: null,
  bio: null,
  display_name: null,
  sector: null,
  equipo: null,
  rustdesk: null,
  is_admin: false,
  sistema_operativo: null,
  microprocesador: null,
  tipo_memoria: null,
  tamano_memoria: null,
  tipo_disco: null,
  tamano_disco: null,
  ip_pc: null,
  interno_telefono: null,
  ip_telefono: null,
  notas: null,
  photo: null,
};

let observers = [];

// Restaurar desde localStorage
if (localStorage.getItem('user')) {
  user = JSON.parse(localStorage.getItem('user'));
}

// ✅ Restaurar sesión automáticamente
getAuthUser();

/**
 * Carga la sesión y perfil del usuario autenticado
 */
async function getAuthUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    console.error('[auth.js getAuthUser] Error al traer el usuario: ', error);
    throw error || new Error("No hay sesión activa");
  }

  updateUser({
    id: data.user.id,
    email: data.user.email,
  });

  await loadUserProfile();
}

/**
 * Carga los datos del perfil
 */
async function loadUserProfile() {
  const profile = await getUserProfileById(user.id);
  updateUser({
    bio: profile.bio,
    display_name: profile.display_name,
    sector: profile.sector,
    equipo: profile.equipo,
    rustdesk: profile.rustdesk,
    is_admin: profile.is_admin,
    sistema_operativo: profile.sistema_operativo,
    microprocesador: profile.microprocesador,
    tipo_memoria: profile.tipo_memoria,
    tamano_memoria: profile.tamano_memoria,
    tipo_disco: profile.tipo_disco,
    tamano_disco: profile.tamano_disco,
    ip_pc: profile.ip_pc,
    interno_telefono: profile.interno_telefono,
    ip_telefono: profile.ip_telefono,
    notas: profile.notas,
    photo: profile.photo,
  });
}

/**
 * Registro + perfil
 */
export async function register({ email, password, display_name, is_admin }) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error('[auth.js register] Error al crear una cuenta: ', error);
    throw error;
  }

  await createUserProfile({
    id: data.user.id,
    email,
    display_name,
    is_admin,
  });

  updateUser({
    id: data.user.id,
    email: data.user.email,
    display_name,
    is_admin,
  });

  return data.user;
}

/**
 * Login
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[auth.js login] Error al iniciar sesión: ', error);
    throw error;
  }

  updateUser({
    id: data.user.id,
    email: data.user.email,
  });

  await loadUserProfile();

  return data.user;
}

/**
 * Logout
 */
export async function logout() {
  await supabase.auth.signOut();

  updateUser({
    id: null,
    email: null,
    photo: null,
  });
}

/**
 * Actualiza el perfil del usuario autenticado
 */
export async function updateAuthProfile(data) {
  try {
    await updateUserProfile(user.id, data);
    updateUser({
      ...data,
      photo: data.photo ?? user.photo,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Sube el avatar del usuario autenticado
 */
export async function updateAuthProfileAvatar(avatar) {
      console.log('[updateAuthProfileAvatar] Se llamó correctamente con:', avatar);
  try {
    const { data, error } = await supabase.auth.getUser();
    const authUser = data?.user;

    if (!authUser) {
      // Retry tras pequeño delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const retry = await supabase.auth.getUser();
      if (!retry.data?.user) {
        throw new Error("No hay usuario autenticado. No se puede subir avatar.");
      }
      return await updateAuthProfileAvatar(avatar);
    }

   const filename = `${crypto.randomUUID()}.jpg`;
const userId = authUser.id;
const fullPath = `${userId}/${filename}`;

console.log('🔄 Llamando a uploadFile con nombre:', filename);
await uploadFile(filename, avatar, BUCKETS.PROFILE);

const publicUrl = getFileURL(fullPath, BUCKETS.PROFILE); // ✅ incluye la carpeta del UID

    await updateAuthProfile({
      photo: publicUrl,
    });
  } catch (error) {
    console.error('[updateAuthProfileAvatar] Error al subir avatar:', error);
  }
}

/*---------------------
| Observer personalizado
+---------------------*/

/**
 * Suscribirse a cambios de usuario
 */
export function subscribeToAuthState(callback) {
  observers.push(callback);
  notify(callback);
}

function notify(callback) {
  callback({ ...user });
}

function notifyAll() {
  observers.forEach(callback => notify(callback));
}

/**
 * Actualiza y notifica
 */
function updateUser(data) {
  user = {
    ...user,
    ...data,
  };

  // ✅ Aseguramos que is_admin sea booleano válido
  if (typeof user.is_admin !== 'boolean') {
    user.is_admin = false;
  }

  notifyAll();

  if (user.id !== null) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

