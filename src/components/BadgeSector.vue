<template>
  <div
    class="flex items-center gap-1 text-[11px] text-center py-[2px] px-2 border border-[#01C38E] rounded-full"
    :style="{
      backgroundColor: getColor(value),
      color: getTextColor(value),
      textShadow: getTextShadow(value),
      minWidth: '90px',
    }"
  >
    <UsersIcon class="w-3 h-3" />
    {{ value }}
  </div>
</template>

<script setup>
import { UsersIcon } from 'lucide-vue-next';

defineProps({
  value: {
    type: String,
    required: true
  }
});

function getColor(sector) {
  switch (sector?.toLowerCase()) {
    case 'it':
      return '#00b894';
    case 'ventas':
      return '#fdcb6e';
    case 'rrhh':
      return '#e17055';
    case 'logística':
      return '#74b9ff';
    case 'producción':
      return '#a29bfe';
    default:
      return '#dfe6e9';
  }
}

function getTextColor(sector) {
  return ['ventas', 'rrhh'].includes(sector?.toLowerCase()) ? '#474747' : '#000000';
}

function getTextShadow(sector) {
  return 'none';
}
</script>
