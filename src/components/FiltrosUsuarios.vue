<template>
  <transition name="fade">
    <div class="mb-6 w-full">
      <!-- Línea unificada de búsqueda, filtros y toggle -->
      <div class="flex flex-wrap items-center justify-between gap-4 w-full">
        <!-- Búsqueda -->
        <div class="relative w-full sm:w-[300px] flex-shrink-0">
          <input
            :value="busqueda"
            @input="$emit('update:busqueda', $event.target.value)"
            type="text"
            placeholder="Buscar por nombre o email..."
            class="w-full pl-10 pr-4 py-2 border rounded-md shadow-sm"
          />
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        <!-- Filtros -->
        <div class="flex flex-wrap gap-4 justify-start sm:justify-center">
        <!-- Empresa -->
        <select
            :value="empresaSeleccionada"
            @change="$emit('update:empresa', $event.target.value)"
            class="w-[200px] px-4 py-2 border rounded-md shadow-sm"
        >
            <option value="">Todas las empresas</option>
            <option v-for="empresa in empresasOrdenadas" :key="empresa" :value="empresa">
            {{ empresa }}
            </option>
        </select>

        <!-- Sector -->
        <select
            :value="sectorSeleccionado"
            @change="$emit('update:sector', $event.target.value)"
            class="w-[200px] px-4 py-2 border rounded-md shadow-sm"
        >
            <option value="">Todos los sectores</option>
            <option v-for="sector in sectoresOrdenados" :key="sector" :value="sector">
            {{ sector }}
            </option>
        </select>

        <!-- Plan -->
        <select
            :value="planSeleccionado"
            @change="$emit('update:plan', $event.target.value)"
            class="w-[200px] px-4 py-2 border rounded-md shadow-sm"
        >
            <option value="">Todos los planes</option>
            <option v-for="plan in planesOrdenados" :key="plan" :value="plan">
            {{ plan }}
            </option>
        </select>
        </div>


        <!-- Toggle -->
        <button
          @click="$emit('toggle')"
          class="flex items-center gap-1 text-sm text-[#01C38E] hover:underline focus:outline-none transition min-w-fit"
        >
          <EyeIcon v-if="!mostrarDetalles" class="w-4 h-4" />
          <EyeOffIcon v-else class="w-4 h-4" />
          <span class="whitespace-nowrap">
            {{ mostrarDetalles ? `Ocultar detalles técnicos` : `Ver detalles técnicos` }}
          </span>
        </button>
      </div>

      <!-- Chips de filtros activos -->
      <div class="flex flex-wrap items-center gap-2 mt-3">
        <span
          v-if="empresaSeleccionada"
          class="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm group hover:bg-red-100 transition"
        >
          Empresa: {{ empresaSeleccionada }}
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

        <!-- Botón "Quitar todos" -->
        <button
          v-if="empresaSeleccionada || sectorSeleccionado || planSeleccionado"
          @click="limpiarFiltros"
          class="text-gray-500 underline hover:text-gray-700 text-sm"
        >
          Quitar todos
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { XCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'

const props = defineProps({
  busqueda: String,
  empresaSeleccionada: String,
  sectorSeleccionado: String,
  planSeleccionado: String,
  empresas: Array,
  sectores: Array,
  planes: Array,
  mostrarDetalles: Boolean
})

const emit = defineEmits([
  'update:busqueda',
  'update:empresa',
  'update:sector',
  'update:plan',
  'toggle'
])

const empresasOrdenadas = computed(() => [...props.empresas].sort((a, b) => a.localeCompare(b)))
const sectoresOrdenados = computed(() => [...props.sectores].sort((a, b) => a.localeCompare(b)))
const planesOrdenados = computed(() => [...props.planes].sort((a, b) => a.localeCompare(b)))

function limpiarFiltros() {
  emit('update:empresa', '')
  emit('update:sector', '')
  emit('update:plan', '')
}
</script>
