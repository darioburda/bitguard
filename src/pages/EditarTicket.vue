<template>
  <div class="max-w-screen-md mx-auto px-4 py-10">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <MainLoader />
    </div>

    <div v-else>
      <h1 class="text-2xl font-bold mb-6">Editar Ticket</h1>

      <AlertMessage v-if="feedback" :message="feedback" type="success" auto-dismiss @dismiss="feedback = ''" />

      <!-- Card del formulario -->
      <div class="relative bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 mb-10 overflow-hidden">
        <!-- Badge estado con estadoOriginal -->
        <BadgeEstado v-if="estadoOriginal" :value="estadoOriginal" class="absolute top-2 left-2 z-10" />

        <!-- Badge ID y NEW -->
        <div class="absolute top-3 right-3 z-10 flex items-center gap-1">
          <span
            v-if="estadoOriginal === 'Abierto'"
            class="text-[10px] font-bold text-[#474747] px-1 py-[1px]"
          >
            NEW
          </span>
          <BadgeTicket v-if="tipoOriginal" :tipo="tipoOriginal" :id="ticket.id" :variant="estadoOriginal === 'Abierto' ? 'activo' : ''" />
        </div>

        <form @submit.prevent="submitForm" class="space-y-6">
          <!-- Usuario solicitante (solo lectura) -->
          <div>
            <label class="block mb-1 font-semibold">Usuario solicitante</label>
            <input
              type="text"
              :value="usuarioSeleccionado"
              disabled
              class="w-full border px-4 py-2 rounded bg-gray-100"
            />
          </div>

          <!-- Técnico asignado -->
          <div>
            <label class="block mb-1 font-semibold">Asignar técnico</label>
            <select v-model="ticket.tecnico_id" class="w-full border px-4 py-2 rounded">
              <option value="">-- Ninguno --</option>
              <option v-for="t in tecnicos" :key="t.id" :value="t.id">
                {{ t.display_name || t.email }}
              </option>
            </select>
          </div>

          <!-- Tipo de soporte -->
          <div>
            <label class="block mb-1 font-semibold">Tipo de soporte</label>
            <select v-model="ticket.tipo" class="w-full border px-4 py-2 rounded">
              <option value="Remoto">Remoto</option>
              <option value="Presencial">Presencial</option>
            </select>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block mb-1 font-semibold">Descripción</label>
            <textarea
              v-model="ticket.descripcion"
              class="w-full border px-4 py-2 rounded resize-none"
              rows="4"
            ></textarea>
          </div>

          <!-- ¿Se realizó visita? -->
          <div>
            <label class="flex items-center gap-2 font-semibold">
              <input type="checkbox" v-model="ticket.fue_visita" />
              ¿Se realizó visita presencial?
            </label>
          </div>

          <!-- Minutos utilizados -->
          <div>
            <label class="block mb-1 font-semibold">Minutos utilizados</label>
            <input
              type="number"
              v-model.number="ticket.minutos_usados"
              class="w-full border px-4 py-2 rounded"
              min="0"
              placeholder="Ej: 45"
            />
          </div>

          <!-- Estado -->
          <div>
            <label class="block mb-1 font-semibold">Estado</label>
            <select v-model="ticket.estado" class="w-full border px-4 py-2 rounded">
              <option value="Abierto">Abierto</option>
              <option value="Activo">Activo</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          <!-- Botón -->
          <MainButton type="submit">Guardar Cambios</MainButton>
        </form>
      </div>

      <!-- Nueva actualización -->
      <div class="bg-white shadow rounded-2xl border p-6 mb-10">
        <h2 class="text-lg font-bold mb-4">Agregar Actualización</h2>
        <form @submit.prevent="agregarActualizacion" class="space-y-4">
          <textarea
            v-model="nuevaActualizacion"
            rows="3"
            class="w-full border px-4 py-2 rounded resize-none"
            placeholder="Describí brevemente el trabajo realizado..."
          ></textarea>
          <MainButton type="submit">Agregar</MainButton>
        </form>
      </div>

      <!-- Historial de actualizaciones -->
      <div v-if="actualizaciones.length > 0" class="bg-white shadow-md rounded-2xl p-6 border">
        <h2 class="text-lg font-bold mb-4">Historial de Actualizaciones</h2>
        <ul class="space-y-4">
          <li v-for="act in actualizaciones" :key="act.id" class="border-b pb-2">
            <div class="text-sm text-gray-600">
              <strong>{{ act.tecnico_nombre }}</strong> - {{ new Date(act.created_at).toLocaleString() }}
            </div>
            <p class="mt-1 text-gray-800 whitespace-pre-line">{{ act.descripcion }}</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getTicketById,
  actualizarTicket,
  getActualizacionesPorTicketId,
  crearActualizacionTicket,
} from '@/services/tickets';
import { getAllUserProfiles } from '@/services/user-profiles';
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
      fue_visita: false,
      estado: 'Abierto',
      tecnico_id: '',
      minutos_usados: 0,
    });

    const tipoOriginal = ref('');
    const estadoOriginal = ref('');
    const tecnicos = ref([]);
    const usuarioSeleccionado = ref('');
    const feedback = ref('');
    const actualizaciones = ref([]);
    const nuevaActualizacion = ref('');
    const loading = ref(true);

    const cargarDatos = async () => {
      try {
        const id = route.params.id;
        const data = await getTicketById(id);
        ticket.value = {
          id: data.id,
          tipo: data.tipo || 'Remoto',
          descripcion: data.descripcion || '',
          fue_visita: data.fue_visita || false,
          estado: data.estado || 'Abierto',
          tecnico_id: data.tecnico_id || '',
          usuario_id: data.usuario_id,
          minutos_usados: data.minutos_usados || 0,
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

        if (estado === 'Cerrado' && (!ticket.value.minutos_usados || ticket.value.minutos_usados <= 0)) {
          feedback.value = '❌ Debes ingresar los minutos utilizados para cerrar el ticket.';
          return;
        }

        if (ticket.value.tecnico_id === '') {
          ticket.value.tecnico_id = null;
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

    const agregarActualizacion = async () => {
      if (!nuevaActualizacion.value.trim()) return;

      try {
        await crearActualizacionTicket(ticket.value.id, nuevaActualizacion.value.trim());
        nuevaActualizacion.value = '';
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
      agregarActualizacion,
      loading,
    };
  },
};
</script>