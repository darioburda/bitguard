<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <!-- Nombre completo -->
      <div class="sm:col-span-2">
        <label for="display_name" class="block mb-1 font-semibold">Nombre completo</label>
        <input
          v-model="profile.display_name"
          type="text"
          id="display_name"
          class="w-full p-2 border border-gray-400 rounded text-sm"
        />
      </div>

      <!-- Interno -->
      <div class="w-32">
        <label for="interno_telefono" class="block mb-1 font-semibold">Interno</label>
        <input
          v-model="profile.interno_telefono"
          type="text"
          id="interno_telefono"
          class="w-full p-2 border border-gray-300 rounded text-sm bg-gray-100"
          disabled
          title="Campo definido por IT"
        />
      </div>

      <!-- Sector -->
      <div class="sm:col-span-1">
        <label for="sector" class="block mb-1 font-semibold">Sector</label>
        <input
          v-model="profile.sector"
          type="text"
          id="sector"
          class="w-full p-2 border border-gray-300 rounded text-sm bg-gray-100"
          disabled
          title="Campo definido por IT"
        />
      </div>

      <!-- Equipo -->
      <div class="sm:col-span-1">
        <label for="equipo" class="block mb-1 font-semibold">Equipo</label>
        <input
          v-model="profile.equipo"
          type="text"
          id="equipo"
          class="w-full p-2 border border-gray-300 rounded text-sm bg-gray-100"
          disabled
          title="Campo definido por IT"
        />
      </div>

      <!-- Rustdesk -->
      <div class="sm:col-span-1">
        <label for="rustdesk" class="block mb-1 font-semibold">Rustdesk</label>
        <input
          v-model="profile.rustdesk"
          type="text"
          id="rustdesk"
          class="w-full p-2 border border-gray-300 rounded text-sm bg-gray-100"
          disabled
          title="Campo definido por IT"
        />
      </div>
    </div>
  </form>
</template>

<script setup>
defineProps({
  profile: {
    type: Object,
    required: true
  },
  editing: {
    type: Boolean,
    default: false
  },
  onSubmit: {
    type: Function,
    required: true
  }
})
</script>
