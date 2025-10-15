<!-- ✅ EditarTicket.vue -->
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
            Actualizar
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
            <!-- Izquierda: estado -->
            <BadgeEstado
              v-if="estadoOriginal"
              :value="estadoOriginal"
              class="absolute top-2 left-2 z-10"
            />
            <!-- Derecha: Empresa (izq) + Ticket (der) -->
            <div
              v-if="esEdicion"
              class="absolute top-3 right-3 z-10 flex items-center gap-2"
            >
              <BadgeEmpresa v-if="empresaNombre" :value="empresaNombre" />
              <BadgeTicket
                v-if="tipoOriginal"
                :tipo="tipoOriginal"
                :id="ticket.id"
                :variant="estadoOriginal === 'Abierto' ? 'activo' : ''"
              />
            </div>
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
        <div v-if="actualizaciones?.length" class="bg-white shadow-md rounded-2xl p-6 border my-6">
          <h2 class="text-lg font-bold mb-4">Historial de Actualizaciones</h2>
          <ul class="space-y-4">
            <li
              v-for="act in actualizaciones"
              :key="act.id"
              :class="[
                'border-b pb-2 flex items-start gap-4',
                esSoporte(act) ? 'flex-row' : 'flex-row-reverse justify-between'
              ]"
            >
              <!-- Foto -->
              <img
                :src="act.actor_avatar_url || '/default-avatar.png'"
                class="w-10 h-10 rounded-full border border-gray-300 flex-shrink-0"
                :alt="act.actor_nombre || (esSoporte(act) ? 'Soporte' : 'Usuario')"
              />
              <!-- Contenido -->
              <div :class="['flex-1 text-sm', esSoporte(act) ? 'text-left' : 'text-right']">
                <!-- Encabezado -->
                <div class="text-gray-600">
                  <strong>{{ act.actor_nombre }}</strong> - {{ formatDate(act.created_at) }}
                </div>

                <!-- Casos especiales -->
                <template v-if="act.tipo_evento === 'cambio_tipo_soporte'">
                  <p class="text-blue-600 font-medium mt-1">
                    🛠 Tipo de soporte cambiado a: <strong>{{ act.tipo_soporte }}</strong>
                  </p>
                  <p class="text-gray-600">{{ act.descripcion }}</p>
                </template>

                <template v-else-if="act.tipo_evento === 'cambio_tecnico'">
                  <p class="text-purple-600 font-medium mt-1">
                    👤 Técnico reasignado
                  </p>
                  <p class="text-gray-600">{{ act.descripcion }}</p>
                </template>

                <template v-else-if="act.tipo_evento === 'cierre_ticket'">
                  <p class="text-green-600 font-medium mt-1">
                    ✅ Ticket cerrado
                  </p>
                  <p class="text-gray-600">{{ act.descripcion }}</p>
                </template>

                <!-- General -->
                <template v-else>
                  <p class="mt-1 text-gray-800 whitespace-pre-line inline-block max-w-[80%]">
                    {{ act.descripcion }}
                  </p>
                  <p class="text-gray-500 italic" v-if="act.minutos_usados">
                    {{ act.minutos_usados }} min · {{ act.fue_visita ? 'Visita presencial' : 'Remoto' }} ·
                    Estado: {{ act.estado_ticket }}
                  </p>
                </template>
              </div>
            </li>
          </ul>
        </div>

        
        <!-- Agregar actualización -->
        <div class="bg-white rounded-xl shadow p-6 mb-6 mt-5">
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
                Actualizar
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
import { useRoute, useRouter } from 'vue-router'

import DetailContainer from '@/components/layouts/DetailContainer.vue'
import DetailLayout from '@/components/layouts/DetailLayout.vue'
import FormularioLayout from '@/components/layouts/FormularioLayout.vue'
import FormularioTicket from '@/components/FormularioTicket.vue'
import AccionesDetalle from '@/components/AccionesDetalle.vue'
import MainButton from '@/components/MainButton.vue'
import BadgeTicket from '@/components/BadgeTicket.vue'
import BadgeEstado from '@/components/BadgeEstado.vue'
import BadgeEmpresa from '@/components/BadgeEmpresa.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import ModalConfirmar from '@/components/ModalConfirmar.vue'

import {
  registrarCambiosTicket,
  getTicketById,
  actualizarTicket,
  getActualizacionesPorTicketId,
  crearActualizacionTicket
} from '@/services/tickets'
import { getAllUserProfiles } from '@/services/user-profiles'
import { getAllEmpresas } from '@/services/empresas'
import { supabase } from '@/services/supabase'

// ------------------------------------------------------------------
// state
// ------------------------------------------------------------------
const route = useRoute()
const router = useRouter()

const ticket = ref({})
const tipoOriginal = ref('')
const estadoOriginal = ref('')
const tecnicoOriginal = ref('')

const usuarios = ref([])
const tecnicos = ref([])
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

// ------------------------------------------------------------------
// computed
// ------------------------------------------------------------------
const esEdicion = computed(() => !!ticket.value?.id)

const usuarioActual = computed(() => {
  const uid = ticket.value?.usuario_id
  return (usuarios.value || []).find(u => u.id === uid) || null
})

const empresaNombre = computed(() => {
  if (usuarioActual.value?.empresa_nombre) return usuarioActual.value.empresa_nombre
  const eid = ticket.value?.empresa_id
  const emp = (empresas.value || []).find(e => e.id === eid)
  return emp?.nombre || ''
})

// para decidir si mostrar izq/der (siempre izq si es soporte/admin)
const esSoporte = (act) => {
  if (!act) return false
  if (typeof act.actor_is_admin === 'boolean') return act.actor_is_admin
  const autorId = act.actor_id || act.tecnico_id
  const perfil = (usuarios.value || []).find(u => u.id === autorId)
  return !!perfil?.is_admin
}

