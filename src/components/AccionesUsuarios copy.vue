<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex flex-wrap gap-4 items-center min-h-[42px]">
      <MainButton @click="$emit('agregar')">Agregar Usuario</MainButton>

      <transition-group name="fade-button" tag="div" class="flex gap-4">
        <MainButton
          v-if="usuariosSeleccionados.size === 1"
          key="editar"
          class="bg-blue-500 hover:bg-blue-600 flex items-center gap-1"
          @click="$emit('editar')"
        >
          <PencilIcon class="w-4 h-4" />
          Editar Usuario
        </MainButton>

        <MainButton
          v-if="usuariosSeleccionados.size > 0"
          key="borrar"
          class="bg-red-500 hover:bg-red-600 flex items-center gap-1"
          @click="$emit('borrar')"
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
            @click="$emit('deseleccionarTodos')"
            class="text-gray-500 underline hover:text-gray-700"
          >
            Deseleccionar todos
          </button>
        </div>
      </transition>
    </div>

    <!-- Toggle técnicos -->
    <button
      @click="$emit('toggleTecnicos')"
      class="flex items-center gap-1 text-sm text-[#01C38E] hover:underline focus:outline-none transition"
    >
      <EyeIcon v-if="!mostrarTecnicos" class="w-4 h-4" />
      <EyeOffIcon v-else class="w-4 h-4" />
      <span>
        {{ mostrarTecnicos ? 'Ocultar detalles técnicos' : 'Ver detalles técnicos' }}
      </span>
    </button>
  </div>
</template>

<script setup>
import MainButton from '@/components/MainButton.vue'
import { PencilIcon, Trash2Icon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'

defineProps({
  usuariosSeleccionados: Object,
  mostrarTecnicos: Boolean
})

defineEmits(['agregar', 'editar', 'borrar', 'toggleTecnicos', 'deseleccionarTodos'])
</script>
