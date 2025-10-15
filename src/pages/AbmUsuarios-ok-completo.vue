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
      <transition name="fade">
        <div class="flex flex-wrap items-center gap-4 mb-4">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por nombre o email..."
            class="w-full sm:w-[300px] px-4 py-2 border rounded-md shadow-sm"
          />
          <select
            v-model="empresaSeleccionada"
            class="w-full sm:w-[200px] px-4 py-2 border rounded-md shadow-sm"
          >
            <option value="">Todas las empresas</option>
            <option v-for="empresa in empresasDisponibles" :key="empresa" :value="empresa">
              {{ empresa }}
            </option>
          </select>
          <select
            v-model="sectorSeleccionado"
            class="w-full sm:w-[200px] px-4 py-2 border rounded-md shadow-sm"
          >
            <option value="">Todos los sectores</option>
            <option v-for="sector in sectoresDisponibles" :key="sector" :value="sector">
              {{ sector }}
            </option>
          </select>
        </div>
      </transition>

      <!-- Acciones -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center min-h-[42px]">
          <MainButton to="/usuarios/agregar" key="agregar">Agregar Usuario</MainButton>

          <transition-group name="fade-button" tag="div" class="flex gap-4">
            <MainButton
              v-if="usuariosSeleccionados.size === 1"
              key="editar"
              class="bg-blue-500 hover:bg-blue-600 flex items-center gap-1"
              @click="irAEditar"
            >
              <PencilIcon class="w-4 h-4" />
              Editar Usuario
            </MainButton>

            <MainButton
              v-if="usuariosSeleccionados.size > 0"
              key="borrar"
              class="bg-red-500 hover:bg-red-600 flex items-center gap-1"
              @click="abrirModalEliminarMultiple"
            >
              <Trash2Icon class="w-4 h-4" />
              Borrar Usuarios
            </MainButton>
          </transition-group>

          <transition name="fade">
            <div
              v-if="usuariosSeleccionados.size > 0"
              key="contador"
              class="flex items-center gap-2 text-sm text-gray-600"
            >
              <span>{{ usuariosSeleccionados.size }} seleccionado(s)</span>
              <button
                @click="usuariosSeleccionados.clear()"
                class="text-gray-500 underline hover:text-gray-700"
              >
                Deseleccionar todos
              </button>
            </div>
          </transition>
        </div>

        <!-- Toggle -->
        <button
          @click="mostrarTecnicos = !mostrarTecnicos"
          class="flex items-center gap-1 text-sm text-[#01C38E] hover:underline focus:outline-none transition"
        >
          <EyeIcon v-if="!mostrarTecnicos" class="w-4 h-4" />
          <EyeOffIcon v-else class="w-4 h-4" />
          <span>
            {{ mostrarTecnicos ? 'Ocultar detalles técnicos' : 'Ver detalles técnicos' }}
          </span>
        </button>
      </div>

      <!-- Lista de usuarios -->
      <div v-if="usuariosPaginados.length === 0" class="text-center text-gray-600 text-lg py-10">
        No se encontraron usuarios que coincidan con la búsqueda.
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6"
      >
      <div
        v-for="usuario in usuariosPaginados"
        :key="usuario.id"
        class="relative overflow-hidden bg-white border border-[#01C38E] shadow-sm rounded-2xl pt-6 px-6 flex flex-col w-full min-w-[300px]"
      >
        <!-- Badge plan -->
        <BadgePlan
          :value="usuario.is_admin ? 'ADMIN' : (usuario.empresa_plan_nombre || 'Default')"
          class="top-2 left-2"
        />

        <!-- Datos básicos -->
        <div class="flex items-center gap-4 mb-4 mt-4">
          <img
            :src="usuario.photo"
            alt="Foto de perfil"
            class="w-14 h-14 rounded-full object-cover ring-2 ring-[#44d6b4] flex-shrink-0"
          />
          <div>
            <h2 class="text-lg font-semibold">{{ usuario.display_name || 'Sin nombre' }}</h2>
            <p class="text-sm text-gray-500">{{ usuario.email }}</p>
            <p class="text-sm pt-1 text-[#474747] font-semibold flex items-center gap-1">
              <UsersIcon class="w-4 h-4" />
              {{ usuario.sector || 'Sin sector' }}
            </p>
          </div>
        </div>

        <hr class="pb-2" />

       
          <!-- Datos comunes -->
          <div
            class="text-sm text-gray-700 space-y-1 transition-all duration-300"
            :class="mostrarTecnicos ? 'mb-4' : 'mb-10'"
          >
          <div class="flex items-center gap-2">
            <strong>Rustdesk:</strong>
            <template v-if="usuario.rustdesk">
              <a
                :href="`rustdesk://${usuario.rustdesk}`"
                class="text-blue-600 hover:underline flex items-center gap-1"
                title="Conectar vía Rustdesk"
              >
                <Laptop2Icon class="w-4 h-4" />
                {{ usuario.rustdesk }}
              </a>
            </template>
            <template v-else>-</template>
          </div>
          <p><strong>Equipo:</strong> {{ usuario.equipo || '-' }}</p>
          <p><strong>IP PC:</strong> {{ usuario.ip_pc || '-' }}</p>
          <p><strong>Interno:</strong> {{ usuario.interno_telefono || '-' }}</p>
          <p><strong>IP Interno:</strong> {{ usuario.ip_telefono || '-' }}</p>
        </div>

        <!-- Parte inferior que crece -->
        <div class="relative grow mt-auto">
          <!-- Bloque técnico expandible con fondo -->
          <TransitionExpand :show="mostrarTecnicos">
            <div
              class="-mx-6 px-6 pt-4 pb-[45px] bg-[#e7fdef] border-t border-[#01C38E] rounded-b-2xl space-y-1"
            >
              <p class="text-sm"><strong>SO:</strong> {{ usuario.sistema_operativo || '-' }}</p>
              <p class="text-sm"><strong>Microprocesador:</strong> {{ usuario.microprocesador || '-' }}</p>
              <p class="text-sm"><strong>Memoria:</strong> {{ usuario.tipo_memoria || '-' }} / {{ usuario.tamano_memoria || '-' }} GB</p>
              <p class="text-sm"><strong>Disco:</strong> {{ usuario.tipo_disco || '-' }} / {{ usuario.tamano_disco || '-' }} GB</p>
            </div>
          </TransitionExpand>

          <!-- Checkbox fijo al fondo -->
          <div class="absolute bottom-3 left-0 flex items-center gap-2 z-10">
            <input
              type="checkbox"
              class="w-4 h-4 accent-[#01C38E]"
              :checked="usuariosSeleccionados.has(usuario.id)"
              @change="toggleSeleccion(usuario.id)"
            />
            <label class="text-sm text-gray-700 select-none">Seleccionar</label>
          </div>
        </div>

        <!-- Badge empresa -->
        <BadgeEmpresa
          v-if="usuario.empresa_nombre"
          :value="usuario.empresa_nombre"
          class="absolute top-3 right-3"
        />
      </div>


      </div>

    <!-- Modal eliminar -->
    <transition name="fade">
      <div
        v-if="mostrarModalEliminar"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
      >
        <div class="bg-white border border-red-500 rounded-lg shadow-lg w-full max-w-[500px] p-6 animate-fadeIn">
          <h2 class="text-lg font-bold text-red-600 mb-4">Confirmar Eliminación</h2>

          <p class="mb-6 break-words">
            <template v-if="usuariosSeleccionados.size === 1">
              ¿Estás seguro de que querés eliminar al usuario
              <strong>
                {{
                  usuarios.find(u => u.id === [...usuariosSeleccionados][0])?.display_name ||
                  usuarios.find(u => u.id === [...usuariosSeleccionados][0])?.email
                }}
              </strong>?
            </template>
            <template v-else>
              ¿Estás seguro de que querés eliminar {{ usuariosSeleccionados.size }} usuario(s)?
            </template>
          </p>

          <div class="flex justify-end gap-4">
            <button
              @click="eliminarUsuariosSeleccionados"
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar
            </button>
            <button
              @click="cerrarModalEliminarMultiple"
              class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </transition>

    
    
    <!-- Paginación con primeros y últimos -->
    <div class="mt-8 flex justify-between items-center text-sm flex-wrap gap-4">
      <button
        @click="paginaActual = 1"
        :disabled="paginaActual === 1"
        class="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
      >
        « Primero
      </button>

      <button
        @click="paginaAnterior"
        :disabled="paginaActual === 1"
        class="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
      >
        ‹ Anterior
      </button>

      <span class="text-sm text-gray-700">
        Página {{ paginaActual }} de {{ totalPaginas }}
      </span>

      <button
        @click="siguientePagina"
        :disabled="paginaActual === totalPaginas"
        class="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
      >
        Siguiente ›
      </button>

      <button
        @click="paginaActual = totalPaginas"
        :disabled="paginaActual === totalPaginas"
        class="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition"
      >
        Último »
      </button>
    </div>


    </template>
  </div>
