<template>
  <DetailContainer :loading="loading">
    <DetailLayout titulo="Editar perfil">
      <AccionesDetalle>
        <MainButton to="/mi-perfil" variant="volver" :showIcon="true">
          Volver
        </MainButton>

        <MainButton
          type="submit"
          variant="actualizar"
          :disabled="editing"
          @click="handleSubmit"
        >
          Actualizar
        </MainButton>
      </AccionesDetalle>

      <FormularioLayout>
        <AlertMessage
          v-if="feedback"
          :type="feedbackType"
          :message="feedback"
          @dismiss="feedback = ''"
        />

        <Formulario
          v-model:profile="profile"
          :editing="editing"
          :on-submit="handleSubmit"
        />
      </FormularioLayout>
    </DetailLayout>
  </DetailContainer>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useLoader } from '@/composables/useLoader.js'
import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import FormularioLayout from '@/components/layouts/FormularioLayout.vue'
import MainButton from '@/components/MainButton.vue'
import Formulario from '@/components/Formulario.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import { subscribeToAuthState } from '@/services/auth'
import { getAllUserProfiles, getUserProfileById, updateUserProfile } from '@/services/user-profiles'
import { supabase } from '@/services/supabase'

const router = useRouter()
const { loading, finalizarCarga } = useLoader()

const profile = ref({
  display_name: '',
  sector: '',
  equipo: '',
  rustdesk: '',
  interno_telefono: '',
  id: ''
})

const editing = ref(false)
const allProfiles = ref([])
const feedback = ref('')
const feedbackType = ref('success')

onMounted(async () => {
  subscribeToAuthState(async (newUserData) => {
    const userProfile = await getUserProfileById(newUserData.id)

    const draft = sessionStorage.getItem('draft_profile')
    profile.value = draft
      ? { ...userProfile, ...JSON.parse(draft), id: userProfile.id }
      : { ...userProfile, id: userProfile.id }

    allProfiles.value = await getAllUserProfiles()
    finalizarCarga()
  })
})

// Guardar borrador en sessionStorage
watch(profile, (nuevo) => {
  sessionStorage.setItem('draft_profile', JSON.stringify(nuevo))
}, { deep: true })

// ✅ Limpiar borrador si navega fuera de la vista
onBeforeRouteLeave(() => {
  sessionStorage.removeItem('draft_profile')
})

const handleSubmit = async () => {
  const nuevoNombre = profile.value.display_name?.trim() || ''
  const perfilActual = allProfiles.value.find(p => p.id === profile.value.id)
  const nombreOriginal = perfilActual?.display_name?.trim() || ''

  if (!nuevoNombre) {
    sessionStorage.setItem('perfil_feedback', '❌ Debes ingresar un nombre')
    sessionStorage.setItem('feedback_type', 'danger')
    return router.push('/mi-perfil')
  }

  if (nuevoNombre === nombreOriginal) {
    sessionStorage.setItem('perfil_feedback', 'ℹ️ No realizaste ningún cambio en el nombre')
    sessionStorage.setItem('feedback_type', 'info')
    return router.push('/mi-perfil')
  }

  const nombreEnUso = allProfiles.value.some(
    p => (p.display_name?.trim()?.toLowerCase() || '') === nuevoNombre.toLowerCase() && p.id !== profile.value.id
  )

  if (nombreEnUso) {
    sessionStorage.setItem('perfil_feedback', '❌ El nombre ya está en uso por otro usuario')
    sessionStorage.setItem('feedback_type', 'danger')
    return router.push('/mi-perfil')
  }

  try {
    editing.value = true

    await updateUserProfile(profile.value.id, { display_name: nuevoNombre })

    const { error: authError } = await supabase.auth.updateUser({
      data: { display_name: nuevoNombre }
    })

    if (authError) throw authError

    sessionStorage.removeItem('draft_profile')
    sessionStorage.setItem('perfil_feedback', '✅ Perfil actualizado correctamente')
    sessionStorage.setItem('feedback_type', 'success')
    router.push('/mi-perfil')
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error)
    editing.value = false
    sessionStorage.setItem('perfil_feedback', '❌ Ocurrió un error al actualizar tu perfil')
    sessionStorage.setItem('feedback_type', 'danger')
    router.push('/mi-perfil')
  }
}
</script>


