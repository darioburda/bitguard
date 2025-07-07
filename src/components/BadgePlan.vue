<template>
  <div
    class="inline-block px-3 py-1 text-xs font-semibold rounded-full text-white"
    :class="badgeClass"
  >
    {{ value }}
  </div>
</template>

<script>
export default {
  name: 'BadgePlan',
  props: {
    value: {
      type: String,
      required: true
    }
  },
  computed: {
    badgeClass() {
      const normalized = this.value.toLowerCase();

      if (normalized.includes('básico') || normalized.includes('basico')) {
        return 'bg-gray-500';
      } else if (normalized.includes('profesional')) {
        return 'bg-blue-600';
      } else if (normalized.includes('corporativo')) {
        return 'bg-purple-700';
      } else {
        return 'bg-[#01C38E]'; // color por defecto
      }
    }
  }
};
</script>
