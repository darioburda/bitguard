<template>
  <PageContainer :loading="loading">
    <AlertMessage
      v-if="feedback"
      :message="feedback"
      type="success"
      auto-dismiss
      @dismiss="feedback = ''"
    />

    <AbmLayout titulo="Gestión de Usuarios">
      <!-- Acciones -->
      <template #acciones>
        <Acciones
          nombreEntidad="Usuario"
          :seleccionados="usuariosSeleccionados"
          @agregar="router.push('/usuarios/agregar')"
          @editar="irAEditar"
          @borrar="abrirModalEliminarMultiple"
          @deseleccionarTodos="usuariosSeleccionados.clear()"
        />
      </template>

      <!-- Filtros -->
      <template #filtros>
        <FiltrosEntidad
          entidad="usuario"
          :busqueda="busqueda"
          :empresaSeleccionada="empresaSeleccionada"
          :sectorSeleccionado="sectorSeleccionado"
          :planSeleccionado="planSeleccionado"
          :empresas="empresasDisponibles"
          :sectores="sectoresDisponibles"
          :planes="planesDisponibles"
          :mostrarDetalles="mostrarTecnicos"
          @update:busqueda="busqueda = $event"
          @update:empresa="empresaSeleccionada = $event"
          @update:sector="sectorSeleccionado = $event"
          @update:plan="planSeleccionado = $event"
          @toggle="mostrarTecnicos = !mostrarTecnicos"
        />
      </template>
    </AbmLayout>

    <!-- Grilla -->
    <GridLayout
      :columnas="4"
      :vacio="usuariosVisibles.length === 0"
      entidad="usuario"
    >
      <UsuarioCard
        v-for="usuario in usuariosVisibles"
        :key="usuario.id"
        :usuario="usuario"
        :mostrarTecnicos="mostrarTecnicos"
        :seleccionados="usuariosSeleccionados"
        @toggle-seleccion="toggleSeleccion"
        :class="{ 'tarjeta-animada': animarTarjetas }"
      />

      <!-- Caja invisible para mantener ancho -->
      <div v-if="usuariosVisibles.length === 0" :key="'placeholder'" class="invisible h-0">.</div>
    </GridLayout>

    <!-- Modal eliminar -->
    <ModalEliminar
      :show="mostrarModalEliminar"
      :cantidad="usuariosSeleccionados.size"
      :nombreUsuario="nombreSeleccionado"
      @confirmar="eliminarUsuariosSeleccionados"
      @cancelar="cerrarModalEliminarMultiple"
    />

    <!-- Paginación -->
    <Paginador
      :paginaActual="paginaActual"
      :totalPaginas="totalPaginas"
      @primero="paginaActual = 1"
      @anterior="paginaAnterior"
      @siguiente="siguientePagina"
      @ultimo="paginaActual = totalPaginas"
      @ir-a="paginaActual = $event"
    />
    <ChatBitButton />

  </PageContainer>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsuarios } from '@/composables/useUsuarios.js'
import { useLoader } from '@/composables/useLoader.js' // ✅ Nuevo
import AlertMessage from '@/components/AlertMessage.vue'
import UsuarioCard from '@/components/UsuarioCard.vue'
import ModalEliminar from '@/components/ModalEliminar.vue'
import Acciones from '@/components/Acciones.vue'
import Paginador from '@/components/Paginador.vue'
import AbmLayout from '@/components/layouts/AbmLayout.vue'
import FiltrosEntidad from '../components/FiltrosEntidad.vue'
import GridLayout from '@/components/layouts/GridLayout.vue'
import PageContainer from '@/components/layouts/PageContainer.vue'
import ChatBitButton from '@/components/ChatBitButton.vue'


const router = useRouter()
const route = useRoute()

const {
  usuarios,
  feedback,
  usuariosSeleccionados,
  paginaActual,
  busqueda,
  sectorSeleccionado,
  empresaSeleccionada,
  planSeleccionado,
  cargarUsuarios,
  sectoresDisponibles,
  empresasDisponibles,
  planesDisponibles,
  usuariosPaginados,
  totalPaginas,
  nombreSeleccionado,
  toggleSeleccion,
  paginaAnterior,
  siguientePagina,
} = useUsuarios()

const { loading, finalizarCarga } = useLoader() // ✅ Usamos el composable

const mostrarTecnicos = ref(false)
const mostrarModalEliminar = ref(false)
const animarTarjetas = ref(true)
const usuariosVisibles = ref([])

watch(usuariosPaginados, async () => {
  animarTarjetas.value = false
  const nuevos = usuariosPaginados.value
  usuariosVisibles.value = usuariosVisibles.value.filter(u =>
    nuevos.some(n => n.id === u.id)
  )
  await new Promise(r => setTimeout(r, 300))
  usuariosVisibles.value = nuevos
  animarTarjetas.value = true
})

const irAEditar = () => {
  const id = [...usuariosSeleccionados.value][0]
  router.push({ name: 'editar-usuario', params: { id } })
}

const abrirModalEliminarMultiple = () => {
  mostrarModalEliminar.value = true
}

const cerrarModalEliminarMultiple = () => {
  mostrarModalEliminar.value = false
}

const eliminarUsuariosSeleccionados = async () => {
  try {
    for (const id of usuariosSeleccionados.value) {
      const response = await fetch('https://yjqstwwltjefqtsxlbsa.functions.supabase.co/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id })
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Error desconocido')
    }
    feedback.value = '✅ Usuarios eliminados correctamente'
    mostrarModalEliminar.value = false
    usuariosSeleccionados.value.clear()
    await cargarUsuarios()
  } catch (error) {
    console.error('Error eliminando usuarios:', error)
    feedback.value = '❌ Error al eliminar usuarios'
  }
}

onMounted(async () => {
  const successMsg = route.query.success
  if (successMsg) {
    feedback.value = decodeURIComponent(successMsg)
    router.replace({ query: {} })
  }

  await cargarUsuarios()
  finalizarCarga() // ✅ Ocultamos el loader solo cuando todo esté listo
})
</script>

