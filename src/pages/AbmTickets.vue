<template>
  <div class="max-w-screen-xl mx-auto px-4 sm:px-8 pt-4 pb-10">
    <div v-if="loading" class="flex justify-center items-center py-20">
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

      <!-- Encabezado -->
      <div class="py-4 mb-6 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Gestión de Tickets</h1>
        <MainButton to="/tickets/crear">Crear Ticket</MainButton>
      </div>

      <!-- Lista de tickets -->
      <div v-if="tickets.length === 0" class="text-center text-gray-600 text-lg py-10">
        No hay tickets registrados.
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6"
      >
        <div
          v-for="ticket in tickets"
          :key="ticket.id"
          class="relative overflow-hidden bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 flex flex-col justify-between w-full min-w-[300px]"
        >
          <!-- Estado -->
          <div
            class="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full"
            :class="{
              'bg-green-100 text-green-700': ticket.estado === 'cerrado',
              'bg-yellow-100 text-yellow-700': ticket.estado === 'abierto'
            }"
          >
            {{ ticket.estado }}
          </div>

          <!-- Título y descripción -->
          <div class="mb-2">
            <h2 class="text-lg font-semibold mb-1">{{ ticket.tipo }}</h2>
            <p class="text-sm text-gray-700">{{ ticket.descripcion }}</p>
          </div>

          <!-- Info adicional -->
          <div class="text-sm text-gray-600 mt-2 space-y-1">
            <p><strong>Empresa:</strong> {{ ticket.empresa_nombre }}</p>
            <p><strong>Solicitante:</strong> {{ ticket.usuario_nombre }}</p>
            <p><strong>Técnico:</strong> {{ ticket.tecnico_nombre }}</p>
            <p><strong>Fecha:</strong> {{ formatDate(ticket.fecha) }}</p>
          </div>

          <!-- Acciones -->
          <div class="mt-4 flex gap-4">
            <RouterLink
              :to="{ name: 'editar-ticket', params: { id: ticket.id } }"
              class="text-blue-600 hover:underline text-sm"
            >
              Editar
            </RouterLink>
            <button
              @click="eliminarTicket(ticket.id)"
              class="text-red-600 hover:underline text-sm"
            >
              Borrar
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllTickets, eliminarTicket as eliminarTicketService } from '@/services/tickets';
import MainLoader from '@/components/MainLoader.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import MainButton from '@/components/MainButton.vue';

export default {
  name: 'AbmTickets',
  components: {
    MainLoader,
    AlertMessage,
    MainButton,
  },
  setup() {
    const tickets = ref([]);
    const loading = ref(true);
    const feedback = ref('');
    const router = useRouter();

    const cargarTickets = async () => {
      try {
        tickets.value = await getAllTickets();
      } catch (error) {
        console.error('Error al cargar tickets:', error);
      } finally {
        loading.value = false;
      }
    };

    const eliminarTicket = async (id) => {
      if (confirm('¿Estás seguro de eliminar este ticket?')) {
        try {
          await eliminarTicketService(id);
          feedback.value = '✅ Ticket eliminado correctamente';
          await cargarTickets();
        } catch (error) {
          console.error('Error al eliminar ticket:', error);
          feedback.value = '❌ No se pudo eliminar el ticket';
        }
      }
    };

    const formatDate = (fecha) => {
      const date = new Date(fecha);
      return date.toLocaleString();
    };

    onMounted(() => {
      cargarTickets();
    });

    return {
      tickets,
      loading,
      feedback,
      eliminarTicket,
      formatDate,
    };
  },
};
</script>
