<script setup>
import { computed } from 'vue'
import { XCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'

const props = defineProps({
  margenInferior: {
  type: String,
  default: 'mb-[0px]' // Admin por defecto
  },
  busqueda: String,
  empresaSeleccionada: [String, Number],
  sectorSeleccionado: String,
  planSeleccionado: String,
  estadoSeleccionado: String,
  tipoSeleccionado: String,
  cantidad: Number, // ✅ nueva prop para mostrar chip con cantidad
  mostrarToggle: {
    type: Boolean,
    default: true // ✅ permite ocultar el botón toggle
  },
  empresas: Array,
  sectores: Array,
  planes: Array,
  estados: Array,
  tipos: Array,
  mostrarDetalles: Boolean,
  mostrarGraficos: Boolean,
  entidad: String
})

const emit = defineEmits([
  'update:busqueda',
  'update:empresa',
  'update:sector',
  'update:plan',
  'update:estado',
  'update:tipo',
  'toggle',
  'toggleGraficos'
])

const ordenarArray = (arr) => {
  return [...(arr || [])].sort((a, b) => {
    const aVal = typeof a === 'string' ? a : a.nombre
    const bVal = typeof b === 'string' ? b : b.nombre
    return aVal?.localeCompare?.(bVal)
  })
}

const empresasOrdenadas = computed(() => ordenarArray(props.empresas))
const sectoresOrdenados = computed(() => ordenarArray(props.sectores))
const planesOrdenados = computed(() => ordenarArray(props.planes))
const estadosOrdenados = computed(() => ordenarArray(props.estados))
const tiposOrdenados = computed(() => ordenarArray(props.tipos))

const placeholderBusqueda = computed(() => {
  if (props.entidad === 'empresa') return 'Buscar por empresa'
  if (props.entidad === 'ticket') return 'Buscar por ticket o título'
  if (props.entidad === 'contacto') return 'Buscar contacto, email o interno'
  return 'Buscar por usuario o email...'
})


const empresaNombreSeleccionada = computed(() => {
  if (!props.empresas || !props.empresaSeleccionada) return ''
  const emp = props.empresas.find(e =>
    typeof e === 'object' && e.id && String(e.id) === String(props.empresaSeleccionada)
  )
  return emp?.nombre || props.empresaSeleccionada
})

function limpiarFiltros() {
  emit('update:empresa', '')
  emit('update:sector', '')
  emit('update:plan', '')
  emit('update:estado', '')
  emit('update:tipo', '')
}
</script>

<template>
  <transition name="fade">
    <div class="mb-6 w-full">
      <!-- Búsqueda y filtros -->
      <!-- Búsqueda y filtros -->
        <div
          :class="[
            'flex flex-wrap justify-between items-center gap-4 w-full pb-5',
            (empresaSeleccionada || sectorSeleccionado || planSeleccionado || estadoSeleccionado || tipoSeleccionado)
              ? ''
              : margenInferior
          ]"
        >
        <!-- Izquierda -->
        <div class="flex flex-wrap items-center gap-4">
          <!-- Búsqueda -->
          <div class="relative w-[280px] sm:w-[300px] flex-shrink-0">
            <input
              :value="busqueda"
              @input="$emit('update:busqueda', $event.target.value)"
              type="text"
              :placeholder="placeholderBusqueda"
              class="w-full pl-10 pr-8 py-2 border rounded-md shadow-sm"
            />
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <XCircleIcon
              v-if="busqueda"
              @click="$emit('update:busqueda', '')"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 w-5 h-5 cursor-pointer"
            />
          </div>

          <!-- Filtros -->
          <div class="flex flex-wrap gap-4">
            <!-- Empresa -->
            <select
              v-if="empresas && empresaSeleccionada !== undefined"
              :value="empresaSeleccionada"
              @change="$emit('update:empresa', $event.target.value)"
              class="w-[200px] px-4 py-2 border rounded-md shadow-sm"
            >
              <option value="">Todas las empresas</option>
              <option
                v-for="empresa in empresasOrdenadas"
                :key="typeof empresa === 'string' ? empresa : empresa.id"
                :value="typeof empresa === 'string' ? empresa : empresa.id"
              >
                {{ typeof empresa === 'string' ? empresa : empresa.nombre }}
              </option>
            </select>

            <!-- Sector -->
            <select
              v-if="sectores && sectorSeleccionado !== undefined"
              :value="sectorSeleccionado"
              @change="$emit('update:sector', $event.target.value)"
              class="w-[200px] px-4 py-2 border rounded-md shadow-sm"
            >
              <option value="">Todos los sectores</option>
              <option
                v-for="sector in sectoresOrdenados"
                :key="sector"
                :value="sector"
              >
                {{ sector }}
              </option>
            </select>

            <!-- Plan -->
            <select
              v-if="planes && planSeleccionado !== undefined"
              :value="planSeleccionado"
              @change="$emit('update:plan', $event.target.value)"
              class="w-[200px] px-4 py-2 border rounded-md shadow-sm"
            >
              <option value="">Todos los planes</option>
              <option
                v-for="plan in planesOrdenados"
                :key="typeof plan === 'string' ? plan : plan.id"
                :value="typeof plan === 'string' ? plan : plan.id"
              >
                {{ typeof plan === 'string' ? plan : plan.nombre }}
              </option>
            </select>

            <!-- Estado -->
            <select
              v-if="estados && estadoSeleccionado !== undefined"
              :value="estadoSeleccionado"
              @change="$emit('update:estado', $event.target.value)"
              class="w-[200px] px-4 py-2 border rounded-md shadow-sm"
            >
              <option value="">Todos los estados</option>
              <option v-for="estado in estadosOrdenados" :key="estado" :value="estado">
                {{ estado }}
              </option>
            </select>

            <!-- Tipo -->
            <select
              v-if="tipos && tipoSeleccionado !== undefined"
              :value="tipoSeleccionado"
              @change="$emit('update:tipo', $event.target.value)"
              class="w-[200px] px-4 py-2 border rounded-md shadow-sm"
            >
              <option value="">Todos los tipos</option>
              <option v-for="tipo in tiposOrdenados" :key="tipo" :value="tipo">
                {{ tipo }}
              </option>
            </select>
          </div>
        </div>

