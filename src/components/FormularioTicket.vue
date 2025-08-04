<script setup>
import { ref, computed, watch, reactive } from 'vue'

const props = defineProps({
  ticket: Object,
  empresas: Array,
  usuarios: Array,
  tecnicos: Array,
  todosUsuarios: Array
})

const emit = defineEmits(['update:ticket'])

// Creamos una copia reactiva local para trabajar
const localTicket = reactive({ ...props.ticket })

// Emitimos los cambios hacia el padre
watch(
  () => localTicket,
  (newVal) => {
    emit('update:ticket', { ...newVal })
  },
  { deep: true }
)

// Variables para manejo del autocomplete y UI
const busquedaUsuario = ref('')
const mostrarSugerencias = ref(false)
const mostrarSelectUsuarios = ref(false)
const usuarioSeleccionado = ref('')

// Computed para filtrar usuarios según texto de búsqueda
const usuariosFiltrados = computed(() => {
  const texto = busquedaUsuario.value.toLowerCase()
  return props.usuarios
    .filter(
      (u) =>
        (u.display_name && u.display_name.toLowerCase().includes(texto)) ||
        u.email.toLowerCase().includes(texto)
    )
    .slice(0, 10)
})

// Funciones para seleccionar usuario desde autocomplete o select
function seleccionarUsuario(usuario) {
  localTicket.usuario_id = usuario.id
  usuarioSeleccionado.value = usuario.display_name || usuario.email
  busquedaUsuario.value = usuarioSeleccionado.value
  mostrarSugerencias.value = false
  mostrarSelectUsuarios.value = false
}

function seleccionarDesdeSelect(e) {
  const id = e.target.value
  const usuario = props.usuarios.find((u) => u.id === id)
  if (usuario) {
    seleccionarUsuario(usuario)
  }
}

function ocultarConDelay() {
  setTimeout(() => {
    mostrarSugerencias.value = false
  }, 200)
}

// Limpiar usuario seleccionado cuando cambia empresa
watch(
  () => localTicket.empresa_id,
  () => {
    localTicket.usuario_id = ''
    usuarioSeleccionado.value = ''
    busquedaUsuario.value = ''
  }
)
</script>

<template>
  <form @submit.prevent>
    <!-- Empresa -->
    <div>
      <label for="empresa" class="block mb-1 font-semibold cursor-pointer">Empresa</label>
      <select
        id="empresa"
        v-model="localTicket.empresa_id"
        class="w-full border px-4 py-2 rounded"
      >
        <option disabled value="">Selecciona una empresa</option>
        <option v-for="e in empresas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
      </select>
    </div>

    <!-- Usuario solicitante con autocomplete -->
    <div class="relative mt-4">
      <label class="block mb-1 font-semibold cursor-pointer">Usuario solicitante</label>
      <input
        type="text"
        v-model="busquedaUsuario"
        placeholder="Buscar por nombre o email..."
        class="w-full border px-4 py-2 rounded"
        :disabled="props.usuarios.length === 0"
        @focus="mostrarSugerencias = true"
        @blur="ocultarConDelay"
      />
      <ul
        v-if="mostrarSugerencias && busquedaUsuario && usuariosFiltrados.length > 0"
        class="absolute z-10 w-full bg-white border border-gray-300 rounded shadow max-h-52 overflow-auto"
      >
        <li
          v-for="u in usuariosFiltrados"
          :key="u.id"
          @mousedown.prevent="seleccionarUsuario(u)"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          {{ u.display_name ? `${u.display_name} - ${u.email}` : u.email }}
        </li>
      </ul>
      <p
        v-if="mostrarSugerencias && busquedaUsuario && usuariosFiltrados.length === 0"
        class="mt-2 text-sm text-red-600"
      >
        ❗ Usuario no encontrado. Verificá el nombre o email.
      </p>
      <div v-if="usuarioSeleccionado" class="text-sm text-gray-600 mt-1">
        Usuario seleccionado: <strong>{{ usuarioSeleccionado }}</strong>
      </div>
      <button
        type="button"
        class="mt-3 text-sm text-blue-600 underline"
        @click="mostrarSelectUsuarios = !mostrarSelectUsuarios"
      >
        {{ mostrarSelectUsuarios ? 'Ocultar listado completo' : '¿No recordás el nombre? Mostrar lista completa' }}
      </button>
      <div v-if="mostrarSelectUsuarios" class="mt-2">
        <select
          class="w-full border px-4 py-2 rounded"
          @change="seleccionarDesdeSelect"
          :value="localTicket.usuario_id"
        >
          <option value="">Selecciona un usuario</option>
          <option v-for="u in usuarios" :key="u.id" :value="u.id">
            {{ u.display_name ? `${u.display_name} - ${u.email}` : u.email }}
          </option>
        </select>
      </div>
    </div>

    <!-- Título -->
    <div class="mt-4">
      <label for="titulo" class="block mb-1 font-semibold cursor-pointer"
        >Título del ticket <span class="text-red-600">*</span></label
      >
      <input
        id="titulo"
        type="text"
        v-model="localTicket.titulo"
        class="w-full border px-4 py-2 rounded"
        maxlength="100"
        required
      />
    </div>

    <!-- Tema de ayuda -->
    <div class="mt-4">
      <label for="tema_ayuda" class="block mb-1 font-semibold cursor-pointer"
        >Tema de ayuda</label
      >
      <select
        id="tema_ayuda"
        v-model="localTicket.tema_ayuda"
        class="w-full border px-4 py-2 rounded"
      >
        <option disabled value="">Selecciona una categoría</option>
        <option value="Red">Red</option>
        <option value="Hardware">Hardware</option>
        <option value="Software">Software</option>
        <option value="Correo">Correo</option>
        <option value="Otro">Otro</option>
      </select>
    </div>

    <!-- Tipo de soporte -->
    <div class="mt-4">
      <label for="tipo" class="block mb-1 font-semibold cursor-pointer">Tipo</label>
      <select
        id="tipo"
        v-model="localTicket.tipo"
        class="w-full border px-4 py-2 rounded"
      >
        <option value="Remoto">Remoto</option>
        <option value="Presencial">Presencial</option>
      </select>
    </div>

    <!-- Descripción -->
    <div class="mt-4">
      <label for="descripcion" class="block mb-1 font-semibold cursor-pointer"
        >Descripción <span class="text-red-600">*</span></label
      >
      <textarea
        id="descripcion"
        v-model="localTicket.descripcion"
        class="w-full border px-4 py-2 rounded resize-none"
        rows="4"
        required
      ></textarea>
    </div>

    <!-- Técnico asignado -->
    <div class="mt-4">
      <label for="tecnico_id" class="block mb-1 font-semibold cursor-pointer"
        >Asignar técnico (opcional)</label
      >
      <select
        id="tecnico_id"
        v-model="localTicket.tecnico_id"
        class="w-full border px-4 py-2 rounded"
      >
        <option value="">-- Ninguno --</option>
        <option v-for="t in tecnicos" :key="t.id" :value="t.id">
          {{ t.display_name || t.email }}
        </option>
      </select>
    </div>
  </form>
</template>
