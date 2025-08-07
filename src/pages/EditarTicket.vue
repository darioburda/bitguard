<template>
  <DetailContainer :loading="loading">
    <template v-if="!loading">
      <DetailLayout titulo="Editar Ticket">
        <!-- Acciones -->
        <AccionesDetalle>
          <MainButton @click="volverALista" variant="volver" :showIcon="true">
            Volver
          </MainButton>

          <MainButton
            v-if="esAdmin"
            type="submit"
            variant="actualizar"
            :disabled="loading"
            @click="submitForm"
          >
            Guardar Cambios
          </MainButton>
        </AccionesDetalle>

        <!-- Feedbacks -->
        <AlertMessage
          v-if="tipoCambiado"
          message="Cambiaste el tipo de soporte con éxito."
          type="success"
          :autoDismiss="true"
          class="mb-4"
          @dismiss="tipoCambiado = false"
        />
        <AlertMessage
          v-if="sinCambios"
          message="No se realizó ningún cambio para guardar."
          type="danger"
          :autoDismiss="true"
          class="mb-4"
          @dismiss="sinCambios = false"
        />
                <AlertMessage
          v-if="tecnicoCambiado"
          message="Cambiaste el técnico asignado con éxito."
          type="success"
          :autoDismiss="true"
          class="mb-4"
          @dismiss="tecnicoCambiado = false"
        />

        <!-- Formulario ticket -->
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
            :es-admin="esAdmin"
          />
        </FormularioLayout>

        <!-- Historial -->
<!-- Historial -->
<div
  v-if="actualizaciones?.length"
  class="bg-white shadow-md rounded-2xl p-6 border my-6"
>
  <h2 class="text-lg font-bold mb-4">Historial de Actualizaciones</h2>
  <ul class="space-y-4">
    <li
      v-for="act in actualizaciones"
      :key="act.id"
      class="border-b pb-3 text-sm"
    >
      <div class="text-gray-500 mb-1">
        {{ formatDate(act.created_at) }}
      </div>

      <template v-if="act.tipo_evento === 'actualizacion'">
        <p class="font-semibold text-gray-800">
          {{ act.tecnico_nombre }} actualizó el ticket
        </p>
        <p class="text-gray-700 whitespace-pre-line mt-1">{{ act.descripcion }}</p>
        <p class="text-gray-500 italic mt-1">
          {{ act.minutos_usados }} min · {{ act.fue_visita ? 'Visita presencial' : 'Remoto' }} · Estado: {{ act.estado_ticket }}
        </p>
      </template>

      <template v-else-if="act.tipo_evento === 'cambio_tipo_soporte'">
        <p class="text-blue-600 font-medium">
          🛠 Tipo de soporte cambiado a: <strong>{{ act.tipo_soporte }}</strong>
        </p>
        <p class="text-gray-600">{{ act.descripcion }}</p>
      </template>

      <template v-else-if="act.tipo_evento === 'cambio_tecnico'">
        <p class="text-purple-600 font-medium">
          👤 Técnico reasignado
        </p>
        <p class="text-gray-600">{{ act.descripcion }}</p>
      </template>

      <template v-else-if="act.tipo_evento === 'cierre_ticket'">
        <p class="text-green-600 font-medium">
          ✅ Ticket cerrado
        </p>
        <p class="text-gray-600">{{ act.descripcion }}</p>
      </template>

      <template v-else>
        <p class="text-gray-500">📌 Evento: {{ act.tipo_evento }}</p>
        <p class="text-gray-600">{{ act.descripcion }}</p>
      </template>
    </li>
  </ul>
</div>


      <!-- Agregar actualización -->
      <div class="bg-white rounded-xl shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4 text-[#01C38E]">Agregar actualización</h2>

        <!-- Mensaje unificado -->
        <AlertMessage
          v-if="feedbackActualizacion"
          :message="feedbackActualizacion"
          :type="feedbackTypeActualizacion"
          :autoDismiss="feedbackTypeActualizacion === 'success'" 
          :dismissible="feedbackTypeActualizacion !== 'danger'" 
          class="mb-4"
          @dismiss="feedbackActualizacion = ''"
        />


        <div class="space-y-4">
          <div>
            <label class="block font-medium mb-1 text-sm">Descripción del trabajo</label>
            <textarea
              v-model="nuevaActualizacion"
              rows="3"
              class="w-full px-4 py-2 border rounded-md text-sm"
            ></textarea>
          </div>

          <div v-if="esAdmin" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-medium mb-1 text-sm">Minutos utilizados</label>
              <input
                type="number"
                v-model="minutosUsados"
                class="w-full px-4 py-2 border rounded-md text-sm"
                min="1"
              />
            </div>
            <div class="flex items-center mt-6">
              <input
                type="checkbox"
                v-model="fueVisita"
                id="fueVisita"
                class="accent-[#01C38E] w-5 h-5"
              />
              <label for="fueVisita" class="ml-2 text-sm">¿Fue una visita presencial?</label>
            </div>
          </div>

          <div class="mt-4 flex gap-4">
            <MainButton variant="actualizar" @click="agregarActualizacion">
              Guardar actualización
            </MainButton>

            <MainButton
              v-if="esAdmin"
              variant="editar"
              :disabled="!puedeCerrarTicket"
              :class="!puedeCerrarTicket ? 'bg-gray-300 cursor-not-allowed text-white' : ''"
              @click="mostrarModalCerrar = true"
            >
              Cerrar Ticket
            </MainButton>
          </div>
        </div>
      </div>

      
    </DetailLayout>
  </template>
  <!-- Modal Confirmar Cierre -->
