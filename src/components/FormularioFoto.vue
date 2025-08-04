<script setup>
import { ref } from 'vue';
import MainButton from './MainButton.vue';

defineProps({
  photo: Object,
  uploading: Boolean,
  handleFileChange: Function,
  handleSubmit: Function,
});

const fileInput = ref(null);
</script>

<template>
  <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start w-full">
    <!-- Selector de archivo -->
    <div class="md:col-span-2 w-full">
      <label class="block mb-2 font-semibold">Nueva foto</label>

      <div class="flex items-center gap-4 w-full">
        <!-- Botón BitGuard -->
        <MainButton type="button" @click="fileInput.click()" variant="editar">
        Seleccionar archivo
        </MainButton>


        <!-- Texto con nombre del archivo -->
        <span class="text-sm text-gray-600 break-all">
          {{ photo.file?.name || 'Ningún archivo seleccionado' }}
        </span>

        <!-- Input oculto -->
        <input
          ref="fileInput"
          type="file"
          id="photo"
          class="hidden"
          @change="handleFileChange"
        />
      </div>
    </div>

    <!-- Previsualización -->
    <div v-if="photo.previewObject" class="flex justify-center items-center">
      <img
        :src="photo.previewObject"
        alt="Previsualización"
        class="w-40 h-40 object-cover rounded-full border-4 border-white shadow"
      />
    </div>
  </form>
</template>
