import { supabase } from './supabase';

// 1. Guardar publicación
export async function savePublicacion({ sender_id, email, display_name, body }) {
  const { data, error } = await supabase
    .from('publicaciones')
    .insert([{ sender_id, email, body }])
    .select();

  if (error) {
    console.error('Error en savePublicacion:', error);
    throw error;
  }

  return data[0];
}

// 2. Obtener publicaciones recientes
export async function getPublicaciones() {
    const { data, error } = await supabase
        .from('publicaciones')
        .select(`
            id,
            body,
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

// 3. Escuchar nuevas publicaciones en tiempo real
export function receivePublicaciones(onInsert, onDelete) {
  const publicacionesChannel = supabase.channel('publicaciones');

  publicacionesChannel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'publicaciones',
      },
      payload => {
        onInsert(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'publicaciones',
      },
      payload => {
        onDelete(payload.old);
      }
    )
    .subscribe();
}


export async function eliminarPublicacion(publicacionId) {
  // Primero eliminamos los comentarios
  const { error: errorComentarios } = await supabase
    .from('publicaciones_comentarios')
    .delete()
    .eq('publicaciones_id', publicacionId);

  if (errorComentarios) {
    console.error('Error eliminando comentarios:', errorComentarios);
    throw errorComentarios;
  }

  // Luego eliminamos la publicación
  const { error: errorPub } = await supabase
    .from('publicaciones')
    .delete()
    .eq('id', publicacionId);

  if (errorPub) {
    console.error('Error eliminando publicación:', errorPub);
    throw errorPub;
  }
}


export async function getPublicacionesPorUsuario(userId) {
  const { data, error } = await supabase
    .from('publicaciones')
    .select(`
      id,
      body,
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

