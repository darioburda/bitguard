<template>
  <div class="relative w-32 h-44 flex flex-col items-center justify-center">
    <div class="relative w-32 h-32">
      <Doughnut :data="chartData" :options="chartOptions" class="w-32 h-32 relative z-0" />
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center">
        <div :class="['text-xl font-bold', colorPorcentaje]">{{ porcentajeRestante }}%</div>
        <div class="text-[12px] text-gray-600">{{ tiempoMostrado }}</div>
      </div>
    </div>

    <!-- Leyenda visible abajo -->
    <div class="mt-2 flex gap-3 text-xs z-20">
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-sm bg-[#ff7675]"></span>
        <span>Usado</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-sm bg-[#55efc4]"></span>
        <span>Restante</span>
      </div>
      <div v-if="props.excedidos > 0" class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-sm bg-[#8e44ad]"></span>
        <span>Excedido</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  usados: {
    type: Number,
    required: true
  },
  restantes: {
    type: Number,
    required: true
  },
  excedidos: {
    type: Number,
    default: 0
  }
})

const totalPlan = props.usados + props.restantes
const total = totalPlan + props.excedidos

const porcentajeRestante = total > 0 ? Math.round((props.restantes / total) * 100) : 0
const colorPorcentaje = props.excedidos > 0 ? 'text-violet-600' : 'text-[#01C38E]'

const chartData = {
  labels: ['Usado', 'Restante', 'Excedido'],
  datasets: [{
    data: [props.usados, props.restantes, props.excedidos],
    backgroundColor: [
      '#ff7675',
      '#55efc4',
      props.excedidos > 0 ? '#8e44ad' : 'transparent'
    ],
    borderWidth: 1
  }]
}

const chartOptions = {
  cutout: '80%',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      position: 'nearest',
      callbacks: {
        label(context) {
          const label = context.label || '';
          const minutos = context.parsed || 0;
          const horas = Math.floor(minutos / 60);
          const minutosRestantes = minutos % 60;
          return `${label}: ${horas}h ${minutosRestantes}m`;
        }
      }
    }
  }
}

function formatearTiempo(min) {
  const horas = Math.floor(min / 60)
  const minutos = min % 60
  return `${horas}h ${minutos}m`
}

const tiempoMostrado = props.restantes > 0
  ? formatearTiempo(props.restantes)
  : formatearTiempo(props.excedidos)
</script>

<style>
.chartjs-tooltip {
  z-index: 10000 !important;
  background: rgba(255, 255, 255, 1) !important;
  color: black !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
  opacity: 1 !important;
}

canvas {
  position: relative;
  z-index: 0;
}
</style>
