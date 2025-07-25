<template>
  <div class="max-w-screen-md mx-auto px-4 py-10">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <MainLoader />
    </div>

    <div v-else>
      <h1 class="text-2xl font-bold mb-6">Editar Ticket</h1>

      <AlertMessage v-if="feedback" :message="feedback" type="success" auto-dismiss @dismiss="feedback = ''" />

      <!-- Card 1: Información del ticket -->
      <div class="relative bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 mb-10 overflow-hidden">
        <BadgeEstado v-if="estadoOriginal" :value="estadoOriginal" class="absolute top-2 left-2 z-10" />
        <div class="absolute top-3 right-3 z-10 flex items-center gap-1">
          <span v-if="estadoOriginal === 'Abierto'" class="text-[10px] font-bold text-[#474747] px-1 py-[1px]">NEW</span>
          <BadgeTicket v-if="tipoOriginal" :tipo="tipoOriginal" :id="ticket.id" :variant="estadoOriginal === 'Abierto' ? 'activo' : ''" />
        </div>

        <form @submit.prevent="submitForm" class="space-y-6">
          <div>
            <label class="block mb-1 font-semibold">Usuario solicitante</label>
            <input type="text" :value="usuarioSeleccionado" disabled class="w-full border px-4 py-2 rounded bg-gray-100" />
          </div>
          <div>
            <label class="block mb-1 font-semibold">Asignar técnico</label>
            <select v-model="ticket.tecnico_id" class="w-full border px-4 py-2 rounded">
              <option value="">-- Ninguno --</option>
              <option v-for="t in tecnicos" :key="t.id" :value="t.id">{{ t.display_name || t.email }}</option>
            </select>
          </div>
          <div>
            <label class="block mb-1 font-semibold">Título del problema</label>
            <input v-model="ticket.titulo" :disabled="!puedeEditarCampos" class="w-full border px-4 py-2 rounded" type="text" :class="{ 'bg-gray-100 text-gray-500': !puedeEditarCampos }" />
          </div>
          <div>
            <label class="block mb-1 font-semibold">Tema de ayuda</label>
            <select v-model="ticket.tema_ayuda" :disabled="!puedeEditarCampos" class="w-full border px-4 py-2 rounded" :class="{ 'bg-gray-100 text-gray-500': !puedeEditarCampos }">
              <option value="">-- Seleccionar --</option>
              <option value="Red e Internet">Red e Internet</option>
              <option value="Correo electrónico">Correo electrónico</option>
              <option value="Teléfono / Interno">Teléfono / Interno</option>
              <option value="Reparación de impresora">Reparación de impresora</option>
              <option value="Compra de equipo">Compra de equipo</option>
              <option value="Sistema de gestión">Sistema de gestión</option>
              <option value="Acceso remoto">Acceso remoto</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label class="block mb-1 font-semibold">Tipo de soporte</label>
            <select v-model="ticket.tipo" class="w-full border px-4 py-2 rounded">
              <option value="Remoto">Remoto</option>
              <option value="Presencial">Presencial</option>
            </select>
          </div>
          <div>
            <label class="block mb-1 font-semibold">Descripción</label>
            <textarea v-model="ticket.descripcion" :disabled="!puedeEditarCampos" class="w-full border px-4 py-2 rounded resize-none" rows="4" :class="{ 'bg-gray-100 text-gray-500': !puedeEditarCampos }"></textarea>
          </div>
          <MainButton type="submit">Guardar Cambios</MainButton>
        </form>
      </div>

      <!-- Card 2: Historial de Actualizaciones -->
      <div v-if="actualizaciones.length > 0" class="bg-white shadow-md rounded-2xl p-6 border mb-6">
        <h2 class="text-lg font-bold mb-4">Historial de Actualizaciones</h2>
        <ul class="space-y-4">
          <li v-for="act in actualizaciones" :key="act.id" class="border-b pb-2">
            <div class="text-sm text-gray-600">
              <strong>{{ act.tecnico_nombre }}</strong> - {{ formatDate(act.created_at) }}
            </div>
            <p class="mt-1 text-gray-800 whitespace-pre-line">{{ act.descripcion }}</p>
            <p class="text-gray-500 italic">
              {{ act.minutos_usados }} min · {{ act.fue_visita ? 'Visita presencial' : 'Remoto' }} · Estado: {{ act.estado_ticket }}
            </p>
          </li>
        </ul>
      </div>

      <!-- Card 3: Agregar actualización -->
      <div class="bg-white rounded-xl shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4 text-[#01C38E]">Agregar actualización</h2>

        <div class="space-y-4">
          <div>
            <label class="block font-medium mb-1 text-sm">Descripción del trabajo</label>
            <textarea v-model="nuevaActualizacion" rows="3" class="w-full px-4 py-2 border rounded-md text-sm"></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-medium mb-1 text-sm">Minutos utilizados</label>
              <input type="number" v-model="minutosUsados" class="w-full px-4 py-2 border rounded-md text-sm" min="1" />
            </div>
            <div class="flex items-center mt-6">
              <input type="checkbox" v-model="fueVisita" id="fueVisita" class="accent-[#01C38E] w-5 h-5" />
              <label for="fueVisita" class="ml-2 text-sm">¿Fue una visita presencial?</label>
            </div>
          </div>

          <div class="mt-4 flex gap-4">
            <MainButton class="bg-blue-600 hover:bg-blue-700" @click="agregarActualizacion">
              Guardar actualización
            </MainButton>
            <MainButton
              :disabled="!puedeCerrarTicket"
              :class="!puedeCerrarTicket ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'"
              @click="cerrarTicket"
            >
              Cerrar Ticket
            </MainButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getTicketById,
  actualizarTicket,
  getActualizacionesPorTicketId,
  crearActualizacionTicket,
} from '@/services/tickets';
import { getAllUserProfiles } from '@/services/user-profiles';
import { supabase } from '@/services/supabase';
import AlertMessage from '@/components/AlertMessage.vue';
import MainButton from '@/components/MainButton.vue';
import BadgeTicket from '@/components/BadgeTicket.vue';
import BadgeEstado from '@/components/BadgeEstado.vue';
import MainLoader from '@/components/MainLoader.vue';

