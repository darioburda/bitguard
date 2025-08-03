<template>
  <div class="mt-6 min-h-[600px] relative">
    <!-- Grilla con animación -->
    <transition-group
      name="fade-move"
      tag="div"
      :class="[gridClass, { 'opacity-50': vacio }]"
      appear
    >
      <component
        v-for="(child, index) in $slots.default?.()"
        :is="child"
        :key="child.key || index"
      />
    </transition-group>

    <!-- Mensaje centrado con delay -->
    <div
      v-if="vacio && mostrarMensaje && mostrarMensajeVacio"
      class="absolute top-10 left-1/2 transform -translate-x-1/2 z-10 text-center"
    >
      <div class="text-gray-600 text-lg">
        {{ mensajeFinal }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  columnas: {
    type: Number,
    default: 4
  },
  vacio: {
    type: Boolean,
    default: false
  },
  mensajeVacio: {
    type: String,
    default: ''
  },
  mostrarMensaje: {
    type: Boolean,
    default: true
  },
  entidad: {
    type: String,
    default: ''
  }
})

const gridClass = computed(() => {
  const colMap = {
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8',
    3: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
  }
  return colMap[props.columnas] || colMap[4]
})

const mensajeFinal = computed(() => {
  if (props.mensajeVacio) return props.mensajeVacio
  if (props.entidad) {
    const entidadPlural = props.entidad.endsWith('s') ? props.entidad : props.entidad + 's'
    return `No se encontraron ${entidadPlural} que coincidan con la búsqueda.`
  }
  return 'No se encontraron elementos.'
})

// Mostrar mensaje de vacío con delay
const mostrarMensajeVacio = ref(false)

watch(
  () => props.vacio,
  (nuevoValor) => {
    if (nuevoValor) {
      mostrarMensajeVacio.value = false
      setTimeout(() => {
        mostrarMensajeVacio.value = true
      }, 400)
    } else {
      mostrarMensajeVacio.value = false
    }
  }
)
</script>

<style scoped>
.fade-move-enter-active,
.fade-move-leave-active {
  transition: all 0.3s ease;
}
.fade-move-enter-from,
.fade-move-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
