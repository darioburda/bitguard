<template>
  <div class="relative flex items-center justify-center w-28 h-28">
    <Doughnut
      :data="chartData"
      :options="chartOptions"
      style="width: 100%; height: 100%; transition: none;"
    />
    <div class="absolute text-center leading-tight">
      <div class="text-xl font-bold text-blue-700">
        {{ porcentaje }}%
      </div>
      <div class="text-[12px] text-blue-600">
        {{ visitasConsumidas }} / {{ visitasTotales }}
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
  visitasConsumidas: { type: Number, required: true },
  visitasTotales: { type: Number, required: true }
})

// Cálculo del porcentaje restante
const porcentaje = props.visitasTotales === 0
  ? 100
  : Math.round(((props.visitasTotales - props.visitasConsumidas) / props.visitasTotales) * 100)

// Datos ajustados
let usados = props.visitasConsumidas
let restantes = props.visitasTotales - props.visitasConsumidas

// 🛠 Ajustes para que empiece totalmente azul si no se usaron visitas
if (props.visitasTotales === 0) {
  usados = 0.00001
  restantes = 1
} else if (usados === 0) {
  usados = props.visitasTotales
  restantes = 0.00001
} else if (restantes === 0) {
  usados = props.visitasConsumidas
  restantes = 0.00001
}

const chartData = {
  labels: ['Usadas', 'Restantes'],
  datasets: [
    {
      data: [usados, restantes],
      backgroundColor: ['#74b9ff', '#dfe6e9'], // azul y gris
      borderWidth: 1
    }
  ]
}

const chartOptions = {
  cutout: '80%',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  }
}
</script>
