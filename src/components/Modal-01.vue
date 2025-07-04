<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl relative">
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
      <!-- Contenido del modal provisto por la vista -->
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal01',
  props: {
    /** Controla la visibilidad del modal */
    modelValue: Boolean
  },
  emits: ['close']
};
</script>
