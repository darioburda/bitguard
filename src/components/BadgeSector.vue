<template>
  <span
    class="inline-block px-3 py-[2px] text-xs font-semibold rounded-full"
    :class="badgeColor"
  >
    {{ value || 'Sin sector' }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: String
});

const badgeColor = computed(() => {
  switch (props.value) {
    case 'Sistemas':
      return 'bg-green-100 text-green-800';
    case 'RRHH':
      return 'bg-purple-100 text-purple-800';
    case 'Administración':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});
</script>
