<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MainButton from '../components/MainButton.vue';
import MainH1 from '../components/MainH1.vue';

export default {
  name: 'AgregarUsuario',
  components: { MainButton, MainH1 },

  setup() {
    const router = useRouter();

    const form = ref({
      display_name: '',
      email: '',
      password: '',
      is_admin: false
    });

    const error = ref('');
    const cargando = ref(false);

    const crearUsuario = async () => {
      error.value = '';

      if (!form.value.display_name || !form.value.email || !form.value.password) {
        error.value = 'Todos los campos son obligatorios.';
        return;
      }

      cargando.value = true;

      try {
        const response = await fetch('https://yjqstwwltjefqtsxlbsa.functions.supabase.co/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form.value)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          router.push({ path: '/abm-usuarios', query: { success: '✅ Usuario creado correctamente' } });
        } else {
          error.value = data.error || '❌ No se pudo crear el usuario.';
        }
      } catch (e) {
        console.error('[AgregarUsuario] Error al llamar a create-user:', e);
        error.value = '❌ Error de conexión o del servidor.';
      } finally {
        cargando.value = false;
      }
    };

    return {
      form,
      error,
      cargando,
      crearUsuario
    };
  }
};
</script>

<template>
  <div class="h-full overflow-auto relative">
    <div class="mx-auto min-w-[700px] max-w-[900px] w-full px-4 sm:px-8 py-6 mt-10 mb-20 bg-white shadow rounded-xl">
      <MainH1 class="mb-6">Agregar Usuario</MainH1>

      <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
        {{ error }}
      </div>

      <form @submit.prevent="crearUsuario">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block mb-2 font-semibold">Nombre completo</label>
            <input v-model="form.display_name" class="w-full p-2 border border-gray-400 rounded text-sm" required />
          </div>

          <div class="sm:col-span-2">
            <label class="block mb-2 font-semibold">Email</label>
            <input v-model="form.email" type="email" class="w-full p-2 border border-gray-400 rounded text-sm" required />
          </div>

          <div class="sm:col-span-2">
            <label class="block mb-2 font-semibold">Contraseña</label>
            <input v-model="form.password" type="password" class="w-full p-2 border border-gray-400 rounded text-sm" required />
          </div>

          <div class="col-span-full">
            <label class="inline-flex items-center mt-2">
              <input type="checkbox" v-model="form.is_admin" class="mr-2" />
              <span class="font-semibold">Administrador</span>
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <MainButton type="submit" :disabled="cargando">
            {{ cargando ? 'Creando...' : 'Crear Usuario' }}
          </MainButton>
          <router-link to="/abm-usuarios" class="px-4 py-2 border border-gray-400 rounded text-sm">Cancelar</router-link>
        </div>
      </form>
    </div>
  </div>
</template>
