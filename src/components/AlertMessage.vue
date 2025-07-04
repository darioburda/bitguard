<template>
    <div
        v-if="visible"
        :class="[
        'p-4 mb-4 rounded border',
        type === 'success' ? 'bg-green-100 text-green-800 border-green-400' :
        type === 'danger' ? 'bg-red-100 text-red-800 border-red-400' :
        'bg-gray-100 text-gray-800 border-gray-400'
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
        },
        autoDismiss: {
            type: Boolean,
            default: false
        },
        dismissTimeout: {
            type: Number,
            default: 4000
        }
    },
    data() {
        return {
            visible: true
        }
    },
    watch: {
        message(newVal) {
            if(newVal && this.autoDismiss) {
                this.visible = true;
                this.startTimer();
            }
        }
    },
    methods: {
        startTimer() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.visible = false;
                this.$emit('dismiss');
            }, this.dismissTimeout);
        }
    },
    mounted() {
        if(this.message && this.autoDismiss) {
            this.startTimer();
        }
    },
    beforeUnmount() {
        clearTimeout(this.timer);
    }
}
</script>



