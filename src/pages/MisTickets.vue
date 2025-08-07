<template>
  <PageContainer :loading="loading">
    <AlertMessage
      v-if="feedback"
      :message="feedback"
      type="success"
      auto-dismiss
      @dismiss="feedback = ''"
    />

    <AbmLayout titulo="Mis Tickets">
      <!-- Acciones -->
      <template #acciones>
      <Acciones
        :seleccionados="ticketsSeleccionados"
        :mostrarAgregar="true"
        :mostrarEditar="true"
        :mostrarEliminar="false"
        nombreEntidad="Ticket"
        @agregar="router.push('/tickets/crear')"
        @editar="editarTicketSeleccionado"
        @deseleccionarTodos="ticketsSeleccionados = new Set()"
      />
      </template>

      <!-- Filtros -->
      <template #filtros>
        <FiltrosEntidad
          entidad="ticket"
          :cantidad="ticketsFiltrados.length"
          :busqueda="busqueda"
          :estadoSeleccionado="estadoSeleccionado"
          :tipoSeleccionado="tipoSeleccionado"
          :estados="estadosDisponibles"
          :tipos="tiposDisponibles"
          @update:busqueda="busqueda = $event"
          @update:estado="estadoSeleccionado = $event"
          @update:tipo="tipoSeleccionado = $event"
        />
      </template>
    </AbmLayout>

    <!-- Grilla -->
    <GridLayout :columnas="4" :vacio="ticketsVisibles.length === 0" entidad="ticket">
      <CardTicketUser
        v-for="ticket in ticketsVisibles"
        :key="ticket.id"
        :ticket="ticket"
        :seleccionados="ticketsSeleccionados"
        @toggleSeleccion="toggleSeleccion"
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
      @siguiente="paginaActual = Math.min(paginaActual + 1, totalPaginas)"
      @ultimo="paginaActual = totalPaginas"
      @ir-a="paginaActual = $event"
    />

    <ChatBitButton />
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import { useLoader } from '@/composables/useLoader'
import { useFiltradoEntidad } from '@/composables/useFiltradoEntidad'

import PageContainer from '@/components/layouts/PageContainer.vue'
import AbmLayout from '@/components/layouts/AbmLayout.vue'
import GridLayout from '@/components/layouts/GridLayout.vue'
import Paginador from '@/components/Paginador.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import FiltrosEntidad from '@/components/FiltrosEntidad.vue'
import Acciones from '@/components/Acciones.vue'
import CardTicketUser from '@/components/CardTicketUser.vue'
import ChatBitButton from '@/components/ChatBitButton.vue'

const router = useRouter()
const { loading, finalizarCarga } = useLoader()

const tickets = ref([])
const ticketsVisibles = ref([])
const feedback = ref('')
const paginaActual = ref(1)
const ITEMS_POR_PAGINA = 12
const animarTarjetas = ref(false)

// Filtros
const busqueda = ref('')
const estadoSeleccionado = ref(null)
const tipoSeleccionado = ref(null)
const estadosDisponibles = ['Abierto', 'Activo', 'Cerrado']
const tiposDisponibles = ['Remoto', 'Presencial']

// Filtrado
const { filtrados: ticketsFiltrados } = useFiltradoEntidad(
  tickets,
  { busqueda, estadoSeleccionado, tipoSeleccionado },
  ['titulo', 'descripcion', 'id'],
  'ticket'
)

const totalPaginas = computed(() =>
  Math.ceil(ticketsFiltrados.value.length / ITEMS_POR_PAGINA)
)

const ticketsPaginados = computed(() => {
  const start = (paginaActual.value - 1) * ITEMS_POR_PAGINA
  return ticketsFiltrados.value.slice(start, start + ITEMS_POR_PAGINA)
})

// Animación
watch(ticketsPaginados, () => {
  animarTarjetas.value = false
  nextTick(() => {
    ticketsVisibles.value = ticketsPaginados.value
    animarTarjetas.value = true
  })
})

// Selección (Set)
const ticketsSeleccionados = ref(new Set())

const toggleSeleccion = (ticketId) => {
  if (ticketsSeleccionados.value.has(ticketId)) {
    ticketsSeleccionados.value.delete(ticketId)
  } else {
    ticketsSeleccionados.value.add(ticketId)
  }
}

const editarTicketSeleccionado = () => {
  if (ticketsSeleccionados.value.size === 1) {
    const id = [...ticketsSeleccionados.value][0]
    router.push(`/tickets/${id}/editar`)
  }
}

// Carga de tickets propios
const cargarTickets = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('tickets')
      .select('*, tecnico:user_profiles!tecnico_id(id, display_name)')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })

    tickets.value = data || []
  } catch (error) {
    console.error('Error al cargar tickets del usuario:', error)
  } finally {
    finalizarCarga()
  }
}

onMounted(cargarTickets)
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
