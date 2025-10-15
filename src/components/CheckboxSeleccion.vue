<template>
  <div class="flex items-center gap-2 z-10">
    <input
      :id="id"
      type="checkbox"
      class="w-4 h-4 accent-[#01C38E]"
      :checked="checked"
      @change="$emit('update:checked', $event.target.checked)"
    />
    <label
      class="text-sm text-gray-700 select-none cursor-pointer"
      :for="id"
    >
      {{ label }}
    </label>
  </div>
</template>

<script setup>
defineProps({
  checked: Boolean,
  label: {
    type: String,
    default: 'Seleccionar'
  },
  id: {
    type: String,
    default: () => `checkbox-${Math.random().toString(36).slice(2, 8)}`
  }
})

defineEmits(['update:checked'])
</script>
