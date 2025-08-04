<template>
  <PageContainer :loading="loading">
    <AlertMessage
      v-if="feedback"
      :message="feedback"
      type="success"
      auto-dismiss
      @dismiss="feedback = ''"
    />

    <AbmLayout titulo="Gestión de Tickets">
      <!-- Acciones -->
      <template #acciones>
        <Acciones
          nombreEntidad="Ticket"
          :seleccionados="ticketsSeleccionados"
          @agregar="router.push('/tickets/crear')"
          @editar="irAEditar"
          @borrar="abrirModalEliminarMultiple"
          @deseleccionarTodos="ticketsSeleccionados.clear()"
        />
      </template>

      <!-- Filtros -->
      <template #filtros>
        <FiltrosEntidad
          entidad="ticket"
          :busqueda="busqueda"
          :empresaSeleccionada="empresaSeleccionada"
          :estadoSeleccionado="estadoSeleccionado"
          :tipoSeleccionado="tipoSeleccionado"
          :empresas="empresasDisponibles"
          :estados="estadosDisponibles"
          :tipos="tiposDisponibles"
          @update:busqueda="busqueda = $event"
          @update:empresa="empresaSeleccionada = $event"
          @update:estado="estadoSeleccionado = $event"
          @update:tipo="tipoSeleccionado = $event"
        />
      </template>
    </AbmLayout>

    <!-- Grilla de tickets -->
    <GridLayout :columnas="4" :vacio="ticketsVisibles.length === 0" entidad="ticket">
      <CardTicket
        v-for="ticket in ticketsVisibles"
        :key="ticket.id"
        :ticket="ticket"
        :seleccionados="ticketsSeleccionados"
        @toggle-seleccion="toggleSeleccion"
        @tomar="abrirModalTomar"
        :class="{ 'tarjeta-animada': animarTarjetas }"
      />

      <div v-if="ticketsVisibles.length === 0" :key="'placeholder'" class="invisible h-0">.</div>
    </GridLayout>

    <!-- Paginador -->
    <Paginador
      v-if="totalPaginas > 1"
      :paginaActual="paginaActual"
      :totalPaginas="totalPaginas"
      @primero="paginaActual = 1"
      @anterior="paginaActual = Math.max(1, paginaActual - 1)"
      @siguiente="paginaActual = Math.min(totalPaginas, paginaActual + 1)"
      @ultimo="paginaActual = totalPaginas"
      @ir-a="paginaActual = $event"
    />

    <!-- Modal Confirmar -->
    <Modal
      :show="modalVisible"
      :nombre="ticketSeleccionado?.id"
      :accion="'tomar el ticket'"
      @cancelar="modalVisible = false"
      @confirmar="tomarTicket"
    />

    <!-- Modal Eliminar -->
    <Modal
      :show="mostrarModalEliminar"
      :eliminar="true"
      :cantidad="ticketsSeleccionados.size"
      :nombre="nombreSeleccionado"
      entidad="ticket"
      @cancelar="cerrarModalEliminarMultiple"
      @confirmar="eliminarTicketsSeleccionados"
    />
    <ChatBitButton />

  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import { getAllTickets, eliminarTicket, actualizarTicket } from '@/services/tickets'
import { getEmpresas } from '@/services/empresas'
import { useLoader } from '@/composables/useLoader.js'

import PageContainer from '@/components/layouts/PageContainer.vue'
import AbmLayout from '@/components/layouts/AbmLayout.vue'
import GridLayout from '@/components/layouts/GridLayout.vue'
import Paginador from '@/components/Paginador.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import Modal from '@/components/Modal.vue'
import FiltrosEntidad from '@/components/FiltrosEntidad.vue'
import Acciones from '@/components/Acciones.vue'
import CardTicket from '@/components/CardTicket.vue'
import ChatBitButton from '@/components/ChatBitButton.vue'


const router = useRouter()

const { loading, finalizarCarga } = useLoader() // ✅ loader reutilizable
const tickets = ref([])
const ticketsOriginales = ref([])
const ticketsSeleccionados = ref(new Set())

const feedback = ref('')
const modalVisible = ref(false)
const mostrarModalEliminar = ref(false)
const ticketSeleccionado = ref(null)
const nombreSeleccionado = ref('')
const animarTarjetas = ref(false)

// Paginación
const paginaActual = ref(1)
const ITEMS_POR_PAGINA = 12

