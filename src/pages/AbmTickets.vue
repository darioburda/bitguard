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
          <BadgeEstado :value="ticket.estado" class="top-2 left-2" />
          <div class="absolute top-3 right-3">
            <BadgeTicket :tipo="ticket.tipo" :id="ticket.id" />
          </div>

          <!-- Descripción -->
          <div class="mb-2 mt-6">
            <h2 class="text-base font-semibold text-gray-800">{{ ticket.descripcion }}</h2>
          </div>

          <!-- Info -->
          <div class="text-sm text-gray-600 mt-2 space-y-1">
            <p><strong>Empresa:</strong> {{ ticket.empresa_nombre }}</p>
            <p><strong>Solicitante:</strong> {{ ticket.usuario_nombre }}</p>
            <p><strong>Técnico:</strong> {{ ticket.tecnico_nombre }}</p>
            <p><strong>Fecha:</strong> {{ formatDate(ticket.fecha) }}</p>
          </div>

          <!-- Acciones -->
          <div class="mt-4 flex flex-wrap gap-4">
            <MainButton
              v-if="ticket.estado === 'Abierto'"
              @click="abrirModalTomar(ticket)"
              class="flex items-center gap-2"
            >
              <Hand class="w-5 h-5" /> Tomar
            </MainButton>
            <RouterLink
              :to="{ name: 'editar-ticket', params: { id: ticket.id } }"
              class="text-blue-600 hover:underline text-sm"
            >
              Editar
            </RouterLink>
            <button
              @click="confirmarEliminar(ticket.id)"
              class="text-red-600 hover:underline text-sm"
            >
              Borrar
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal Confirmar Tomar Ticket -->
    <ModalConfirmar
      :visible="modalVisible"
      :nombre="ticketSeleccionado?.descripcion || ''"
      @cancelar="modalVisible = false"
      @confirmar="tomarTicket"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllTickets, eliminarTicket as eliminarTicketService, actualizarTicket } from '@/services/tickets';
import { supabase } from '@/services/supabase';
import MainLoader from '@/components/MainLoader.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import MainButton from '@/components/MainButton.vue';
import BadgeTicket from '@/components/BadgeTicket.vue';
import BadgeEstado from '@/components/BadgeEstado.vue';
import ModalConfirmar from '@/components/ModalConfirmar.vue';
import { Monitor, Hand  } from 'lucide-vue-next';

export default {
  name: 'AbmTickets',
  components: {
    MainLoader,
    AlertMessage,
    MainButton,
    BadgeTicket,
    BadgeEstado,
    ModalConfirmar,
    Monitor,
    Hand 
  },
  setup() {
    const tickets = ref([]);
    const loading = ref(true);
    const feedback = ref('');
    const router = useRouter();
    const modalVisible = ref(false);
    const ticketSeleccionado = ref(null);

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

    const confirmarEliminar = (id) => {
      eliminarTicket(id);
    };

    const abrirModalTomar = (ticket) => {
      ticketSeleccionado.value = ticket;
      modalVisible.value = true;
    };

    const tomarTicket = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user || !user.user?.id) throw new Error('Usuario no autenticado');

        await actualizarTicket(ticketSeleccionado.value.id, {
          tecnico_id: user.user.id,
          estado: 'Activo'
        });

        feedback.value = '✅ Ticket tomado con éxito';
        modalVisible.value = false;
        await cargarTickets();
      } catch (error) {
        console.error('Error al tomar ticket:', error);
        feedback.value = '❌ No se pudo tomar el ticket';
      }
    };

    const formatDate = (fecha) => {
      const date = new Date(fecha);
      return date.toLocaleString();
    };

    onMounted(cargarTickets);

    return {
      tickets,
      loading,
      feedback,
      eliminarTicket,
      formatDate,
      modalVisible,
      ticketSeleccionado,
      abrirModalTomar,
      tomarTicket,
    };
  }
};
</script>
