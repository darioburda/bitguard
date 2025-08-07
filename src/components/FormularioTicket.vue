<template>
  <div class="space-y-4">
    <!-- Empresa (solo admin y solo si es nuevo) -->
    <div v-if="esAdmin && !ticket.id">
      <label for="empresa" class="block font-medium text-sm mb-1 cursor-pointer">Empresa</label>
      <select
        id="empresa"
        v-model="ticket.empresa_id"
        class="w-full px-4 py-2 border rounded-md text-sm cursor-pointer"
      >
        <option disabled value="">Seleccionar empresa</option>
        <option v-for="emp in empresas" :key="emp.id" :value="emp.id">
          {{ emp.nombre }}
        </option>
      </select>
    </div>

    <!-- Usuario (solo admin y solo si es nuevo) -->
    <div v-if="esAdmin && !ticket.id">
      <label for="usuario" class="block font-medium text-sm mb-1 cursor-pointer">Usuario solicitante</label>
      <select
        id="usuario"
        v-model="ticket.usuario_id"
        class="w-full px-4 py-2 border rounded-md text-sm cursor-pointer"
      >
        <option disabled value="">Seleccionar usuario</option>
        <option
          v-for="user in todosUsuarios.filter(u => u.empresa_id === ticket.empresa_id)"
          :key="user.id"
          :value="user.id"
        >
          {{ user.display_name || user.email }}
        </option>
      </select>
    </div>

    <!-- Usuario (solo admin y edición) -->
    <div v-if="esAdmin && ticket.id">
      <label for="usuario-lectura" class="block font-medium text-sm mb-1 mt-5 cursor-pointer">Usuario solicitante</label>
      <input
        id="usuario-lectura"
        type="text"
        :value="nombreUsuarioSolicitante"
        disabled
        class="w-full px-4 py-2 border rounded-md bg-gray-100 text-sm text-gray-700"
      />
    </div>

    <!-- Tema de ayuda como select -->
    <div>
      <label for="tema-ayuda" class="block font-medium text-sm mb-1 cursor-pointer">Tema de ayuda</label>
      <select
        id="tema-ayuda"
        v-model="temaSeleccionado"
        class="w-full px-4 py-2 border rounded-md text-sm cursor-pointer"
        :disabled="ticket.id"
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
      <div v-if="temaSeleccionado === 'Otro'">
        <label for="tema-especifico" class="block font-medium text-sm mb-1 mt-2 cursor-pointer">Especificar tema</label>
        <input
          id="tema-especifico"
          v-model="ticket.tema_ayuda"
          type="text"
          placeholder="Especificar tema"
          class="w-full px-4 py-2 border rounded-md text-sm cursor-pointer"
          :disabled="ticket.id"
        />
      </div>
    </div>

    <!-- Título del problema -->
    <div>
      <label for="titulo" class="block font-medium text-sm mb-1 cursor-pointer">Título del problema</label>
      <input
        id="titulo"
        type="text"
        v-model="ticket.titulo"
        class="w-full px-4 py-2 border rounded-md text-sm cursor-pointer"
        :disabled="ticket.id"
      />
    </div>

    <!-- Descripción -->
    <div>
      <label for="descripcion" class="block font-medium text-sm mb-1 cursor-pointer">Descripción</label>
      <textarea
        id="descripcion"
        v-model="ticket.descripcion"
        rows="4"
        class="w-full px-4 py-2 border rounded-md text-sm cursor-pointer"
        :disabled="ticket.id"
      ></textarea>
    </div>

    <!-- Tipo de soporte (solo admin) -->
    <div v-if="esAdmin">
      <label for="tipo" class="block font-medium text-sm mb-1 cursor-pointer">Tipo de soporte</label>
      <select
        id="tipo"
        v-model="ticket.tipo"
        class="w-full px-4 py-2 border rounded-md text-sm cursor-pointer"
      >
        <option disabled value="">Seleccionar tipo</option>
        <option value="Presencial">Presencial</option>
        <option value="Remoto">Remoto</option>
      </select>
    </div>

    <!-- Técnico asignado (solo admin) -->
    <div v-if="esAdmin">
      <label for="tecnico" class="block font-medium text-sm mb-1 cursor-pointer">Técnico asignado</label>
      <select
        id="tecnico"
        v-model="ticket.tecnico_id"
        class="w-full px-4 py-2 border rounded-md text-sm cursor-pointer"
      >
        <option disabled value="">Seleccionar técnico</option>
        <option v-for="tec in tecnicos" :key="tec.id" :value="tec.id">
          {{ tec.display_name || tec.email }}
        </option>
      </select>
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

const nombreUsuarioSolicitante = computed(() => {
  if (!props.ticket || !props.ticket.usuario_id) return '—'
  const user = props.todosUsuarios.find((u) => u.id === props.ticket.usuario_id)
  return user?.display_name || user?.email || 'Usuario no encontrado'
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

onMounted(() => {
  const actual = props.ticket.tema_ayuda
  temaSeleccionado.value = opcionesTemas.includes(actual) ? actual : 'Otro'
})
</script>
