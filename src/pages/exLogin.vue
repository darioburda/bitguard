<script>
import MainButton from '../components/MainButton.vue';
import MainH1 from '../components/MainH1.vue';
import { login } from '../services/auth';
import Swal from 'sweetalert2';

export default {
  name: 'Login',
  components: { MainH1, MainButton },
  data() {
    return {
      user: {
        email: '',
        password: '',
      },
      loading: false,
      errorMessage: '',
    };
  },
  methods: {
    validateForm() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!this.user.email && !this.user.password) {
        this.errorMessage = 'Debes completar el email y la contraseña.';
        return false;
      }
      if (!this.user.email && this.user.password) {
        this.errorMessage = 'Debes completar el email.';
        return false;
      }
      if (this.user.email && !this.user.password) {
        this.errorMessage = 'Debes completar la contraseña.';
        return false;
      }
      if (!emailRegex.test(this.user.email)) {
        this.errorMessage = 'El email no es válido.';
        return false;
      }
      if (this.user.password.length < 6) {
        this.errorMessage = 'Contraseña debe tener al menos 6 caracteres.';
        return false;
      }

      this.errorMessage = '';
      return true;
    },
    async handleSubmit() {
      if (!this.validateForm()) return;
      try {
        this.loading = true;
        await login(this.user.email, this.user.password);
        this.$router.push({ path: '/mi-perfil', query: { loginSuccess: 'true' } });
      } catch (error) {
        this.errorMessage = 'Credenciales incorrectas.';
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    if (this.$route.query.success === 'true') {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Tu cuenta fue creada con éxito',
        showConfirmButton: false,
        timer: 1500,
      });
      this.$router.replace({ path: this.$route.path });
    } else if (this.$route.query.loggedOut === 'true') {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Sesión cerrada con éxito',
        showConfirmButton: false,
        timer: 1500,
      });
      this.$router.replace({ path: this.$route.path });
    }
  }
};
</script>


<template>
  <div class="h-full w-full flex items-center justify-center">
    <div class="max-w-md w-full p-8 bg-[#FFFFFF] border border-[#01C38E] rounded-2xl flex flex-col items-center">
      
      <H1 class="text-2xl font-bold text-[#474747] mb-4">Ingresar a mi cuenta</H1>

      <!-- <AlertMessage 
        v-if="successMessage"
        :message="successMessage"
        type="success"
        :autoDismiss="true"
        @dismiss="successMessage = ''"
      /> -->

      <form @submit.prevent="handleSubmit" class="w-full flex flex-col items-center gap-6">
        <div v-if="errorMessage" class="text-red-600 w-full">{{ errorMessage }}</div>

        <div class="w-full">
          <label for="email" class="block mb-1 text-sm font-medium">Email</label>
          <input
            v-model="user.email"
            type="email"
            id="email"
            class="w-full p-2 border rounded border-[#01C38E] focus:outline-none focus:ring-2 focus:ring-[#01C38E]"
          />
        </div>

        <div class="w-full">
          <label for="password" class="block mb-1 text-sm font-medium">Contraseña</label>
          <input
            v-model="user.password"
            type="password"
            id="password"
            class="w-full p-2 border rounded border-[#01C38E] focus:outline-none focus:ring-2 focus:ring-[#01C38E]"
          />
        </div>

        <div>
          <MainButton type="submit" :disabled="loading" class="w-32 text-center">Ingreso</MainButton>
        </div>
      </form>

    </div>
  </div>
</template>


