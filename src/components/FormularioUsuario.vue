<script setup>
import { ref, computed } from 'vue'
import MainSwitch from './MainSwitch.vue'
import ModalConfirmar from '@/components/ModalConfirmar.vue'

const form = defineModel('form')
const props = defineProps({
  editing: Boolean,
  modo: String, // 'creacion' o 'edicion'
})

const mostrarModalAdmin = ref(false)

// ✅ Solo pide password en modo 'creacion'
const puedeActivarSwitch = computed(() => {
  if (props.modo === 'edicion') return true
  return (
    form.value.display_name?.trim() &&
    form.value.email?.trim() &&
    form.value.password?.trim()
  )
})

// ✅ Siempre muestra el modal al querer activar admin
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
    <!-- Nombre completo -->
    <div class="sm:col-span-2">
      <label for="display_name" class="block mb-2 font-semibold cursor-pointer">Nombre completo</label>
      <input
        id="display_name"
        v-model="form.display_name"
        :disabled="props.editing"
        class="w-full p-2 border rounded text-sm"
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
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        :disabled="props.editing"
        class="w-full p-2 border rounded text-sm"
        required
      />
    </div>

    <!-- ✅ Contraseña solo si es creación -->
    <div class="sm:col-span-2" v-if="props.modo === 'creacion'">
      <label for="password" class="block mb-2 font-semibold cursor-pointer">Contraseña</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        autocomplete="new-password"
        autocorrect="off"
        spellcheck="false"
        class="w-full p-2 border rounded text-sm"
        required
      />
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

    <!-- Resto de campos solo en edición -->
    <template v-if="props.modo === 'edicion'">
      <div class="sm:col-span-2 border-t pt-6 mt-6">
        <label for="rustdesk" class="block mb-2 font-semibold">Rustdesk</label>
        <input v-model="form.rustdesk" id="rustdesk" class="w-full p-2 border rounded text-sm" />
      </div>
      <div>
        <label class="block mb-2 font-semibold">Equipo</label>
        <input v-model="form.equipo" class="w-full p-2 border rounded text-sm" />
      </div>
      <div>
        <label class="block mb-2 font-semibold">IP PC</label>
        <input v-model="form.ip_pc" class="w-full p-2 border rounded text-sm" />
      </div>
      <div>
        <label class="block mb-2 font-semibold">Interno Telefónico</label>
        <input v-model="form.interno_telefono" class="w-full p-2 border rounded text-sm" />
      </div>
      <div>
        <label class="block mb-2 font-semibold">IP Teléfono</label>
        <input v-model="form.ip_telefono" class="w-full p-2 border rounded text-sm" />
      </div>
      <div>
        <label class="block mb-2 font-semibold">Sistema Operativo</label>
        <select v-model="form.sistema_operativo" class="w-full p-2 border rounded text-sm">
          <option disabled value="">Seleccionar</option>
          <option>Windows 7</option>
          <option>Windows 10</option>
          <option>Windows 11</option>
          <option>Windows Server 2016</option>
          <option>Windows Server 2022</option>
        </select>
      </div>
      <div>
        <label class="block mb-2 font-semibold">Microprocesador</label>
        <select v-model="form.microprocesador" class="w-full p-2 border rounded text-sm">
          <option disabled value="">Seleccionar</option>
          <option>I3</option>
          <option>I5</option>
          <option>I7</option>
          <option>Otro</option>
        </select>
      </div>
      <div>
        <label class="block mb-2 font-semibold">Tipo de Memoria</label>
        <select v-model="form.tipo_memoria" class="w-full p-2 border rounded text-sm">
          <option disabled value="">Seleccionar</option>
          <option>DDR3</option>
          <option>DDR4</option>
          <option>DDR5</option>
          <option>SODIMM</option>
        </select>
      </div>
      <div>
        <label class="block mb-2 font-semibold">Tamaño de Memoria (GB)</label>
        <select v-model="form.tamano_memoria" class="w-full p-2 border rounded text-sm">
          <option disabled value="">Seleccionar</option>
          <option>4</option>
          <option>8</option>
          <option>16</option>
          <option>32</option>
        </select>
      </div>
      <div>
        <label class="block mb-2 font-semibold">Tipo de Disco</label>
        <select v-model="form.tipo_disco" class="w-full p-2 border rounded text-sm">
          <option disabled value="">Seleccionar</option>
          <option>SSD</option>
          <option>Mecánico</option>
        </select>
      </div>
      <div>
        <label class="block mb-2 font-semibold">Tamaño de Disco (GB)</label>
        <select v-model="form.tamano_disco" class="w-full p-2 border rounded text-sm">
          <option disabled value="">Seleccionar</option>
          <option>120</option>
          <option>250</option>
          <option>500</option>
          <option>1000</option>
        </select>
      </div>
      <div class="sm:col-span-2">
        <label class="block mb-2 font-semibold">Notas</label>
        <textarea v-model="form.notas" class="w-full p-2 border rounded text-sm resize-none h-24"></textarea>
      </div>
    </template>
  </div>

  <!-- Modal Confirmar acceso admin -->
  <ModalConfirmar
    v-if="mostrarModalAdmin"
    :visible="true"
    :titulo="'Rol de Administrador'"
    :mensaje="`¿Estás seguro de que querés otorgarle acceso de administrador a <strong>${form.display_name || 'el usuario'}</strong>?`"
    @confirmar="confirmarAdmin"
    @cancelar="cancelarAdmin"
  />
</template>
