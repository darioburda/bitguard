<script setup>
import { ref, computed, watch } from 'vue'
import MainSwitch from './MainSwitch.vue'
import ModalConfirmar from '@/components/ModalConfirmar.vue'

const form = defineModel('form')
const emit = defineEmits(['error'])
const props = defineProps({
  editing: Boolean,
  modo: String, // 'creacion' o 'edicion'
  empresas: {
    type: Array,
    default: () => []
  }
})

const mostrarModalAdmin = ref(false)

const puedeActivarSwitch = computed(() => {
  if (props.modo === 'edicion') return true
  return (
    form.value.display_name?.trim() &&
    form.value.email?.trim() &&
    form.value.password?.trim() &&
    form.value.empresa_id
  )
})

// Emitir error si faltan campos obligatorios en creación
watch(
  () => [form.value.display_name, form.value.email, form.value.password, form.value.empresa_id],
  ([nombre, email, password, empresa]) => {
    if (props.modo === 'creacion') {
      if (!nombre || !email || !password || !empresa) {
        emit('error', '❌ Todos los campos obligatorios deben completarse.')
      } else {
        emit('error', '')
      }
    }
  }
)

function manejarCambioAdmin(nuevoValor) {
  if (nuevoValor) {
    mostrarModalAdmin.value = true
  } else {
    form.value.is_admin = false
  }
}

function confirmarAdmin() {
  form.value.is_admin = true
  mostrarModalAdmin.value = false
}

