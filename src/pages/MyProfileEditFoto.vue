<script setup>
import { onUnmounted, ref } from 'vue';
import MainButton from '../components/MainButton.vue';
import MainH1 from '../components/MainH1.vue';
import { updateAuthProfileAvatar } from '../services/auth';
import MainLoader from '../components/MainLoader.vue';
import MessageBox from '../components/MessageBox.vue';

const { photo, uploading, feedback, handleSubmit, handleFileChange } = useProfileEditAvatarForm();

function useProfileEditAvatarForm() {
  const photo = ref({
    file: null,
    previewObject: null,
  });
  const uploading = ref(false);
  const feedback = ref({
    message: null,
    type: 'success',
  });

 async function handleSubmit() {
  feedback.value.message = null;

  if (!photo.value.file) {
    feedback.value = {
      message: 'No hay una foto seleccionada.',
      type: 'error',
    };
    return;
  }

  if (uploading.value) return;

  try {
    uploading.value = true;
    await updateAuthProfileAvatar(photo.value.file);

    // Redireccionamos al perfil con mensaje de éxito
    window.location.href = '/mi-perfil?success=avatar';
//     setTimeout(() => {
//   window.location.href = '/mi-perfil?success=avatar';
// }, 4000);
  } catch (error) {
    feedback.value = {
      message: 'Ocurrió un error al subir la foto.',
      type: 'error',
    };
  }
  uploading.value = false;
}

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) {
      if (photo.value.previewObject) {
        URL.revokeObjectURL(photo.value.previewObject);
      }
      photo.value = {
        file: null,
        previewObject: null,
      };
      return;
    }

    photo.value.file = file;
    photo.value.previewObject = URL.createObjectURL(file);
  }

  onUnmounted(() => photo.value.previewObject && URL.revokeObjectURL(photo.value.previewObject));

  return {
    photo,
    uploading,
    feedback,
    handleSubmit,
    handleFileChange,
  };
}
</script>

<template>
  <div class="h-full overflow-auto">
    <div class="mx-auto max-w-[900px] w-full px-4 sm:px-8 py-6 mt-10 bg-white shadow rounded-xl">
      <MainH1>Editar mi foto de perfil</MainH1>

      <MessageBox
        v-if="feedback.message != null"
        :content="feedback"
        class="mb-4"
      />

      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <label for="photo" class="block mb-2 font-semibold">Nueva foto</label>
          <input
            type="file"
            id="photo"
            class="w-full p-2 border border-gray-400 rounded text-sm"
            @change="handleFileChange"
          />
          <div class="mt-4">
            <MainButton type="submit">
              <template v-if="!uploading">Subir mi foto</template>
              <MainLoader v-else />
            </MainButton>
          </div>
        </div>

        <div v-if="photo.previewObject" class="flex justify-center items-center">
          <img
            :src="photo.previewObject"
            alt="Previsualización"
            class="w-40 h-40 object-cover rounded-full border-4 border-white shadow"
          />
        </div>
      </form>
    </div>
  </div>
</template>
