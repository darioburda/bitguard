<template>
  <div class="mt-8 flex justify-between items-center text-sm flex-wrap gap-4">
    <button
      @click="$emit('primero')"
      :disabled="paginaActual === 1"
      class="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
    >
      « Primero
    </button>

    <button
      @click="$emit('anterior')"
      :disabled="paginaActual === 1"
      class="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
    >
      ‹ Anterior
    </button>

    <span class="text-sm text-gray-700">
      Página {{ paginaActual }} de {{ totalPaginas }}
    </span>

    <button
      @click="$emit('siguiente')"
      :disabled="paginaActual === totalPaginas"
      class="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
    >
      Siguiente ›
    </button>

    <button
      @click="$emit('ultimo')"
      :disabled="paginaActual === totalPaginas"
      class="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
    >
      Último »
    </button>
  </div>
</template>

<script setup>
defineProps({
  paginaActual: Number,
  totalPaginas: Number
})

defineEmits(['primero', 'anterior', 'siguiente', 'ultimo'])
</script>
