<template>
  <div class="h-full overflow-auto relative">
    <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <MainLoader />
    </div>

    <div class="mx-auto max-w-6xl w-full px-4 sm:px-8 py-10 mt-10">
      <!-- CARD -->
      <div
        class="relative bg-white shadow-md rounded-2xl p-10 overflow-hidden w-full min-w-[420px] max-w-[620px] mx-auto flex flex-col gap-6 border border-[#01C38E] transition-all duration-300"
      >
        <h2 class="text-xl font-semibold text-gray-800">Crear nuevo ticket</h2>

        <!-- Tipo -->
        <div>
          <label for="tipo" class="block font-semibold mb-1">Tipo</label>
          <select
            id="tipo"
            v-model="nuevoTicket.tipo"
            class="w-full border px-4 py-2 rounded"
          >
            <option value="Remoto">Remoto</option>
            <option value="Presencial">Presencial</option>
          </select>
        </div>

        <!-- Descripción -->
        <div>
          <label for="descripcion" class="block font-semibold mb-1">Descripción</label>
          <textarea
            id="descripcion"
            v-model="nuevoTicket.descripcion"
            placeholder="Describí brevemente el problema o consulta..."
            class="w-full border px-4 py-2 rounded"
            rows="4"
          ></textarea>
        </div>

        <!-- Botón -->
        <button
          @click="crearTicket"
          :disabled="!nuevoTicket.descripcion.trim()"
          class="transition-colors py-2 px-4 rounded text-white font-semibold"
          :class="nuevoTicket.descripcion.trim() ? 'bg-[#01C38E] hover:bg-[#019d75]' : 'bg-[#9be2c9] cursor-not-allowed'"
        >
          Crear Ticket
        </button>

        <!-- Toggle -->
        <button
          @click="mostrarConsumo = !mostrarConsumo"
          class="flex items-center gap-1 text-sm self-start text-[#01C38E] hover:underline focus:outline-none transition"
        >
          <EyeIcon v-if="!mostrarConsumo" class="w-4 h-4" />
          <EyeOffIcon v-else class="w-4 h-4" />
          <span>{{ mostrarConsumo ? 'Ocultar consumo del plan' : 'Ver consumo del plan' }}</span>
        </button>

        <!-- Consumo -->
        <div
          v-if="mostrarConsumo && empresa"
          class="bg-[#e7fdef] -mx-10 -mb-10 px-10 pt-6 pb-8 rounded-b-2xl transition-all duration-300"
        >
          <h2 class="text-lg font-semibold text-gray-700 mb-6 text-center">Consumo del Plan</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
            <!-- Soporte -->
            <div class="flex flex-col items-center w-[140px] h-[140px]">
              <span class="text-sm text-gray-500 mb-1">Soporte</span>
              <SoporteChart
                class="w-[140px] h-[140px]"
                :usados="empresa.minutos_consumidos ?? 0"
                :restantes="(empresa.plan?.minutos_incluidos ?? 0) - (empresa.minutos_consumidos ?? 0)"
              />
            </div>

            <!-- Visitas -->
            <div class="flex flex-col items-center w-[140px] h-[140px]">
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

      <!-- Tickets del usuario -->
      <div v-if="tickets && tickets.length" class="mt-10 max-w-xl mx-auto">
        <h2 class="text-xl font-semibold mb-4">Tus Tickets</h2>
        <ul class="space-y-3">
          <li
            v-for="ticket in tickets"
            :key="ticket.id"
            class="bg-white shadow p-4 rounded-lg text-sm border border-gray-200"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold">{{ ticket.descripcion }}</p>
                <p class="text-gray-500">
                  ID: {{ ticket.id.slice(0, 8) }} · {{ ticket.estado }} · {{ ticket.tipo }}
                </p>
              </div>
              <span class="text-xs text-gray-400">{{ formatDate(ticket.created_at) }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../services/supabase';
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next';
import SoporteChart from '../components/SoporteChart.vue';
import VisitasChart from '../components/VisitasChart.vue';
import MainLoader from '../components/MainLoader.vue';

const router = useRouter();
const loading = ref(true);
const empresa = ref(null);
const tickets = ref([]);
const mostrarConsumo = ref(true);
const user = ref({});
const nuevoTicket = ref({
  tipo: 'Remoto',
  descripcion: ''
});

const cargarDatos = async () => {
  loading.value = true;
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return router.push('/');

  const { data: perfil } = await supabase
    .from('user_profiles')
    .select('*, empresa:empresas(*, plan:planes(*))')
    .eq('id', authUser.id)
    .single();

  user.value = perfil;
  empresa.value = perfil.empresa;

  const { data: misTickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('usuario_id', perfil.id)
    .order('created_at', { ascending: false }); // ✅ Corregido

  tickets.value = misTickets || [];
  loading.value = false;
};

const crearTicket = async () => {
  if (!nuevoTicket.value.descripcion) return;
  const { error } = await supabase.from('tickets').insert({
    usuario_id: user.value.id,
    empresa_id: empresa.value.id,
    tipo: nuevoTicket.value.tipo,
    descripcion: nuevoTicket.value.descripcion,
    estado: 'Abierto'
  });

  if (error) {
    console.error('❌ Error al crear ticket: ', error);
    return;
  }

  nuevoTicket.value.descripcion = '';
  await cargarDatos();
};

const formatDate = (iso) => {
  const date = new Date(iso);
  return date.toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
};

onMounted(() => {
  cargarDatos();
});
</script>
