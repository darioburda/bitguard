<template>
  <div class="space-y-4">


    <!-- Usuario solicitante (solo edición, readonly) -->
    <div v-if="ticket.id">
      <label class="block font-medium text-sm mb-1 mt-5">Usuario solicitante</label>
      <input
        type="text"
        :value="nombreUsuarioSolicitante"
        disabled
        class="w-full px-4 py-2 border rounded-md bg-gray-100 text-sm text-gray-700"
      />
    </div>

        <!-- Empresa (solo lectura) -->
    <div>
      <label class="block font-medium text-sm mb-1">Empresa</label>
      <input
        type="text"
        :value="nombreEmpresa"
        disabled
        class="w-full px-4 py-2 border rounded-md bg-gray-100 text-sm text-gray-700"
      />
    </div>

    <!-- Título -->
    <div>
      <label class="block font-medium text-sm mb-1">Título del problema</label>
      <input
        type="text"
        v-model="ticket.titulo"
        class="w-full px-4 py-2 border rounded-md text-sm"
        :disabled="!puedeEditar"
      />
    </div>

    <!-- Tema de ayuda -->
    <div>
      <label class="block font-medium text-sm mb-1">Tema de ayuda</label>
      <input
        type="text"
        v-model="ticket.tema_ayuda"
        class="w-full px-4 py-2 border rounded-md text-sm"
        :disabled="!puedeEditar"
      />
    </div>

    <!-- Tipo de soporte -->
    <div>
      <label class="block font-medium text-sm mb-1">Tipo de soporte</label>
      <select
        v-model="ticket.tipo"
        class="w-full px-4 py-2 border rounded-md text-sm"
      >
        <option disabled value="">Seleccionar tipo</option>
        <option value="Presencial">Presencial</option>
        <option value="Remoto">Remoto</option>
      </select>
    </div>

    <!-- Técnico asignado -->
    <div>
      <label class="block font-medium text-sm mb-1">Técnico asignado</label>
      <select
        v-model="ticket.tecnico_id"
        class="w-full px-4 py-2 border rounded-md text-sm"
      >
        <option disabled value="">Seleccionar técnico</option>
        <option v-for="tec in tecnicos" :key="tec.id" :value="tec.id">
          {{ tec.display_name || tec.email }}
        </option>
      </select>
    </div>

    <!-- Descripción -->
    <div>
      <label class="block font-medium text-sm mb-1">Descripción</label>
      <textarea
        v-model="ticket.descripcion"
        rows="4"
        class="w-full px-4 py-2 border rounded-md text-sm"
        :disabled="!puedeEditar"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  },
  empresas: {
    type: Array,
    required: true
  },
  tecnicos: {
    type: Array,
    required: true
  },
  todosUsuarios: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:ticket'])

const puedeEditar = computed(() => {
  return !props.ticket.id || props.ticket.estado === 'Abierto'
})

const nombreUsuarioSolicitante = computed(() => {
  if (!props.ticket || !props.ticket.usuario_id) return '—'
  const user = props.todosUsuarios.find((u) => u.id === props.ticket.usuario_id)
  return user?.display_name || user?.email || 'Usuario no encontrado'
})

const nombreEmpresa = computed(() => {
  if (!props.ticket || !props.ticket.empresa_id) return '—'
  const emp = props.empresas.find((e) => e.id === props.ticket.empresa_id)
  return emp?.nombre || 'Empresa no encontrada'
})
</script>
