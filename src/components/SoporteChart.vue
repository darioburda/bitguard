<template>
  <div class="flex flex-col items-center justify-center w-28">
    <div class="relative w-28 h-28">
      <Doughnut :data="chartData" :options="chartOptions" class="w-full h-full" />
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center text-center leading-tight"
        :class="colorPorcentaje"
      >
        <div class="text-xl font-bold">
          {{ porcentajeRestante }}%
        </div>
        <div class="text-[12px] text-gray-600">
          {{ tiempoMostrado }}
        </div>
      </div>
    </div>

    <!-- Leyenda visible abajo -->
    <div class="mt-2 flex flex-col items-center gap-1 text-xs">
      <div class="flex gap-3">
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-sm bg-[#55efc4]"></span>
          <span>Restante</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-sm bg-[#ff7675]"></span>
          <span>Usado</span>
        </div>
      </div>
      <div
        class="flex items-center gap-1 mt-1"
        :class="{ 'invisible': props.excedidos === 0 }"
      >
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

const total = props.usados + props.restantes + props.excedidos
const porcentajeRestante = total > 0 ? Math.round((props.restantes / total) * 100) : 0
const colorPorcentaje = props.excedidos > 0 ? 'text-violet-600' : 'text-[#01C38E]'

const chartData = {
  labels: ['Excedido', 'Usado', 'Restante'],
  datasets: [
    {
      data: [props.excedidos, props.usados, props.restantes],
      backgroundColor: [
        props.excedidos > 0 ? '#8e44ad' : 'transparent',
        '#ff7675',
        '#55efc4'
      ],
      borderWidth: 0
    }
  ]
}

const chartOptions = {
  cutout: '80%',
  responsive: true,
  maintainAspectRatio: false,
  rotation: 0,
  circumference: 360,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: false,
      external: customTooltip,
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
    tooltipEl.style.transition = 'opacity 0.2s ease'
    tooltipEl.style.opacity = '0'
    tooltipEl.style.display = 'none'
    document.body.appendChild(tooltipEl)
  }

  const tooltipModel = context.tooltip

  if (tooltipModel.opacity === 0) {
    tooltipEl.style.opacity = '0'
    tooltipEl.style.display = 'none'
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
  }

  const event = tooltipModel._event
  let x, y

  if (event?.clientX && event?.clientY) {
    x = event.clientX + 10
    y = event.clientY + 10
  } else {
    const canvasRect = context.chart.canvas.getBoundingClientRect()
    x = canvasRect.left + window.pageXOffset + tooltipModel.caretX
    y = canvasRect.top + window.pageYOffset + tooltipModel.caretY
  }

  tooltipEl.style.left = `${x}px`
  tooltipEl.style.top = `${y}px`
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
