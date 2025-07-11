<template>
  <div class="relative w-full h-full">
    <Doughnut :data="chartData" :options="chartOptions" />
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-xs font-semibold text-gray-700 text-center leading-tight">
        {{ labelTexto }}
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
  usados: {
    type: Number,
    required: true
  },
  restantes: {
    type: Number,
    required: true
  }
});

// Datos para el gráfico
const chartData = {
  labels: ['Usado', 'Restante'],
  datasets: [{
    data: [props.usados, props.restantes],
    backgroundColor: ['#ff7675', '#55efc4'],
    borderWidth: 1
  }]
};

// Opciones
const chartOptions = {
  cutout: '65%',
  plugins: {
    legend: { display: false }
  }
};

// Texto central (ej. "3h 40m")
const horas = Math.floor(props.restantes / 60);
const minutos = props.restantes % 60;
const labelTexto = `${horas}h ${minutos}m`;
</script>
