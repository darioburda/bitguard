<template>
  <div
    class="text-xs font-semibold px-3 py-[2px] rounded-full border shadow-sm flex items-center gap-1"
    :class="['bg-[#F0F2FF]', 'text-[#474747]', 'border-[#01C38E]']"
  >
    <PhoneIcon class="w-4 h-4 text-[#474747]" />
    {{ value }}
  </div>
</template>

<script setup>
import { PhoneIcon } from 'lucide-vue-next';

defineProps({
  value: {
    type: [String, Number],
    required: true
  }
});
</script>
