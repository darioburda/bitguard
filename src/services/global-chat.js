import supabase from "./supabase";
/**
 *  
 * @param {{email: string, body: string}} data 
 */
export async function saveGlobalChatMessage(data) {
    const { error } = await supabase
        .from('global_chat')
        .insert({...data});

    if(error) {
        console.error('[global-chat.js saveGlobalChatMessage] Error al grabar el mensaje: ', error);
        throw error;
    }
}

/**
 * @returns {{id: number, email: string, body: string, created_at: string}[]}
 */
export async function getGlobalChatLastMessages() {

    const { data, error } = await supabase
        .from('global_chat')
        .select()
        .order('created_at', { ascending: false })
        .limit(5);

    if(error) {
        console.error('[global-chat.js getGlobalChatLastMessages] Error al traer los mensajes: ', error);
        throw error;
    }

    return data;
}

export async function receiveGlobalChatMessages(callback) {
    
    const chatChannel = supabase.channel('global_chat');
    
    chatChannel.on(

        'postgres_changes',
        {
            event: 'INSERT',
            schema: 'public',
            table: 'global_chat',
        },
        data => {
            callback(data.new);
        }
    );
    chatChannel.subscribe();
}   

//----------------

// Método para guardar comentarios
export async function saveComment(messageId, { sender_id, email, body }) {
    const { data, error } = await supabase
        .from('global_chat_comments')
        .insert({
            message_id: messageId,
            sender_id,
            email,
            body
        })
        .select(); // Retorna el comentario insertado

    if (error) {
        console.error('Error saving comment:', error);
        throw error;
    }

    return data[0];
}







// Método para cargar comentarios existentes
export async function loadComments(messageId) {
    const { data, error } = await supabase
        .from('global_chat_comments')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading comments:', error);
        throw error;
    }

    return data;
}

// Suscripción a nuevos comentarios en tiempo real
export function subscribeToComments(callback) {
    return supabase.channel('global_chat_comments_channel')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'global_chat_comments'
            },
            payload => callback(payload.new)
        )
        .subscribe();
}