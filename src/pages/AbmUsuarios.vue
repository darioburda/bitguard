<template>
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

      <!-- Título -->
      <h1 class="text-2xl font-bold mb-2">Gestión de Usuarios</h1>

      <!-- Filtros -->
      <FiltrosUsuarios
        :busqueda="busqueda"
        :empresaSeleccionada="empresaSeleccionada"
        :sectorSeleccionado="sectorSeleccionado"
        :empresas="empresasDisponibles"
        :sectores="sectoresDisponibles"
        @update:busqueda="busqueda = $event"
        @update:empresa="empresaSeleccionada = $event"
        @update:sector="sectorSeleccionado = $event"
      />

      <!-- Acciones reutilizables -->
      <Acciones
        nombreEntidad="Usuario"
        :seleccionados="usuariosSeleccionados"
        :mostrarToggle="mostrarTecnicos"
        labelToggle="detalles técnicos"
        @agregar="router.push('/usuarios/agregar')"
        @editar="irAEditar"
        @borrar="abrirModalEliminarMultiple"
        @toggle="mostrarTecnicos = !mostrarTecnicos"
        @deseleccionarTodos="usuariosSeleccionados.clear()"
      />

      <!-- Lista de usuarios -->
      <div v-if="usuariosPaginados.length === 0" class="text-center text-gray-600 text-lg py-10">
        No se encontraron usuarios que coincidan con la búsqueda.
      </div>

      <transition-group
        name="fade-move"
        tag="div"
        appear
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6"
      >
        <UsuarioCard
          v-for="usuario in usuariosPaginados"
          :key="usuario.id"
          :usuario="usuario"
          :mostrarTecnicos="mostrarTecnicos"
          :seleccionados="usuariosSeleccionados"
          @toggle-seleccion="toggleSeleccion"
        />
      </transition-group>

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
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Composables
import { useUsuarios } from '@/composables/useUsuarios.js'

// Componentes
import MainLoader from '@/components/MainLoader.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import UsuarioCard from '@/components/UsuarioCard.vue'
import ModalEliminar from '@/components/ModalEliminar.vue'
import FiltrosUsuarios from '@/components/FiltrosUsuarios.vue'
import Acciones from '@/components/Acciones.vue'
import Paginador from '@/components/Paginador.vue'

// Icons (usados en componentes hijos)
import {
  Laptop2Icon,
  UsersIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  Trash2Icon
} from 'lucide-vue-next'

// Router
const router = useRouter()
const route = useRoute()

// Composable de usuarios
const {
  usuarios,
  loading,
  feedback,
  usuariosSeleccionados,
  paginaActual,
  busqueda,
  sectorSeleccionado,
  empresaSeleccionada,
  cargarUsuarios,
  sectoresDisponibles,
  empresasDisponibles,
  usuariosPaginados,
  totalPaginas,
  nombreSeleccionado,
  toggleSeleccion,
  paginaAnterior,
  siguientePagina,
} = useUsuarios()

// Modal y estado técnico
const mostrarTecnicos = ref(false)
const mostrarModalEliminar = ref(false)

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

// Carga inicial
onMounted(() => {
  const successMsg = route.query.success
  if (successMsg) {
    feedback.value = decodeURIComponent(successMsg)
    router.replace({ query: {} })
  }
  cargarUsuarios()
})
</script>


<style scoped>
/* Transición de expansión técnica */
.fade-expand-enter-active,
.fade-expand-leave-active {
  transition: all 0.35s ease;
  overflow: hidden;
}
.fade-expand-enter-from,
.fade-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}
.fade-expand-enter-to,
.fade-expand-leave-from {
  max-height: 300px;
  opacity: 1;
  transform: translateY(0);
}

/* Fade general para modales, filtros, contadores */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transición para los botones Editar/Borrar */
.fade-button-enter-active,
.fade-button-leave-active {
  transition: all 0.3s ease-in-out;
}
.fade-button-enter-from,
.fade-button-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

/* Movimiento suave para grupo de botones */
.fade-move-enter-active,
.fade-move-leave-active {
  transition: all 0.3s ease;
}
.fade-move-enter-from,
.fade-move-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* Transición alternativa */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Visual del bloque técnico */
.card-tecnica {
  background-color: #ECFDF5;
  border-radius: 0 0 1rem 1rem;
  padding: 0.75rem;
  border-top: 1px solid #D1FAE5;
  margin-top: 0.75rem;
}

/* Animación para el modal */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>