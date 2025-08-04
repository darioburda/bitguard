<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { crearEmpresa } from '@/services/empresas'
import { getAllPlanes } from '@/services/planes'

import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import FormularioLayout from '@/components/layouts/FormularioLayout.vue'
import FormularioEmpresa from '@/components/FormularioEmpresa.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import MainButton from '@/components/MainButton.vue'

const router = useRouter()

const form = ref({
  nombre: '',
  email_contacto: '',
  telefono: '',
  direccion: '',
  cuit: '',
  visitas_consumidas: 0,
  minutos_consumidos: 0,
  plan_id: '',
})

const planes = ref([])
const cargando = ref(false)
const feedback = ref('')
const feedbackType = ref('danger') // 'success' o 'danger'

// Cargar los planes disponibles
onMounted(async () => {
  try {
    planes.value = await getAllPlanes()
  } catch (error) {
    console.error('Error al cargar planes:', error)
  }
})

// Validación y creación
const guardarEmpresa = async () => {
  feedback.value = ''
  feedbackType.value = 'danger'

  if (!form.value.nombre.trim()) {
    feedback.value = '❌ Debes cargar el nombre de empresa'
    return
  }

  // Email obligatorio y válido
  if (!form.value.email_contacto.trim()) {
    feedback.value = '❌ Debes cargar un email de contacto'
    return
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.value.email_contacto)) {
      feedback.value = '❌ El email de contacto no tiene un formato válido'
      return
    }
  }

  if (!form.value.plan_id) {
    feedback.value = '❌ Debes elegir un plan para la empresa'
    return
  }

  if (form.value.cuit.trim()) {
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/
    if (!cuitRegex.test(form.value.cuit)) {
      feedback.value = '❌ El CUIT debe tener el formato XX-XXXXXXXX-X'
      return
    }
  }

  try {
    cargando.value = true
    await crearEmpresa(form.value)
    feedbackType.value = 'success'
    sessionStorage.setItem('empresa_feedback', '✅ Empresa creada correctamente')
    router.push('/abm-empresas')
  } catch (error) {
    console.error('Error al crear empresa:', error)
    feedback.value = '❌ No se pudo crear la empresa'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <DetailContainer :loading="cargando">
    <DetailLayout titulo="Agregar Empresa">
      <AccionesDetalle>
        <MainButton to="/abm-empresas" variant="volver" :showIcon="true">
          Volver
        </MainButton>

        <MainButton
          type="submit"
          variant="actualizar"
          :disabled="cargando"
          @click="guardarEmpresa"
        >
          Crear Empresa
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
          v-model:form="form"
          :planes="planes"
          :editing="false"
        />
      </FormularioLayout>
    </DetailLayout>
  </DetailContainer>
</template>
