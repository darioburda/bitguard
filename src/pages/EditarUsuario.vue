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
          <div
            v-if="error"
            class="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded"
          >
            {{ error }}
          </div>

          <FormularioUsuario
            v-if="usuario"
            v-model:form="usuario"
            :editing="false"
            modo="edicion"
          />
        </FormularioLayout>
      </DetailLayout>
    </template>
  </DetailContainer>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserProfileById, updateUserProfile } from '@/services/user-profiles'

import MainButton from '@/components/MainButton.vue'
import MainLoader from '@/components/MainLoader.vue'
import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import FormularioLayout from '@/components/layouts/FormularioLayout.vue'
import FormularioUsuario from '@/components/FormularioUsuario.vue'

export default {
  name: 'EditarUsuario',
  components: {
    MainButton,
    MainLoader,
    DetailContainer,
    DetailLayout,
    AccionesDetalle,
    FormularioLayout,
    FormularioUsuario,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const usuario = ref(null)
    const cargando = ref(true)
    const error = ref('')

    const cargarUsuario = async () => {
      const id = route.params.id

      if (!id || id === 'undefined') {
        error.value = 'ID de usuario inválido.'
        cargando.value = false
        return
      }

      try {
        const data = await getUserProfileById(id)
        if (!data) {
          error.value = 'Usuario no encontrado.'
        } else {
          usuario.value = data
        }
      } catch (e) {
        error.value = 'Error al cargar el usuario.'
      } finally {
        cargando.value = false
      }
    }

    const guardarCambios = async () => {
      try {
        await updateUserProfile(usuario.value.id, usuario.value)
        router.push({ path: '/abm-usuarios', query: { success: '✅ Perfil actualizado correctamente' } })
      } catch (e) {
        error.value = '❌ Error al guardar los cambios.'
      }
    }

    onMounted(() => {
      cargarUsuario()
    })

    return {
      usuario,
      cargando,
      error,
      guardarCambios,
    }
  },
}
</script>
