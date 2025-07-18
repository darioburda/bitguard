<template>
  <div class="max-w-screen-md mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold mb-6">Editar Ticket</h1>

    <AlertMessage v-if="feedback" :message="feedback" type="success" auto-dismiss @dismiss="feedback = ''" />

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
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTicketById, actualizarTicket } from '@/services/tickets';
import { getAllUserProfiles } from '@/services/user-profiles';
import AlertMessage from '@/components/AlertMessage.vue';
import MainButton from '@/components/MainButton.vue';

export default {
  components: {
    AlertMessage,
    MainButton,
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
    const tecnicos = ref([]);
    const usuarioSeleccionado = ref('');
    const feedback = ref('');

    const cargarDatos = async () => {
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

      const perfiles = await getAllUserProfiles();
      tecnicos.value = perfiles.filter((u) => u.is_admin);

      const usuario = perfiles.find((u) => u.id === data.usuario_id);
      usuarioSeleccionado.value = usuario
        ? usuario.display_name || usuario.email
        : 'Usuario no encontrado';
    };

    const submitForm = async () => {
  try {
    const estado = ticket.value.estado;

    // Si el estado es 'en_proceso' o 'cerrado', exigir técnico
    if ((estado === 'Activo' || estado === 'Cerrado') &&
        (!ticket.value.tecnico_id || ticket.value.tecnico_id === '')) {
      feedback.value = '❌ Debes asignar un técnico para continuar.';
      return;
    }

    // Si el estado es 'cerrado', exigir minutos usados
    if (estado === 'Cerrado' &&
        (!ticket.value.minutos_usados || ticket.value.minutos_usados <= 0)) {
      feedback.value = '❌ Debes ingresar los minutos utilizados para cerrar el ticket.';
      return;
    }

    // Asegurar que se envíe null en vez de string vacío
    if (ticket.value.tecnico_id === '') {
      ticket.value.tecnico_id = null;
    }

    await actualizarTicket(ticket.value.id, ticket.value);
    feedback.value = '✅ Ticket actualizado correctamente';
    router.push({ name: 'AbmTickets' });
  } catch (error) {
    console.error('[EditarTicket] Error:', error);
    feedback.value = '❌ Error al actualizar ticket';
  }
};





            onMounted(cargarDatos);

            return {
            ticket,
            tecnicos,
            usuarioSeleccionado,
            feedback,
            submitForm,
            };
        },
        };
</script>

<style scoped>
label {
  color: #333;
}
</style>
