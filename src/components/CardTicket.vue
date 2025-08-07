<template>
  <div class="relative overflow-hidden bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 flex flex-col justify-between w-full min-w-[300px]">
    <!-- Badge Estado -->
    <BadgeEstado :value="ticket.estado" class="top-2 left-2" />

    <!-- Botón tomar o ver -->
    <div class="absolute top-3 right-3">
      <template v-if="ticket.estado === 'Abierto'">
        <button
          @click="$emit('tomar', ticket)"
          title="Tomar Ticket"
          class="focus:outline-none hover:opacity-80 flex items-center gap-1"
        >
          <i class="fas fa-hand-paper text-[#01C38E]"></i>
          <span class="text-[10px] font-bold text-[#474747]">NEW</span>
          <BadgeTicket :tipo="ticket.tipo" :id="ticket.id" variant="activo" />
        </button>
      </template>
      <template v-else>
        <RouterLink
          :to="{ name: 'editar-ticket', params: { id: ticket.id } }"
          title="Ver y editar ticket"
        >
          <BadgeTicket
            :tipo="ticket.tipo"
            :id="ticket.id"
            class="hover:opacity-80 cursor-pointer"
          />
        </RouterLink>
      </template>
    </div>

    <!-- Checkbox -->
    <CheckboxSeleccion
      class="absolute bottom-3 left-3"
      :checked="seleccionados.has(ticket.id)"
      @update:checked="$emit('toggle-seleccion', ticket.id)"
    />

    <!-- Contenido -->
    <div class="mb-2 mt-6">
      <h2 class="text-lg font-bold text-[#01C38E] truncate">{{ ticket.titulo }}</h2>
      <p class="text-sm text-gray-800 mt-1 line-clamp-3">{{ ticket.descripcion }}</p>
    </div>

    <!-- Detalles -->
    <div class="mb-5 text-sm text-gray-600 mt-2 space-y-1">
      <p><strong>Empresa:</strong> {{ ticket.empresa_nombre }}</p>
      <p><strong>Solicitante:</strong> {{ ticket.usuario_nombre }}</p>
      <p><strong>Técnico:</strong> {{ ticket.tecnico_nombre }}</p>
      <p><strong>Fecha:</strong> {{ formatDate(ticket.created_at) }}</p>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import BadgeEstado from '@/components/BadgeEstado.vue'
import BadgeTicket from '@/components/BadgeTicket.vue'
import CheckboxSeleccion from '@/components/CheckboxSeleccion.vue'

defineProps({
  ticket: Object,
  seleccionados: Object
})

defineEmits(['toggle-seleccion', 'tomar'])

const formatDate = (fecha) => {
  const date = new Date(fecha)
  return date.toLocaleString()
}
</script>
