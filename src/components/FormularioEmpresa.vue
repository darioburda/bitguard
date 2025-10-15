<script setup>
import { defineModel, defineProps, watch } from 'vue'

const form = defineModel('form')

defineProps({
  planes: Array,
  editing: Boolean
})

// Formatear CUIT al volar caracteres no numéricos y limitar a 11 dígitos
watch(() => form.value.cuit, (nuevo) => {
  let digits = nuevo?.replace(/\D/g, '').slice(0, 11) || '' // Limita a 11 dígitos

  if (digits.length === 11) {
    form.value.cuit = digits.replace(/^(\d{2})(\d{8})(\d)/, '$1-$2-$3')
  } else if (digits.length > 2 && digits.length <= 10) {
    form.value.cuit = digits.replace(/^(\d{2})(\d+)/, '$1-$2')
  } else {
    form.value.cuit = digits
  }
})
</script>


<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <!-- Nombre -->
    <div class="sm:col-span-2">
      <label for="nombre" class="block mb-2 font-semibold cursor-pointer">Nombre de la empresa</label>
      <input
        id="nombre"
        v-model="form.nombre"
        :disabled="editing"
        class="w-full p-2 border rounded text-sm cursor-pointer"
        required
      />
    </div>

    <!-- Email de contacto -->
    <div class="sm:col-span-2">
      <label for="email_contacto" class="block mb-2 font-semibold cursor-pointer">Email de contacto</label>
      <input
        id="email_contacto"
        v-model="form.email_contacto"
        type="email"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        :disabled="editing"
        class="w-full p-2 border rounded text-sm cursor-pointer"
        placeholder="correo@dominio.com"
      />
    </div>

    <!-- Teléfono -->
    <div class="sm:col-span-2">
      <label for="telefono" class="block mb-2 font-semibold cursor-pointer">Teléfono</label>
      <input
        id="telefono"
        v-model="form.telefono"
        type="text"
        :disabled="editing"
        class="w-full p-2 border rounded text-sm cursor-pointer"
      />
    </div>

    <!-- Dirección -->
    <div class="sm:col-span-2">
      <label for="direccion" class="block mb-2 font-semibold cursor-pointer">Dirección</label>
      <input
        id="direccion"
        v-model="form.direccion"
        type="text"
        :disabled="editing"
        class="w-full p-2 border rounded text-sm cursor-pointer"
      />
    </div>

    <!-- CUIT -->
    <div class="sm:col-span-2">
      <label for="cuit" class="block mb-2 font-semibold cursor-pointer">CUIT</label>
      <input
        id="cuit"
        v-model="form.cuit"
        type="text"
        placeholder="20-12345678-1"
        :disabled="editing"
        class="w-full p-2 border rounded text-sm cursor-pointer"
      />
    </div>

    <!-- Plan -->
    <div class="sm:col-span-2">
      <label for="plan_id" class="block mb-2 font-semibold cursor-pointer">Plan asignado</label>
      <select
        id="plan_id"
        v-model="form.plan_id"
        :disabled="editing"
        class="w-full p-2 border rounded text-sm cursor-pointer"
        required
      >
        <option disabled value="">Selecciona un plan</option>
        <option v-for="plan in planes" :key="plan.id" :value="plan.id">
          {{ plan.nombre }}
        </option>
      </select>
    </div>
  </div>
</template>
