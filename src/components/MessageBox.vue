<script setup>
defineProps({
    content: {
        type: Object,
        required: true,
    }
})
</script>

<template>
    <div
        class="p-4 mb-4"
        :class="{
            'bg-green-200': content.type == 'success',
            'bg-red-200': content.type == 'error',
        }"
    >
        {{ content.message }}
    </div>
</template>