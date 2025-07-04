import { supabase } from './supabase';
import { uploadFile, getFileURL, BUCKETS } from './storage';

let publicacionesChannel = null;

/**
 * Guardar una publicación nueva (con o sin imagen)
 */
export async function savePublicacion({ sender_id, email, body, file = null }) {
  let image = null;

  if (file) {
    const filename = `publicacion-${Date.now()}-${file.name}`;
    await uploadFile(filename, file, BUCKETS.POST); // Esto ya guarda en uid/
    image = getFileURL(`${sender_id}/${filename}`, BUCKETS.POST);
    console.log('🖼️ Imagen URL:', image);
  }

  const { data, error } = await supabase
    .from('publicaciones')
    .insert([{ sender_id, email, body, image }])
    .select();

  if (error) {
    console.error('Error en savePublicacion:', error);
    throw error;
  }

  return data[0];
}

/**
 * Editar una publicación existente (cuerpo e imagen opcional)
 */
export async function editarPublicacion(publicacionId, { body, file = null, sender_id }) {
  const updateFields = { body };

  if (file) {
    const filename = `publicacion-${Date.now()}-${file.name}`;
    await uploadFile(filename, file, BUCKETS.POST); // guarda en uid/
    updateFields.image = getFileURL(`${sender_id}/${filename}`, BUCKETS.POST);
  }

  const { data, error } = await supabase
    .from('publicaciones')
    .update(updateFields)
    .eq('id', publicacionId)
    .select();

  if (error) {
    console.error('Error editando publicación:', error);
    throw error;
  }

  return data[0];
}

/**
 * Obtener publicaciones recientes con sus datos de perfil
 */
export async function getPublicaciones() {
  const { data, error } = await supabase
    .from('publicaciones')
    .select(`
      id,
      body,
      image,
      created_at,
      sender_id,
      email,
      user_profiles (
        display_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getPublicaciones] Error:', error);
    throw error;
  }

  return data;
}

/**
 * Escuchar publicaciones en tiempo real
 */
export function receivePublicaciones(onInsert, onDelete) {
  if (publicacionesChannel) return;

  publicacionesChannel = supabase.channel('publicaciones');

  publicacionesChannel
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'publicaciones' },
      (payload) => onInsert(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'publicaciones' },
      (payload) => onDelete(payload.old)
    )
    .subscribe();
}

/**
 * Eliminar una publicación y sus comentarios
 */
export async function eliminarPublicacion(publicacionId) {
  const { error: errorComentarios } = await supabase
    .from('publicaciones_comentarios')
    .delete()
    .eq('publicaciones_id', publicacionId);

  if (errorComentarios) {
    console.error('Error eliminando comentarios:', errorComentarios);
    throw errorComentarios;
  }

  const { error: errorPub } = await supabase
    .from('publicaciones')
    .delete()
    .eq('id', publicacionId);

  if (errorPub) {
    console.error('Error eliminando publicación:', errorPub);
    throw errorPub;
  }
}

/**
 * Obtener publicaciones por usuario
 */
export async function getPublicacionesPorUsuario(userId) {
  const { data, error } = await supabase
    .from('publicaciones')
    .select(`
      id,
      body,
      image,
      created_at
    `)
    .eq('sender_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener publicaciones del usuario:', error);
    throw error;
  }

  return data;
}

/**
 * Cancelar suscripción en tiempo real
 */
export function unsubscribeFromPublicaciones() {
  if (publicacionesChannel) {
    supabase.removeChannel(publicacionesChannel);
    publicacionesChannel = null;
  }
}
