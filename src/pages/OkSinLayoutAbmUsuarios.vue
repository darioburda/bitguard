<template>
  <!-- Contenedor externo fijo -->
  <div class="w-full">
    <!-- Contenedor interno con ancho máximo fijo siempre -->
    <div class="max-w-screen-xl mx-auto px-4 sm:px-8 pt-4 pb-10">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <MainLoader />
      </div>

      <template v-else>
        <AlertMessage
          v-if="feedback"
          :message="feedback"
          type="success"
          auto-dismiss
          @dismiss="feedback = ''"
        />

        <AbmLayout titulo="Gestión de Usuarios">
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


        <!-- Grilla o mensaje -->
        <div class="mt-6 min-h-[600px]">
          <transition-group
            name="fade-move"
            tag="div"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            :class="{ 'opacity-50': usuariosPaginados.length === 0 }"
            appear
          >
          <UsuarioCard
            v-for="usuario in usuariosPaginados"
            :key="usuario.id"
            :usuario="usuario"
            :mostrarTecnicos="mostrarTecnicos"
            :seleccionados="usuariosSeleccionados"
            @toggle-seleccion="toggleSeleccion"
            :class="{ 'tarjeta-animada': animarTarjetas }"
          />


            <!-- Caja invisible para mantener ancho -->
            <div v-if="usuariosPaginados.length === 0" :key="'placeholder'" class="invisible h-0">.</div>
          </transition-group>


          <!-- Mensaje si no hay resultados -->
          <div
            v-if="usuariosPaginados.length === 0"
            class="text-center text-gray-600 text-lg py-10"
          >
            No se encontraron usuarios que coincidan con la búsqueda.
          </div>
        </div>

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
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsuarios } from '@/composables/useUsuarios.js'
import MainLoader from '@/components/MainLoader.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import UsuarioCard from '@/components/UsuarioCard.vue'
import ModalEliminar from '@/components/ModalEliminar.vue'
import Acciones from '@/components/Acciones.vue'
import Paginador from '@/components/Paginador.vue'
import AbmLayout from '@/components/layouts/AbmLayout.vue'
import FiltrosEntidad from '../components/FiltrosEntidad.vue'


const router = useRouter()
const route = useRoute()

const {
  usuarios,
  loading,
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

const mostrarTecnicos = ref(false)
const mostrarModalEliminar = ref(false)
const animarTarjetas = ref(false)

// Aplica animación a todas las tarjetas cada vez que cambia el listado
watchEffect(() => {
  usuariosPaginados.value // dependencia
  animarTarjetas.value = false
  requestAnimationFrame(() => {
    animarTarjetas.value = true
  })
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

onMounted(() => {
  const successMsg = route.query.success
  if (successMsg) {
    feedback.value = decodeURIComponent(successMsg)
    router.replace({ query: {} })
  }

  cargarUsuarios()
})
</script>
