import { supabase } from './supabase';

// Vamos a cachear localmente los ids de los chats que vamos trayendo.
// Los ids los vamos a guardar en un objeto, donde la clave de cada id
// va a ser la unión de los ids ordenados de los usuarios.
// Por ejemplo: { "userId1_userId2": 5 }
let privateChatIdsCache = {};

if(localStorage.getItem('privateChatIds')) {
    privateChatIdsCache = JSON.parse(localStorage.getItem('privateChatIds'));
}

/**
 * 
 * @param {string} sender_id 
 * @param {string} receiver_id 
 * @returns {Promise<number>}
 */
async function getPrivateChatId(sender_id, receiver_id) {
    // Probamos, primero, de sacar el id del caché.
    const cacheKey = [sender_id, receiver_id].sort().join("_");

    let chat_id = privateChatIdsCache[cacheKey];
    if(chat_id) return chat_id;
    // let chat_id;
    chat_id = await fetchPrivateChat(sender_id, receiver_id);

    // Si el id no existe aún, entonces creamos la conversación privada.
    if(!chat_id) {
        chat_id = await createPrivateChat(sender_id, receiver_id);
        // await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log("Chat ID:", chat_id)

    // Guardamos el id obtenido en el caché, y actualizamos localStorage.
    privateChatIdsCache[cacheKey] = chat_id;
    localStorage.setItem('privateChatIds', JSON.stringify(privateChatIdsCache));

    return chat_id;
}

/**
 * 
 * @param {string} sender_id 
 * @param {string} receiver_id 
 * @returns {Promise<number|null>}
 */
async function fetchPrivateChat(sender_id, receiver_id) {
    const userIds = [sender_id, receiver_id].sort();
    console.log(sender_id, receiver_id);
    console.log(userIds);

    const { data, error } = await supabase
        .from('private_chats')
        .select('id')
        .eq('user_id1', userIds[0])
        .eq('user_id2', userIds[1]);

    if(error) {
        console.error('[private-chat.js fetchPrivateChat] Error al obtener el chat privado: ', error);
        throw error;
    }

    return data[0]?.id;
}

/**
 * 
 * @param {string} sender_id 
 * @param {string} receiver_id 
 * @returns {Promise<number>}
 */
async function createPrivateChat(sender_id, receiver_id) {
    const userIds = [sender_id, receiver_id].sort();
    console.log(sender_id, receiver_id);
    console.log(userIds);

    const { data, error } = await supabase
        .from('private_chats')
        .insert({
            user_id1: userIds[0],
            user_id2: userIds[1],
        })
        .select(); // NECESARIO para obtener el ID

    if (error) {
        console.error('[private-chat.js createPrivateChat] Error al crear el chat privado: ', error);
        throw error;
    }

    // if (!data || data.length === 0) {
    //     throw new Error('[private-chat.js createPrivateChat] No se recibió un ID válido del chat');
    // }

    // console.log('[createPrivateChat] Chat creado con ID:', data[0].id);
    return data[0].id;
}

/**
 * 
 * @param {string} sender_id 
 * @param {string} receiver_id 
 * @param {string} body 
 */
export async function savePrivateChatMessage(sender_id, receiver_id, body) {
    // Primero, obtenemos el id del chat privado.
    const chat_id = await getPrivateChatId(sender_id, receiver_id);

    // Ahora sí, podemos guardar el mensaje.
    const { error } = await supabase
        .from('private_messages')
        .insert({
            chat_id,
            sender_id,
            body,
        });

    if(error) {
        console.error('[private-chat.js savePrivateChatMessage] Error al grabar el mensaje privado: ', error);
        throw error;
    }
}

/**
 * 
 * @param {string} sender_id 
 * @param {string} receiver_id 
 * @param {() => void} callback 
 */
export async function receivePrivateChatMessages(sender_id, receiver_id, callback) {
    const chat_id = await getPrivateChatId(sender_id, receiver_id);

    const privateChatChannel = supabase.channel('private-chat');
    privateChatChannel.on(
        'postgres_changes',
        {
            event: 'INSERT',
            schema: 'public',
            table: 'private_messages',
            // Noten que en filter, el tipo de comparación lo prefijamos
            // al valor después del "=". Por ejemplo, si queremos una
            // comparación de igualdad, usamos el "eq.".
            filter: 'chat_id=eq.' + chat_id,
        },
        data => {
            // Ejecutamos el callback con los datos recibidos.
            callback(data.new);
        }
    )
    privateChatChannel.subscribe();
}

/**
 * 
 * @param {string} sender_id 
 * @param {string} receiver_id 
 * @returns {Promise<{}[]>}
 */
export async function getPrivateChatLastMessages(sender_id, receiver_id) {
    const chat_id = await getPrivateChatId(sender_id, receiver_id);

    const { data, error } = await supabase
        .from('private_messages')
        .select()
        .eq('chat_id', chat_id);

    if(error) {
        console.error('[private-chat.js getPrivateChatLastMessages] Error al traer los mensajes privados: ', error);
        throw error;
    }

    return data;
}