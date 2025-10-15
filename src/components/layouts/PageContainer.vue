<template>
  <div
    class="w-full relative min-h-screen bg-cover bg-center"
    :class="{ 'bg-fixed': bgFixed }"
    :style="{ backgroundImage: `url(${fondoImg})` }"
  >
    <!-- Loader -->
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
    >
      <MainLoader />
    </div>

    <!-- Contenido -->
    <div class="max-w-screen-xl mx-auto px-4 sm:px-8 pt-4 pb-10">
      <slot />
    </div>
  </div>
</template>

<script setup>
import MainLoader from '@/components/MainLoader.vue'
import fondoImg from '@/assets/background-Bitguard.png' // ✅ cambiar por tu imagen real

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  bgFixed: {
    type: Boolean,
    default: false
  }
})
</script>
