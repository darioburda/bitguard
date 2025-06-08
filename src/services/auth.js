import supabase from "./supabase";
import { createUserProfile, getUserProfileById, updateUserProfile } from "./user-profiles";


let user={
    id: null,
    email: null,
    bio: null,
    display_name: null,
    sector: null,
    equipo: null,
    rustdesk: null,
}
//pedimos cargar la data del user authenticado
let observers =[];
getAuthUser();

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
    });
}

/**
 * Registra y lo autentica
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{}>}
 */
export async function register(email, password) {

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if(error) {
        console.error('[auth.js register] Error al crear una cuenta: ', error);
        throw error;
    }
    try {
        await createUserProfile({
            id: data.user.id,
            email,
        });
    } catch (error) {
        throw error;
    }

    updateUser({
        id: data.user.id,
        email: data.user.email,
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

export async function logout() {
    supabase.auth.signOut();
    updateUser({
        id: null,
        email: null,

    });
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
 * @param{()=>{}} callback
 */
function notify(callback){
    callback({...user});
}
/**
 */
function notifyAll(){
    observers.forEach(callback => notify(callback));
}

export async function updateAuthProfile(data) {
    try {
        await updateUserProfile(user.id, data);
    updateUser({
        bio: data.bio,
        display_name: data.display_name,
        sector: data.sector,
        equipo: data.equipo,
        rustdesk: data.rustdesk,
    });

    } catch (error) {
        throw error;
    }
}

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