<template>
  <div class="relative flex flex-col items-center justify-center w-28 h-40">
    <div class="relative w-28 h-28">
      <Doughnut :data="chartData" :options="chartOptions" class="w-full h-full" />

      <!-- Texto centrado dentro del doughnut -->
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center text-center leading-tight"
        :class="colorTexto"
      >
        <div class="text-xl font-bold">
          {{ porcentaje }}%
        </div>
        <div class="text-[12px] text-gray-600">
          {{ visitasConsumidas }} / {{ visitasTotales }}
        </div>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="mt-2 flex flex-col items-center gap-1 text-xs">
      <div class="flex gap-3">
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-sm bg-[#0984e3]"></span>
          <span>Restantes</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-sm bg-[#ff7675]"></span>
          <span>Usadas</span>
        </div>
      </div>
      <div class="flex items-center gap-1 mt-1 invisible">
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
  visitasConsumidas: { type: Number, required: true },
  visitasTotales: { type: Number, required: true }
})

const porcentaje = props.visitasTotales === 0
  ? 0
  : Math.round(((props.visitasTotales - props.visitasConsumidas) / props.visitasTotales) * 100)

const colorTexto = props.visitasTotales === 0
  ? 'text-gray-400'
  : (props.visitasConsumidas >= props.visitasTotales ? 'text-blue-800' : 'text-[#0984e3]')

let usadas = props.visitasConsumidas
let restantes = props.visitasTotales - props.visitasConsumidas
let chartColors = ['#ff7675', '#0984e3']

if (props.visitasTotales === 0) {
  usadas = 0.00001
  restantes = 1
  chartColors = ['#ccc', '#ccc']
} else if (usadas === 0) {
  usadas = 0.00001
} else if (restantes === 0) {
  restantes = 0.00001
}

const chartData = {
  labels: ['Usadas', 'Restantes'],
  datasets: [
    {
      data: [usadas, restantes],
      backgroundColor: chartColors,
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
          const cantidad = props.visitasTotales === 0 ? 0 : context.parsed || 0
          return `${label}: ${cantidad} visita${cantidad === 1 ? '' : 's'}`
        }
      }
    }
  }
}

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
      const valor = props.visitasTotales === 0 ? 0 : point.parsed || 0
      const bgColor = point.element?.options?.backgroundColor || '#000'
      return `<span class="tooltip-color" style="background:${bgColor}"></span> ${label}: ${valor} visita${valor === 1 ? '' : 's'}`
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
