<template>
  <div
    class="absolute top-0 left-0 text-[11px] text-center py-[2px] px-1"
    :class="getTextClass(plan)"
    :style="{
      backgroundColor: getColor(plan),
      color: getTextColor(plan),
      textShadow: getTextShadow(plan),
      width: '80px',
      transform: 'rotate(-45deg) translate(-50%, 30%)',
      transformOrigin: 'top left',
      borderTopLeftRadius: '2px'
    }"
  >
    {{ plan || 'Sin Plan' }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  plan: {
    type: String,
    default: ''
  }
})

function getColor(plan) {
  switch (plan?.toLowerCase()) {
    case 'oro':
      return '#ffd700'
    case 'plata':
      return '#dcdcdc'
    case 'bronce':
      return '#b87333'
    case 'admin':
      return '#474747'
    default:
      return '#6c5ce7' // color por defecto si no hay plan válido
  }
}

function getTextColor(plan) {
  return ['oro', 'plata'].includes(plan?.toLowerCase()) ? '#474747' : '#ffffff'
}

function getTextShadow(plan) {
  return ['oro', 'plata'].includes(plan?.toLowerCase()) ? '0 0.5px #999' : 'none'
}

function getTextClass(plan) {
  return ['oro', 'plata'].includes(plan?.toLowerCase()) ? 'font-bold' : 'font-semibold'
}
</script>
