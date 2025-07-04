import supabase from "./supabase";

// Definición de buckets
export const BUCKETS = {
  PROFILE: 'profile-picture',
  POST: 'post-image',
};

/**
 * Sube un archivo a Supabase Storage
 * 
 * @param {string} name - Nombre del archivo (sin uid)
 * @param {File} file - Objeto File (input[type="file"] del formulario)
 * @param {string} bucket - Nombre del bucket (por defecto 'profile-picture')
 * @returns {object} - Resultado del upload
 */
export async function uploadFile(name, file, bucket = BUCKETS.PROFILE) {
  const user = await supabase.auth.getUser();
  const uid = user.data.user.id;

  const path = `${uid}/${name}`; // 👈 sube dentro de carpeta del UID

  console.log('📦 Subiendo archivo a:', path);

  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(path, file);

  if (error) {
    console.error('[storage.js uploadFile] Error al subir el archivo.', error);
    throw error;
  }

  const url = getFileURL(path, bucket);
  console.log('📦 URL generada:', url);

  return data;
}

/**
 * Obtiene la URL pública de un archivo en Supabase Storage
 * 
 * @param {string} path - Ruta del archivo dentro del bucket (ej: uid/archivo.jpg)
 * @param {string} bucket - Nombre del bucket (por defecto 'profile-picture')
 * @returns {string} - URL pública del archivo
 */
export function getFileURL(path, bucket = BUCKETS.PROFILE) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
