<template>
  <DetailContainer :loading="loading">
    <template v-if="!loading">
      <DetailLayout titulo="Editar Ticket">
        <!-- Acciones (solo Volver) -->
        <AccionesDetalle>
          <MainButton to="/mis-tickets" variant="volver" :showIcon="true">
            Volver
          </MainButton>
        </AccionesDetalle>

        <!-- Formulario (solo lectura para user) -->
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
            v-if="ticket?.id"
            class="absolute top-3 right-3 z-10 flex items-center gap-2"
          >
            <BadgeEmpresa
              v-if="empresaNombre"
              :value="empresaNombre"
            />
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
            :tecnicos="usuarios"
            :todos-usuarios="usuarios"
            :es-admin="false"
          >
          </FormularioTicket>
        </FormularioLayout>

        <!-- Historial de actualizaciones -->
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
              <div
                :class="[
                  'flex-1 text-sm',
                  esSoporte(act) ? 'text-left items-start' : 'text-right items-end'
                ]"
              >
                <!-- Encabezado: actor + fecha -->
                <div class="text-gray-600">
                  <strong>{{ act.actor_nombre }}</strong> - {{ formatDate(act.created_at) }}
                </div>

                <!-- ======== Casos especiales (igual que admin) ======== -->
                <!-- Cambio de tipo de soporte -->
                <template v-if="act.tipo_evento === 'cambio_tipo_soporte'">
                  <p class="text-blue-600 font-medium mt-1">
                    🛠 Tipo de soporte cambiado a: <strong>{{ act.tipo_soporte }}</strong>
                  </p>
                  <p class="text-gray-600">{{ act.descripcion }}</p>
                </template>

                <!-- Cambio de técnico -->
                <template v-else-if="act.tipo_evento === 'cambio_tecnico'">
                  <p class="text-purple-600 font-medium mt-1">
                    👤 Técnico reasignado
                  </p>
                  <p class="text-gray-600">{{ act.descripcion }}</p>
                </template>

                <!-- Cierre de ticket (si querés mantenerlo igual que admin) -->
                <template v-else-if="act.tipo_evento === 'cierre_ticket'">
                  <p class="text-green-600 font-medium mt-1">
                    ✅ Ticket cerrado
                  </p>
                  <p class="text-gray-600">{{ act.descripcion }}</p>
                </template>

                <!-- ======== Caso general (actualización normal) ======== -->
                <template v-else>
                  <!-- Burbuja de texto -->
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

          <!-- Feedback -->
          <div ref="alertRef">
            <AlertMessage
              v-if="feedbackActualizacion"
              :message="feedbackActualizacion"
              :type="feedbackTypeActualizacion"
              :autoDismiss="feedbackTypeActualizacion !== 'danger'"
              class="mb-4"
              @dismiss="feedbackActualizacion = ''"
            />
          </div>

          <div class="space-y-4">
            <div>
              <label class="block font-medium mb-1 text-sm">Descripción del trabajo</label>
              <textarea
                v-model="nuevaActualizacion"
                rows="3"
                class="w-full px-4 py-2 border rounded-md text-sm"
              ></textarea>
            </div>

            <!-- Solo Guardar actualización -->
            <div class="mt-4 flex gap-4">
              <MainButton variant="actualizar" @click="agregarActualizacion">
                Actualizar
              </MainButton>
            </div>
          </div>
        </div>
      </DetailLayout>
    </template>
  </DetailContainer>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
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
import BadgeEmpresa from '@/components/BadgeEmpresa.vue'

import {
  getTicketById,
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
const usuarios = ref([])
const empresas = ref([])
const actualizaciones = ref([])

const nuevaActualizacion = ref('')
const loading = ref(true)

// Feedback + scroll
const feedbackActualizacion = ref('')
const feedbackTypeActualizacion = ref('')
const alertRef = ref(null)

// ✅ técnicos derivados de usuarios (evita undefined en el hijo)
const tecnicos = computed(() =>
  (usuarios.value || []).filter(u => u.is_admin) // ajustá si tu flag de soporte es otro
)

const tieneActualizacionPendiente = computed(() => nuevaActualizacion.value.trim().length > 0)

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

// Muestra SIEMPRE a la izquierda a cualquiera que sea soporte/admin,
// incluso si después reasignaste el ticket.
const esSoporte = (act) => {
  if (!act) return false

  // 1) Si viene marcado desde el backend, usarlo
  if (typeof act.actor_is_admin === 'boolean') {
    return act.actor_is_admin
  }

  // 2) Fallback: buscar el rol del autor en memoria
  const autorId = act.actor_id || act.tecnico_id
  const perfil = (usuarios.value || []).find(u => u.id === autorId)
  return !!perfil?.is_admin
}

const cargarDatos = async () => {
  try {
    const id = route.params.id

    const data = await getTicketById(id)
    ticket.value = data
    tipoOriginal.value = data.tipo
    estadoOriginal.value = data.estado

    usuarios.value = await getAllUserProfiles()
    empresas.value = await getAllEmpresas()

    // getActualizacionesPorTicketId debe devolver: tecnico_id, actor_nombre, actor_avatar_url, actor_is_admin
    actualizaciones.value = await getActualizacionesPorTicketId(id)
  } catch (error) {
    console.error('[EditarTicketUser] Error al cargar datos:', error)
  } finally {
    loading.value = false
  }
}

const scrollToAlert = async () => {
  await nextTick()
  alertRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const agregarActualizacion = async () => {
  // Validación: solo descripción obligatoria (usuario común)
  if (!tieneActualizacionPendiente.value) {
    feedbackActualizacion.value = '❌ Debes completar la descripción del trabajo.'
    feedbackTypeActualizacion.value = 'danger'
    await scrollToAlert()
    return
  }

  try {
    const { data: session } = await supabase.auth.getUser()
    const autor = session?.user?.id
    if (!autor) throw new Error('Usuario no autenticado')

    await crearActualizacionTicket({
      ticket_id: ticket.value.id,
      tecnico_id: autor,                 // autor de la actualización (sea user o admin)
      descripcion: nuevaActualizacion.value.trim(),
      minutos_usados: 0,                 // no aplica para user
      fue_visita: false,                 // no aplica para user
      estado_ticket: ticket.value.estado
    })

    // Reset + feedback success
    nuevaActualizacion.value = ''
    feedbackActualizacion.value = '✅ Actualización guardada con éxito.'
    feedbackTypeActualizacion.value = 'success'
    await scrollToAlert()

    // Refrescar historial
    actualizaciones.value = await getActualizacionesPorTicketId(ticket.value.id)
  } catch (error) {
    console.error('[EditarTicketUser] Error al guardar actualización:', error)
    feedbackActualizacion.value = '❌ No se pudo agregar la actualización.'
    feedbackTypeActualizacion.value = 'danger'
    await scrollToAlert()
  }
}
const usuarioActual = computed(() => {
  const uid = ticket.value?.usuario_id
  return (usuarios.value || []).find(u => u.id === uid) || null
})

const empresaNombre = computed(() => {
  // 1) si el perfil del usuario ya trae el nombre de empresa, usarlo
  if (usuarioActual.value?.empresa_nombre) return usuarioActual.value.empresa_nombre

  // 2) fallback por empresa_id del ticket
  const eid = ticket.value?.empresa_id
  const emp = (empresas.value || []).find(e => e.id === eid)
  return emp?.nombre || ''
})

onMounted(cargarDatos)
</script>