export default {
  components: {
    AlertMessage,
    MainButton,
    BadgeTicket,
    BadgeEstado,
    MainLoader
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const ticket = ref({
      tipo: '',
      descripcion: '',
      estado: 'Abierto',
      tecnico_id: '',
      titulo: '',
      tema_ayuda: '',
      usuario_id: '',
      created_at: ''
    });

    const tipoOriginal = ref('');
    const estadoOriginal = ref('');
    const tecnicos = ref([]);
    const usuarioSeleccionado = ref('');
    const feedback = ref('');
    const actualizaciones = ref([]);
    const nuevaActualizacion = ref('');
    const minutosUsados = ref(0);
    const fueVisita = ref(false);
    const loading = ref(true);
    const currentUserId = ref('');

    const puedeEditarCampos = computed(() => {
      return currentUserId.value === ticket.value.usuario_id && ticket.value.estado === 'Abierto';
    });

    const tieneActualizacionPendiente = computed(() => {
      return nuevaActualizacion.value.trim().length > 0 && minutosUsados.value > 0;
    });

    const puedeCerrarTicket = computed(() => {
      return (
        (ticket.value.estado === 'Abierto' || ticket.value.estado === 'Activo') &&
        tieneActualizacionPendiente.value
      );
    });

    const formatDate = (fecha) => {
      if (!fecha) return '—';
      const date = new Date(fecha);
      return isNaN(date) ? 'Fecha inválida' : date.toLocaleString('es-AR');
    };

    const cargarDatos = async () => {
      try {
        const id = route.params.id;
        const { data: session } = await supabase.auth.getUser();
        currentUserId.value = session?.user?.id;

        const data = await getTicketById(id);
        ticket.value = {
          id: data.id,
          tipo: data.tipo || 'Remoto',
          descripcion: data.descripcion || '',
          estado: data.estado || 'Abierto',
          tecnico_id: data.tecnico_id || '',
          usuario_id: data.usuario_id,
          titulo: data.titulo || '',
          tema_ayuda: data.tema_ayuda || '',
          created_at: data.created_at
        };

        tipoOriginal.value = ticket.value.tipo;
        estadoOriginal.value = ticket.value.estado;

        const perfiles = await getAllUserProfiles();
        tecnicos.value = perfiles.filter((u) => u.is_admin);
        const usuario = perfiles.find((u) => u.id === data.usuario_id);
        usuarioSeleccionado.value = usuario?.display_name || usuario?.email || 'Usuario no encontrado';

        actualizaciones.value = await getActualizacionesPorTicketId(id);
      } catch (error) {
        console.error('Error al cargar datos del ticket:', error);
      } finally {
        loading.value = false;
      }
    };

    const submitForm = async () => {
      try {
        const estado = ticket.value.estado;

        if ((estado === 'Activo' || estado === 'Cerrado') && (!ticket.value.tecnico_id || ticket.value.tecnico_id === '')) {
          feedback.value = '❌ Debes asignar un técnico para continuar.';
          return;
        }

        await actualizarTicket(ticket.value.id, ticket.value);

        estadoOriginal.value = ticket.value.estado;
        tipoOriginal.value = ticket.value.tipo;

        feedback.value = '✅ Ticket actualizado correctamente';
        router.push({ name: 'AbmTickets' });
      } catch (error) {
        console.error('[EditarTicket] Error:', error);
        feedback.value = '❌ Error al actualizar ticket';
      }
    };

    const cerrarTicket = async () => {
      try {
        if (tieneActualizacionPendiente.value) {
          await agregarActualizacion(true);
        }

        await actualizarTicket(ticket.value.id, { estado: 'Cerrado' });
        ticket.value.estado = 'Cerrado';
        estadoOriginal.value = 'Cerrado';
        feedback.value = '✅ Ticket cerrado correctamente';
      } catch (error) {
        console.error('[cerrarTicket] Error:', error);
        feedback.value = '❌ No se pudo cerrar el ticket.';
      }
    };

    const agregarActualizacion = async (desdeCerrarTicket = false) => {
      if (!tieneActualizacionPendiente.value) {
        if (!desdeCerrarTicket) {
          feedback.value = '❌ Debes completar la descripción y minutos.';
        }
        return;
      }

      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) throw new Error('Técnico no autenticado');

        const tecnicoActual = user.user.id;

        if (!ticket.value.tecnico_id) {
          await actualizarTicket(ticket.value.id, { tecnico_id: tecnicoActual });
          ticket.value.tecnico_id = tecnicoActual;
        }

        await crearActualizacionTicket({
          ticket_id: ticket.value.id,
          tecnico_id: tecnicoActual,
          descripcion: nuevaActualizacion.value.trim(),
          minutos_usados: minutosUsados.value,
          fue_visita: fueVisita.value,
          estado_ticket: ticket.value.estado,
        });

        nuevaActualizacion.value = '';
        minutosUsados.value = 0;
        fueVisita.value = false;
        actualizaciones.value = await getActualizacionesPorTicketId(ticket.value.id);
      } catch (error) {
        console.error('[AgregarActualizacion] Error:', error);
        feedback.value = '❌ No se pudo agregar la actualización.';
      }
    };

    onMounted(cargarDatos);

    return {
      ticket,
      tipoOriginal,
      estadoOriginal,
      tecnicos,
      usuarioSeleccionado,
      feedback,
      submitForm,
      actualizaciones,
      nuevaActualizacion,
      minutosUsados,
      fueVisita,
      agregarActualizacion,
      loading,
      formatDate,
      puedeEditarCampos,
      puedeCerrarTicket,
      cerrarTicket
    };
  },
};
</script>
