<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DetailContainer from '@/components/layouts/DetailContainer.vue';
import DetailLayout from '@/components/layouts/DetailLayout.vue';
import AccionesDetalle from '@/components/AccionesDetalle.vue';
import FormularioLayout from '@/components/layouts/FormularioLayout.vue';
import FormularioUsuario from '@/components/FormularioUsuario.vue';
import MainButton from '@/components/MainButton.vue';
import AlertMessage from '@/components/AlertMessage.vue';

const router = useRouter();

const form = ref({
  display_name: '',
  email: '',
  password: '',
  is_admin: false
});

const cargando = ref(false);
const feedback = ref('');
const feedbackType = ref('danger'); // 'success' o 'danger'

const crearUsuario = async () => {
  feedback.value = '';
  feedbackType.value = 'danger';

  if (!form.value.display_name || !form.value.email || !form.value.password) {
    feedback.value = 'Todos los campos son obligatorios.';
    return;
  }

  cargando.value = true;

  try {
    const response = await fetch('https://yjqstwwltjefqtsxlbsa.functions.supabase.co/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      router.push({ path: '/abm-usuarios', query: { success: '✅ Usuario creado correctamente' } });
    } else {
      feedback.value = data.error || '❌ No se pudo crear el usuario.';
    }
  } catch (e) {
    console.error('[AgregarUsuario] Error al llamar a create-user:', e);
    feedback.value = '❌ Error de conexión o del servidor.';
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <DetailContainer :loading="cargando">
    <DetailLayout titulo="Agregar Usuario">
      <AccionesDetalle>
        <MainButton to="/abm-usuarios" variant="volver" :showIcon="true">
          Volver
        </MainButton>

        <MainButton
          type="submit"
          variant="actualizar"
          :disabled="cargando"
          @click="crearUsuario"
        >
          Crear Usuario
        </MainButton>
      </AccionesDetalle>

      <FormularioLayout>
        <AlertMessage
          v-if="feedback"
          :message="feedback"
          :type="feedbackType"
          @dismiss="feedback = ''"
        />

        <FormularioUsuario
          v-model:form="form"
          :editing="false"
        />
      </FormularioLayout>
    </DetailLayout>
  </DetailContainer>
</template>