// Filtros
const busqueda = ref('')
const empresaSeleccionada = ref(null)
const estadoSeleccionado = ref(null)
const tipoSeleccionado = ref(null)

const empresasDisponibles = ref([])
const estadosDisponibles = ['Abierto', 'Activo', 'Cerrado']
const tiposDisponibles = ['Remoto', 'Presencial']

const cargarTickets = async () => {
  try {
    const data = await getAllTickets()
    tickets.value = data
    ticketsOriginales.value = data

    const empresas = await getEmpresas()
    empresasDisponibles.value = empresas.map(e => ({ id: e.id, nombre: e.nombre }))
  } catch (error) {
    console.error('Error al cargar tickets:', error)
  } finally {
    ticketsSeleccionados.value.clear()
    finalizarCarga() // ✅ ocultar loader
  }
}

const aplicarFiltros = () => {
  let filtrados = [...ticketsOriginales.value]

  if (busqueda.value) {
    const texto = busqueda.value.toLowerCase()
    filtrados = filtrados.filter(ticket =>
      ticket.titulo?.toLowerCase().includes(texto) ||
      ticket.usuario_nombre?.toLowerCase().includes(texto) ||
      ticket.id?.slice(-8).toLowerCase().includes(texto)
    )
  }

  if (empresaSeleccionada.value) {
    filtrados = filtrados.filter(t => String(t.empresa_id) === String(empresaSeleccionada.value))
  }

  if (estadoSeleccionado.value) {
    filtrados = filtrados.filter(t => t.estado === estadoSeleccionado.value)
  }

  if (tipoSeleccionado.value) {
    filtrados = filtrados.filter(t => t.tipo === tipoSeleccionado.value)
  }

  tickets.value = filtrados
  paginaActual.value = 1
}

const totalPaginas = computed(() =>
  Math.ceil(tickets.value.length / ITEMS_POR_PAGINA)
)

const ticketsVisibles = computed(() => {
  const start = (paginaActual.value - 1) * ITEMS_POR_PAGINA
  return tickets.value.slice(start, start + ITEMS_POR_PAGINA)
})

// Animar tarjetas
watch(ticketsVisibles, () => {
  animarTarjetas.value = false
  nextTick(() => {
    animarTarjetas.value = true
  })
})

const toggleSeleccion = (id) => {
  if (ticketsSeleccionados.value.has(id)) {
    ticketsSeleccionados.value.delete(id)
  } else {
    ticketsSeleccionados.value.add(id)
  }
}

const abrirModalTomar = (ticket) => {
  ticketSeleccionado.value = ticket
  modalVisible.value = true
}

const tomarTicket = async () => {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user || !user.user?.id) throw new Error('Usuario no autenticado')

    await actualizarTicket(ticketSeleccionado.value.id, {
      tecnico_id: user.user.id,
      estado: 'Activo'
    })

    feedback.value = '✅ Ticket tomado con éxito'
    modalVisible.value = false
    await cargarTickets()
  } catch (error) {
    feedback.value = '❌ No se pudo tomar el ticket'
    console.error(error)
  }
}

const abrirModalEliminarMultiple = () => {
  mostrarModalEliminar.value = true

  if (ticketsSeleccionados.value.size === 1) {
    const id = [...ticketsSeleccionados.value][0]
    const ticket = tickets.value.find(t => t.id === id)
    nombreSeleccionado.value = `#${ticket?.id?.slice(-8)}`
  } else {
    nombreSeleccionado.value = ''
  }
}

const cerrarModalEliminarMultiple = () => {
  mostrarModalEliminar.value = false
}

const eliminarTicketsSeleccionados = async () => {
  try {
    for (const id of ticketsSeleccionados.value) {
      await eliminarTicket(id)
    }
    feedback.value = '✅ Tickets eliminados correctamente'
    await cargarTickets()
  } catch (error) {
    feedback.value = '❌ No se pudieron eliminar los tickets'
    console.error(error)
  } finally {
    mostrarModalEliminar.value = false
  }
}

const irAEditar = () => {
  const id = [...ticketsSeleccionados.value][0]
  router.push({ name: 'editar-ticket', params: { id } })
}

onMounted(cargarTickets)
watch([busqueda, empresaSeleccionada, estadoSeleccionado, tipoSeleccionado], aplicarFiltros)
</script>

<style scoped>
.tarjeta-animada {
  animation: fadeInUp 0.4s ease;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
