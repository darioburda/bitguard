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
import {
  getEmpresaById,
  updateEmpresa,
  getAllEmpresas
} from '@/services/empresas'
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
    FormularioEmpresa
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
      plan_id: null
    })

    const planes = ref([])
    const empresasExistentes = ref([])
    const loading = ref(true)
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

    const cargarEmpresas = async () => {
      try {
        empresasExistentes.value = await getAllEmpresas()
      } catch (error) {
        console.error('Error al cargar empresas existentes:', error)
      }
    }

    const guardarCambios = async () => {
      feedback.value = ''
      feedbackType.value = 'error'

      const nombre = empresa.value.nombre.trim()
      const email = empresa.value.email_contacto.trim()
      const cuit = empresa.value.cuit.trim()
      const idActual = empresa.value.id

      if (!nombre) {
        feedback.value = '❌ Debes cargar el nombre de empresa'
        return
      }

      const nombreExistente = empresasExistentes.value.some(
        (e) =>
          e.nombre.toLowerCase() === nombre.toLowerCase() &&
          e.id !== idActual
      )
      if (nombreExistente) {
        feedback.value = '❌ Ya existe una empresa con ese nombre'
        return
      }

      if (!email) {
        feedback.value = '❌ Debes ingresar un correo de contacto'
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        feedback.value = '❌ El email de contacto no tiene un formato válido'
        return
      }

      const emailExistente = empresasExistentes.value.some(
        (e) =>
          e.email_contacto?.toLowerCase() === email.toLowerCase() &&
          e.id !== idActual
      )
      if (emailExistente) {
        feedback.value = '❌ Ese email ya está asociado a otra empresa'
        return
      }

      if (!empresa.value.plan_id) {
        feedback.value = '❌ Debes elegir un plan para la empresa'
        return
      }

      if (cuit && !/^\d{2}-\d{8}-\d{1}$/.test(cuit)) {
        feedback.value = '❌ El CUIT debe tener el formato XX-XXXXXXXX-X'
        return
      }

      const cuitExistente = empresasExistentes.value.some(
        (e) =>
          e.cuit?.toLowerCase() === cuit.toLowerCase() &&
          e.id !== idActual
      )
      if (cuit && cuitExistente) {
        feedback.value = '❌ Ese CUIT ya está en uso por otra empresa'
        return
      }

      try {
        await updateEmpresa(empresa.value.id, empresa.value)
        sessionStorage.setItem(
          'empresa_feedback',
          '✅ Empresa actualizada correctamente'
        )
        router.push('/abm-empresas')
      } catch (error) {
        console.error('Error al actualizar empresa:', error)
        feedback.value = '❌ Error al actualizar empresa'
      }
    }

    onMounted(async () => {
      await cargarPlanes()
      await cargarEmpresa()
      await cargarEmpresas()
    })

    return {
      empresa,
      planes,
      loading,
      feedback,
      feedbackType,
      guardarCambios
    }
  }
}
</script>
