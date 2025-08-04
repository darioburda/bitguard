<script>
import { useRoute } from 'vue-router';
import { logout, subscribeToAuthState } from './services/auth';

export default {
  name: 'App',
  data() {
    return {
      user: {
        id: null,
        email: null,
        bio: null,
        display_name: null,
        career: null,
      },
    };
  },
  computed: {
    isHome() {
      return this.$route.path === '/';
    },
  },
  methods: {
    handleLogout() {
      logout();
      this.$router.push({ path: '/ingresar', query: { loggedOut: 'true' } });
    },
  },
  mounted() {
    subscribeToAuthState((newUserData) => (this.user = newUserData));
  },
};
</script>




<template>
  <div class="grid min-h-screen grid-rows-[auto_1fr_auto] bg-gradient-to-br bg-[#F0F2FF] text-black">

    <!-- NAVBAR -->
    <nav class="flex items-center justify-between px-6 py-6 bg-[#277AE8] text-white relative">
      <!-- Logo -->
      <div class="w-1/3 flex justify-start">
        <RouterLink to="/">
          <img src="@/assets/logo-blanco.png" alt="Logo BitGuard" class="w-32 h-auto" />
        </RouterLink>
      </div>

      <!-- Links Centrados -->
      <ul class="absolute left-1/2 transform -translate-x-1/2 flex gap-6">
        <li>
          <RouterLink to="/" class="hover:text-[#00FFC3] transition-all hover:scale-110">Home</RouterLink>
        </li>

        <template v-if="user.id !== null">
          <li v-if="user.is_admin">
            <RouterLink to="/abm-usuarios" class="px-4 py-2 text-white hover:underline">Usuarios</RouterLink>
          </li>
          <li v-if="user.is_admin">
            <RouterLink to="/abm-empresas" class="px-4 py-2 text-white hover:underline">Empresas</RouterLink>
          </li>
          <li v-if="user.is_admin">
            <RouterLink to="/abm-tickets" class="px-4 py-2 text-white hover:underline">Tickets</RouterLink>
          </li>

          <li v-if="!user.is_admin">
            <RouterLink to="/mis-tickets" class="hover:text-[#00FFC3] transition-all hover:scale-110">
              Mis Tickets
            </RouterLink>
          </li>
          <li v-if="!user.is_admin">
            <RouterLink to="/empresa/contactos" class="hover:text-[#00FFC3] transition-all hover:scale-110">
              Contactos
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/mi-perfil" class="hover:text-[#00FFC3] transition-all hover:scale-110">Perfil</RouterLink>
          </li>
          <li>
            <form @submit.prevent="handleLogout">
              <button type="submit" class="hover:underline cursor-pointer">
                {{ user.email }} (Cerrar sesión)
              </button>
            </form>
          </li>
        </template>

        <template v-else>
          <li>
            <RouterLink to="/ingresar" class="hover:text-[#00FFC3] transition-all hover:scale-110">
              Ingresar
            </RouterLink>
          </li>
        </template>
      </ul>

      <!-- Placeholder derecha -->
      <div class="w-1/3"></div>
    </nav>

    <!-- MAIN -->
    <main class="overflow-y-auto">
      <div class="h-full flex items-center justify-center">
        <RouterView />
      </div>

      <!-- Botón flotante de ChatBit -->
      <ChatBitButton v-if="user.id" />
    </main>

    <!-- FOOTER -->
    <footer
      v-if="isHome"
      class="bg-gradient-to-b from-[#474747] to-[#000000] text-white py-6 px-6"
    >
      <div class="container mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-items-center">
          <div class="md:justify-self-start text-center md:text-left">
            <h3 class="font-bold text-lg mb-2">TP1: Clientes Web Mobile</h3>
            <div class="space-y-1 text-sm opacity-90">
              <p>Profesor: Santiago Gallino</p>
              <p>Alumnos: Burda Nicolás, Burda Darío</p>
            </div>
          </div>

          <img src="@/assets/logo-blanco.png" alt="Logo BitGuard" class="w-32 max-h-20 object-contain" />

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
