<template>
  <div class="relative bg-white shadow-md rounded-2xl p-10 overflow-hidden w-full flex flex-col gap-10 border border-[#01C38E]">
    <!-- Badges -->
    <BadgePlan
      v-if="empresa?.plan?.nombre"
      :plan="empresa.plan.nombre"
      class="absolute top-2 left-2"
    />
    <BadgeEmpresa
      v-if="empresa?.nombre"
      :value="empresa.nombre"
      class="absolute top-3 right-3"
    />

    <!-- Datos del usuario -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 w-full">
      <div class="flex items-center gap-4">
        <div class="relative w-28 h-28 shrink-0">
          <img
            v-if="user.photo"
            :src="user.photo"
            alt="Foto de perfil"
            class="w-full h-full object-cover rounded-full border-2 border-[#01C38E] shadow-md"
          />
          <div v-else class="w-full h-full bg-gray-300 rounded-full border-4 border-white shadow-md"></div>
          <RouterLink
            to="/mi-perfil/editar/imagen"
            class="absolute top-1 right-1 bg-black/60 p-1 rounded-full hover:bg-black/80 transition"
            title="Editar imagen"
          >
            <Camera class="w-4 h-4 text-white" />
          </RouterLink>
        </div>

        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ user.display_name || 'Mi perfil' }}</h1>
          <p class="text-sm text-gray-500">{{ user.email }}</p>
          <p class="text-sm pt-1 text-[#474747] font-semibold flex items-center gap-1">
            <UsersIcon class="w-4 h-4" />
            {{ user.sector || 'Sin sector' }}
          </p>
        </div>
      </div>

      <div class="flex flex-col justify-center space-y-1 text-sm text-gray-700 border-l pl-6 border-gray-300">
        <div class="flex gap-2">
          <strong>Rustdesk:</strong> <span>{{ user.rustdesk || '-' }}</span>
        </div>
        <div class="flex gap-2">
          <strong>Equipo:</strong> <span>{{ user.equipo || '-' }}</span>
        </div>
        <div class="flex gap-2">
          <strong>Interno:</strong> <span>{{ user.interno_telefono || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Botón toggle -->
    <button
      @click="mostrarConsumo = !mostrarConsumo"
      class="flex items-center gap-1 text-sm self-end text-[#01C38E] hover:underline focus:outline-none transition"
    >
      <EyeIcon v-if="!mostrarConsumo" class="w-4 h-4" />
      <EyeOffIcon v-else class="w-4 h-4" />
      <span>{{ mostrarConsumo ? 'Ocultar consumo del plan' : 'Ver consumo del plan' }}</span>
    </button>

    <!-- Caja integrada para métricas -->
    <div v-if="empresa && mostrarConsumo" class="bg-[#e7fdef] -mx-10 -mb-10 px-10 pt-6 pb-8 rounded-b-2xl">
      <h2 class="text-lg font-semibold text-gray-700 mb-6 text-center">Consumo del Plan</h2>

      <div class="flex flex-col sm:flex-row justify-center items-center my-2 gap-y-10 sm:gap-x-6">
        <!-- Soporte -->
        <div class="flex flex-col items-center justify-center text-center gap-y-2">
          <h2 class="text-xs text-gray-500 mb-1">Soporte</h2>
          <SoporteChart
            class="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] lg:w-[160px] lg:h-[160px]"
            :usados="empresa.minutos_consumidos ?? 0"
            :restantes="(empresa.plan?.minutos_incluidos ?? 0) - (empresa.minutos_consumidos ?? 0)"
          />
        </div>

        <!-- Visitas -->
        <div class="flex flex-col items-center justify-center text-center gap-y-2">
          <h2 class="text-xs text-gray-500 mb-1">Visitas</h2>
          <VisitasChart
            class="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] lg:w-[160px] lg:h-[160px]"
            :visitasConsumidas="empresa.visitas_consumidas ?? 0"
            :visitasTotales="empresa.plan?.visitas_incluidas ?? 0"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Camera, UsersIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import BadgePlan from './BadgePlan.vue'
import BadgeEmpresa from './BadgeEmpresa.vue'
import SoporteChart from './SoporteChart.vue'
import VisitasChart from './VisitasChart.vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  user: Object,
  empresa: Object
})

const mostrarConsumo = ref(false)
</script>
