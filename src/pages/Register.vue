<script>
import MainButton from '../components/MainButton.vue';
import MainH1 from '../components/MainH1.vue';
import { register } from '../services/auth';
import AlertMessage from '../components/AlertMessage.vue';

export default {
    name: 'Register',
    components: { MainH1, MainButton,AlertMessage },
    data() {
        return {
            user: {
                email: '',
                password: '',
            },
            loading: false,
            errorMessage: '',
            successMessage: '',
        }
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
                this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
                return false;
            }

            this.errorMessage = '';
            return true;
        },
        async handleSubmit() {
            if (!this.validateForm()) return;
            try {
                this.loading = true;
                await register(this.user.email, this.user.password);
                this.$router.push({ path: '/mi-perfil', query: { accountCreated: 'true' } });
            } catch (error) {
                this.errorMessage = 'No se pudo crear la cuenta.';
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<!-- <template>
    <div class="max-w-md mx-auto my-auto p-8 mt-20 bg-white border border-softPink rounded-lg shadow-md">
        
        <AlertMessage 
            v-if="successMessage"
            :message="successMessage"
            type="success"
            :autoDismiss="true"
            @dismiss="successMessage = ''"
        />
        <MainH1>Crear una cuenta</MainH1>

        <form action="#" @submit.prevent="handleSubmit">
            <div v-if="errorMessage" class="text-red-600 mb-2">{{ errorMessage }}</div>

            <div class="mb-3">
                <label for="email" class="block mb-2">Email</label>
                <input
                    v-model="user.email"
                    type="email"
                    id="email"
                    class="w-full p-2 border border-gray-400 rounded">
            </div>
            <div class="mb-3">
                <label for="password" class="block mb-2">Contraseña</label>
                <input
                    v-model="user.password"
                    type="password"
                    id="password"
                    class="w-full p-2 border border-gray-400 rounded">
            </div>
            <MainButton type="submit" :disabled="loading">Registrate</MainButton>
        </form>
    </div>
</template> -->

<template>
  <div class="h-full w-full flex items-center justify-center">
        <div class="max-w-md w-full p-8 bg-white  border border-[#01C38E] rounded-tr-2xl rounded-bl-2xl flex flex-col items-center ">
        <AlertMessage 
            v-if="successMessage"
            :message="successMessage"
            type="success"
            :autoDismiss="true"
            @dismiss="successMessage = ''"
        />
        <H1 class="text-2xl font-bold text-[#474747] mb-4 ">Crear una cuenta</H1>

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
    <MainButton type="submit" :disabled="loading" class="w-32 text-center">Registro</MainButton>
  </div>
</form>

        </div>
  </div>
</template>



