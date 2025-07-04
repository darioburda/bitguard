<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="disabled"
    class="transition-colors py-2 px-4 rounded
           bg-[#41C3A5] text-white focus:bg-[#3D9C86]
           hover:bg-[#3D9C86] active:bg-yellow-700
           disabled:opacity-50 disabled:cursor-not-allowed"
    v-bind="$attrs"
  >
    <slot>Enviar</slot>
  </component>
</template>

<script>
export default {
  name: 'MainButton',
  props: {
    to: {
      type: [String, Object],
      default: null
    },
    type: {
      type: String,
      default: 'button'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
};
</script>
