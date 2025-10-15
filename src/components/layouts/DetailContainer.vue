<template>
  <div class="h-full overflow-auto relative">
    <!-- Loader pantalla completa con blur -->
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
    >
      <MainLoader />
    </div>

    <div class="mx-auto w-full max-w-3xl min-w-[720px] px-4 sm:px-8 py-5">
      <slot />
    </div>
  </div>
</template>

<script setup>
import MainLoader from '@/components/MainLoader.vue'

defineProps({
  loading: Boolean
})
</script>
