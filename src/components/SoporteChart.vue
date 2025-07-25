<template>
  <div class="relative flex flex-col items-center justify-center w-28 h-40">
    <Doughnut :data="chartData" :options="chartOptions" class="w-28 h-28" />
    <div
      class="absolute text-center leading-tight top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      :class="colorPorcentaje"
    >
      <div class="text-xl font-bold">
        {{ porcentajeRestante }}%
      </div>
      <div class="text-[12px] text-gray-600">
        {{ tiempoMostrado }}
      </div>
    </div>

    <!-- Leyenda visible abajo -->
    <div class="mt-2 flex gap-3 text-xs">
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
      '#ff7675', // rojo - usados
      '#55efc4', // verde - restantes
      props.excedidos > 0 ? '#8e44ad' : 'transparent' // violeta o transparente
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
      enabled: false, // Desactiva tooltip por defecto
      external: customTooltip, // Usa tooltip personalizado
      callbacks: {
        label(context) {
          const label = context.label || ''
          const minutos = context.parsed || 0
          return `${label}: ${formatearTiempo(minutos)}`
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

// Función para tooltip personalizado con transición sin parpadeos ni mini cuadro
function customTooltip(context) {
  let tooltipEl = document.getElementById('chartjs-tooltip')

  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.id = 'chartjs-tooltip'
    tooltipEl.className = 'chartjs-tooltip'
    tooltipEl.style.position = 'absolute'
    tooltipEl.style.pointerEvents = 'none'
    tooltipEl.style.background = 'rgba(0, 0, 0, 1)'
    tooltipEl.style.color = 'white'
    tooltipEl.style.padding = '6px 8px'
    tooltipEl.style.borderRadius = '4px'
    tooltipEl.style.fontSize = '12px'
    tooltipEl.style.fontFamily = "'Montserrat', sans-serif"
    tooltipEl.style.whiteSpace = 'nowrap'
    tooltipEl.style.transition = 'none'
    tooltipEl.style.opacity = '0'
    tooltipEl.style.display = 'none'
    document.body.appendChild(tooltipEl)
  }

  const tooltipModel = context.tooltip

  if (tooltipModel.opacity === 0) {
    tooltipEl.style.opacity = '0'
    tooltipEl.style.display = 'none'
    tooltipEl.innerHTML = ''
    return
  }

  if (tooltipModel.dataPoints) {
    const lines = tooltipModel.dataPoints.map(point => {
      const label = point.label || ''
      const minutos = point.parsed || 0
      const bgColor = point.element?.options?.backgroundColor || '#000'
      return `<span class="tooltip-color" style="background:${bgColor}"></span> ${label}: ${formatearTiempo(minutos)}`
    })

    tooltipEl.innerHTML = lines.join('<br/>')
  } else {
    tooltipEl.innerHTML = ''
  }

  const canvasRect = context.chart.canvas.getBoundingClientRect()
  tooltipEl.style.left = canvasRect.left + window.pageXOffset + tooltipModel.caretX + 'px'
  tooltipEl.style.top = canvasRect.top + window.pageYOffset + tooltipModel.caretY + 'px'

  tooltipEl.style.display = 'block'
  tooltipEl.style.opacity = '1'
  tooltipEl.style.zIndex = '9999'

  tooltipEl.style.width = 'auto'
  tooltipEl.style.height = 'auto'
}
</script>

<style scoped>
.chartjs-tooltip {
  white-space: nowrap;
  font-size: 12px;
  font-family: 'Montserrat', sans-serif;
  overflow: hidden;
}

.chartjs-tooltip .tooltip-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  vertical-align: middle;
  border-radius: 2px;
}
</style>
