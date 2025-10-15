<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import FormularioLayout from '@/components/layouts/FormularioLayout.vue'
import FormularioUsuario from '@/components/FormularioUsuario.vue'
import MainButton from '@/components/MainButton.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import { getAllEmpresas } from '@/services/empresas'
import { getAllUserProfiles } from '@/services/user-profiles'

const router = useRouter()
const cargando = ref(false)
const empresas = ref([])
const perfiles = ref([])

const feedback = ref('')
const feedbackType = ref('danger')

const form = ref({
  display_name: '',
  email: '',
  password: '',
  is_admin: false,
  empresa_id: ''
})

const cargarDatos = async () => {
  try {
    empresas.value = await getAllEmpresas()
    perfiles.value = await getAllUserProfiles()
  } catch (e) {
    console.error('[AgregarUsuario] Error al cargar datos', e)
  }
}

onMounted(() => {
  cargarDatos()
})

const crearUsuario = async () => {
  feedback.value = ''
  feedbackType.value = 'danger'

  const nombre = form.value.display_name.trim()
  const email = form.value.email.trim().toLowerCase()
  const password = form.value.password.trim()
  const empresaId = form.value.empresa_id

  // Validar nombre
  if (!nombre) {
    feedback.value = '❌ Debes ingresar un nombre completo.'
    return
  }

  const nombreEnUso = perfiles.value.some(
    u => u.display_name?.trim().toLowerCase() === nombre.toLowerCase()
  )
  if (nombreEnUso) {
    feedback.value = '❌ El nombre ya está en uso por otro usuario.'
    return
  }

  // Validar email
  if (!email) {
    feedback.value = '❌ Debes ingresar un email.'
    return
  }

  const emailEnUso = perfiles.value.some(
    u => u.email?.trim().toLowerCase() === email
  )
  if (emailEnUso) {
    feedback.value = '❌ El email ya está en uso por otro usuario.'
    return
  }

  // Validar contraseña
  if (!password) {
    feedback.value = '❌ Debes ingresar una contraseña.'
    return
  }

  // Validar empresa
  if (!empresaId) {
    feedback.value = '❌ Debes seleccionar una empresa.'
    return
  }

  cargando.value = true

  try {
    const response = await fetch('https://yjqstwwltjefqtsxlbsa.functions.supabase.co/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    if (response.ok && data.success) {
      feedbackType.value = 'success'
      feedback.value = '✅ Usuario creado correctamente'
      router.push({ path: '/abm-usuarios', query: { success: feedback.value } })
    } else {
      feedback.value = data.error || '❌ No se pudo crear el usuario.'
    }
  } catch (e) {
    console.error('[AgregarUsuario] Error al crear usuario:', e)
    feedback.value = '❌ Error de conexión o del servidor.'
  } finally {
    cargando.value = false
  }
}
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
          auto-dismiss
          @dismiss="feedback = ''"
        />

        <FormularioUsuario
          v-model:form="form"
          :editing="false"
          modo="creacion"
          :empresas="empresas"
        />
      </FormularioLayout>
    </DetailLayout>
  </DetailContainer>
</template>
