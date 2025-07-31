<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <!-- Botones + contador -->
    <div class="w-[90%] mx-auto flex flex-col items-center gap-3 sm:w-auto sm:mx-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
      <transition-group name="fade-button" tag="div" class="flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto">
        <MainButton
          key="agregar"
          @click="$emit('agregar')"
          variant="agregar"
        >
          Agregar {{ nombreEntidad }}
        </MainButton>

        <MainButton
          v-if="seleccionados.size > 0"
          key="borrar"
          variant="borrar"
          @click="$emit('borrar')"
        >
          Borrar {{ nombreEntidad }}{{ seleccionados.size > 1 ? 's' : '' }}
        </MainButton>

        <MainButton
          v-if="seleccionados.size === 1"
          key="editar"
          variant="editar"
          @click="$emit('editar')"
        >
          Editar {{ nombreEntidad }}
        </MainButton>
      </transition-group>

      <!-- Contador alineado a la par de botones -->
      <transition name="fade">
        <div
          v-if="seleccionados.size > 0"
          key="contador"
          class="flex items-center gap-2 text-sm text-gray-600"
        >
          <span>{{ seleccionados.size }} seleccionado(s)</span>
          <button
            @click="$emit('deseleccionarTodos')"
            class="text-gray-500 underline hover:text-gray-700"
          >
            Deseleccionar todos
          </button>
        </div>
      </transition>
    </div>

    <!-- Botón toggle alineado a derecha -->
  <div class="sm:self-start">
    <button
      v-if="mostrarToggle !== null"
      @click="$emit('toggle')"
      class="flex items-center gap-1 text-sm text-[#01C38E] hover:underline focus:outline-none transition min-w-fit"
    >
      <EyeIcon v-if="!mostrarToggle" class="w-4 h-4" />
      <EyeOffIcon v-else class="w-4 h-4" />
      <span class="whitespace-nowrap">
        {{ mostrarToggle ? `Ocultar ${labelToggle}` : `Ver ${labelToggle}` }}
      </span>
    </button>
  </div>

  </div>
</template>



<script setup>
import MainButton from '@/components/MainButton.vue'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

defineProps({
  seleccionados: Object,
  nombreEntidad: {
    type: String,
    default: 'Elemento'
  },
  mostrarToggle: {
    type: Boolean,
    default: null
  },
  labelToggle: {
    type: String,
    default: 'detalles'
  }
})

defineEmits(['agregar', 'editar', 'borrar', 'toggle', 'deseleccionarTodos'])
</script>

<style scoped>
.fade-button-enter-active,
.fade-button-leave-active {
  transition: all 0.3s ease-in-out;
}
.fade-button-enter-from,
.fade-button-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
