<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <MainLoader />
    </div>

    <div v-else>
      <h1 class="text-2xl font-bold mb-6">Detalle del Ticket</h1>

      <div class="bg-white rounded-2xl shadow border border-[#01C38E] p-6 space-y-6">

        <!-- Estado y Tipo -->
        <div class="flex justify-between items-center">
          <BadgeEstado :value="ticket.estado" />
          <BadgeTicket :tipo="ticket.tipo" :id="ticket.id" />
        </div>

        <!-- Descripción -->
        <div>
          <h2 class="font-semibold text-lg mb-1">Descripción</h2>
          <p class="text-gray-700">{{ ticket.descripcion }}</p>
        </div>

        <!-- Información técnica -->
        <div class="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <p><strong>Empresa:</strong> {{ ticket.empresa_nombre }}</p>
          <p><strong>Solicitante:</strong> {{ ticket.usuario_nombre }}</p>
          <p><strong>Técnico:</strong> {{ ticket.tecnico_nombre }}</p>
          <p><strong>Fecha de creación:</strong> {{ formatDate(ticket.fecha) }}</p>
          <p><strong>¿Fue visita?</strong> {{ ticket.fue_visita ? 'Sí' : 'No' }}</p>
          <p><strong>Minutos usados:</strong> {{ ticket.minutos_usados || 0 }} min</p>
        </div>

        <!-- Botón volver -->
        <div class="pt-6 text-right">
          <RouterLink to="/abm-tickets">
            <button class="text-sm text-white bg-[#01C38E] hover:bg-[#00a678] px-4 py-2 rounded-md shadow">
              ← Volver a Tickets
            </button>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getTicketById } from '@/services/tickets';
import MainLoader from '@/components/MainLoader.vue';
import BadgeTicket from '@/components/BadgeTicket.vue';
import BadgeEstado from '@/components/BadgeEstado.vue';

const route = useRoute();
const ticket = ref(null);
const loading = ref(true);

const formatDate = (fecha) => {
  const date = new Date(fecha);
  return date.toLocaleString();
};

onMounted(async () => {
  try {
    ticket.value = await getTicketById(route.params.id);
  } catch (error) {
    console.error('Error al cargar ticket:', error);
  } finally {
    loading.value = false;
  }
});
</script>
