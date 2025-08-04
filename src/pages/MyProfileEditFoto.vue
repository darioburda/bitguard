<template>
  <DetailContainer :loading="loading">
    <DetailLayout titulo="Editar mi foto">
      <MessageBox
        v-if="feedback.message != null"
        :content="feedback"
        class="mb-4"
      />

      <AccionesDetalle>
        <MainButton to="/mi-perfil" variant="volver" :showIcon="true">
          Volver
        </MainButton>

        <MainButton
          type="submit"
          variant="actualizar"
          :disabled="uploading"
          @click="handleSubmit"
        >
          Actualizar
        </MainButton>
      </AccionesDetalle>

      <FormularioLayout>
        <FormularioFoto
          :photo="photo"
          :uploading="uploading"
          :handleFileChange="handleFileChange"
          :handleSubmit="handleSubmit"
        />
      </FormularioLayout>
    </DetailLayout>
  </DetailContainer>
</template>




<script setup>
import { ref, onUnmounted } from 'vue';
import MainButton from '../components/MainButton.vue';
import MainLoader from '../components/MainLoader.vue';
import MainH1 from '../components/MainH1.vue';
import MessageBox from '../components/MessageBox.vue';
import AccionesDetalle from '../components/AccionesDetalle.vue';
import FormularioFoto from '../components/FormularioFoto.vue';
import FormularioLayout from '@/components/layouts/FormularioLayout.vue';
import DetailLayout from '@/components/layouts/DetailLayout.vue';
import DetailContainer from '@/components/layouts/DetailContainer.vue';
import { updateAuthProfileAvatar } from '../services/auth';

const loading = ref(false);

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
      window.location.href = '/mi-perfil?success=avatar';
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

  onUnmounted(() => {
    if (photo.value.previewObject) {
      URL.revokeObjectURL(photo.value.previewObject);
    }
  });

  return {
    photo,
    uploading,
    feedback,
    handleSubmit,
    handleFileChange,
  };
}

</script>
