<template>
  <transition name="fade">
    <div class="flex flex-wrap items-center gap-4 mb-4">
      <input
        :value="busqueda"
        @input="$emit('update:busqueda', $event.target.value)"
        type="text"
        placeholder="Buscar por nombre o email..."
        class="w-full sm:w-[300px] px-4 py-2 border rounded-md shadow-sm"
      />
      <select
        :value="empresaSeleccionada"
        @change="$emit('update:empresa', $event.target.value)"
        class="w-full sm:w-[200px] px-4 py-2 border rounded-md shadow-sm"
      >
        <option value="">Todas las empresas</option>
        <option v-for="empresa in empresas" :key="empresa" :value="empresa">
          {{ empresa }}
        </option>
      </select>
      <select
        :value="sectorSeleccionado"
        @change="$emit('update:sector', $event.target.value)"
        class="w-full sm:w-[200px] px-4 py-2 border rounded-md shadow-sm"
      >
        <option value="">Todos los sectores</option>
        <option v-for="sector in sectores" :key="sector" :value="sector">
          {{ sector }}
        </option>
      </select>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  busqueda: String,
  empresaSeleccionada: String,
  sectorSeleccionado: String,
  empresas: Array,
  sectores: Array
})

defineEmits(['update:busqueda', 'update:empresa', 'update:sector'])
</script>
