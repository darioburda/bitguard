<template>
  <div class="flex items-center gap-2 z-10">
    <input
      type="checkbox"
      class="w-4 h-4 accent-[#01C38E]"
      :checked="checked"
      @change="$emit('update:checked', $event.target.checked)"
    />
    <label class="text-sm text-gray-700 select-none">
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
  }
})

defineEmits(['update:checked'])
</script>
