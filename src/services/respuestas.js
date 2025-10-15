// services/respuestas.js
import { supabase } from './supabase';

let respuestasChannel = null;

// Obtener respuestas de un mensaje del global_chat
export async function getRespuestas(globalChatId) {
  const { data, error } = await supabase
    .from('global_chat_respuestas')
    .select(`
      id,
      comment,
      created_at,
      sender_id,
      user_profiles ( display_name, email )
    `)
    .eq('global_chat_id', globalChatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[respuestas.js getRespuestas] Error al obtener respuestas:', error);
    throw error;
  }

  return data;
}

// Agregar una respuesta a un mensaje del global_chat
export async function agregarRespuesta({ global_chat_id, sender_id, comment }) {
  const payload = {
    global_chat_id: Number(global_chat_id),
    sender_id,
    comment
  };

  console.log('[respuestas.js agregarRespuesta] Insertando respuesta con payload:', payload);

  const { error } = await supabase
    .from('global_chat_respuestas')
    .insert(payload);

  if (error) {
    console.error('[respuestas.js agregarRespuesta] Error al insertar respuesta:', error);
    throw error;
  }
}

// Suscribirse a nuevas respuestas
export function subscribeToRespuestas(callback) {
  if (respuestasChannel) return;

  respuestasChannel = supabase.channel('global_chat_respuestas_channel');

  respuestasChannel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'global_chat_respuestas'
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}

// Cancelar suscripción
export function unsubscribeFromRespuestas() {
  if (respuestasChannel) {
    supabase.removeChannel(respuestasChannel);
    respuestasChannel = null;
  }
}
