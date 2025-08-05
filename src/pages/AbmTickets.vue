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
        :cantidad="ticketsFiltrados.length"
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
import { useFiltradoEntidad } from '@/composables/useFiltradoEntidad.js'

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
const { loading, finalizarCarga } = useLoader()

const tickets = ref([])
const ticketsVisibles = ref([])
const ticketsSeleccionados = ref(new Set())
const ticketSeleccionado = ref(null)
const nombreSeleccionado = ref('')

const feedback = ref('')
const modalVisible = ref(false)
const mostrarModalEliminar = ref(false)
const animarTarjetas = ref(false)

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

// ✅ Composable de filtrado reutilizable
const { filtrados: ticketsFiltrados } = useFiltradoEntidad(
  tickets,
  { busqueda, empresaSeleccionada, estadoSeleccionado, tipoSeleccionado },
  ['titulo', 'usuario_nombre', 'id'],
  'ticket'
)

const totalPaginas = computed(() =>
  Math.ceil(ticketsFiltrados.value.length / ITEMS_POR_PAGINA)
)

const ticketsPaginados = computed(() => {
  const start = (paginaActual.value - 1) * ITEMS_POR_PAGINA
  return ticketsFiltrados.value.slice(start, start + ITEMS_POR_PAGINA)
})

// Animación de tarjetas
watch(ticketsPaginados, () => {
  animarTarjetas.value = false
  nextTick(() => {
    ticketsVisibles.value = ticketsPaginados.value
    animarTarjetas.value = true
  })
})

// Selección
const toggleSeleccion = (id) => {
  if (ticketsSeleccionados.value.has(id)) {
    ticketsSeleccionados.value.delete(id)
  } else {
    ticketsSeleccionados.value.add(id)
  }
}

// Modal Tomar Ticket
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

// Modal Eliminar
const abrirModalEliminarMultiple = () => {
  mostrarModalEliminar.value = true
  if (ticketsSeleccionados.value.size === 1) {
    const id = [...ticketsSeleccionados.value][0]
    const ticket = ticketsFiltrados.value.find(t => t.id === id)
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

// Redirección
const irAEditar = () => {
  const id = [...ticketsSeleccionados.value][0]
  router.push({ name: 'editar-ticket', params: { id } })
}

// Carga inicial
const cargarTickets = async () => {
  try {
    const data = await getAllTickets()
    tickets.value = data

    const empresas = await getEmpresas()
    empresasDisponibles.value = empresas.map(e => ({ id: e.id, nombre: e.nombre }))
  } catch (error) {
    console.error('Error al cargar tickets:', error)
  } finally {
    ticketsSeleccionados.value.clear()
    finalizarCarga()
  }
}

onMounted(async () => {
  await cargarTickets()
})
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
