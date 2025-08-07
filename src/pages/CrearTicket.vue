<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import FormularioLayout from '@/components/layouts/FormularioLayout.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import MainButton from '@/components/MainButton.vue'
import FormularioTicket from '@/components/FormularioTicket.vue'

import { getAllEmpresas } from '@/services/empresas'
import { getAllUserProfiles } from '@/services/user-profiles'
import { crearTicket } from '@/services/tickets'

const router = useRouter()

const cargando = ref(false)
const feedback = ref('')
const feedbackType = ref('danger')

const empresas = ref([])
const usuarios = ref([])
const todosUsuarios = ref([])
const tecnicos = ref([])
const esAdmin = ref(false)

const ticket = ref({
  empresa_id: '',
  tipo: 'Remoto',
  titulo: '',
  tema_ayuda: '',
  descripcion: '',
  usuario_id: '',
  tecnico_id: null // ✅ corregido: null en lugar de string vacía
})

const cargarDatos = async () => {
  cargando.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const perfil = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    esAdmin.value = perfil.data?.is_admin || false

    const perfiles = await getAllUserProfiles()
    todosUsuarios.value = perfiles
    tecnicos.value = perfiles.filter(u => u.is_admin)

    if (esAdmin.value) {
      empresas.value = await getAllEmpresas()
      usuarios.value = []
    } else {
      const usuario = perfil.data
      ticket.value.usuario_id = usuario.id
      ticket.value.empresa_id = usuario.empresa_id
    }

  } catch (error) {
    console.error(error)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)

const filtrarUsuariosPorEmpresa = () => {
  if (!ticket.value.empresa_id) {
    usuarios.value = []
    ticket.value.usuario_id = ''
    return
  }
  usuarios.value = todosUsuarios.value.filter(u => u.empresa_id === ticket.value.empresa_id)
  ticket.value.usuario_id = ''
  feedback.value = ''
}

watch(() => ticket.value.empresa_id, filtrarUsuariosPorEmpresa)

const guardarTicket = async () => {
  feedback.value = ''
  feedbackType.value = 'danger'

  if (esAdmin.value && !ticket.value.empresa_id) {
    feedback.value = '❌ Debes seleccionar una empresa.'
    return
  }

  if (esAdmin.value && !ticket.value.usuario_id) {
    feedback.value = '❌ Debes seleccionar un usuario solicitante.'
    return
  }

  if (!ticket.value.tema_ayuda || !ticket.value.tema_ayuda.trim()) {
    feedback.value = '❌ Debes seleccionar o especificar un tema de ayuda.'
    return
  }

  if (!ticket.value.titulo || !ticket.value.titulo.trim()) {
    feedback.value = '❌ Debes ingresar un título para el ticket.'
    return
  }

  if (!ticket.value.descripcion || !ticket.value.descripcion.trim()) {
    feedback.value = '❌ Debes ingresar una descripción.'
    return
  }

  if (esAdmin.value && !ticket.value.tipo) {
    feedback.value = '❌ Debes seleccionar un tipo de soporte.'
    return
  }

  cargando.value = true
  try {
    const payload = {
      ...ticket.value,
      tecnico_id: ticket.value.tecnico_id || null,
      estado: ticket.value.tecnico_id ? 'Activo' : 'Abierto',
    }

    await crearTicket(payload)

    feedbackType.value = 'success'
    feedback.value = '✅ Ticket creado correctamente'

    const destino = esAdmin.value ? 'AbmTickets' : 'MisTickets'
    router.push({ name: destino })
  } catch (error) {
    console.error(error)
    feedback.value = '❌ Error al crear ticket'
  } finally {
    cargando.value = false
  }
}

</script>

<template>
  <DetailContainer :loading="cargando">
    <DetailLayout titulo="Crear Ticket">
      <AccionesDetalle>
        <MainButton
          :to="esAdmin ? '/abm-tickets' : '/mis-tickets'"
          variant="volver"
          :showIcon="true"
        >
          Volver
        </MainButton>

        <MainButton
          variant="actualizar"
          :disabled="cargando"
          @click="guardarTicket"
        >
          Crear Ticket
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

        <FormularioTicket
          v-model:ticket="ticket"
          :empresas="empresas"
          :usuarios="usuarios"
          :tecnicos="tecnicos"
          :todos-usuarios="todosUsuarios"
          :es-admin="esAdmin"
        />
      </FormularioLayout>
    </DetailLayout>
  </DetailContainer>
</template>
