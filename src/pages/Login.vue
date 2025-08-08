<script>
import MainButton from '../components/MainButton.vue';
import MainH1 from '../components/MainH1.vue';
import { login } from '../services/auth';
import Swal from 'sweetalert2';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon
} from 'lucide-vue-next';
import fondo2 from '@/assets/background-Bitguard.png';

export default {
  name: 'Login',
  components: {
    MainH1,
    MainButton,
    MailIcon,
    LockIcon,
    EyeIcon,
    EyeOffIcon
  },
  data() {
    return {
      user: {
        email: '',
        password: '',
      },
      loading: false,
      errorMessage: '',
      mostrarPassword: false, // 👁️ para alternar visibilidad
      fondo2,
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
  <div
    class="w-full min-h-screen flex items-center justify-center bg-cover bg-center overflow-hidden"
    :style="{ backgroundImage: `url(${fondo2})` }"
  >
    <div class="max-w-md w-full p-8 bg-white/90 border border-[#01C38E] rounded-2xl shadow-lg backdrop-blur-md">

      <MainH1 class="text-2xl font-bold text-[#474747] mb-6 text-center">
        Ingresar a mi cuenta
      </MainH1>

      <form @submit.prevent="handleSubmit" class="w-full flex flex-col gap-6">
        <div
          v-if="errorMessage"
          class="text-red-600 text-sm bg-red-100 border border-red-300 px-3 py-2 rounded text-center"
        >
          {{ errorMessage }}
        </div>

        <div class="w-full relative">
          <label for="email" class="block mb-1 text-sm font-medium text-gray-700">Email</label>
          <div class="relative">
            <MailIcon class="absolute left-2 top-2.5 h-5 w-5 text-[#01C38E]" />
            <input
              v-model="user.email"
              type="email"
              id="email"
              class="w-full pl-10 pr-2 py-2 border rounded border-[#01C38E] focus:outline-none focus:ring-2 focus:ring-[#01C38E]"
              placeholder="tuemail@ejemplo.com"
            />
          </div>
        </div>

        <div class="w-full relative">
          <label for="password" class="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
          <div class="relative">
            <LockIcon class="absolute left-2 top-2.5 h-5 w-5 text-[#01C38E]" />
            <input
              v-model="user.password"
              :type="mostrarPassword ? 'text' : 'password'"
              id="password"
              class="w-full pl-10 pr-10 py-2 border rounded border-[#01C38E] focus:outline-none focus:ring-2 focus:ring-[#01C38E]"
              placeholder="●●●●●●●"
            />
            <!-- Icono de ojo -->
            <span
              class="absolute right-2 top-[10px] cursor-pointer text-[#01C38E]"
              @click="mostrarPassword = !mostrarPassword"
            >
              <EyeIcon v-if="!mostrarPassword" class="h-5 w-5" />
              <EyeOffIcon v-else class="h-5 w-5" />
            </span>
          </div>
        </div>

        <!-- Botón centrado -->
        <div class="flex pt-3 justify-center">
          <MainButton type="submit" :disabled="loading" class="w-32">
            <span v-if="loading">Ingresando...</span>
            <span v-else>Ingreso</span>
          </MainButton>
        </div>
      </form>
    </div>
  </div>
</template>
