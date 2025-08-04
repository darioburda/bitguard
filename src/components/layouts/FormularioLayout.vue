<template>
  <div class="relative bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 overflow-hidden">
    <!-- Badges opcionales -->
    <slot name="badges" />

    <!-- Contenido del formulario -->
    <slot />
  </div>
</template>


<script setup>
// Este layout encapsula un formulario dentro de una card visual consistente
// con padding, sombra y ancho fijo como en MyProfile o EditarUsuario
</script>
