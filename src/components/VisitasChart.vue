<template>
  <div class="relative w-full h-full flex items-center justify-center">
    <Doughnut :data="chartData" :options="chartOptions" />
    <div
      class="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight"
    >
      <!-- Solo mostrar el porcentaje si hay visitas totales -->
      <span
        v-if="visitasTotales !== 0"
        class="font-bold text-[15px] text-blue-700"
      >
        {{ porcentaje + '%' }}
      </span>

      <!-- Valor abajo (siempre visible) -->
      <span
        class="text-[11px]"
        :class="visitasTotales === 0 ? 'text-gray-400' : 'text-blue-600'"
      >
        {{ visitasTotales === 0 ? '0 / 0' : `${visitasConsumidas} / ${visitasTotales}` }}
      </span>
    </div>
  </div>
</template>



<script setup>
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({
  visitasConsumidas: {
    type: Number,
    required: true
  },
  visitasTotales: {
    type: Number,
    required: true
  }
});

const porcentaje = props.visitasTotales === 0
  ? 0
  : Math.floor((props.visitasConsumidas / props.visitasTotales) * 100);

const chartData = {
  labels: ['Usadas', 'Restantes'],
  datasets: [
    {
      data: props.visitasTotales === 0
        ? [1, 0] // Mostrar una torta "completa" gris cuando no hay datos
        : [props.visitasConsumidas, props.visitasTotales - props.visitasConsumidas],
      backgroundColor: props.visitasTotales === 0
        ? ['#E0E0E0', '#E0E0E0']
        : ['#74b9ff', '#dfe6e9'],
      borderWidth: 1
    }
  ]
};

const chartOptions = {
  cutout: '80%',
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  },
  responsive: true,
  maintainAspectRatio: false
};
</script>
