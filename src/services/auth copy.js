import { getFileURL, uploadFile } from "./storage";
import { supabase } from './supabase';
import { createUserProfile, getUserProfileById, updateUserProfile } from "./user-profiles";
// import Swal from 'sweetalert2';


let user={
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
}
//pedimos cargar la data del user authenticado
let observers =[];

// getAuthUser();



if(localStorage.getItem('user')){
    user =JSON.parse(localStorage.getItem('user'));
}
/**
 *carga la data del usuario
 */
async function getAuthUser() {
    const {data,error} = await supabase.auth.getUser();
        
    if(error) {
        console.error('[auth.js getAuthUser] Error al traer el usuario: ', error);
        throw error;
    }

    updateUser({
        id: data.user.id,
        email: data.user.email,
    });
    loadUserProfile();
}

async function loadUserProfile() {
    const profile = await getUserProfileById(user.id);
    updateUser({
        bio: profile.bio,
        display_name: profile.display_name,
        sector: profile.sector,
        equipo: profile.equipo,
        rustdesk: profile.rustdesk,
        is_admin: profile.is_admin,
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
        photo: profile.photo,
    });
}

/**
 * Registra y lo autentica
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{}>}
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
    is_admin
  });

  updateUser({
    id: data.user.id,
    email: data.user.email,
    display_name,
    is_admin
  });

  return data.user;
}


/**
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{}>}
 */
export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if(error) {
        console.error('[auth.js login] Error al iniciar sesión: ', error);
        throw error;
    }

    updateUser({
        id: data.user.id,
        email: data.user.email,
    });
    loadUserProfile();

    return data.user;
}

// export async function logout() {
//     supabase.auth.signOut();
//     updateUser({
//         id: null,
//         email: null,

//     });
// }

export async function logout() {
  await supabase.auth.signOut();

  updateUser({
    id: null,
    email: null,
    photo: null,
  });
}

/**
 * Actualiza los datos del perfil del usuario autenticado.
 * 
 * @param {{bio?: string|null, career?: string|null, display_name?: string|null, photo?: string|null}} data 
 */

export async function updateAuthProfile(data) {
    try {
        await updateUserProfile(user.id, data);
    updateUser({
        bio: data.bio,
        display_name: data.display_name,
        sector: data.sector,
        equipo: data.equipo,
        rustdesk: data.rustdesk,
        ip_pc: null,
        interno_telefono: null,
        ip_telefono: null,
        microprocesador: null,
        tipo_memoria: null,
        tamano_memoria: null,
        tipo_disco: null,
        tamano_disco: null,
        notas: null,
        photo: data.photo ?? user.photo,
    });

    } catch (error) {
        throw error;
    }
}

/**
 * 
 * @param {File} avatar 
 */
export async function updateAuthProfileAvatar(avatar) {
    try {
       

        const { data: { user: authUser } } = await supabase.auth.getUser();
        const filename = `${authUser.id}/${crypto.randomUUID()}.jpg`; // ✅ usa auth.uid()


        await uploadFile(filename, avatar);

        // Actualizamos la data del perfil del usuario para guardar
        // la foto.
        await updateAuthProfile({
            photo: getFileURL(filename),
        });
    } catch (error) {
        // TODO...
    }
}






/*-----------------------------------------
|Metodos del observer para la autenticación
+-------------------------------------------*/
/** 
* @param {()=>()} callback
*/
export function subscribeToAuthState(callback){
    //TODO Unsubscribe

    observers.push(callback);
    notify(callback);
}

/**
 * Notifica a un observer.
 * @param {() => {}} callback
 */
function notify(callback){
    callback({...user});
}

/**
 * Notifica a todos los observers.
*/
function notifyAll(){
    observers.forEach(callback => notify(callback));
}

/**
 * Actualiza la data del usuario, y notifica a los observers.
 * 
 * @param {{id?: string|null, email?: string|null, bio?: string|null, dislplay_name?: string|null, career?: string|null}} data 
 */

function updateUser(data){
    user ={
    ...user,
    ...data,
    }
    notifyAll();
    if(user.id !== null){
        localStorage.setItem('user', JSON.stringify(user));
    }else{
        localStorage.removeItem('user');
    }
}