<!-- Toggle alineado a la derecha -->
<div v-if="mostrarToggle" class="ml-auto flex items-center">
  <button
    v-if="entidad === 'usuario'"
    @click="$emit('toggle')"
    class="flex items-center gap-1 text-sm text-[#01C38E] hover:underline transition"
  >
    <EyeIcon v-if="!mostrarDetalles" class="w-4 h-4" />
    <EyeOffIcon v-else class="w-4 h-4" />
    <span class="whitespace-nowrap">
      {{ mostrarDetalles ? 'Ocultar detalles técnicos' : 'Ver detalles técnicos' }}
    </span>
  </button>

  <button
    v-if="entidad === 'empresa'"
    @click="$emit('toggleGraficos')"
    class="flex items-center gap-1 text-sm text-[#01C38E] hover:underline transition"
  >
    <EyeIcon v-if="!mostrarGraficos" class="w-4 h-4" />
    <EyeOffIcon v-else class="w-4 h-4" />
    <span class="whitespace-nowrap">
      {{ mostrarGraficos ? 'Ocultar consumo de planes' : 'Ver consumo de planes' }}
    </span>
  </button>
</div>

      </div>

      <!-- Chips activos -->
<!-- Chips activos -->
<div class="flex flex-wrap items-center gap-2 justify-between w-full">
  <div class="flex flex-wrap items-center gap-2">
    <!-- Chips de filtros individuales -->
    <span
      v-if="empresaSeleccionada"
      class="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm group hover:bg-red-100 transition"
    >
      Empresa: {{ empresaNombreSeleccionada }}
      <XCircleIcon
        @click="$emit('update:empresa', '')"
        class="w-5 h-5 text-gray-500 group-hover:text-red-500 cursor-pointer"
      />
    </span>

    <span
      v-if="sectorSeleccionado"
      class="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm group hover:bg-red-100 transition"
    >
      Sector: {{ sectorSeleccionado }}
      <XCircleIcon
        @click="$emit('update:sector', '')"
        class="w-5 h-5 text-gray-500 group-hover:text-red-500 cursor-pointer"
      />
    </span>

    <span
      v-if="planSeleccionado"
      class="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm group hover:bg-red-100 transition"
    >
      Plan: {{ planSeleccionado }}
      <XCircleIcon
        @click="$emit('update:plan', '')"
        class="w-5 h-5 text-gray-500 group-hover:text-red-500 cursor-pointer"
      />
    </span>

    <span
      v-if="estadoSeleccionado"
      class="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm group hover:bg-red-100 transition"
    >
      Estado: {{ estadoSeleccionado }}
      <XCircleIcon
        @click="$emit('update:estado', '')"
        class="w-5 h-5 text-gray-500 group-hover:text-red-500 cursor-pointer"
      />
    </span>

    <span
      v-if="tipoSeleccionado"
      class="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm group hover:bg-red-100 transition"
    >
      Tipo: {{ tipoSeleccionado }}
      <XCircleIcon
        @click="$emit('update:tipo', '')"
        class="w-5 h-5 text-gray-500 group-hover:text-red-500 cursor-pointer"
      />
    </span>

    <button
      v-if="empresaSeleccionada || sectorSeleccionado || planSeleccionado || estadoSeleccionado || tipoSeleccionado"
      @click="limpiarFiltros"
      class="text-gray-500 underline hover:text-gray-700 text-sm"
    >
      Quitar todos
    </button>
  </div>

  <!-- Chip de cantidad -->
  <span
    v-if="cantidad !== undefined"
    class="bg-white border border-gray-300 px-3 py-1 rounded-full text-sm text-gray-600 whitespace-nowrap"
  >
    {{ cantidad }} {{ entidad }}{{ cantidad === 1 ? '' : 's' }}
  </span>
</div>

    </div>
  </transition>
</template>