</template>

<script setup>
import TransitionExpand from '@/components/TransitionExpand.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserProfilesPaginated } from '@/services/user-profiles'
import MainLoader from '@/components/MainLoader.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import MainButton from '@/components/MainButton.vue'
import BadgeEmpresa from '@/components/BadgeEmpresa.vue'
import BadgePlan from '@/components/BadgePlan.vue'
import {
  Laptop2Icon,
  UsersIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  Trash2Icon
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const usuarios = ref([])
const loading = ref(true)
const feedback = ref('')

const usuariosSeleccionados = ref(new Set())
const mostrarTecnicos = ref(false)
const mostrarModalEliminar = ref(false)

const paginaActual = ref(1)
const usuariosPorPagina = 1000

const busqueda = ref('')
const sectorSeleccionado = ref('')
const empresaSeleccionada = ref('')

const sectoresDisponibles = computed(() => {
  const sectores = usuarios.value.map(u => u.sector).filter(Boolean)
  return [...new Set(sectores)]
})

const empresasDisponibles = computed(() => {
  const empresas = usuarios.value.map(u => u.empresa_nombre).filter(Boolean)
  return [...new Set(empresas)]
})

const usuariosFiltrados = computed(() =>
  usuarios.value.filter(u => {
    const coincideBusqueda =
      u.display_name?.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      u.email?.toLowerCase().includes(busqueda.value.toLowerCase())
    const coincideSector =
      !sectorSeleccionado.value || u.sector === sectorSeleccionado.value
    const coincideEmpresa =
      !empresaSeleccionada.value || u.empresa_nombre === empresaSeleccionada.value
    return coincideBusqueda && coincideSector && coincideEmpresa
  })
)

const totalPaginas = computed(() =>
  Math.ceil(usuariosFiltrados.value.length / 12)
)

const usuariosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * 12
  return usuariosFiltrados.value.slice(inicio, inicio + 12)
})

const cargarUsuarios = async () => {
  loading.value = true
  try {
    const { data } = await getUserProfilesPaginated(usuariosPorPagina, 1)
    usuarios.value = data
  } catch (error) {
    console.error('Error cargando usuarios:', error)
  } finally {
    loading.value = false
    usuariosSeleccionados.value.clear()
  }
}

const toggleSeleccion = (id) => {
  if (usuariosSeleccionados.value.has(id)) {
    usuariosSeleccionados.value.delete(id)
  } else {
    usuariosSeleccionados.value.add(id)
  }
}

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

const paginaAnterior = () => {
  if (paginaActual.value > 1) paginaActual.value--
}

const siguientePagina = () => {
  if (paginaActual.value < totalPaginas.value) paginaActual.value++
}

watch([busqueda, sectorSeleccionado, empresaSeleccionada], () => {
  paginaActual.value = 1
})

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