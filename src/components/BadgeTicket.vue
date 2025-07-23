<template>
  <div
    v-if="id"
    class="text-xs font-semibold px-3 py-[2px] rounded-full border shadow-sm flex items-center gap-1"
    :class="variant === 'activo'
      ? ['bg-[#474747]', 'text-[#facc15]', 'border-[#facc15]']
      : ['bg-[#F0F2FF]', 'text-[#474747]', 'border-[#01C38E]']"
  >
    <component
      :is="tipo === 'Remoto' ? Monitor : MapPin"
      class="w-4 h-4"
      :class="variant === 'activo' ? 'text-[#facc15]' : 'text-[#474747]'"
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
    required: false, // ya no es obligatorio
    default: ''
  },
  variant: {
    type: String,
    default: ''
  }
});
</script>
