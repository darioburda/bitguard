<template>
  <DetailContainer :loading="loading">
    <template v-if="!loading">
      <DetailLayout titulo="Editar Ticket">
        <AccionesDetalle>
          <MainButton to="/abm-tickets" variant="volver" :showIcon="true">
            Volver
          </MainButton>

          <MainButton
            type="submit"
            variant="actualizar"
            :disabled="loading"
            @click="submitForm"
          >
            Guardar Cambios
          </MainButton>
        </AccionesDetalle>

        <FormularioLayout>
          <template #badges>
            <BadgeEstado
              v-if="estadoOriginal"
              :value="estadoOriginal"
              class="absolute top-2 left-2 z-10"
            />

            <BadgeTicket
              v-if="tipoOriginal"
              :tipo="tipoOriginal"
              :id="ticket.id"
              :variant="estadoOriginal === 'Abierto' ? 'activo' : ''"
              class="absolute top-3 right-3 z-10"
            />
          </template>

          <FormularioTicket
            v-model:ticket="ticket"
            :empresas="empresas"
            :usuarios="usuarios"
            :tecnicos="tecnicos"
            :todos-usuarios="usuarios"
          />
        </FormularioLayout>

        <!-- Historial de actualizaciones -->
        <div v-if="actualizaciones?.length" class="bg-white shadow-md rounded-2xl p-6 border my-6">
          <h2 class="text-lg font-bold mb-4">Historial de Actualizaciones</h2>
          <ul class="space-y-4">
            <li v-for="act in actualizaciones" :key="act.id" class="border-b pb-2">
              <div class="text-sm text-gray-600">
                <strong>{{ act.tecnico_nombre }}</strong> - {{ formatDate(act.created_at) }}
              </div>
              <p class="mt-1 text-gray-800 whitespace-pre-line">{{ act.descripcion }}</p>
              <p class="text-gray-500 italic">
                {{ act.minutos_usados }} min · {{ act.fue_visita ? 'Visita presencial' : 'Remoto' }} · Estado: {{ act.estado_ticket }}
              </p>
            </li>
          </ul>
        </div>

        <!-- Agregar actualización -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4 text-[#01C38E]">Agregar actualización</h2>

          <div class="space-y-4">
            <div>
              <label class="block font-medium mb-1 text-sm">Descripción del trabajo</label>
              <textarea v-model="nuevaActualizacion" rows="3" class="w-full px-4 py-2 border rounded-md text-sm"></textarea>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-medium mb-1 text-sm">Minutos utilizados</label>
                <input type="number" v-model="minutosUsados" class="w-full px-4 py-2 border rounded-md text-sm" min="1" />
              </div>
              <div class="flex items-center mt-6">
                <input type="checkbox" v-model="fueVisita" id="fueVisita" class="accent-[#01C38E] w-5 h-5" />
                <label for="fueVisita" class="ml-2 text-sm">¿Fue una visita presencial?</label>
              </div>
            </div>

            <div class="mt-4 flex gap-4">
              <MainButton
                variant="actualizar"
                @click="agregarActualizacion"
              >
                Guardar actualización
              </MainButton>

              <MainButton
                variant="editar"
                :disabled="!puedeCerrarTicket"
                :class="!puedeCerrarTicket ? 'bg-gray-300 cursor-not-allowed text-white' : ''"
                @click="cerrarTicket"
              >
                Cerrar Ticket
              </MainButton>

            </div>
          </div>
        </div>
      </DetailLayout>
    </template>
  </DetailContainer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import FormularioLayout from '@/components/layouts/FormularioLayout.vue'
import FormularioTicket from '@/components/FormularioTicket.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import MainButton from '@/components/MainButton.vue'
import BadgeTicket from '@/components/BadgeTicket.vue'
import BadgeEstado from '@/components/BadgeEstado.vue'

import {
  getTicketById,
  actualizarTicket,
  getActualizacionesPorTicketId,
  crearActualizacionTicket
} from '@/services/tickets'
import { getAllUserProfiles } from '@/services/user-profiles'
import { getAllEmpresas } from '@/services/empresas'
import { supabase } from '@/services/supabase'

const route = useRoute()
const router = useRouter()

const ticket = ref({})
const tipoOriginal = ref('')
const estadoOriginal = ref('')
const tecnicos = ref([])
const usuarios = ref([])
const empresas = ref([])

const usuarioSeleccionado = ref('')
const feedback = ref('')
const actualizaciones = ref([])
const nuevaActualizacion = ref('')
const minutosUsados = ref(0)
const fueVisita = ref(false)
const loading = ref(true)
const currentUserId = ref('')

const tieneActualizacionPendiente = computed(() =>
  nuevaActualizacion.value.trim().length > 0 && minutosUsados.value > 0
)

const puedeCerrarTicket = computed(() =>
  (ticket.value.estado === 'Abierto' || ticket.value.estado === 'Activo') &&
  (tieneActualizacionPendiente.value || actualizaciones.value.length > 0)
)

const formatDate = (fecha) => {
  if (!fecha) return '—'
  const date = new Date(fecha)
  return isNaN(date) ? 'Fecha inválida' : date.toLocaleString('es-AR')
}

const cargarDatos = async () => {
  try {
    const id = route.params.id
    const { data: session } = await supabase.auth.getUser()
    currentUserId.value = session?.user?.id

    const data = await getTicketById(id)
    ticket.value = data
    tipoOriginal.value = data.tipo
    estadoOriginal.value = data.estado

    const perfiles = await getAllUserProfiles()
    usuarios.value = perfiles
    tecnicos.value = perfiles.filter((u) => u.is_admin)

    const empresasData = await getAllEmpresas()
    empresas.value = empresasData

    const usuario = perfiles.find((u) => u.id === data.usuario_id)
    usuarioSeleccionado.value = usuario?.display_name || usuario?.email || 'Usuario no encontrado'

    actualizaciones.value = await getActualizacionesPorTicketId(id)
  } catch (error) {
    console.error('Error al cargar datos del ticket:', error)
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  try {
    const estado = ticket.value.estado

    if ((estado === 'Activo' || estado === 'Cerrado') && (!ticket.value.tecnico_id || ticket.value.tecnico_id === '')) {
      feedback.value = '❌ Debes asignar un técnico para continuar.'
      return
    }

    await actualizarTicket(ticket.value.id, ticket.value)
    estadoOriginal.value = ticket.value.estado
    tipoOriginal.value = ticket.value.tipo
    feedback.value = '✅ Ticket actualizado correctamente'
    router.push({ name: 'AbmTickets' })
  } catch (error) {
    console.error('[EditarTicket] Error:', error)
    feedback.value = '❌ Error al actualizar ticket'
  }
}

const cerrarTicket = async () => {
  try {
    if (tieneActualizacionPendiente.value) {
      await agregarActualizacion(true)
    }

    await actualizarTicket(ticket.value.id, { estado: 'Cerrado' })
    ticket.value.estado = 'Cerrado'
    estadoOriginal.value = 'Cerrado'
    feedback.value = '✅ Ticket cerrado correctamente'
  } catch (error) {
    console.error('[cerrarTicket] Error:', error)
    feedback.value = '❌ No se pudo cerrar el ticket.'
  }
}

const agregarActualizacion = async (desdeCerrarTicket = false) => {
  if (!tieneActualizacionPendiente.value) {
    if (!desdeCerrarTicket) {
      feedback.value = '❌ Debes completar la descripción y minutos.'
    }
    return
  }

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) throw new Error('Técnico no autenticado')

    const tecnicoActual = user.user.id

    if (!ticket.value.tecnico_id) {
      await actualizarTicket(ticket.value.id, { tecnico_id: tecnicoActual })
      ticket.value.tecnico_id = tecnicoActual
    }

    await crearActualizacionTicket({
      ticket_id: ticket.value.id,
      tecnico_id: tecnicoActual,
      descripcion: nuevaActualizacion.value.trim(),
      minutos_usados: minutosUsados.value,
      fue_visita: fueVisita.value,
      estado_ticket: ticket.value.estado
    })

    nuevaActualizacion.value = ''
    minutosUsados.value = 0
    fueVisita.value = false
    actualizaciones.value = await getActualizacionesPorTicketId(ticket.value.id)
  } catch (error) {
    console.error('[AgregarActualizacion] Error:', error)
    feedback.value = '❌ No se pudo agregar la actualización.'
  }
}

onMounted(cargarDatos)
</script>