const tieneActualizacionPendiente = computed(() =>
  nuevaActualizacion.value.trim().length > 0 &&
  (!esAdmin.value || minutosUsados.value > 0)
)

const puedeCerrarTicket = computed(() =>
  (ticket.value.estado === 'Abierto' || ticket.value.estado === 'Activo') &&
  (tieneActualizacionPendiente.value || actualizaciones.value.length > 0)
)

// ------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------
const formatDate = (fecha) => {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '')
}

function limpiarTicketParaUpdate(t) {
  const {
    empresa_id,
    usuario_id,
    tecnico_id,
    tipo,
    estado,
    titulo,
    descripcion,
    tema_ayuda
  } = t
  return { empresa_id, usuario_id, tecnico_id, tipo, estado, titulo, descripcion, tema_ayuda }
}

// ------------------------------------------------------------------
// actions
// ------------------------------------------------------------------
const volverALista = () => {
  // si querés diferenciar por rol, cambiá el destino
  router.push(esAdmin.value ? '/abm-tickets' : '/mis-tickets')
}

const cargarDatos = async () => {
  try {
    const id = route.params.id

    // rol actual
    const { data: session } = await supabase.auth.getUser()
    const userId = session?.user?.id

    if (userId) {
      const { data: perfil } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()
      esAdmin.value = perfil?.is_admin === true
    } else {
      esAdmin.value = false
    }

    // ticket y originales
    const data = await getTicketById(id)
    ticket.value = data
    tipoOriginal.value = data.tipo
    estadoOriginal.value = data.estado
    tecnicoOriginal.value = data.tecnico_id

    // catálogos
    const perfiles = await getAllUserProfiles()
    usuarios.value = perfiles
    tecnicos.value = perfiles.filter(u => u.is_admin)

    empresas.value = await getAllEmpresas()

    // historial
    actualizaciones.value = await getActualizacionesPorTicketId(id)
  } catch (e) {
    console.error('❌ Error al cargar datos del ticket:', e)
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

    const huboCambioTipo = ticket.value.tipo !== tipoOriginal.value
    const huboCambioTecnico = ticket.value.tecnico_id !== tecnicoOriginal.value

    if (!huboCambioTipo && !huboCambioTecnico) {
      sinCambios.value = true
      tipoCambiado.value = false
      tecnicoCambiado.value = false
      return
    }

    sinCambios.value = false

    // guardrails
    if ((ticket.value.estado === 'Activo' || ticket.value.estado === 'Cerrado') &&
        (!ticket.value.tecnico_id || ticket.value.tecnico_id === '')) {
      alert('❌ Debes asignar un técnico para continuar.')
      return
    }

    await actualizarTicket(ticket.value.id, limpiarTicketParaUpdate(ticket.value))

    // actualizo originales para futuros diffs
    estadoOriginal.value = ticket.value.estado
    tipoOriginal.value = ticket.value.tipo
    tecnicoOriginal.value = ticket.value.tecnico_id

    // registrar eventos (tipo/tecnico/cierre si aplica)
    await registrarCambiosTicket(ticketAnterior, ticket.value, user.id)

    tipoCambiado.value = huboCambioTipo
    tecnicoCambiado.value = huboCambioTecnico

    // refrescar historial
    actualizaciones.value = await getActualizacionesPorTicketId(ticket.value.id)
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
  } catch (error) {
    console.error('[cerrarTicket] Error:', error)
    feedbackActualizacion.value = '❌ No se pudo cerrar el ticket.'
    feedbackTypeActualizacion.value = 'danger'
  }
}

const agregarActualizacion = async (desdeCerrarTicket = false) => {
  feedbackActualizacion.value = ''

  const descVacia = nuevaActualizacion.value.trim().length === 0
  const minutosInvalidos = esAdmin.value && minutosUsados.value <= 0

  if (descVacia) {
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

    // si no hay técnico asignado aún, el que actualiza pasa a serlo
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

    // reset form de actualización
    nuevaActualizacion.value = ''
    minutosUsados.value = 0
    fueVisita.value = false
    if (!desdeCerrarTicket) {
      feedbackActualizacion.value = '✅ Actualización guardada con éxito.'
      feedbackTypeActualizacion.value = 'success'
    }

    // refrescar historial
    actualizaciones.value = await getActualizacionesPorTicketId(ticket.value.id)
  } catch (error) {
    console.error('[AgregarActualizacion] Error:', error)
    const msg = error?.message || ''

    if (msg.includes('Faltan campos obligatorios')) {
      feedbackActualizacion.value = '❌ Faltan campos obligatorios para registrar la actualización.'
    } else if (msg.includes('No se encontró el ticket')) {
      feedbackActualizacion.value = '❌ No se encontró el ticket en la base de datos.'
    } else if (msg.includes('No se encontró el perfil del usuario')) {
      feedbackActualizacion.value = '❌ No se encontró el perfil del usuario asociado.'
    } else if (msg.includes('Error al insertar actualización')) {
      feedbackActualizacion.value = '❌ No se pudo registrar la actualización. Revisa los datos.'
    } else if (msg.includes('Error al actualizar consumo de empresa')) {
      feedbackActualizacion.value = '❌ Se registró la actualización, pero hubo un error al actualizar el consumo de la empresa.'
    } else {
      feedbackActualizacion.value = '❌ No se pudo agregar la actualización. Intenta nuevamente.'
    }

    feedbackTypeActualizacion.value = 'danger'
  }
}

// ------------------------------------------------------------------
onMounted(cargarDatos)
</script>

