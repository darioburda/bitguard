<template>
  <div class="space-y-4">
    <!-- ============ EMPRESA ============ -->
    <!-- Admin en CREACIÓN: select -->
    <div v-if="esAdmin && !esEdicion">
      <label for="empresa" class="block font-medium text-sm mb-1 cursor-pointer">Empresa</label>
      <select
        id="empresa"
        v-model="ticketModel.empresa_id"
        :disabled="estaDeshabilitado('empresa_id')"
        :class="[baseInput, estaDeshabilitado('empresa_id') ? claseRO : claseRW]"
      >
        <option disabled value="">Seleccionar empresa</option>
        <option v-for="emp in empresas" :key="emp.id" :value="emp.id">
          {{ emp.nombre }}
        </option>
      </select>
    </div>

    <!-- Admin en EDICIÓN: lectura -->
    <!-- <div v-if="esAdmin && esEdicion" class="mt-5">
      <label class="block font-medium text-sm mb-1">Empresa</label>
      <input
        type="text"
        :value="nombreEmpresa"
        disabled
        :class="[baseInput, claseRO]"
      />
    </div> -->
    

    <!-- Usuario COMÚN en EDICIÓN: mostrar empresa (lectura) -->
    <!-- <div v-if="!esAdmin && esEdicion" class="mt-5 flex items-center gap-2">
      <p class="text-lg font-bold text-gray-800 truncate">Empresa:</p>
      <p class="text-lg font-semibold text-[#277AE8] truncate">{{ nombreEmpresa }}</p>
    </div> -->

    <!-- ============ USUARIO SOLICITANTE ============ -->
    <!-- Admin en CREACIÓN: select -->
    <div v-if="esAdmin && !esEdicion">
      <label for="usuario" class="block font-medium text-sm mb-1 cursor-pointer">Usuario solicitante</label>
      <select
        id="usuario"
        v-model="ticketModel.usuario_id"
        :disabled="estaDeshabilitado('usuario_id')"
        :class="[baseInput, estaDeshabilitado('usuario_id') ? claseRO : claseRW]"
      >
        <option disabled value="">Seleccionar usuario</option>
        <option
          v-for="user in (todosUsuarios || []).filter(u => u.empresa_id === ticketModel.empresa_id)"
          :key="user.id"
          :value="user.id"
        >
          {{ user.display_name || user.email }}
        </option>
      </select>
    </div>

    <!-- Admin en EDICIÓN: lectura minimalista -->
    <div v-else-if="esAdmin && esEdicion" class="mt-5 flex items-center gap-2">
      <p class="text-lg font-bold text-gray-800 truncate">Usuario solicitante:</p>
      <p class="text-lg font-semibold text-[#277AE8] truncate">{{ nombreUsuarioSolicitante }}</p>
    </div>

    <!-- Usuario COMÚN: NO se muestra usuario solicitante -->

    <!-- Usuario COMÚN en EDICIÓN: técnico asignado (lectura) -->
    <div v-if="!esAdmin && esEdicion" class="mt-5 flex items-center gap-2">
      <p class="text-lg font-bold text-gray-800 truncate">Técnico asignado:</p>
      <p class="text-lg font-semibold text-[#277AE8] truncate">{{ nombreTecnicoAsignado }}</p>
    </div>

    <!-- ============ ADMIN: Tipo de soporte + Técnico asignado ============ -->
    <div v-if="esAdmin" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Columna: Tipo de soporte -->
      <div class="flex flex-col">
        <label class="block font-medium text-sm mb-1">Tipo de soporte</label>

        <!-- Edición: icono + valor -->
        <div v-if="esEdicion" class="flex items-center gap-2">
          <button
            type="button"
            @click="abrirModalTipoSoporte()"
            class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            aria-label="Cambiar tipo de soporte"
            title="Cambiar tipo de soporte"
          >
            <Wrench class="w-5 h-5 text-[#277AE8]" />
          </button>
          <p class="text-lg font-semibold text-[#277AE8] truncate">
            {{ ticketModel.tipo || 'Sin definir' }}
          </p>
        </div>

        <!-- Creación: select normal -->
        <div v-else>
          <select
            v-model="ticketModel.tipo"
            :disabled="estaDeshabilitado('tipo')"
            :class="[baseInput, estaDeshabilitado('tipo') ? claseRO : claseRW]"
          >
            <option disabled value="">Seleccionar tipo</option>
            <option value="Presencial">Presencial</option>
            <option value="Remoto">Remoto</option>
          </select>
        </div>
      </div>

      <!-- Columna: Técnico asignado -->
      <div class="flex flex-col">
        <label class="block font-medium text-sm mb-1">Técnico asignado</label>

        <!-- Edición: icono + valor -->
        <div v-if="esEdicion" class="flex items-center gap-2">
          <button
            v-if="!estaDeshabilitado('tecnico_id')"
            type="button"
            @click="abrirModalAsignar()"
            class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            aria-label="Reasignar técnico"
            title="Reasignar"
          >
            <UserRound class="w-5 h-5 text-[#277AE8]" />
          </button>
          <p class="text-lg font-semibold text-[#277AE8] truncate">
            {{ nombreTecnicoAsignado || 'Sin asignar' }}
          </p>
        </div>

        <!-- Creación: select normal -->
        <div v-else>
          <select
            v-model="ticketModel.tecnico_id"
            :disabled="estaDeshabilitado('tecnico_id')"
            :class="[baseInput, estaDeshabilitado('tecnico_id') ? claseRO : claseRW]"
          >
            <option disabled value="">Seleccionar técnico</option>
            <option v-for="tec in tecnicos" :key="tec.id" :value="tec.id">
              {{ tec.display_name || tec.email }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- ============ Tema de ayuda + Especificar tema ============ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="tema-ayuda" class="block font-medium text-sm mb-1 cursor-pointer">Tema de ayuda</label>
        <select
          id="tema-ayuda"
          v-model="temaSeleccionado"
          :disabled="estaDeshabilitado('tema_ayuda')"
          :class="[baseInput, estaDeshabilitado('tema_ayuda') ? claseRO : claseRW]"
        >
          <option disabled value="">Seleccionar tema</option>
          <option value="No hay internet">No hay internet</option>
          <option value="No imprime">No imprime</option>
          <option value="PC lenta">PC lenta</option>
          <option value="Error de login">Error de login</option>
          <option value="Problema con sistema de gestión">Problema con sistema de gestión</option>
          <option value="Otro">Otro (especificar)</option>
        </select>
      </div>

      <div>
        <label for="tema-especifico" class="block font-medium text-sm mb-1 cursor-pointer">Especificar tema</label>
        <input
          id="tema-especifico"
          v-model="ticketModel.tema_ayuda"
          type="text"
          placeholder="Especificar tema"
          :disabled="estaDeshabilitado('tema_ayuda') || temaSeleccionado !== 'Otro'"
          :class="[baseInput, (estaDeshabilitado('tema_ayuda') || temaSeleccionado !== 'Otro') ? claseRO : claseRW]"
        />
      </div>
    </div>

    <!-- ============ Título ============ -->
    <div>
      <label for="titulo" class="block font-medium text-sm mb-1 cursor-pointer">Título del problema</label>
      <input
        id="titulo"
        type="text"
        v-model="ticketModel.titulo"
        :disabled="estaDeshabilitado('titulo')"
        :class="[baseInput, estaDeshabilitado('titulo') ? claseRO : claseRW]"
      />
    </div>

    <!-- ============ Descripción ============ -->
    <div>
      <label for="descripcion" class="block font-medium text-sm mb-1 cursor-pointer">Descripción</label>
      <textarea
        id="descripcion"
        v-model="ticketModel.descripcion"
        rows="4"
        :disabled="estaDeshabilitado('descripcion')"
        :class="[baseInput, 'resize-y', estaDeshabilitado('descripcion') ? claseRO : claseRW]"
      ></textarea>
    </div>

    <!-- ========= MODAL ASIGNAR TÉCNICO ========= -->
    <transition name="fade">
      <div v-if="mostrarModalAsignar" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
        <div class="bg-white border border-[#01C38E] rounded-lg shadow-lg w-full max-w-[500px] p-6 animate-fadeIn relative">
          <h2 class="text-lg font-bold text-[#01C38E] mb-4">Asignar técnico</h2>

          <!-- Búsqueda -->
          <input
            v-model="buscarTec"
            type="text"
            placeholder="Buscar soporte…"
            class="w-full px-4 py-2 border rounded-md text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#01C38E] focus:border-[#01C38E]"
          />

          <!-- Lista sin avatar; altura estable -->
          <ul class="min-h-[240px] max-h-72 overflow-y-auto divide-y border rounded-md">
            <li v-for="tec in tecnicosFiltrados" :key="tec.id">
              <button
                type="button"
                class="w-full px-3 text-left hover:bg-gray-50 flex items-center justify-between h-12"
                :class="preseleccion?.id === tec.id ? 'bg-[#eef8f5]' : ''"
                @click="asignarTecnico(tec)"
              >
                <span class="truncate font-medium">
                  {{ tec.display_name || tec.email }}
                </span>
                <span class="text-xs text-gray-500 truncate max-w-[45%]">
                  {{ tec.email }}
                </span>
              </button>
            </li>

            <li v-if="!tecnicosFiltrados.length" class="h-24 flex items-center justify-center text-sm text-gray-500">
              No se encontraron soportes con “{{ buscarTec }}”.
            </li>
          </ul>

          <!-- Acciones -->
          <div class="flex justify-end gap-4 mt-6">
            <button
              @click="confirmarAsignacion"
              class="px-4 py-2 bg-[#01C38E] text-white rounded hover:bg-[#00b383] disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!preseleccion"
            >
              Confirmar
            </button>
            <button
              @click="cerrarModalAsignar"
              class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </transition>
    <!-- ========= /MODAL ========= -->

    <!-- ========= MODAL CAMBIAR TIPO DE SOPORTE ========= -->
    <transition name="fade">
      <div
        v-if="modalTipoSoporteAbierto"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
      >
        <div
          class="bg-white border border-[#01C38E] rounded-lg shadow-lg w-full max-w-[500px] p-6 animate-fadeIn"
        >
          <h2 class="text-lg font-bold text-[#01C38E] mb-4">Cambiar tipo de soporte</h2>

          <select
            v-model="ticketModel.tipo"
            class="w-full px-4 py-2 border rounded-md text-sm cursor-pointer"
          >
            <option disabled value="">Seleccionar tipo</option>
            <option value="Presencial">Presencial</option>
            <option value="Remoto">Remoto</option>
          </select>

          <div class="flex justify-end gap-4 mt-6">
            <button
              @click="confirmarTipoSoporte"
              class="px-4 py-2 bg-[#01C38E] text-white rounded hover:bg-[#00b383]"
            >
              Confirmar
            </button>
            <button
              @click="modalTipoSoporteAbierto = false"
              class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </transition>
    <!-- ========= /MODAL ========= -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { UserRound, Wrench } from 'lucide-vue-next'
import BadgeEmpresa from '@/components/BadgeEmpresa.vue'

const props = defineProps({
  ticket: { type: Object, required: true },
  empresas: { type: Array, required: true },
  tecnicos: { type: Array, default: () => [] },
  todosUsuarios: { type: Array, default: () => [] },
  esAdmin: { type: Boolean, default: false }
})

const emit = defineEmits(['update:ticket'])

/** v-model con getter/setter para no mutar el prop directamente */
const ticketModel = computed({
  get: () => props.ticket || {},
  set: (val) => emit('update:ticket', val)
})

/** Estado de edición / creación */
const esEdicion = computed(() => !!ticketModel.value.id)

/** Helpers de estilo */
const baseInput = 'w-full px-4 py-2 rounded-md text-sm'
const claseRO   = 'bg-gray-100 text-gray-700 border border-gray-200 cursor-not-allowed'
const claseRW   = 'bg-white text-gray-900 border border-gray-300 cursor-pointer'

/**
 * Reglas de deshabilitado por campo:
 * - En creación:
 *    - Admin: puede editar todo
 *    - Usuario común: SOLO se bloquean empresa_id, usuario_id y tecnico_id
 * - En edición:
 *    - Admin: SOLO puede editar 'tipo' y 'tecnico_id'
 *    - Usuario común: todo deshabilitado
 */
const estaDeshabilitado = (campo) => {
  if (!esEdicion.value) {
    // CREACIÓN
    if (props.esAdmin) return false
    // usuario común creando: bloquear solo estos
    return ['empresa_id', 'usuario_id', 'tecnico_id'].includes(campo)
  }
  // EDICIÓN
  if (props.esAdmin) return !['tipo', 'tecnico_id'].includes(campo)
  return true
}

/** Nombres derivados */
const nombreUsuarioSolicitante = computed(() => {
  if (!ticketModel.value?.usuario_id) return '—'
  const user = (props.todosUsuarios || []).find(u => u.id === ticketModel.value.usuario_id)
  return user?.display_name || user?.email || 'Usuario no encontrado'
})

const nombreTecnicoAsignado = computed(() => {
  if (!ticketModel.value?.tecnico_id) return 'No asignado'
  const tec = (props.tecnicos || []).find(t => t.id === ticketModel.value.tecnico_id)
  return tec?.display_name || tec?.email || 'Técnico no encontrado'
})

const nombreEmpresa = computed(() => {
  const id = ticketModel.value?.empresa_id
  const emp = (props.empresas || []).find(e => e.id === id)
  return emp?.nombre || '—'
})

/** Tema (select + input dependiente) */
const opcionesTemas = [
  'No hay internet',
  'No imprime',
  'PC lenta',
  'Error de login',
  'Problema con sistema de gestión'
]
const temaSeleccionado = ref('')

watch(temaSeleccionado, (nuevo) => {
  if (nuevo !== 'Otro') {
    ticketModel.value = { ...ticketModel.value, tema_ayuda: nuevo }
  } else {
    ticketModel.value = { ...ticketModel.value, tema_ayuda: '' }
  }
})

onMounted(() => {
  const actual = ticketModel.value?.tema_ayuda || ''
  temaSeleccionado.value = opcionesTemas.includes(actual) ? actual : (actual ? 'Otro' : '')
})

/** ================== Modal Asignar Técnico ================== */
const mostrarModalAsignar = ref(false)
const buscarTec = ref('')
const preseleccion = ref(null)

const abrirModalAsignar = () => {
  preseleccion.value = null
  buscarTec.value = ''
  mostrarModalAsignar.value = true
}
const cerrarModalAsignar = () => { mostrarModalAsignar.value = false }

const tecnicosFiltrados = computed(() => {
  const q = buscarTec.value.trim().toLowerCase()
  const lista = props.tecnicos || []
  if (!q) return lista
  return lista.filter(t => {
    const n = (t.display_name || '').toLowerCase()
    const e = (t.email || '').toLowerCase()
    return n.includes(q) || e.includes(q)
  })
})

const asignarTecnico = (tec) => { preseleccion.value = tec }
const confirmarAsignacion = () => {
  if (!preseleccion.value) return
  ticketModel.value = { ...ticketModel.value, tecnico_id: preseleccion.value.id }
  cerrarModalAsignar()
}

/** Cerrar modal con ESC */
const onKey = (e) => {
  if (e.key === 'Escape' && mostrarModalAsignar.value) cerrarModalAsignar()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

/** ================== Modal Tipo de Soporte ================== */
const modalTipoSoporteAbierto = ref(false)
function abrirModalTipoSoporte() { modalTipoSoporteAbierto.value = true }
function confirmarTipoSoporte() { modalTipoSoporteAbierto.value = false }
</script>

<style scoped>
/* Transición del modal (igual a tu ejemplo) */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Animación de aparición del card */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

/* Focus/active safe */
li button:focus,
li button:active {
  outline: none;
}
li button.selected {
  background-color: #eef8f5;
}
</style>
