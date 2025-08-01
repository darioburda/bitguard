<template>
  <div class="mt-8 grid grid-cols-3 items-center text-sm w-full">

    <!-- Izquierda: Primero / Anterior -->
    <div class="flex justify-start gap-2 flex-wrap">
      <button
        @click="$emit('primero')"
        :disabled="paginaActual === 1"
        class="px-3 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
      >
        « Primero
      </button>

      <button
        @click="$emit('anterior')"
        :disabled="paginaActual === 1"
        class="px-3 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
      >
        ‹ Anterior
      </button>
    </div>

    <!-- Centro: Números de página -->
    <div class="flex justify-center gap-2 flex-wrap">
      <template v-for="n in paginasVisibles" :key="n + '-' + paginaActual">
        <span v-if="n === '...'" class="px-2 text-gray-400">…</span>
        <button
          v-else
          @click="$emit('ir-a', n)"
          :class="[
            'px-3 py-2 rounded border transition',
            paginaActual === n
              ? 'bg-[#01C38E] text-white font-semibold border-[#01C38E]'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ n }}
        </button>
      </template>
    </div>

    <!-- Derecha: Siguiente / Último -->
    <div class="flex justify-end gap-2 flex-wrap">
      <button
        @click="$emit('siguiente')"
        :disabled="paginaActual === totalPaginas"
        class="px-3 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
      >
        Siguiente ›
      </button>

      <button
        @click="$emit('ultimo')"
        :disabled="paginaActual === totalPaginas"
        class="px-3 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
      >
        Último »
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  paginaActual: Number,
  totalPaginas: Number
})

defineEmits(['primero', 'anterior', 'siguiente', 'ultimo', 'ir-a'])

const paginasVisibles = computed(() => {
  const total = props.totalPaginas
  const actual = props.paginaActual
  const delta = 1
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= actual - delta && i <= actual + delta)) {
      range.push(i)
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})
</script>
