<template>
  <DetailContainer :loading="loading">
    <template v-if="!loading">
      <DetailLayout titulo="Editar Empresa">
        <AccionesDetalle>
          <MainButton to="/abm-empresas" variant="volver" :showIcon="true">
            Volver
          </MainButton>

          <MainButton
            type="submit"
            variant="actualizar"
            :disabled="loading"
            @click="guardarCambios"
          >
            Guardar Cambios
          </MainButton>
        </AccionesDetalle>

        <FormularioLayout>
          <AlertMessage
            v-if="feedback"
            :message="feedback"
            :type="feedbackType"
            @dismiss="feedback = ''"
          />

          <FormularioEmpresa
            v-model:form="empresa"
            :planes="planes"
            :editing="false"
          />
        </FormularioLayout>
      </DetailLayout>
    </template>
  </DetailContainer>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getEmpresaById, updateEmpresa } from '@/services/empresas'
import { getAllPlanes } from '@/services/planes'

import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import FormularioLayout from '@/components/layouts/FormularioLayout.vue'
import MainButton from '@/components/MainButton.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import FormularioEmpresa from '@/components/FormularioEmpresa.vue'

export default {
  name: 'EditarEmpresa',
  components: {
    DetailContainer,
    DetailLayout,
    AccionesDetalle,
    FormularioLayout,
    MainButton,
    AlertMessage,
    FormularioEmpresa,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const empresa = ref({
      nombre: '',
      email_contacto: '',
      telefono: '',
      direccion: '',
      cuit: '',
      plan_id: null,
    })
    const loading = ref(true)
    const planes = ref([])
    const feedback = ref('')
    const feedbackType = ref('success')

    const cargarEmpresa = async () => {
      try {
        Object.assign(empresa.value, await getEmpresaById(route.params.id))
      } catch (error) {
        console.error('Error al cargar empresa:', error)
      } finally {
        loading.value = false
      }
    }

    const cargarPlanes = async () => {
      try {
        planes.value = await getAllPlanes()
      } catch (error) {
        console.error('Error al cargar planes:', error)
      }
    }

  const guardarCambios = async () => {
  feedback.value = ''
  feedbackType.value = 'error'

  if (!empresa.value.nombre.trim()) {
    feedback.value = '❌ Debes cargar el nombre de empresa'
    return
  }

  if (!empresa.value.email_contacto.trim()) {
    feedback.value = '❌ Debes ingresar un correo de contacto'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(empresa.value.email_contacto)) {
    feedback.value = '❌ El email de contacto no tiene un formato válido'
    return
  }

  if (!empresa.value.plan_id) {
    feedback.value = '❌ Debes elegir un plan para la empresa'
    return
  }

  if (empresa.value.cuit?.trim()) {
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/
    if (!cuitRegex.test(empresa.value.cuit)) {
      feedback.value = '❌ El CUIT debe tener el formato XX-XXXXXXXX-X'
      return
    }
  }

  try {
    await updateEmpresa(empresa.value.id, empresa.value)
    sessionStorage.setItem('empresa_feedback', '✅ Empresa actualizada correctamente')
    router.push('/abm-empresas')
  } catch (error) {
    console.error('Error al actualizar empresa:', error)
    feedback.value = '❌ Error al actualizar empresa'
  }
}


    onMounted(() => {
      cargarEmpresa()
      cargarPlanes()
    })

    return {
      empresa,
      planes,
      loading,
      feedback,
      feedbackType,
      guardarCambios,
    }
  },
}
</script>
