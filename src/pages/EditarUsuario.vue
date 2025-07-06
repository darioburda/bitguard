<template>
  <div class="h-full overflow-auto relative py-10">
    <div
      v-if="cargando"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
    >
      <MainLoader />
    </div>
    <h1 class="text-2xl font-bold mb-6">Editar Usuario</h1>

    <div class="mx-auto min-w-[700px] max-w-[900px] w-full px-4 sm:px-8 py-6 mt-10 mb-20 bg-white shadow rounded-xl">
      <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
        {{ error }}
      </div>

      <form v-if="usuario" @submit.prevent="guardarCambios">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Campos existentes -->
          <div>
            <label class="block mb-2 font-semibold">Nombre completo</label>
            <input v-model="usuario.display_name" class="w-full p-2 border border-gray-400 rounded text-sm" />
          </div>
          <div>
            <label class="block mb-2 font-semibold">Rustdesk</label>
            <input v-model="usuario.rustdesk" class="w-full p-2 border border-gray-400 rounded text-sm" />
          </div>
          <div>
            <label class="block mb-2 font-semibold">Equipo</label>
            <input v-model="usuario.equipo" class="w-full p-2 border border-gray-400 rounded text-sm" />
          </div>
          <div>
            <label class="block mb-2 font-semibold">IP PC</label>
            <input v-model="usuario.ip_pc" class="w-full p-2 border border-gray-400 rounded text-sm" />
          </div>
          <div>
            <label class="block mb-2 font-semibold">Interno Telefónico</label>
            <input v-model="usuario.interno_telefono" class="w-full p-2 border border-gray-400 rounded text-sm" />
          </div>
          <div>
            <label class="block mb-2 font-semibold">IP Teléfono</label>
            <input v-model="usuario.ip_telefono" class="w-full p-2 border border-gray-400 rounded text-sm" />
          </div>
          <div>
            <label class="block mb-2 font-semibold">Sistema Operativo</label>
            <select v-model="usuario.sistema_operativo" class="w-full p-2 border border-gray-400 rounded text-sm">
              <option disabled value="">Seleccionar</option>
              <option>Windows 7</option>
              <option>Windows 10</option>
              <option>Windows 11</option>
              <option>Windows Server 2016</option>
              <option>Windows Server 2022</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 font-semibold">Microprocesador</label>
            <select v-model="usuario.microprocesador" class="w-full p-2 border border-gray-400 rounded text-sm">
              <option disabled value="">Seleccionar</option>
              <option>I3</option>
              <option>I5</option>
              <option>I7</option>
              <option>Otro</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 font-semibold">Tipo de Memoria</label>
            <select v-model="usuario.tipo_memoria" class="w-full p-2 border border-gray-400 rounded text-sm">
              <option disabled value="">Seleccionar</option>
              <option>DDR3</option>
              <option>DDR4</option>
              <option>DDR5</option>
              <option>SODIMM</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 font-semibold">Tamaño de Memoria (GB)</label>
            <select v-model="usuario.tamano_memoria" class="w-full p-2 border border-gray-400 rounded text-sm">
              <option disabled value="">Seleccionar</option>
              <option>4</option>
              <option>8</option>
              <option>16</option>
              <option>32</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 font-semibold">Tipo de Disco</label>
            <select v-model="usuario.tipo_disco" class="w-full p-2 border border-gray-400 rounded text-sm">
              <option disabled value="">Seleccionar</option>
              <option>SSD</option>
              <option>Mecánico</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 font-semibold">Tamaño de Disco (GB)</label>
            <select v-model="usuario.tamano_disco" class="w-full p-2 border border-gray-400 rounded text-sm">
              <option disabled value="">Seleccionar</option>
              <option>120</option>
              <option>250</option>
              <option>500</option>
              <option>1000</option>
            </select>
          </div>

          <!-- Notas -->
          <div class="sm:col-span-2">
            <label class="block mb-2 font-semibold">Notas</label>
            <textarea v-model="usuario.notas" class="w-full p-2 border border-gray-400 rounded text-sm resize-none h-24"></textarea>
          </div>

          <!-- ✅ Selector de Empresa -->
          <div>
            <label class="block mb-2 font-semibold">Empresa</label>
            <select v-model="usuario.empresa_id" class="w-full p-2 border border-gray-400 rounded text-sm">
              <option disabled value="">Seleccionar empresa</option>
              <option v-for="empresa in empresas" :key="empresa.id" :value="empresa.id">
                {{ empresa.nombre }}
              </option>
            </select>
          </div>

          <!-- Sector -->
          <div>
            <label class="block mb-2 font-semibold">Sector</label>
            <select v-model="usuario.sector" class="w-full p-2 border border-gray-400 rounded text-sm">
              <option disabled value="">Seleccionar sector</option>
              <option>Administración</option>
              <option>RRHH</option>
              <option>Sistemas</option>
              <option>Eccomerce</option>
              <option>Fabrica</option>
            </select>
          </div>

          <!-- Admin -->
          <div class="col-span-full">
            <label class="inline-flex items-center mt-2">
              <input type="checkbox" v-model="usuario.is_admin" class="mr-2" />
              <span class="font-semibold">Administrador</span>
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <MainButton type="submit">Guardar</MainButton>
          <router-link to="/abm-usuarios" class="px-4 py-2 border border-gray-400 rounded text-sm">Cancelar</router-link>
        </div>
        <!-- <div class="mt-4 p-4 bg-gray-100 text-sm">
          <strong>Empresas cargadas:</strong>
          <pre>{{ empresas }}</pre>
          <div class="text-xs bg-yellow-50 p-2 mt-2 rounded">
            Empresas: {{ empresas }}
          </div>

        </div> -->

      </form>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserProfileById, updateUserProfile } from '../services/user-profiles';
import { getEmpresas } from '../services/empresas';
import MainButton from '../components/MainButton.vue';
import MainH1 from '../components/MainH1.vue';
import MainLoader from '../components/MainLoader.vue';

export default {
  name: 'EditarUsuario',
  components: { MainButton, MainH1, MainLoader },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const usuario = ref(null);
    const cargando = ref(true);
    const error = ref('');
    const empresas = ref([]);

    const cargarUsuario = async () => {
      const id = route.params.id;

      if (!id || id === 'undefined') {
        error.value = 'ID de usuario inválido.';
        cargando.value = false;
        return;
      }

      try {
  const data = await getUserProfileById(id);
  if (!data) {
    error.value = 'Usuario no encontrado.';
  } else {
    usuario.value = data;
    console.log('usuario:', usuario.value); // 👈 Acá ves si tiene empresa_id
  }
} catch (e) {
  error.value = 'Error al cargar el usuario.';
} finally {
  cargando.value = false;
}

    };

    const cargarEmpresas = async () => {
  try {
    const { data } = await getEmpresas();
    console.log('👀 Empresas desde Supabase:', data);
    empresas.value = data;
    console.log('✅ Empresas cargadas:', empresas.value);

  } catch (e) {
    console.error('❌ Error al cargar empresas:', e);
  }
};


    const guardarCambios = async () => {
      try {
        await updateUserProfile(usuario.value.id, usuario.value);
        router.push({ path: '/abm-usuarios', query: { success: '✅ Perfil actualizado correctamente' } });
      } catch (e) {
        error.value = '❌ Error al guardar los cambios.';
      }
    };

    onMounted(() => {
      cargarUsuario();
      cargarEmpresas();
    });

    return {
      usuario,
      cargando,
      error,
      guardarCambios,
      empresas
    };
  }
};
</script>
