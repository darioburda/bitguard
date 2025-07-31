<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
    >
      <div class="bg-white border border-red-500 rounded-lg shadow-lg w-full max-w-[500px] p-6 animate-fadeIn">
        <h2 class="text-lg font-bold text-red-600 mb-4">Confirmar Eliminación</h2>

        <p class="mb-6 break-words">
          <template v-if="cantidad === 1">
            ¿Estás seguro de que querés eliminar al usuario
            <strong>{{ nombreUsuario }}</strong>?
          </template>
          <template v-else>
            ¿Estás seguro de que querés eliminar {{ cantidad }} usuario(s)?
          </template>
        </p>

        <div class="flex justify-end gap-4">
          <button
            @click="$emit('confirmar')"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Eliminar
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
  show: Boolean,
  cantidad: Number,
  nombreUsuario: String
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
