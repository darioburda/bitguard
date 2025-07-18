<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    v-if="visible"
  >
    <div class="bg-white border-2 border-emerald-500 rounded-xl shadow-xl w-full max-w-md p-6">
      <h2 class="text-xl font-bold text-emerald-600 mb-4">
        {{ titulo || 'Confirmar Asignación' }}
      </h2>
      <p class="mb-4">
        {{ mensaje || '¿Estás seguro de tomar este ticket?' }}
      </p>
      <div class="flex justify-end gap-2">
          <button
            class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
            @click="$emit('confirmar')"
          >
            Confirmar
          </button>
        <button
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          @click="$emit('cancelar')"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalConfirmar',
  props: {
    visible: Boolean,
    titulo: String,
    mensaje: String
  }
};
</script>
