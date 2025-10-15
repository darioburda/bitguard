<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
    >
      <div
        :class="[
          'bg-white rounded-lg shadow-lg w-full max-w-[500px] p-6 animate-fadeIn border',
          esEliminar ? 'border-red-500' : 'border-[#01C38E]'
        ]"
      >
        <h2
          :class="[
            'text-lg font-bold mb-4',
            esEliminar ? 'text-red-600' : 'text-[#01C38E]'
          ]"
        >
          {{ esEliminar ? 'Confirmar Eliminación' : 'Confirmar Acción' }}
        </h2>

        <p class="mb-6 break-words">
          <template v-if="esEliminar">
            <template v-if="cantidad === 1">
              ¿Estás seguro de que querés eliminar {{ nombreEntidadSingular }} <strong>{{ nombre }}</strong>?
            </template>
            <template v-else>
              ¿Estás seguro de que querés eliminar {{ cantidad }} {{ nombreEntidadPlural }}?
            </template>
          </template>

          <template v-else>
            ¿Estás seguro de que querés {{ accion || 'confirmar la acción' }}
            <strong v-if="nombre">#{{ nombre?.slice(-8) }}</strong>?
          </template>
        </p>

        <div class="flex justify-end gap-4">
          <button
            @click="$emit('confirmar')"
            :class="[
              'px-4 py-2 text-white rounded hover:opacity-90',
              esEliminar ? 'bg-red-600 hover:bg-red-700' : 'bg-[#01C38E] hover:bg-[#00b383]'
            ]"
          >
            {{ esEliminar ? 'Eliminar' : 'Confirmar' }}
          </button>
          <button
            @click="$emit('cancelar')"
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,               // Visibilidad del modal
  eliminar: Boolean,           // Si es de eliminación o no
  cantidad: Number,            // Cantidad seleccionada (para eliminar)
  nombre: String,              // Nombre o ID del recurso
  entidad: {                   // Tipo de entidad (ticket, usuario, etc.)
    type: String,
    default: 'usuario'
  },
  accion: String               // Acción que se desea confirmar (tomar, cerrar, etc.)
})

defineEmits(['confirmar', 'cancelar'])

const esEliminar = computed(() => props.eliminar)

const nombreEntidadSingular = computed(() => {
  switch (props.entidad) {
    case 'ticket': return 'el ticket';
    case 'empresa': return 'la empresa';
    default: return 'al usuario';
  }
})

const nombreEntidadPlural = computed(() => {
  switch (props.entidad) {
    case 'ticket': return 'ticket(s)';
    case 'empresa': return 'empresa(s)';
    default: return 'usuario(s)';
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
