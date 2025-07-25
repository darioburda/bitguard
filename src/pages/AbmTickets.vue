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
      <div class="py-4 mb-6 flex justify-between items-center flex-wrap gap-4">
        <h1 class="text-2xl font-bold">Gestión de Tickets</h1>
        <div class="flex items-center gap-4">
          <MainButton to="/tickets/crear">Crear Ticket</MainButton>

          <MainButton
            v-if="ticketsSeleccionados.size === 1"
            class="bg-blue-500 hover:bg-blue-600"
            @click="irAEditar"
          >
            Editar Ticket
          </MainButton>

          <MainButton
            v-if="ticketsSeleccionados.size > 0"
            class="bg-red-500 hover:bg-red-600"
            @click="eliminarTicketsSeleccionados"
          >
            Borrar Tickets
          </MainButton>
        </div>
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
          <!-- Badge Estado -->
          <BadgeEstado :value="ticket.estado" class="top-2 left-2" />

        <!-- Badge tipo con estética NEW si está Abierto, clickeable o no según estado -->
        <div class="absolute top-3 right-3">
          <template v-if="ticket.estado === 'Abierto'">
            <button
              @click="abrirModalTomar(ticket)"
              title="Tomar Ticket"
              class="focus:outline-none"
            >
              <div class="flex items-center gap-1 cursor-pointer hover:opacity-80">
                <span class="text-[10px] font-bold text-[#474747] px-0 py-[1px] rounded-sm tracking-wide">
                  NEW
                </span>
                <BadgeTicket
                  :tipo="ticket.tipo"
                  :id="ticket.id"
                  variant="activo"
                />
              </div>
            </button>
          </template>

          <template v-else>
            <RouterLink
              :to="{ name: 'editar-ticket', params: { id: ticket.id } }"
              title="Ver y editar ticket"
            >
              <BadgeTicket :tipo="ticket.tipo" :id="ticket.id" class="hover:opacity-80 cursor-pointer" />
            </RouterLink>
          </template>
        </div>



          <!-- Checkbox en esquina inferior izquierda -->
          <input
            type="checkbox"
            class="absolute bottom-3 left-3 w-5 h-5 accent-[#01C38E]"
            :checked="ticketsSeleccionados.has(ticket.id)"
            @change="toggleSeleccion(ticket.id)"
          />

          <!-- Título y descripción -->
          <div class="mb-2 mt-6">
            <h2 class="text-lg font-bold text-[#01C38E] truncate">{{ ticket.titulo }}</h2>
            <p class="text-sm text-gray-800 mt-1 line-clamp-3">{{ ticket.descripcion }}</p>
          </div>


          <!-- Info -->
          <div class="mb-5 text-sm text-gray-600 mt-2 space-y-1">
            <p><strong>Empresa:</strong> {{ ticket.empresa_nombre }}</p>
            <p><strong>Solicitante:</strong> {{ ticket.usuario_nombre }}</p>
            <p><strong>Técnico:</strong> {{ ticket.tecnico_nombre }}</p>
            <p><strong>Fecha:</strong> {{ formatDate(ticket.created_at) }}</p>
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

export default {
  name: 'AbmTickets',
  components: {
    MainLoader,
    AlertMessage,
    MainButton,
    BadgeTicket,
    BadgeEstado,
    ModalConfirmar
  },
  setup() {
    const tickets = ref([]);
    const loading = ref(true);
    const feedback = ref('');
    const modalVisible = ref(false);
    const ticketSeleccionado = ref(null);
    const ticketsSeleccionados = ref(new Set());
    const router = useRouter();

    const cargarTickets = async () => {
      try {
        tickets.value = await getAllTickets();
      } catch (error) {
        console.error('Error al cargar tickets:', error);
      } finally {
        loading.value = false;
        ticketsSeleccionados.value.clear();
      }
    };

    const toggleSeleccion = (id) => {
      if (ticketsSeleccionados.value.has(id)) {
        ticketsSeleccionados.value.delete(id);
      } else {
        ticketsSeleccionados.value.add(id);
      }
    };

    const eliminarTicketsSeleccionados = async () => {
      if (confirm(`¿Eliminar ${ticketsSeleccionados.value.size} ticket(s)?`)) {
        try {
          for (const id of ticketsSeleccionados.value) {
            await eliminarTicketService(id);
          }
          feedback.value = '✅ Tickets eliminados correctamente';
          await cargarTickets();
        } catch (error) {
          console.error('Error al eliminar tickets:', error);
          feedback.value = '❌ No se pudieron eliminar los tickets';
        }
      }
    };

    const irAEditar = () => {
      const id = [...ticketsSeleccionados.value][0];
      router.push({ name: 'editar-ticket', params: { id } });
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
      formatDate,
      modalVisible,
      ticketSeleccionado,
      abrirModalTomar,
      tomarTicket,
      ticketsSeleccionados,
      toggleSeleccion,
      eliminarTicketsSeleccionados,
      irAEditar,
    };
  }
};
</script>
