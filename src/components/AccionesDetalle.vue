<!-- /components/AccionesDetalle.vue -->
<template>
  <div class="flex justify-start mb-4 gap-2">
    <slot />
  </div>

  <!-- Slot para feedback opcional -->
  <slot name="feedback" />

  <div class="border-b border-gray-200 mb-6"></div>
</template>

<script setup>
// Componente de acciones con slot principal para botones
// y slot adicional para mensajes de feedback (ej: AlertMessage)
</script>

<style scoped>
/* Estilos personalizados opcionales */
</style>
