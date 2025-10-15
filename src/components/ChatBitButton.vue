<template>
  <RouterLink
    to="/chat"
    class="fixed bottom-6 right-6 z-50 bg-[#01C38E] rounded-full shadow-lg hover:bg-[#00a77c] transition-transform w-16 h-16 flex items-center justify-center overflow-hidden transition-opacity duration-[1500ms]"
    :class="{ 'opacity-0 pointer-events-none': !mostrarBoton, 'opacity-100': mostrarBoton }"
    title="Abrir Chat"
  >
    <img
      :src="chatbitLogo"
      alt="Chatbit"
      class="object-contain w-14 h-14 p-0 floating-icon"
      :class="{ 'rotate-on-load': mostrarAnimacion }"
    />
  </RouterLink>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import chatbitLogo from '@/assets/chatbit.png'

const mostrarBoton = ref(false)
const mostrarAnimacion = ref(false)

onMounted(() => {
  setTimeout(() => {
    mostrarAnimacion.value = false
    void document.querySelector('.floating-icon')?.offsetWidth
    mostrarAnimacion.value = true
    setTimeout(() => (mostrarAnimacion.value = false), 1800)
  }, 1800)

  setTimeout(() => {
    mostrarBoton.value = true
  }, 1500)
})
</script>

<style scoped>
.rotate-on-load {
  animation: spin 1.8s ease-in-out;
}
@keyframes spin {
  0% {
    transform: rotate(0deg) scale(0.9);
  }
  50% {
    transform: rotate(360deg) scale(1.1);
  }
  100% {
    transform: rotate(720deg) scale(1);
  }
}
</style>
