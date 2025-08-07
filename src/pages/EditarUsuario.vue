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
          usuarioOriginal.value = { ...data } // copia para comparar cambios
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
    }
  },
}
</script>
