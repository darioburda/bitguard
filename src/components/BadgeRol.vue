<template>
  <div
    class="absolute top-0 left-0 text-white text-[11px] font-semibold text-center py-[2px] px-1 shadow-sm"
    :style="{
      backgroundColor: value === 'ADMIN' ? '#474747' : '#287AE6',
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
</script>
