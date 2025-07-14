<template>
  <div class="h-full overflow-auto relative">
    <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <MainLoader />
    </div>

    <div v-else class="mx-auto max-w-[900px] w-full px-4 sm:px-8 py-6 mt-10 bg-white shadow rounded-xl">
      <div v-if="successMessage" class="mb-4">
        <AlertMessage type="success" :message="successMessage" autoDismiss />
      </div>

      <!-- Encabezado -->
      <div class="flex items-center gap-6 mb-6">
        <div class="relative w-28 h-28">
          <img
            v-if="user.photo"
            :src="user.photo"
            alt="Foto de perfil"
            class="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
          />
          <div v-else class="w-full h-full bg-gray-300 rounded-full border-4 border-white shadow-md"></div>
          <RouterLink
            to="/mi-perfil/editar/imagen"
            class="absolute top-1 right-1 bg-black/60 p-1 rounded-full hover:bg-black/80 transition"
            title="Editar imagen"
          >
            <Camera class="w-4 h-4 text-white" />
          </RouterLink>
        </div>

        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-800">
              {{ user.display_name || 'Mi perfil' }}
            </h1>
            <RouterLink
              to="/mi-perfil/editar"
              class="transition-colors py-2 px-4 rounded bg-[#41C3A5] text-white focus:bg-[#3D9C86] hover:bg-[#3D9C86]"
            >
              Editar perfil
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Info técnica -->
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

    <!-- Empresa -->
    <div v-if="empresa" class="mt-10 bg-white p-6 rounded-xl shadow max-w-[900px] mx-auto">
      <h2 class="text-xl font-semibold mb-1">{{ empresa.nombre }}</h2>
      <p class="text-gray-600 text-sm">
        Plan: <strong>{{ empresa.plan?.nombre }}</strong>
      </p>
      <p class="text-xs text-gray-500">
        Soporte usado: {{ empresa.horas_consumidas }}m / {{ empresa.plan?.minutos_incluidos }}m ·
        Visitas: {{ empresa.visitas_consumidas }} / {{ empresa.plan?.visitas_incluidas }}
      </p>

    </div>

    <!-- Compañeros -->
    <div v-if="companeros.length" class="mt-10 max-w-[900px] mx-auto">
      <h2 class="text-xl font-semibold mb-4">Compañeros de tu empresa</h2>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="u in companeros"
          :key="u.id"
          class="bg-white rounded-lg shadow p-4 flex gap-4 items-center"
        >
          <img
            :src="u.photo || defaultPhotoUrl"
            alt="Foto"
            class="w-12 h-12 rounded-full object-cover border"
          />
          <div class="text-sm">
            <p class="font-medium">{{ u.display_name }}</p>
            <p class="text-gray-500">{{ u.email }}</p>
            <p class="text-gray-500">Interno: {{ u.interno_telefono || '—' }}</p>

          </div>
        </div>
      </div>
    </div>

    <!-- Tickets -->
    <div v-if="tickets.length" class="mt-10 max-w-[900px] mx-auto mb-20">
      <h2 class="text-xl font-semibold mb-4">Tus Tickets</h2>
      <ul class="space-y-3">
        <li v-for="ticket in tickets" :key="ticket.id" class="bg-white shadow p-4 rounded-lg text-sm">
          <div class="flex justify-between">
            <div>
              <p class="font-semibold">{{ ticket.descripcion }}</p>
              <p class="text-gray-500">Estado: {{ ticket.estado }} · {{ ticket.tipo_soporte }}</p>
            </div>
            <span class="text-xs text-gray-400">{{ formatDate(ticket.created_at) }}</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Chat flotante -->
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
  </div>
</template>

<script>
import MainH1 from '../components/MainH1.vue';
import MainButton from '../components/MainButton.vue';
import MainLoader from '../components/MainLoader.vue';
import AlertMessage from '../components/AlertMessage.vue';
import { subscribeToAuthState } from '../services/auth';
import { getUserProfileById } from '../services/user-profiles';
import { supabase } from '@/services/supabase';
import { Camera } from 'lucide-vue-next';
import chatbitLogo from '@/assets/chatbit.png';

const defaultPhotoUrl =
  'https://yjqstwwltjefqtsxlbsa.supabase.co/storage/v1/object/public/profile-picture//default-avatar-2.png';

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
      chatbitLogo,
      empresa: null,
      companeros: [],
      tickets: [],
      defaultPhotoUrl
    };
  },
  methods: {
    formatDate(dateStr) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('es-AR', options);
    }
  },
  mounted() {
    subscribeToAuthState(async (sessionUser) => {
      if (sessionUser?.id) {
        try {
          const profile = await getUserProfileById(sessionUser.id);
          this.user = { ...sessionUser, ...profile };

          // Consulta empresa
          const { data: empresaData } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', profile.empresa_id)
            .single();

          if (!empresaData) throw new Error('Empresa no encontrada');

          // Consulta plan
          if (empresaData.plan_id) {
            const { data: planData } = await supabase
              .from('planes')
              .select('nombre, minutos_incluidos, visitas_incluidas')

              .eq('id', empresaData.plan_id)
              .single();
            empresaData.plan = planData;
          }

          this.empresa = empresaData;

          // Compañeros
          const { data: companerosData } = await supabase
            .from('user_profiles')
            .select('id, display_name, email, interno_telefono, photo')

            .eq('empresa_id', profile.empresa_id);

          this.companeros = (companerosData || []).filter((u) => u.id !== profile.id);

          // Tickets
          const { data: misTickets } = await supabase
            .from('tickets')
            .select('*')
            .eq('usuario_id', profile.id)
            .order('created_at', { ascending: false });

          this.tickets = misTickets;
        } catch (error) {
          console.error('Error al cargar datos de perfil extendido:', error);
        } finally {
          this.loading = false;
        }
      } else {
        this.loading = false;
      }

      // Mensajes por query
      if (this.$route.query.success === 'true') {
        this.successMessage = 'Perfil actualizado correctamente.';
      } else if (this.$route.query.success === 'avatar') {
        this.successMessage = 'Tu foto de perfil se actualizó correctamente.';
      }

      setTimeout(() => (this.successMessage = ''), 5000);

      // Chat animación
      setTimeout(() => {
        this.mostrarAnimacion = false;
        void document.querySelector('.floating-icon')?.offsetWidth;
        this.mostrarAnimacion = true;
        setTimeout(() => (this.mostrarAnimacion = false), 1800);
      }, 1800);

      setTimeout(() => {
        this.mostrarBoton = true;
      }, 1500);
    });
  }
};
</script>

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
