<template>
  <div
    class="relative overflow-hidden bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 flex flex-col justify-between w-full max-w-[320px] sm:max-w-[440px] md:max-w-[500px] lg:max-w-[540px] xl:max-w-[380px] mx-auto"
  >
    <input
      type="checkbox"
      class="absolute bottom-3 left-3 w-5 h-5 accent-[#01C38E]"
      :checked="seleccionados.has(empresa.id)"
      @change="$emit('toggle-seleccion', empresa.id)"
    />

    <BadgePlan :value="empresa.plan_nombre || 'Sin plan'" class="top-2 left-2" />

    <div class="pt-5 flex justify-between items-start mb-2 gap-4">
      <div>
        <h2 class="text-lg font-semibold">{{ empresa.nombre }}</h2>
        <p class="text-sm text-gray-500 pb-1">{{ empresa.email_contacto || 'Sin email' }}</p>
        <p class="text-sm"><strong>CUIT:</strong> {{ empresa.cuit || '-' }}</p>
        <p class="text-sm"><strong>Teléfono:</strong> {{ empresa.telefono || '-' }}</p>
        <p class="text-sm"><strong>Dirección:</strong> {{ empresa.direccion || '-' }}</p>
      </div>
    </div>

    <!-- Gráficos con fondo verde -->
    <div
      :key="mostrarGraficos"
      :class="[
        'transition-all duration-500',
        mostrarGraficos ? 'bg-[#e7fdef] -mx-6 px-6 pt-5 pb-6 mb-[-1.5rem] rounded-b-2xl' : 'opacity-0 pointer-events-none h-0 overflow-hidden'
      ]"
    >
      <h2 class="text-sm font-semibold text-gray-700 mb-4 text-center">Consumo del Plan</h2>

      <div
        class="flex flex-col sm:flex-row justify-center items-center gap-y-10 sm:gap-x-6 sm:gap-y-4 lg:gap-x-0 lg:gap-y-0 xl:gap-x-0"
      >
        <div class="flex flex-col items-center justify-center text-center gap-y-2">
          <h2 class="text-xs text-gray-500 mb-1">Soporte</h2>
          <SoporteChart
            class="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] lg:w-[160px] lg:h-[160px]"
            :usados="empresa.minutos_consumidos ?? 0"
            :restantes="empresa.minutos_restantes ?? 0"
            :excedidos="empresa.minutos_excedidos ?? 0"
          />
        </div>

        <div class="flex flex-col items-center justify-center text-center gap-y-2">
          <h2 class="text-xs text-gray-500 mb-1">Visitas</h2>
          <VisitasChart
            class="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] lg:w-[160px] lg:h-[160px]"
            :visitasConsumidas="empresa.visitas_consumidas ?? 0"
            :visitasTotales="empresa.visitas_incluidas ?? 0"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  empresa: Object,
  seleccionados: Object,
  mostrarGraficos: Boolean
})

defineEmits(['toggle-seleccion'])

import BadgePlan from '@/components/BadgePlan.vue'
import SoporteChart from '@/components/SoporteChart.vue'
import VisitasChart from '@/components/VisitasChart.vue'
</script>
