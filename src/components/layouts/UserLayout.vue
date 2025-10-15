<template>
  <!-- Título -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold">{{ titulo }}</h1>
  </div>

  <!-- Filtros -->
  <slot name="filtros" />
  

  <!-- Separador -->
  <div class="border-b border-gray-200 mb-6"></div>

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
