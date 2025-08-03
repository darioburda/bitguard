<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
    >
      <div
        class="bg-white border border-[#01C38E] rounded-lg shadow-lg w-full max-w-[500px] p-6 animate-fadeIn"
      >
        <h2 class="text-lg font-bold text-[#01C38E] mb-4">Confirmar Acción</h2>

        <p class="mb-6 break-words">
          ¿Estás seguro de que querés tomar el ticket
          <strong>#{{ nombre?.slice(-8) }}</strong>?
        </p>

        <div class="flex justify-end gap-4">
          <button
            @click="$emit('confirmar')"
            class="px-4 py-2 bg-[#01C38E] text-white rounded hover:bg-[#00b383]"
          >
            Confirmar
          </button>
          <button
            @click="$emit('cancelar')"
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: Boolean,
  nombre: String // será el ID completo del ticket
})

defineEmits(['confirmar', 'cancelar'])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
