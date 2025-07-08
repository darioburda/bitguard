<template>
  <div class="max-w-screen-md mx-auto px-4 sm:px-8 py-10">
    <div v-if="loading" class="flex justify-center py-10">
      <MainLoader />
    </div>

    <template v-else>
      <AlertMessage
        v-if="feedback"
        :message="feedback"
        type="success"
        auto-dismiss
        @dismiss="feedback = ''"
      />

      <h1 class="text-2xl font-bold mb-6">Editar Ticket</h1>

      <form @submit.prevent="submitForm" class="space-y-6">
        <div>
          <label class="font-medium">Tipo</label>
          <input v-model="ticket.tipo" type="text" class="w-full border rounded p-2 mt-1" />
        </div>

        <div>
          <label class="font-medium">Descripción</label>
          <textarea v-model="ticket.descripcion" class="w-full border rounded p-2 mt-1"></textarea>
        </div>

        <div>
          <label class="font-medium">Estado</label>
          <select v-model="ticket.estado" class="w-full border rounded p-2 mt-1">
            <option value="abierto">Abierto</option>
            <option value="en_proceso">En Proceso</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>

        <div>
          <label class="font-medium">Fue visita?</label>
          <input type="checkbox" v-model="ticket.fue_visita" class="ml-2" />
        </div>

        <div>
          <label class="font-medium">Técnico asignado</label>
          <select v-model="ticket.tecnico_id" class="w-full border rounded p-2 mt-1">
            <option value="">-- Sin asignar --</option>
            <option v-for="t in tecnicos" :key="t.id" :value="t.id">
              {{ t.display_name }}
            </option>
          </select>
        </div>

        <MainButton type="submit">Actualizar Ticket</MainButton>
      </form>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTicketById, actualizarTicket } from '@/services/tickets';
import { getAllUserProfiles } from '@/services/user-profiles';
import MainLoader from '@/components/MainLoader.vue';
import MainButton from '@/components/MainButton.vue';
import AlertMessage from '@/components/AlertMessage.vue';

export default {
  name: 'EditarTicket',
  components: { MainLoader, MainButton, AlertMessage },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const ticket = ref(null);
    const loading = ref(true);
    const feedback = ref('');
    const tecnicos = ref([]);

    const cargarTicket = async () => {
      try {
        ticket.value = await getTicketById(route.params.id);
      } catch (error) {
        console.error('Error al cargar ticket:', error);
        feedback.value = '❌ Error al cargar el ticket';
      }
    };

    const cargarTecnicos = async () => {
      const allUsers = await getAllUserProfiles();
      tecnicos.value = allUsers.filter(u => u.is_admin);
    };

    const submitForm = async () => {
      try {
        await actualizarTicket(route.params.id, ticket.value);
        feedback.value = '✅ Ticket actualizado correctamente';
        setTimeout(() => router.push('/tickets'), 1000);
      } catch (error) {
        console.error('Error al actualizar ticket:', error);
        feedback.value = '❌ No se pudo actualizar el ticket';
      }
    };

    onMounted(async () => {
      await Promise.all([cargarTicket(), cargarTecnicos()]);
      loading.value = false;
    });

    return {
      ticket,
      tecnicos,
      loading,
      feedback,
      submitForm,
    };
  }
};
</script>