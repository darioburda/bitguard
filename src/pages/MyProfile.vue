<template>
  <div class="h-full overflow-auto relative">
    <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <MainLoader />
    </div>

    <div class="mx-auto max-w-6xl w-full px-4 sm:px-8 py-10 mt-10">
      <div class="flex justify-end mb-4">
        <RouterLink
          to="/mi-perfil/editar"
          class="transition-colors py-2 px-4 rounded bg-[#01C38E] text-white focus:bg-[#3D9C86] hover:bg-[#3D9C86]"
        >
          Editar perfil
        </RouterLink>
      </div>

      <!-- CARD principal -->
      <div class="relative bg-white shadow-md rounded-2xl p-10 overflow-hidden w-full flex flex-col gap-10 border border-[#01C38E]">
        <!-- Badges -->
        <BadgePlan
          v-if="empresa?.plan?.nombre"
          :value="empresa.plan.nombre"
          class="absolute top-2 left-2"
        />
        <BadgeEmpresa
          v-if="empresa?.nombre"
          :value="empresa.nombre"
          class="absolute top-3 right-3"
        />

        <!-- Datos del usuario -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 w-full">
          <div class="flex items-center gap-4">
            <div class="relative w-28 h-28 shrink-0">
              <img
                v-if="user.photo"
                :src="user.photo"
                alt="Foto de perfil"
                class="w-full h-full object-cover rounded-full border-2 border-[#01C38E] shadow-md"
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
              <p class="text-sm pt-1 text-[#474747] font-semibold flex items-center gap-1">
                <UsersIcon class="w-4 h-4" />
                {{ user.sector || 'Sin sector' }}
              </p>
            </div>
          </div>

          <div class="flex flex-col justify-center space-y-1 text-sm text-gray-700 border-l pl-6 border-gray-300">
            <div class="flex gap-2">
              <strong>Rustdesk:</strong> <span>{{ user.rustdesk || '-' }}</span>
            </div>
            <div class="flex gap-2">
              <strong>Equipo:</strong> <span>{{ user.equipo || '-' }}</span>
            </div>
            <div class="flex gap-2">
              <strong>Interno:</strong> <span>{{ user.interno_telefono || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Botón toggle -->
        <button
          @click="mostrarConsumo = !mostrarConsumo"
          class="flex items-center gap-1 text-sm self-end text-[#01C38E] hover:underline focus:outline-none transition"
        >
          <EyeIcon v-if="!mostrarConsumo" class="w-4 h-4" />
          <EyeOffIcon v-else class="w-4 h-4" />
          <span>{{ mostrarConsumo ? 'Ocultar consumo del plan' : 'Ver consumo del plan' }}</span>
        </button>



        <!-- Caja integrada para métricas -->
        <div v-if="empresa && mostrarConsumo" class="bg-[#e7fdef] -mx-10 -mb-10 px-10 pt-6 pb-8 rounded-b-2xl">
          <h2 class="text-lg font-semibold text-gray-700 mb-6 text-center">Consumo del Plan</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6 justify-items-center">
            <!-- Gráfica: Soporte -->
            <div class="flex flex-col items-center w-[140px] h-[140px]">
              <span class="text-sm text-gray-500 mb-1">Soporte</span>
              <SoporteChart
                class="w-[140px] h-[140px]"
                :usados="empresa.minutos_consumidos ?? 0"
                :restantes="(empresa.plan?.minutos_incluidos ?? 0) - (empresa.minutos_consumidos ?? 0)"
              />
            </div>

            <!-- Gráfica: Visitas -->
            <div class="flex flex-col items-center w-[140px] h-[140px] justify-center">
              <div class="flex flex-col items-center">
                <span class="text-sm text-gray-500 mb-1">Visitas</span>
                <VisitasChart
                  class="w-[80px] h-[80px]"
                  :visitasConsumidas="empresa.visitas_consumidas ?? 0"
                  :visitasTotales="empresa.plan?.visitas_incluidas ?? 0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      

      <!-- Botón flotante de chat -->
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
import { UsersIcon } from 'lucide-vue-next';
import BadgeEmpresa from '@/components/BadgeEmpresa.vue';
import SoporteChart from '@/components/SoporteChart.vue';
import VisitasChart from '@/components/VisitasChart.vue';
import { getEmpresaConResumen } from '@/services/empresas';
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next';


export default {
  name: 'MyProfile',
  components: {
    MainLoader,
    AlertMessage,
    Camera,
    BadgePlan,
    BadgeSector,
    UsersIcon,
    BadgeEmpresa,
    SoporteChart,
    VisitasChart,
    EyeIcon,
    EyeOffIcon
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
      mostrarConsumo: false,
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

          this.empresa = await getEmpresaConResumen(profile.empresa_id);

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