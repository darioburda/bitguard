<template>
  <DetailContainer :loading="cargando">
    <template v-if="!cargando">
      <DetailLayout titulo="Editar Usuario">
        <AccionesDetalle>
          <MainButton to="/abm-usuarios" variant="volver" :showIcon="true">
            Volver
          </MainButton>

          <MainButton
            type="submit"
            variant="actualizar"
            :disabled="cargando"
            @click="guardarCambios"
          >
            Guardar
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
            v-if="usuario"
            v-model:form="usuario"
            :editing="true"
            modo="edicion"
            :empresas="empresas"
            @reset-password="onResetPassword"
          />
        </FormularioLayout>
      </DetailLayout>
    </template>
  </DetailContainer>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getUserProfileById, updateUserProfile, getAllUserProfiles } from '@/services/user-profiles'
import { getAllEmpresas } from '@/services/empresas'
import { syncUserMetadata } from '@/services/sync-user-metadata'

import MainButton from '@/components/MainButton.vue'
import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import FormularioLayout from '@/components/layouts/FormularioLayout.vue'
import FormularioUsuario from '@/components/FormularioUsuario.vue'
import AlertMessage from '@/components/AlertMessage.vue'

import { supabase } from '@/services/supabase'

export default {
  name: 'EditarUsuario',
  components: {
    MainButton,
    DetailContainer,
    DetailLayout,
    AccionesDetalle,
    FormularioLayout,
    FormularioUsuario,
    AlertMessage,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const usuario = ref(null)
    const usuarioOriginal = ref(null)
    const cargando = ref(true)

    const feedback = ref('')
    const feedbackType = ref('danger')
    const empresas = ref([])

    // ===== Base URL para Edge Functions =====
    const EDGE_BASE =
      import.meta.env.VITE_SUPABASE_EDGE_URL?.replace(/\/$/, '') ||
      import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')

    if (!EDGE_BASE) {
      console.warn(
        '[BitGuard] No se encontró VITE_SUPABASE_EDGE_URL ni VITE_SUPABASE_URL. ' +
        'Configurá las variables en .env para poder llamar a Edge Functions.'
      )
    }

    const EDGE_FN_RESET_PASSWORD = `${EDGE_BASE}/functions/v1/reset-user-password`

    const cargarUsuario = async () => {
      const id = route.params.id

      if (!id || id === 'undefined') {
        feedback.value = '❌ ID de usuario inválido.'
        cargando.value = false
        return
      }

      try {
        const data = await getUserProfileById(id)
        if (!data) {
          feedback.value = '❌ Usuario no encontrado.'
        } else {
          usuario.value = { ...data }
          usuarioOriginal.value = { ...data }
        }

        empresas.value = await getAllEmpresas()
      } catch (e) {
        feedback.value = '❌ Error al cargar el usuario.'
      } finally {
        cargando.value = false
      }
    }

    const guardarCambios = async () => {
      feedback.value = ''
      feedbackType.value = 'danger'

      const camposObligatorios = ['display_name', 'email', 'empresa_id']
      for (const campo of camposObligatorios) {
        if (!usuario.value[campo] || !usuario.value[campo].toString().trim()) {
          feedback.value = '❌ Completá todos los campos obligatorios.'
          return
        }
      }

      const sinCambios = JSON.stringify(usuario.value) === JSON.stringify(usuarioOriginal.value)
      if (sinCambios) {
        feedbackType.value = 'info'
        feedback.value = 'ℹ️ No realizaste ningún cambio.'
        return
      }

      const todos = await getAllUserProfiles()
      const nombreNuevo = usuario.value.display_name?.trim().toLowerCase()
      const emailNuevo = usuario.value.email?.trim().toLowerCase()

      const nombreEnUso = todos.some(
        u => u.display_name?.trim().toLowerCase() === nombreNuevo && u.id !== usuario.value.id
      )
      if (nombreEnUso) {
        feedback.value = '❌ El nombre ya está en uso por otro usuario.'
        return
      }

      const emailEnUso = todos.some(
        u => u.email?.trim().toLowerCase() === emailNuevo && u.id !== usuario.value.id
      )
      if (emailEnUso) {
        feedback.value = '❌ El email ya está en uso por otro usuario.'
        return
      }

      try {
        await updateUserProfile(usuario.value.id, usuario.value)
        await syncUserMetadata(usuario.value.id, {
          is_admin: usuario.value.is_admin,
          display_name: usuario.value.display_name
        })
        router.push({
          path: '/abm-usuarios',
          query: { success: '✅ Perfil actualizado correctamente' }
        })
      } catch (e) {
        feedback.value = '❌ Error al guardar los cambios.'
      }
    }

  // === Reset de contraseña recibido desde FormularioUsuario ===
  const onResetPassword = async (nuevaClave) => {
    try {
      feedback.value = ''
      feedbackType.value = 'info'

      // Token del admin logueado (opcional: invoke suele enviarlo solo, pero aseguramos)
      const { data: sessionData, error: sErr } = await supabase.auth.getSession()
      if (sErr) throw sErr
      const token = sessionData?.session?.access_token
      if (!token) throw new Error('No se pudo obtener el token de sesión.')

      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { userId: usuario.value.id, newPassword: nuevaClave },
        headers: { Authorization: `Bearer ${token}` } // 👈 importante
      })

      if (error) throw new Error(error.message || 'Fallo al restablecer la contraseña.')

      feedbackType.value = 'success'
      feedback.value = '✅ Contraseña actualizada correctamente.'
    } catch (e) {
      feedbackType.value = 'danger'
      feedback.value = `❌ No se pudo restablecer la contraseña. ${e.message || ''}`
    }
  }


    onMounted(() => {
      cargarUsuario()
    })

    return {
      usuario,
      cargando,
      feedback,
      feedbackType,
      guardarCambios,
      empresas,
      onResetPassword,
    }
  },
}
</script>
