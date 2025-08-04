<script setup>
import { ref, computed } from 'vue'
import MainSwitch from './MainSwitch.vue'
import ModalConfirmar from '@/components/ModalConfirmar.vue'

const form = defineModel('form')
const props = defineProps({ editing: Boolean })

const mostrarModalAdmin = ref(false)

// Habilitar el switch solo si todos los campos están completos
const puedeActivarSwitch = computed(() =>
  form.value.display_name?.trim() &&
  form.value.email?.trim() &&
  form.value.password?.trim()
)

// Interceptar cambio del switch
function manejarCambioAdmin(nuevoValor) {
  if (nuevoValor && !props.editing) {
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

    <!-- Contraseña -->
    <div class="sm:col-span-2">
      <label for="password" class="block mb-2 font-semibold cursor-pointer">Contraseña</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        autocomplete="new-password"
        autocorrect="off"
        spellcheck="false"
        :disabled="props.editing"
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
