<template>
  <div
    v-if="visible"
    :class="[
      'p-4 mb-4 rounded border text-sm shadow-sm',
      type === 'success' ? 'bg-green-100 text-green-800 border-green-400' :
      type === 'danger'  ? 'bg-red-100 text-red-800 border-red-400' :
                           'bg-blue-100 text-blue-800 border-blue-400'
    ]"
  >
    {{ message }}
  </div>
</template>

<script>
export default {
  name: 'AlertMessage',
  props: {
    message: String,
    type: {
      type: String,
      default: 'info'
    }
  },
  data() {
    return {
      visible: true,
      timer: null
    }
  },
  watch: {
    message(newVal) {
      if (newVal) {
        this.visible = true
        this.handleAutoDismiss()
      }
    }
  },
  mounted() {
    if (this.message) {
      this.handleAutoDismiss()
    }
  },
  beforeUnmount() {
    clearTimeout(this.timer)
  },
  methods: {
    handleAutoDismiss() {
      clearTimeout(this.timer)

      if (this.type === 'success' || this.type === 'info') {
        this.timer = setTimeout(() => {
          this.visible = false
          this.$emit('dismiss')
        }, 3000)
      }
    }
  }
}
</script>