function cancelarAdmin() {
  form.value.is_admin = false
  mostrarModalAdmin.value = false
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <!-- Nombre -->
    <div class="sm:col-span-2">
      <label for="display_name" class="block mb-2 font-semibold cursor-pointer">Nombre completo</label>
      <input
        id="display_name"
        v-model="form.display_name"
        class="w-full p-2 border rounded text-sm cursor-pointer"
        required
      />
    </div>

    <!-- Email -->
    <div class="sm:col-span-2">
      <label for="email" class="block mb-2 font-semibold cursor-pointer">Email</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        class="w-full p-2 border rounded text-sm cursor-pointer"
        required
      />
    </div>

    <!-- Contraseña solo en creación -->
    <div class="sm:col-span-2" v-if="props.modo === 'creacion'">
      <label for="password" class="block mb-2 font-semibold cursor-pointer">Contraseña</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        autocomplete="new-password"
        class="w-full p-2 border rounded text-sm cursor-pointer"
        required
      />
    </div>

    <!-- Empresa -->
    <div class="sm:col-span-2">
      <label for="empresa_id" class="block mb-2 font-semibold cursor-pointer">Empresa</label>
      <select
        id="empresa_id"
        v-model="form.empresa_id"
        class="w-full p-2 border rounded text-sm cursor-pointer"
        required
      >
        <option disabled value="">Seleccionar empresa</option>
        <option v-for="empresa in props.empresas" :key="empresa.id" :value="empresa.id">
          {{ empresa.nombre }}
        </option>
      </select>
    </div>

    <!-- Switch admin -->
    <div class="col-span-full mt-4">
      <MainSwitch
        :model-value="form.is_admin"
        @update:modelValue="manejarCambioAdmin"
        label="Dar acceso de administrador"
        :disabled="!puedeActivarSwitch"
        :title="!puedeActivarSwitch ? 'Completá los campos antes de otorgar permisos' : ''"
      />
    </div>

    <!-- Campos técnicos solo en edición -->
    <template v-if="props.modo === 'edicion'">
      <div class="sm:col-span-2 border-t pt-6 mt-6">
        <label for="rustdesk" class="block mb-2 font-semibold cursor-pointer">Rustdesk</label>
        <input id="rustdesk" v-model="form.rustdesk" class="w-full p-2 border rounded text-sm cursor-pointer" />
      </div>

      <div>
        <label for="equipo" class="block mb-2 font-semibold cursor-pointer">Equipo</label>
        <input id="equipo" v-model="form.equipo" class="w-full p-2 border rounded text-sm cursor-pointer" />
      </div>

      <div>
        <label for="ip_pc" class="block mb-2 font-semibold cursor-pointer">IP PC</label>
        <input id="ip_pc" v-model="form.ip_pc" class="w-full p-2 border rounded text-sm cursor-pointer" />
      </div>

      <div>
        <label for="interno_telefono" class="block mb-2 font-semibold cursor-pointer">Interno Telefónico</label>
        <input id="interno_telefono" v-model="form.interno_telefono" class="w-full p-2 border rounded text-sm cursor-pointer" />
      </div>

      <div>
        <label for="ip_telefono" class="block mb-2 font-semibold cursor-pointer">IP Teléfono</label>
        <input id="ip_telefono" v-model="form.ip_telefono" class="w-full p-2 border rounded text-sm cursor-pointer" />
      </div>

      <div>
        <label for="sistema_operativo" class="block mb-2 font-semibold cursor-pointer">Sistema Operativo</label>
        <select id="sistema_operativo" v-model="form.sistema_operativo" class="w-full p-2 border rounded text-sm cursor-pointer">
          <option disabled value="">Seleccionar</option>
          <option>Windows 7</option>
          <option>Windows 10</option>
          <option>Windows 11</option>
          <option>Windows Server 2016</option>
          <option>Windows Server 2022</option>
        </select>
      </div>

      <div>
        <label for="microprocesador" class="block mb-2 font-semibold cursor-pointer">Microprocesador</label>
        <select id="microprocesador" v-model="form.microprocesador" class="w-full p-2 border rounded text-sm cursor-pointer">
          <option disabled value="">Seleccionar</option>
          <option>I3</option>
          <option>I5</option>
          <option>I7</option>
          <option>Otro</option>
        </select>
      </div>

      <div>
        <label for="tipo_memoria" class="block mb-2 font-semibold cursor-pointer">Tipo de Memoria</label>
        <select id="tipo_memoria" v-model="form.tipo_memoria" class="w-full p-2 border rounded text-sm cursor-pointer">
          <option disabled value="">Seleccionar</option>
          <option>DDR3</option>
          <option>DDR4</option>
          <option>DDR5</option>
          <option>SODIMM</option>
        </select>
      </div>

      <div>
        <label for="tamano_memoria" class="block mb-2 font-semibold cursor-pointer">Tamaño de Memoria (GB)</label>
        <select id="tamano_memoria" v-model="form.tamano_memoria" class="w-full p-2 border rounded text-sm cursor-pointer">
          <option disabled value="">Seleccionar</option>
          <option>4</option>
          <option>8</option>
          <option>16</option>
          <option>32</option>
        </select>
      </div>

      <div>
        <label for="tipo_disco" class="block mb-2 font-semibold cursor-pointer">Tipo de Disco</label>
        <select id="tipo_disco" v-model="form.tipo_disco" class="w-full p-2 border rounded text-sm cursor-pointer">
          <option disabled value="">Seleccionar</option>
          <option>SSD</option>
          <option>Mecánico</option>
        </select>
      </div>

      <div>
        <label for="tamano_disco" class="block mb-2 font-semibold cursor-pointer">Tamaño de Disco (GB)</label>
        <select id="tamano_disco" v-model="form.tamano_disco" class="w-full p-2 border rounded text-sm cursor-pointer">
          <option disabled value="">Seleccionar</option>
          <option>120</option>
          <option>250</option>
          <option>500</option>
          <option>1000</option>
        </select>
      </div>

      <div class="sm:col-span-2">
        <label for="notas" class="block mb-2 font-semibold cursor-pointer">Notas</label>
        <textarea
          id="notas"
          v-model="form.notas"
          class="w-full p-2 border rounded text-sm resize-none h-24 cursor-pointer"
        ></textarea>
      </div>
    </template>
  </div>

  <!-- Modal confirmar admin -->
  <ModalConfirmar
    v-if="mostrarModalAdmin"
    :visible="true"
    :titulo="'Rol de Administrador'"
    :mensaje="`¿Estás seguro de que querés otorgarle acceso de administrador a <strong>${form.display_name || 'el usuario'}</strong>?`"
    @confirmar="confirmarAdmin"
    @cancelar="cancelarAdmin"
  />
</template>
