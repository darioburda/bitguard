import { supabase } from './supabase';

let comentariosChannel = null;

// Obtener comentarios de una publicación
export async function getComentarios(publicacionId) {
  const { data, error } = await supabase
    .from('publicaciones_comentarios')
    .select(`
      id,
      comment,
      created_at,
      sender_id,
      user_profiles (
        display_name,
        email
      )
    `)
    .eq('publicaciones_id', publicacionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al obtener comentarios:', error);
    throw error;
  }

  return data;
}

// Agregar un comentario a una publicación
export async function agregarComentario({ publicacionId, senderId, comment }) {
  const { error } = await supabase
    .from('publicaciones_comentarios')
    .insert({
      publicaciones_id: publicacionId,
      sender_id: senderId,
      comment: comment,
    });

  if (error) {
    console.error('Error al insertar comentario:', error);
    throw error;
  }
}

// Suscribirse a nuevos comentarios (solo una vez)
export function subscribeToComentarios(callback) {
  if (comentariosChannel) return;

  comentariosChannel = supabase.channel('publicaciones_comentarios_channel');

  comentariosChannel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'publicaciones_comentarios',
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}

// Cancelar suscripción
export function unsubscribeFromComentarios() {
  if (comentariosChannel) {
    supabase.removeChannel(comentariosChannel);
    comentariosChannel = null;
  }
}
