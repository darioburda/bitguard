<script>
import MainH1 from '../components/MainH1.vue';
import logo from '../assets/iso-04.png';
import AlertMessage from '../components/AlertMessage.vue';

export default {
  name: 'Home',
  components: { MainH1, AlertMessage },
  data() {
    return {
      logo,
      successMessage: '',
    };
  },
  mounted() {
    if (this.$route.query.loginSuccess === 'true') {
      this.successMessage = 'Has iniciado sesión con éxito.';
      this.$router.replace({ path: this.$route.path, query: {} });
    } else if (this.$route.query.success === 'true') {
      this.successMessage = 'La cuenta se ha creado con éxito.';
      this.$router.replace({ path: this.$route.path, query: {} });
    }
  },
};
</script>


<template>
    <AlertMessage 
        v-if="successMessage"
        :message="successMessage"
        type="success"
        :autoDismiss="true"
        @dismiss="successMessage = ''"
    />
    <div class="flex flex-col items-center justify-center text-center px-5">
        <MainH1 class="text-2xl bg-font-bold my-4">¡Bienvenidos!</MainH1>
        <img 
            :src="logo" 
            alt="BitGuard logo" 
            class="w-60 h-auto my-10" 
        />

        <p class="text-gray-700 max-w-xl">
            Inventario, monitoreo y soporte tecnico.
        </p>
    </div>
</template>