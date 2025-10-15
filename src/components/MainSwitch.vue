<script setup>
defineProps({
  modelValue: Boolean,
  label: String,
  disabled: Boolean,
  title: String
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex items-center justify-between gap-4 py-2">
    <span class="font-semibold text-sm">{{ label }}</span>

    <button
      type="button"
      :disabled="disabled"
      :title="title"
      class="relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none"
      :class="[
        modelValue ? 'bg-[#41C3A5]' : 'bg-gray-300',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      ]"
      @click="!disabled && emit('update:modelValue', !modelValue)"
    >
      <span
        class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300"
        :class="modelValue ? 'translate-x-6' : 'translate-x-0'"
      ></span>
    </button>
  </div>
</template>
