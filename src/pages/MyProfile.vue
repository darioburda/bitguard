<template>
  <DetailContainer :loading="loading">
    <DetailLayout titulo="Mi perfil">
      <AccionesDetalle>
        <template #default>
          <MainButton variant="editar" to="/mi-perfil/editar">
            Editar perfil
          </MainButton>

          <MainButton
            v-if="esAdmin"
            variant="actualizar"
            @click="actualizarMetadatos"
          >
            Sinc
          </MainButton>
        </template>

        <template #feedback>
          <AlertMessage
            v-if="feedback"
            :message="feedback"
            :type="feedbackType"
            @dismiss="feedback = ''"
          />
        </template>
      </AccionesDetalle>

      <CardProfile
        :user="user"
        :empresa="empresa"
        :mostrar-consumo="mostrarConsumo"
        :mostrar-boton="mostrarBoton"
        :mostrar-animacion="mostrarAnimacion"
        @toggle-consumo="mostrarConsumo = !mostrarConsumo"
      />
    </DetailLayout>

    <ChatBitButton />
  </DetailContainer>
</template>

<script>
import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import CardProfile from '@/components/CardProfile.vue'
import MainButton from '@/components/MainButton.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import ChatBitButton from '@/components/ChatBitButton.vue'

import { subscribeToAuthState } from '@/services/auth'
import { getUserProfileById } from '@/services/user-profiles'
import { getEmpresaConResumen } from '@/services/empresas'
import { supabase } from '@/services/supabase'

export default {
  name: 'MyProfile',
  components: {
    DetailContainer,
    DetailLayout,
    AccionesDetalle,
    CardProfile,
    MainButton,
    AlertMessage,
    ChatBitButton
  },
  data() {
    return {
      user: {
        id: null,
        email: null,
        display_name: null,
        sector: null,
        equipo: null,
        rustdesk: null,
        interno_telefono: null,
        photo: null
      },
      loading: true,
      empresa: null,
      tickets: [],
      mostrarBoton: false,
      mostrarAnimacion: false,
      mostrarConsumo: false,
      feedback: '',
      feedbackType: 'success',
      esAdmin: false
    }
  },
  methods: {
    async actualizarMetadatos() {
      try {
        const { id, email, display_name } = this.user
        const { error } = await supabase.auth.updateUser({
          data: {
            is_admin: true,
            display_name
          }
        })

        if (error) throw error

        this.feedback = '✅ Metadatos sincronizados correctamente.'
        this.feedbackType = 'success'
      } catch (err) {
        console.error('❌ Error al sincronizar metadatos:', err)
        this.feedback = '❌ No se pudo sincronizar metadatos.'
        this.feedbackType = 'error'
      }
    }
  },
  mounted() {
    // Feedback desde sesión
    this.feedback = sessionStorage.getItem('perfil_feedback') || ''
    this.feedbackType = sessionStorage.getItem('feedback_type') || 'success'
    sessionStorage.removeItem('perfil_feedback')
    sessionStorage.removeItem('feedback_type')

    subscribeToAuthState(async (sessionUser) => {
      if (sessionUser?.id) {
        try {
          const profile = await getUserProfileById(sessionUser.id)
          this.user = { ...sessionUser, ...profile }
          this.esAdmin = !!profile.is_admin

          const empresaConResumen = await getEmpresaConResumen(profile.empresa_id)
          this.empresa = empresaConResumen

          const { data: misTickets } = await supabase
            .from('tickets')
            .select('*')
            .eq('usuario_id', profile.id)
            .order('created_at', { ascending: false })

          this.tickets = misTickets
        } catch (error) {
          console.error('❌ Error al cargar datos de perfil extendido:', error)
        } finally {
          this.loading = false
        }
      } else {
        this.loading = false
      }

      setTimeout(() => {
        this.mostrarAnimacion = false
        void document.querySelector('.floating-icon')?.offsetWidth
        this.mostrarAnimacion = true
        setTimeout(() => (this.mostrarAnimacion = false), 1800)
      }, 1800)

      setTimeout(() => {
        this.mostrarBoton = true
      }, 1500)
    })
  }
}
</script>
