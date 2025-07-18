<template>
  <div
    class="text-xs font-semibold px-3 py-[2px] rounded-full border shadow-sm flex items-center gap-1"
    :class="['bg-[#F0F2FF]', 'text-[#474747]', 'border-[#01C38E]']"
  >
    <component
      :is="tipo === 'Remoto' ? Monitor : MapPin"
      class="w-4 h-4 text-[#474747]"
    />
    #{{ id.slice(-8) }}
  </div>
</template>

<script setup>
import { Monitor, MapPin } from 'lucide-vue-next';

defineProps({
  tipo: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  }
});
</script>