<ModalConfirmar
  v-if="mostrarModalCerrar"
  :titulo="'Cerrar Ticket'"
  :mensaje="`¿Estás seguro que deseas cerrar el ticket <strong>#${ticket.id?.slice(-8)}</strong>?`"
  @confirmar="cerrarTicket"
  @cancelar="mostrarModalCerrar = false"
/>

  </DetailContainer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import FormularioLayout from '@/components/layouts/FormularioLayout.vue'
import FormularioTicket from '@/components/FormularioTicket.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import MainButton from '@/components/MainButton.vue'
import BadgeTicket from '@/components/BadgeTicket.vue'
import BadgeEstado from '@/components/BadgeEstado.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import ModalConfirmar from '@/components/ModalConfirmar.vue'
import { registrarCambiosTicket } from '@/services/tickets'

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

const ticket = ref({})
const tipoOriginal = ref('')
const estadoOriginal = ref('')
const tecnicoOriginal = ref('')
const tecnicos = ref([])
const usuarios = ref([])
const empresas = ref([])
const actualizaciones = ref([])
const nuevaActualizacion = ref('')
const minutosUsados = ref(0)
const fueVisita = ref(false)
const loading = ref(true)
const esAdmin = ref(false)

const feedbackActualizacion = ref('')
const feedbackTypeActualizacion = ref('danger')

const tipoCambiado = ref(false)
const tecnicoCambiado = ref(false)
const sinCambios = ref(false)

const mostrarModalCerrar = ref(false)

const tieneActualizacionPendiente = computed(() =>
  nuevaActualizacion.value.trim().length > 0 && (!esAdmin.value || minutosUsados.value > 0)
)

const puedeCerrarTicket = computed(() =>
  (ticket.value.estado === 'Abierto' || ticket.value.estado === 'Activo') &&
  (tieneActualizacionPendiente.value || actualizaciones.value.length > 0)
)

const volverALista = () => {}

const formatDate = (fecha) => {
  if (!fecha) return '—'
  const date = new Date(fecha)
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '')
}

function limpiarTicketParaUpdate(ticket) {
  const {
    empresa_id,
    usuario_id,
    tecnico_id,
    tipo,
    estado,
    titulo,
    descripcion,
    tema_ayuda
  } = ticket
  return { empresa_id, usuario_id, tecnico_id, tipo, estado, titulo, descripcion, tema_ayuda }
}

const cargarDatos = async () => {
  try {
    const id = route.params.id

    const { data: session } = await supabase.auth.getUser()
    const user = session?.user

    const { data: perfil } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    esAdmin.value = perfil?.is_admin === true

    console.log('[DEBUG] perfil:', perfil)
    console.log('[DEBUG] esAdmin:', esAdmin.value)

    const data = await getTicketById(id)
    ticket.value = data
    tipoOriginal.value = data.tipo
    estadoOriginal.value = data.estado
    tecnicoOriginal.value = data.tecnico_id

    const perfiles = await getAllUserProfiles()
    usuarios.value = perfiles
    tecnicos.value = perfiles.filter((u) => u.is_admin)

    empresas.value = await getAllEmpresas()
    actualizaciones.value = await getActualizacionesPorTicketId(id)

    console.log('[DEBUG] cargarDatos - actualizaciones:', actualizaciones.value)
  } catch (error) {
    console.error('❌ Error al cargar datos del ticket:', error)
  } finally {
    loading.value = false
  }
}


const submitForm = async () => {
  try {
    const { data: session } = await supabase.auth.getUser()
    const user = session?.user
    if (!user) throw new Error('Usuario no autenticado')

    const ticketAnterior = {
      ...ticket.value,
      tipo: tipoOriginal.value,
      estado: estadoOriginal.value,
      tecnico_id: tecnicoOriginal.value
    }

    console.log('[DEBUG] submitForm - tipo anterior:', ticketAnterior.tipo)
    console.log('[DEBUG] submitForm - tipo actual:', ticket.value.tipo)

    const huboCambioTipo = ticket.value.tipo !== tipoOriginal.value
    const huboCambioTecnico = ticket.value.tecnico_id !== tecnicoOriginal.value

    if (!huboCambioTipo && !huboCambioTecnico) {
      sinCambios.value = true
      tipoCambiado.value = false
      tecnicoCambiado.value = false
      return
    }

    sinCambios.value = false

    if ((ticket.value.estado === 'Activo' || ticket.value.estado === 'Cerrado') &&
      (!ticket.value.tecnico_id || ticket.value.tecnico_id === '')) {
      alert('❌ Debes asignar un técnico para continuar.')
      return
    }

    await actualizarTicket(ticket.value.id, limpiarTicketParaUpdate(ticket.value))

    estadoOriginal.value = ticket.value.estado
    tipoOriginal.value = ticket.value.tipo
    tecnicoOriginal.value = ticket.value.tecnico_id

    await registrarCambiosTicket(ticketAnterior, ticket.value, user.id)

    tipoCambiado.value = huboCambioTipo
    tecnicoCambiado.value = huboCambioTecnico

    actualizaciones.value = await getActualizacionesPorTicketId(ticket.value.id)
    console.log('[DEBUG] submitForm - actualizaciones luego de guardar:', actualizaciones.value)

  } catch (error) {
    console.error('[EditarTicket] Error:', error)
    alert('❌ Error al actualizar ticket')
  }
}

