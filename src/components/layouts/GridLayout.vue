<template>
  <div class="mt-6 min-h-[600px]">
    <transition-group
      name="fade-move"
      tag="div"
      :class="[gridClass, { 'opacity-50': vacio }]"
        appear
    >
      <slot />
    </transition-group>

    <div
      v-if="mostrarMensaje && vacio"
      class="text-center text-gray-600 text-lg py-10"
    >
      {{ mensajeVacio }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  columnas: {
    type: Number,
    default: 4 // Cambiar a 3 en empresas si se desea
  },
  vacio: {
    type: Boolean,
    default: false
  },
  mensajeVacio: {
    type: String,
    default: 'No se encontraron elementos.'
  },
  mostrarMensaje: {
    type: Boolean,
    default: true
  }
})

const gridClass = computed(() => {
  const colMap = {
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8',
    3: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
  }
  return colMap[props.columnas] || colMap[4]
})
</script>
