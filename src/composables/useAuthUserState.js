import { onMounted, onUnmounted, ref } from "vue";
import { subscribeToAuthState } from "../services/auth";

// Para los "hooks" al ciclo de vida del componente (como mounted o
// unmounted) tenemos las funciones equivalentes que se llaman igual
// pero con el prefijo "on" y en camelCase. Por ejemplo: onMounted y 
// onUnmounted.
// Todas reciben un callback como argumento con lo que queremos correr
// cuando sucede el evento.

export default function useAuthUserState() {
    // Definimos la variable para cancelar la suscripción, poniéndole 
    // una función como placeholder.
    let unsubAuth = () => {}

    const user = ref({
        id: null,
        email: null,
        bio: null,
        display_name: null,
        career: null,
        photo: null,
    });

    // onMounted(() => {
    //     unsubAuth = subscribeToAuthState(newUserData => user.value = newUserData);
    // });
    onMounted(() => unsubAuth = subscribeToAuthState(newUserData => user.value = newUserData));

    onUnmounted(() => unsubAuth());
    // onUnmounted(unsubAuth);

    return {
        user,
    }
}