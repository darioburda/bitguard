<template>
  <div class="h-full overflow-auto relative">
    <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <MainLoader />
    </div>

    <div v-else class="mx-auto max-w-[900px] w-full px-4 sm:px-8 py-6 mt-10">
      <div class="flex justify-end mb-4">
        <RouterLink
          to="/mi-perfil/editar"
          class="transition-colors py-2 px-4 rounded bg-[#41C3A5] text-white focus:bg-[#3D9C86] hover:bg-[#3D9C86]"
        >
          Editar perfil
        </RouterLink>
      </div>

      <div class="relative bg-white shadow rounded-2xl p-6 overflow-hidden">

        <BadgePlan
          v-if="empresa?.plan?.nombre"
          :value="empresa.plan.nombre"
          class="absolute top-2 left-2"
        />

        


        <div class="flex items-center gap-6 mb-6">
          <BadgeSector
          v-if="user.sector"
          :value="user.sector"
          class="absolute top-3 right-3 mt-4"
        />
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

          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ user.display_name || 'Mi perfil' }}</h1>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
        </div>

        <hr class="mb-4" />

        <div class="text-sm text-gray-700 space-y-2">
          <div class="flex items-center gap-2">
            <strong>Rustdesk:</strong>
            <span>{{ user.rustdesk || '-' }}</span>
          </div>
          <p><strong>Equipo:</strong> {{ user.equipo || '-' }}</p>
          <p><strong>Interno:</strong> {{ user.interno_telefono || '-' }}</p>
        </div>
      </div>

      <div v-if="tickets.length" class="mt-10">
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
  </div>
</template>


<script>
import MainLoader from '../components/MainLoader.vue';
import AlertMessage from '../components/AlertMessage.vue';
import { subscribeToAuthState } from '../services/auth';
import { getUserProfileById } from '../services/user-profiles';
import { supabase } from '@/services/supabase';
import { Camera } from 'lucide-vue-next';
import chatbitLogo from '@/assets/chatbit.png';
import BadgePlan from '../components/BadgePlan.vue';
import BadgeSector from '../components/BadgeSector.vue';

export default {
  name: 'MyProfile',
  components: {
    MainLoader,
    AlertMessage,
    Camera,
    BadgePlan,
    BadgeSector,
  },
  data() {
    return {
      user: {
        id: null,
        email: null,
        display_name: null,
        sector: null,
        equipo: null,
        rustdesk: null,
        interno_telefono: null,
        photo: null,
      },
      loading: true,
      successMessage: '',
      mostrarBoton: false,
      mostrarAnimacion: false,
      chatbitLogo,
      empresa: null,
      tickets: [],
    };
  },
  methods: {
    formatDate(dateStr) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('es-AR', options);
    },
  },
  mounted() {
    subscribeToAuthState(async (sessionUser) => {
      if (sessionUser?.id) {
        try {
          const profile = await getUserProfileById(sessionUser.id);
          this.user = { ...sessionUser, ...profile };

          const { data: empresaData } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', profile.empresa_id)
            .single();

          if (!empresaData) throw new Error('Empresa no encontrada');

          if (empresaData.plan_id) {
            const { data: planData } = await supabase
              .from('planes')
              .select('nombre, minutos_incluidos, visitas_incluidas')
              .eq('id', empresaData.plan_id)
              .single();
            empresaData.plan = planData;
          }

          this.empresa = empresaData;

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

      if (this.$route.query.success === 'true') {
        this.successMessage = 'Perfil actualizado correctamente.';
      } else if (this.$route.query.success === 'avatar') {
        this.successMessage = 'Tu foto de perfil se actualizó correctamente.';
      }

      setTimeout(() => (this.successMessage = ''), 5000);

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
  },
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
