<template>
  <div
    class="absolute top-0 left-0 text-[11px] text-center py-[2px] px-1"
    :class="getTextClass(value)"
    :style="{
      backgroundColor: getColor(value),
      color: getTextColor(value),
      textShadow: getTextShadow(value),
      width: '80px',
      transform: 'rotate(-45deg) translate(-50%, 30%)',
      transformOrigin: 'top left',
      borderTopLeftRadius: '2px'
    }"
  >
    {{ value }}
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: String,
    required: true
  }
});

function getColor(estado) {
  switch (estado?.toLowerCase()) {
    case 'abierto':
      return '#facc15'; // amarillo
    case 'cerrado':
      return '#E54437'; // verde
    case 'pendiente':
      return '#a1a1aa'; // gris 4ade80
    case 'activo':
      return '#4ade80'; // naranja
    default:
      return '#6c5ce7'; // violeta
  }
}

function getTextColor(estado) {
  return ['abierto', 'pendiente'].includes(estado?.toLowerCase()) ? '#333' : '#ffffff';
}

function getTextShadow(estado) {
  return ['abierto', 'pendiente'].includes(estado?.toLowerCase()) ? '0 0.5px #999' : 'none';
}

function getTextClass(estado) {
  return ['cerrado'].includes(estado?.toLowerCase()) ? 'font-bold' : 'font-semibold';
}
</script>
