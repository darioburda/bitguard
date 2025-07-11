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

function getColor(plan) {
  switch (plan?.toLowerCase()) {
    case 'oro':
      return '#ffd700';
    case 'plata':
      return '#dcdcdc';
    case 'bronce':
      return '#b87333';
    case 'admin':
      return '#474747';
    default:
      return '#6c5ce7';
  }
}

function getTextColor(plan) {
  return ['oro', 'plata'].includes(plan?.toLowerCase()) ? '#474747' : '#ffffff';
}

function getTextShadow(plan) {
  return ['oro', 'plata'].includes(plan?.toLowerCase()) ? '0 0.5px #999' : 'none';
}

function getTextClass(plan) {
  return ['oro', 'plata'].includes(plan?.toLowerCase()) ? 'font-bold' : 'font-semibold';
}
</script>
