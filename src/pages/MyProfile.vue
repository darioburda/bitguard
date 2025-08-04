<template>
  <DetailContainer :loading="loading">
    <DetailLayout titulo="Mi perfil">
      <AccionesDetalle>
        <template #default>
          <MainButton variant="editar" to="/mi-perfil/editar">
            Editar perfil
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
  </DetailContainer>
</template>

<script>
import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import CardProfile from '@/components/CardProfile.vue'
import MainButton from '@/components/MainButton.vue'
import AlertMessage from '@/components/AlertMessage.vue'
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
        photo: null,
      },
      loading: true,
      empresa: null,
      tickets: [],
      mostrarBoton: false,
      mostrarAnimacion: false,
      mostrarConsumo: false,
      feedback: '',
      feedbackType: 'success',
    }
  },
  mounted() {
    // Mensaje de feedback (si existe)
    this.feedback = sessionStorage.getItem('perfil_feedback') || ''
    this.feedbackType = sessionStorage.getItem('feedback_type') || 'success'
    sessionStorage.removeItem('perfil_feedback')
    sessionStorage.removeItem('feedback_type')

    subscribeToAuthState(async (sessionUser) => {
      if (sessionUser?.id) {
        try {
          const profile = await getUserProfileById(sessionUser.id)
          this.user = { ...sessionUser, ...profile }

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
  },
}
</script>