const cerrarTicket = async () => {
  try {
    mostrarModalCerrar.value = false
    if (tieneActualizacionPendiente.value) {
      await agregarActualizacion(true)
    }

    const estadoAnterior = ticket.value.estado
    const nuevoEstado = 'Cerrado'

    await actualizarTicket(ticket.value.id, { estado: nuevoEstado })
    ticket.value.estado = nuevoEstado
    estadoOriginal.value = nuevoEstado

    const { data: session } = await supabase.auth.getUser()
    const userId = session?.user?.id

    await registrarCambiosTicket(
      { ...ticket.value, estado: estadoAnterior },
      { ...ticket.value, estado: nuevoEstado },
      userId,
      'cierre_ticket'
    )

    feedbackActualizacion.value = '✅ Ticket cerrado correctamente.'
    feedbackTypeActualizacion.value = 'success'
    actualizaciones.value = await getActualizacionesPorTicketId(ticket.value.id)
    console.log('[DEBUG] cerrarTicket - actualizaciones:', actualizaciones.value)

  } catch (error) {
    console.error('[cerrarTicket] Error:', error)
    feedbackActualizacion.value = '❌ No se pudo cerrar el ticket.'
    feedbackTypeActualizacion.value = 'danger'
  }
}

const agregarActualizacion = async (desdeCerrarTicket = false) => {
  feedbackActualizacion.value = ''
  const descripcionVacia = nuevaActualizacion.value.trim().length === 0
  const minutosInvalidos = esAdmin.value && minutosUsados.value <= 0

  if (descripcionVacia) {
    feedbackActualizacion.value = '❌ Debes completar la descripción del trabajo.'
    feedbackTypeActualizacion.value = 'danger'
    return
  }

  if (minutosInvalidos) {
    feedbackActualizacion.value = '❌ Debes asignar los minutos al trabajo realizado.'
    feedbackTypeActualizacion.value = 'danger'
    return
  }

  try {
    const { data: session } = await supabase.auth.getUser()
    const tecnicoActual = session?.user?.id
    if (!tecnicoActual) throw new Error('Técnico no autenticado')

    if (!ticket.value.tecnico_id) {
      await actualizarTicket(ticket.value.id, { tecnico_id: tecnicoActual })
      ticket.value.tecnico_id = tecnicoActual
    }

    await crearActualizacionTicket({
      ticket_id: ticket.value.id,
      tecnico_id: tecnicoActual,
      descripcion: nuevaActualizacion.value.trim(),
      minutos_usados: esAdmin.value ? minutosUsados.value : 0,
      fue_visita: esAdmin.value ? fueVisita.value : false,
      estado_ticket: ticket.value.estado,
      tipo_evento: 'actualizacion',
      tipo_soporte: ticket.value.tipo
    })

    nuevaActualizacion.value = ''
    minutosUsados.value = 0
    fueVisita.value = false
    feedbackActualizacion.value = ''
    actualizaciones.value = await getActualizacionesPorTicketId(ticket.value.id)
    console.log('[DEBUG] agregarActualizacion - actualizaciones:', actualizaciones.value)

  } catch (error) {
    console.error('[AgregarActualizacion] Error:', error)

    const mensaje = error?.message || ''
    if (mensaje.includes('Faltan campos obligatorios')) {
      feedbackActualizacion.value = '❌ Faltan campos obligatorios para registrar la actualización.'
    } else if (mensaje.includes('No se encontró el ticket')) {
      feedbackActualizacion.value = '❌ No se encontró el ticket en la base de datos.'
    } else if (mensaje.includes('No se encontró el perfil del usuario')) {
      feedbackActualizacion.value = '❌ No se encontró el perfil del usuario asociado.'
    } else if (mensaje.includes('Error al insertar actualización')) {
      feedbackActualizacion.value = '❌ No se pudo registrar la actualización. Revisa los datos.'
    } else if (mensaje.includes('Error al actualizar consumo de empresa')) {
      feedbackActualizacion.value = '❌ Se registró la actualización, pero hubo un error al actualizar el consumo de la empresa.'
    } else {
      feedbackActualizacion.value = '❌ No se pudo agregar la actualización. Intenta nuevamente.'
    }

    feedbackTypeActualizacion.value = 'danger'
  }
}

onMounted(cargarDatos)
</script>








