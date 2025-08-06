<template>
  <div
    class="relative overflow-hidden bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 flex flex-col justify-between w-full min-w-[300px]"
  >
    <!-- Badge Estado -->
    <BadgeEstado :value="ticket.estado" class="top-2 left-2" />

    <!-- Badge Ticket y NEW -->
    <div class="absolute top-3 right-3 flex items-center gap-1">
      <span
        v-if="ticket.estado === 'Abierto'"
        class="text-[10px] font-bold text-[#474747]"
      >
        NEW
      </span>
      <BadgeTicket
        :tipo="ticket.tipo"
        :id="ticket.id"
        class="hover:opacity-80 cursor-pointer"
        @click.stop="irAEditarTicket"
      />
    </div>

    <!-- Contenido -->
    <div class="mb-2 mt-6">
      <h2 class="text-lg font-bold text-[#01C38E] truncate">
        {{ ticket.titulo || 'Sin título' }}
      </h2>
      <p class="text-sm text-gray-800 mt-1 line-clamp-3">
        {{ ticket.descripcion }}
      </p>
    </div>

    <!-- Detalles -->
    <div class="mb-1 text-sm text-gray-600 mt-2 space-y-1">
      <p v-if="ticket.tecnico">
        <strong>Técnico: </strong>
        <span>
          {{ ticket.tecnico.display_name }}
        </span>
      </p>
      <p><strong>Fecha:</strong> {{ formatDate(ticket.created_at) }}</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BadgeEstado from '@/components/BadgeEstado.vue'
import BadgeTicket from '@/components/BadgeTicket.vue'

const props = defineProps({
  ticket: Object
})

const router = useRouter()

const irAEditarTicket = () => {
  router.push({ name: 'editar-ticket-user', params: { id: props.ticket.id } })
}

const formatDate = (fecha) => {
  const date = new Date(fecha)
  return date.toLocaleString('es-AR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}
</script>
