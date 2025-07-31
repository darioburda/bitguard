<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="disabled"
    :class="[
      'transition-colors rounded text-white font-medium',
      'flex items-center justify-center gap-1',
      baseClasses,
      sizeFinalClasses,
      {
        'disabled:opacity-50 disabled:cursor-not-allowed': disabled
      }
    ]"
    v-bind="$attrs"
  >
    <!-- Icono a la izquierda -->
    <component
      v-if="showIcon && iconComponent && iconPosition === 'left'"
      :is="iconComponent"
      class="w-4 h-4"
    />

    <slot>{{ labelDefault }}</slot>

    <!-- Icono a la derecha -->
    <component
      v-if="showIcon && iconComponent && iconPosition === 'right'"
      :is="iconComponent"
      class="w-4 h-4"
    />
  </component>
</template>

<script>
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-vue-next'

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
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) =>
        ['agregar', 'editar', 'borrar', 'default'].includes(value)
    },
    size: {
      type: String,
      default: null,
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    iconPosition: {
      type: String,
      default: 'left',
      validator: (val) => ['left', 'right'].includes(val)
    }
  },
  computed: {
    baseClasses() {
      switch (this.variant) {
        case 'agregar':
          return 'bg-[#41C3A5] hover:bg-[#3D9C86] focus:bg-[#3D9C86]'
        case 'editar':
          return 'bg-blue-500 hover:bg-blue-600 focus:bg-blue-600'
        case 'borrar':
          return 'bg-red-500 hover:bg-red-600 focus:bg-red-600'
        case 'default':
        default:
          return 'bg-gray-500 hover:bg-gray-600 focus:bg-gray-600'
      }
    },
    sizeFinalClasses() {
      const baseResponsiveWidth = 'w-full sm:w-auto'

      switch (this.size) {
        case 'sm':
          return `${baseResponsiveWidth} text-sm h-8 px-3 min-w-[120px]`
        case 'lg':
          return `${baseResponsiveWidth} text-sm h-11 px-5 min-w-[200px]`
        case 'md':
        default:
          return `${baseResponsiveWidth} text-sm h-9 px-4 min-w-[167px]`
      }
    },
    iconComponent() {
      switch (this.variant) {
        case 'agregar':
          return PlusIcon
        case 'editar':
          return PencilIcon
        case 'borrar':
          return Trash2Icon
        default:
          return null
      }
    },
    labelDefault() {
      switch (this.variant) {
        case 'agregar':
          return 'Agregar'
        case 'editar':
          return 'Editar'
        case 'borrar':
          return 'Eliminar'
        default:
          return 'Enviar'
      }
    }
  }
}
</script>
