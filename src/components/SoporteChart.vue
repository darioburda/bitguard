<template>
  <div class="relative flex items-center justify-center w-28 h-28">
    <Doughnut :data="chartData" :options="chartOptions" />
    <div class="absolute text-center leading-tight">
      <div class="text-xl font-bold text-[#01C38E]">
        {{ porcentajeRestante }}%
      </div>
      <div class="text-[12px] text-gray-600">
        {{ tiempoUsado }} / {{ tiempoTotal }}
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
  }
})

const total = props.usados + props.restantes
const porcentajeRestante = total > 0 ? Math.round((props.restantes / total) * 100) : 0

const chartData = {
  labels: ['Usado', 'Restante'],
  datasets: [{
    data: [props.usados, props.restantes],
    backgroundColor: ['#ff7675', '#55efc4'],
    borderWidth: 1
  }]
}

const chartOptions = {
  cutout: '80%',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: false
    }
  }
}

// Funciones utilitarias para convertir minutos a formato `1h 20m`
function formatearTiempo(min) {
  const horas = Math.floor(min / 60)
  const minutos = min % 60
  return `${horas}h ${minutos}m`
}

const tiempoUsado = formatearTiempo(props.usados)
const tiempoTotal = `${Math.floor(total / 60)}h`

</script>
