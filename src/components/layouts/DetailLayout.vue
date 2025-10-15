<template>
  <div class="mb-6">
    <!-- Título -->
    <h1 class="text-2xl font-bold text-gray-800">{{ titulo }}</h1>

    <!-- Acciones opcionales -->
    <div v-if="$slots.acciones" class="mt-4">
      <slot name="acciones" />
    </div>
  </div>

  <!-- Separador -->
  <!-- <div class="border-b border-gray-200 mb-6"></div> -->

  <!-- Contenido principal -->
  <slot />
</template>

<script setup>
defineProps({
  titulo: {
    type: String,
    required: true
  }
})
</script>
