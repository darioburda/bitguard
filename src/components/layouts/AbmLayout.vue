<template>
  <!-- Título -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold">{{ titulo }}</h1>
  </div>

  <!-- Acciones -->
  <slot name="acciones" />

  <!-- Filtros -->
  <slot name="filtros" />

  <!-- Separador -->
  <div class="pt-0 my-0 border-b border-gray-200"></div>
</template>

<script setup>
defineProps({
  titulo: {
    type: String,
    required: true
  }
})
</script>
