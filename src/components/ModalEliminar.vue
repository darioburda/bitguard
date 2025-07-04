<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    v-if="visible"
  >
    <div class="bg-white border-2 border-red-500 rounded-xl shadow-xl w-full max-w-md p-6">
      <h2 class="text-xl font-bold text-red-600 mb-4">Confirmar Eliminación</h2>
      <p class="mb-4">
        ¿Estás seguro de que querés eliminar al usuario
        <strong>{{ nombre }}</strong>?
      </p>
      <div class="flex justify-end gap-2">
        <button
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          @click="$emit('cancelar')"
        >
          Cancelar
        </button>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          @click="$emit('confirmar')"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalEliminar',
  props: {
    visible: Boolean,
    nombre: String,
  },
};
</script>
