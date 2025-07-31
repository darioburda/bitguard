<template>
  <transition
    @before-enter="beforeEnter"
    @enter="enter"
    @leave="leave"
  >
    <div v-show="show">
      <slot />
    </div>
  </transition>
</template>

<script setup>
import { nextTick } from 'vue'
defineProps({
  show: Boolean
})

const beforeEnter = (el) => {
  el.style.maxHeight = '0'
  el.style.opacity = '0'
  el.style.transition = 'all 0.35s ease'
}

const enter = async (el) => {
  await nextTick()
  el.style.maxHeight = el.scrollHeight + 'px'
  el.style.opacity = '5'
}

const leave = (el) => {
  el.style.maxHeight = '0'
  el.style.opacity = '0'
}
</script>
