<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { crearEmpresa, getAllEmpresas } from '@/services/empresas'
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
const empresasExistentes = ref([])
const cargando = ref(false)
const feedback = ref('')
const feedbackType = ref('danger')

// Cargar planes y empresas para validación
onMounted(async () => {
  try {
    planes.value = await getAllPlanes()
    empresasExistentes.value = await getAllEmpresas()
  } catch (error) {
    console.error('Error al cargar datos:', error)
  }
})

// Validación y creación
const guardarEmpresa = async () => {
  feedback.value = ''
  feedbackType.value = 'danger'

  const nombre = form.value.nombre.trim()
  const email = form.value.email_contacto.trim()
  const cuit = form.value.cuit.trim()

  if (!nombre) {
    feedback.value = '❌ Debes cargar el nombre de empresa'
    return
  }

  const nombreExistente = empresasExistentes.value.some(
    (e) => e.nombre.toLowerCase() === nombre.toLowerCase()
  )
  if (nombreExistente) {
    feedback.value = '❌ Ya existe una empresa con ese nombre'
    return
  }

  if (!email) {
    feedback.value = '❌ Debes cargar un email de contacto'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    feedback.value = '❌ El email de contacto no tiene un formato válido'
    return
  }

  const emailExistente = empresasExistentes.value.some(
    (e) => e.email_contacto?.toLowerCase() === email.toLowerCase()
  )
  if (emailExistente) {
    feedback.value = '❌ Ese email ya está asociado a otra empresa'
    return
  }

  if (!form.value.plan_id) {
    feedback.value = '❌ Debes elegir un plan para la empresa'
    return
  }

  if (cuit && !/^\d{2}-\d{8}-\d{1}$/.test(cuit)) {
    feedback.value = '❌ El CUIT debe tener el formato XX-XXXXXXXX-X'
    return
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
