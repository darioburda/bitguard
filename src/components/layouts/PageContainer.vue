<template>
  <div class="w-full relative">
    <!-- Loader pantalla completa con blur -->
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
    >
      <MainLoader />
    </div>

    <!-- Contenido principal -->
    <div class="max-w-screen-xl mx-auto px-4 sm:px-8 pt-4 pb-10">
      <slot />
    </div>
  </div>
</template>

<script setup>
import MainLoader from '@/components/MainLoader.vue'

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})
</script>
