<script>
import { logout, subscribeToAuthState } from './services/auth';
import logo from './assets/iso-03.png';




export default {
    name: 'App',
    data(){
        return{
            user: {
                id: null,
                email:null,
                bio: null,
                display_name: null,
                career: null,
            },
            logo
        };
    },
    methods:{
        handleLogout(){
            logout();
            this.$router.push({ path: '/ingresar', query: { loggedOut: 'true' } });
        }
    },
    async mounted(){
        subscribeToAuthState(newUserData => this.user = newUserData);
    }
}
</script>

<template>
    <div class="grid min-h-screen grid-rows-[auto_1fr_auto] bg-gradient-to-b from-[#FFFFFF] to-[#D7DDFF] text-black">

        <nav class="flex items-center justify-center h-27 gap-8 p-4 bg-gradient-to-b from-[#287AE6] to-[#0C4EA4] text-white">
            <RouterLink to="/" class="inline-block w-22">
                <img 
                    :src="logo" 
                    alt="BitGuard logo" 
                    class="w-full h-auto" 
                />
            </RouterLink>
            <ul class="flex gap-4">
                <li>
                    <RouterLink to="/" class="inline-block hover:text-[#00FFC3] transform transition-transform duration-300 ease-in-out hover:scale-110" >Home</RouterLink>
                </li>
                <template v-if="user.id !== null">
                    <li>
                        <RouterLink to="/chat" class="inline-block hover:text-[#00FFC3] transform transition-transform duration-300 ease-in-out hover:scale-110">Muro</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/mi-perfil" class="inline-block hover:text-[#00FFC3] transform transition-transform duration-300 ease-in-out hover:scale-110">Perfil</RouterLink>
                    </li>
                    <li>
                        <form 
                            action="#"
                            @submit.prevent="handleLogout"
                        >
                        <button 
                                type="submit"
                                class="hover:underline cursor-pointer"
                            >
                                {{ user.email }} (Cerrar sesión)
                        </button>
                        </form>
                    </li>
                </template>
                <template v-else>
                    <li>
                        <RouterLink to="/ingresar" class="inline-block hover:text-[#00FFC3] transform transition-transform duration-300 ease-in-out hover:scale-110">Ingresar</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/crear-cuenta" class="inline-block hover:text-[#00FFC3] transform transition-transform duration-300 ease-in-out hover:scale-110">Crear cuenta</RouterLink>
                    </li>
                </template>
            </ul>
        </nav>

        <main class="overflow-y-auto">
            <div class="container mx-auto">
                <RouterView />
            </div>
        </main>



    <footer class="bg-gradient-to-b from-[#474747] to-[#000000] text-white py-4 px-4">
            <div class="container mx-auto">
                    
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-items-center">
                    
                        <div class="md:justify-self-start text-center md:text-left">
                            <h3 class="font-bold text-lg mb-2">TP1: Clientes Web Mobile</h3>
                            <div class="space-y-1">
                            <p class="text-sm opacity-90">Profesor: Santiago Gallino</p>
                            <p class="text-sm opacity-90">Alumnos: Burda Nicolás, Burda Darío</p>
                            </div>
                        </div>
                        
                        <div class="flex flex-col items-center justify-center space-y-2">
                            <img 
                            :src="logo" 
                            alt="BitGuard logo" 
                            class="h-12 opacity-80" 
                            />
                        </div>
                        
                        
                        <div class="md:justify-self-end text-center md:text-right">
                            <h4 class="font-bold mb-3">Enlaces rápidos</h4>
                            <div class="space-y-2">
                            <RouterLink 
                                to="/" 
                                class="block text-sm opacity-80 hover:opacity-100 hover:text-[#00FFC3] transition-all"
                            >
                                Inicio
                            </RouterLink>
                            <RouterLink 
                                v-if="user.id !== null"
                                to="/mi-perfil" 
                                class="block text-sm opacity-80 hover:opacity-100 hover:text-[#00FFC3] transition-all"
                            >
                                Mi perfil
                            </RouterLink>
                            </div>
                        </div>
                </div>
                    
                <div class="border-t border-white/20 mt-4 pt-2 text-center text-xs opacity-44">
                    <p>Desarrollado con Vue.js, Tailwind CSS y Supabase - Burda´s &copy; 2025</p>
                </div>
            </div>
    </footer>
    </div>
</template>