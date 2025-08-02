<template>
  <div
    class="relative overflow-hidden bg-white border border-[#01C38E] shadow-sm rounded-2xl pt-6 px-6 flex flex-col w-full min-w-[300px] transition-all duration-300 ease-in-out"
  >
    <!-- Badge del plan -->
    <BadgePlan :plan="empresa.plan_nombre || 'Sin plan'" class="top-2 left-2" />

    <!-- Datos básicos -->
    <div
      class="flex flex-col gap-1 mt-4 transition-all duration-300"
      :class="mostrarGraficos ? 'mb-4' : 'mb-10'"
    >
      <h2 class="text-lg font-semibold">{{ empresa.nombre }}</h2>
      <p class="text-sm text-gray-500">{{ empresa.email_contacto || 'Sin email' }}</p>
      <p class="text-sm"><strong>CUIT:</strong> {{ empresa.cuit || '-' }}</p>
      <p class="text-sm"><strong>Teléfono:</strong> {{ empresa.telefono || '-' }}</p>
      <p class="text-sm"><strong>Dirección:</strong> {{ empresa.direccion || '-' }}</p>
    </div>

    <!-- Parte inferior -->
    <div class="relative grow mt-auto">
      <TransitionExpand :show="mostrarGraficos">
        <div class="-mx-6 px-6 pt-4 pb-[38px] bg-[#e7fdef] border-t border-[#01C38E] rounded-b-2xl space-y-1">
          <h2 class="text-sm font-semibold text-gray-700 mb-4 text-center">Consumo del Plan</h2>

          <div class="flex flex-col sm:flex-row justify-center items-center gap-y-10 sm:gap-x-0 pb-1">
            <!-- Soporte -->
            <div class="flex flex-col items-center justify-center text-center gap-y-2">
              <h2 class="text-xs text-gray-500 mb-1">Soporte</h2>
              <div
                :class="[!fadeTerminado ? 'opacity-0 pointer-events-none' : 'opacity-100', 'transition-opacity duration-300']"
                @transitionend="activarGrafico('soporte')"
              >
                <component
                  :is="graficosMontados.soporte ? SoporteChart : 'div'"
                  class="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] lg:w-[160px] lg:h-[160px]"
                  v-bind="graficosMontados.soporte ? {
                    usados: empresa.minutos_consumidos ?? 0,
                    restantes: empresa.minutos_restantes ?? 0,
                    excedidos: empresa.minutos_excedidos ?? 0
                  } : {}"
                />
              </div>
            </div>

            <!-- Visitas -->
            <div class="flex flex-col items-center justify-center text-center gap-y-2">
              <h2 class="text-xs text-gray-500 mb-1">Visitas</h2>
              <div
                :class="[!fadeTerminado ? 'opacity-0 pointer-events-none' : 'opacity-100', 'transition-opacity duration-300']"
                @transitionend="activarGrafico('visitas')"
              >
                <component
                  :is="graficosMontados.visitas ? VisitasChart : 'div'"
                  class="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] lg:w-[160px] lg:h-[160px]"
                  v-bind="graficosMontados.visitas ? {
                    visitasConsumidas: empresa.visitas_consumidas ?? 0,
                    visitasTotales: empresa.visitas_incluidas ?? 0
                  } : {}"
                />
              </div>
            </div>
          </div>
        </div>
      </TransitionExpand>

      <!-- Checkbox -->
      <div class="absolute bottom-3 -left-2">
        <CheckboxSeleccion
          :checked="seleccionados.has(empresa.id)"
          @update:checked="$emit('toggle-seleccion', empresa.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import BadgePlan from '@/components/BadgePlan.vue'
import SoporteChart from '@/components/SoporteChart.vue'
import VisitasChart from '@/components/VisitasChart.vue'
import TransitionExpand from '@/components/TransitionExpand.vue'
import CheckboxSeleccion from '@/components/CheckboxSeleccion.vue'

const props = defineProps({
  empresa: Object,
  seleccionados: Object,
  mostrarGraficos: Boolean
})

defineEmits(['toggle-seleccion'])

const fadeTerminado = ref(false)
const graficosMontados = ref({ soporte: false, visitas: false })

watch(() => props.mostrarGraficos, (nuevo) => {
  if (nuevo) {
    fadeTerminado.value = false
    graficosMontados.value.soporte = false
    graficosMontados.value.visitas = false
    setTimeout(() => {
      fadeTerminado.value = true
    }, 0)
  } else {
    fadeTerminado.value = false
  }
})

const activarGrafico = (tipo) => {
  if (!graficosMontados.value[tipo]) {
    graficosMontados.value[tipo] = true
  }
}
</script>
