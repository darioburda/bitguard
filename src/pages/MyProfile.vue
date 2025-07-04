<template>
  <div class="h-full overflow-auto relative">
    <!-- Loader superpuesto -->
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
    >
      <MainLoader />
    </div>

    <!-- Contenido -->
    <div
      v-else
      class="mx-auto max-w-[900px] w-full px-4 sm:px-8 py-6 mt-10 bg-white shadow rounded-xl"
    >
      <!-- Mensaje de éxito -->
      <div v-if="successMessage" class="mb-4">
        <AlertMessage
          type="success"
          :message="successMessage"
          autoDismiss
        />
      </div>

      <!-- Encabezado -->
      <div class="flex items-center gap-6 mb-6">
        <!-- Foto con ícono de editar -->
        <div class="relative w-28 h-28">
          <img
            v-if="user.photo"
            :src="user.photo"
            alt="Foto de perfil"
            class="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
          />
          <div
            v-else
            class="w-full h-full bg-gray-300 rounded-full border-4 border-white shadow-md"
          ></div>

          <!-- Ícono de cámara -->
          <RouterLink
            to="/mi-perfil/editar/imagen"
            class="absolute top-1 right-1 bg-black/60 p-1 rounded-full hover:bg-black/80 transition"
            title="Editar imagen"
          >
            <Camera class="w-4 h-4 text-white" />
          </RouterLink>
        </div>

        <!-- Info -->
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-800">
              {{ user.display_name || 'Mi perfil' }}
            </h1>
            <RouterLink
              to="/mi-perfil/editar"
              class="transition-colors py-2 px-4 rounded bg-[#41C3A5] text-white focus:bg-[#3D9C86] hover:bg-[#3D9C86] active:bg-yellow-700"
            >
              Editar perfil
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Información del perfil -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <div>
          <dt class="font-semibold">Biografía</dt>
          <dd class="mb-2">{{ user.bio || '—' }}</dd>
        </div>
        <div>
          <dt class="font-semibold">Email</dt>
          <dd class="mb-2">{{ user.email || '—' }}</dd>
        </div>
        <div>
          <dt class="font-semibold">Sector</dt>
          <dd class="mb-2">{{ user.sector || '—' }}</dd>
        </div>
        <div>
          <dt class="font-semibold">Equipo</dt>
          <dd class="mb-2">{{ user.equipo || '—' }}</dd>
        </div>
        <div>
          <dt class="font-semibold">Rustdesk</dt>
          <dd class="mb-2">{{ user.rustdesk || '—' }}</dd>
        </div>
      </div>
    </div>
  </div>

  <!-- Botón flotante de chat con logo -->
  <RouterLink
    to="/chat"
    class="fixed bottom-6 right-6 z-50 bg-[#01C38E] rounded-full shadow-lg hover:bg-[#00a77c] transition-transform w-16 h-16 flex items-center justify-center overflow-hidden transition-opacity duration-[1500ms]"
    :class="{ 'opacity-0 pointer-events-none': !mostrarBoton, 'opacity-100': mostrarBoton }"
    title="Abrir Chat"
  >
    <img
      :src="chatbitLogo"
      alt="Chatbit"
      class="object-contain w-14 h-14 p-0 floating-icon"
      :class="{ 'rotate-on-load': mostrarAnimacion }"
    />
  </RouterLink>
</template>

<script>
import MainH1 from '../components/MainH1.vue';
import MainButton from '../components/MainButton.vue';
import MainLoader from '../components/MainLoader.vue';
import AlertMessage from '../components/AlertMessage.vue';
import { subscribeToAuthState } from '../services/auth';
import { getUserProfileById } from '../services/user-profiles';
import { Camera } from 'lucide-vue-next';
import chatbitLogo from '@/assets/chatbit.png'; // ✅ Importación correcta del logo

export default {
  name: 'MyProfile',
  components: {
    MainH1,
    MainButton,
    MainLoader,
    AlertMessage,
    Camera
  },
  data() {
    return {
      user: {
        id: null,
        email: null,
        bio: null,
        display_name: null,
        sector: null,
        equipo: null,
        rustdesk: null,
        photo: null
      },
      loading: true,
      successMessage: '',
      mostrarBoton: false,
      mostrarAnimacion: false,
      chatbitLogo // ✅ Lo añadimos al data para usar en template
    };
  },
  mounted() {
    subscribeToAuthState(async (sessionUser) => {
      if (sessionUser?.id) {
        try {
          const profile = await getUserProfileById(sessionUser.id);
          this.user = { ...sessionUser, ...profile };
          console.log('[MyProfile.vue] Usuario cargado:', JSON.parse(JSON.stringify(this.user)));
        } catch (error) {
          console.error('Error al cargar perfil extendido:', error);
        } finally {
          this.loading = false;
        }
      } else {
        this.loading = false;
      }

      if (this.$route.query.success === 'true') {
        this.successMessage = 'Perfil actualizado correctamente.';
      } else if (this.$route.query.success === 'avatar') {
        this.successMessage = 'Tu foto de perfil se actualizó correctamente.';
      }

      setTimeout(() => (this.successMessage = ''), 5000);
    });

    // Animación del ícono flotante
    setTimeout(() => {
      this.mostrarAnimacion = false;
      void document.querySelector('.floating-icon')?.offsetWidth;
      this.mostrarAnimacion = true;

      setTimeout(() => {
        this.mostrarAnimacion = false;
      }, 1800);
    }, 1800);

    setTimeout(() => {
      this.mostrarBoton = true;
    }, 1500);
  }
};
</script>

<!-- Estilos globales para animación -->
<style>
@keyframes spin-once {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotate-on-load {
  animation: spin-once 0.6s ease-in-out;
}
</style>
