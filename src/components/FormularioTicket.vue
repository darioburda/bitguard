<template>
  <div class="space-y-4">
    <!-- Usuario solicitante (solo edición, readonly, solo admin) -->
    <div v-if="esAdmin && ticket.id">
      <label class="block font-medium text-sm mb-1 mt-5">Usuario solicitante</label>
      <input
        type="text"
        :value="nombreUsuarioSolicitante"
        disabled
        class="w-full px-4 py-2 border rounded-md bg-gray-100 text-sm text-gray-700"
      />
    </div>

    <!-- Empresa (select si es nuevo, solo admin) -->
    <div v-if="esAdmin">
      <label class="block font-medium text-sm mb-1">Empresa</label>
      <template v-if="!ticket.id">
        <select
          v-model="ticket.empresa_id"
          class="w-full px-4 py-2 border rounded-md text-sm"
        >
          <option disabled value="">Seleccionar empresa</option>
          <option v-for="emp in empresas" :key="emp.id" :value="emp.id">
            {{ emp.nombre }}
          </option>
        </select>
      </template>
      <template v-else>
        <input
          type="text"
          :value="nombreEmpresa"
          disabled
          class="w-full px-4 py-2 border rounded-md bg-gray-100 text-sm text-gray-700"
        />
      </template>
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

    <!-- Tema de ayuda como select -->
    <div>
      <label class="block font-medium text-sm mb-1">Tema de ayuda</label>
      <select
        v-model="temaSeleccionado"
        class="w-full px-4 py-2 border rounded-md text-sm"
        :disabled="!puedeEditar"
      >
        <option disabled value="">Seleccionar tema</option>
        <option value="No hay internet">No hay internet</option>
        <option value="No imprime">No imprime</option>
        <option value="PC lenta">PC lenta</option>
        <option value="Error de login">Error de login</option>
        <option value="Problema con sistema de gestión">Problema con sistema de gestión</option>
        <option value="Otro">Otro (especificar)</option>
      </select>

      <!-- Input visible solo si elige "Otro" -->
      <input
        v-if="temaSeleccionado === 'Otro'"
        v-model="ticket.tema_ayuda"
        type="text"
        placeholder="Especificar tema"
        class="w-full px-4 py-2 border rounded-md text-sm mt-2"
        :disabled="!puedeEditar"
      />
    </div>

    <!-- Tipo de soporte (solo admin) -->
    <div v-if="esAdmin">
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

    <!-- Técnico asignado (solo admin) -->
    <div v-if="esAdmin">
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
import { computed, ref, watch, onMounted } from 'vue'

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
  },
  esAdmin: {
    type: Boolean,
    default: false
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

// Select dinámico para tema_ayuda
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
    props.ticket.tema_ayuda = nuevo
  } else {
    props.ticket.tema_ayuda = ''
  }
})

// Inicializa correctamente al editar
onMounted(() => {
  const actual = props.ticket.tema_ayuda
  temaSeleccionado.value = opcionesTemas.includes(actual) ? actual : 'Otro'
})
</script>

