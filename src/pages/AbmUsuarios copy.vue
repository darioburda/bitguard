<script>
import { onMounted, ref } from 'vue';
import { getAllUserProfiles, updateUserProfile } from '../services/user-profiles';
import { Laptop2Icon } from 'lucide-vue-next';

export default {
  name: 'AbmUsuarios',
  components: { Laptop2Icon },
  setup() {
    const usuarios = ref([]);
    const loading = ref(true);
    const usuarioSeleccionado = ref(null);

    const seleccionarUsuario = (usuario) => {
      usuarioSeleccionado.value = { ...usuario }; // Clonamos para no modificar directo
    };

    const guardarCambios = async () => {
      try {
        await updateUserProfile(usuarioSeleccionado.value.id, usuarioSeleccionado.value);
        const index = usuarios.value.findIndex(u => u.id === usuarioSeleccionado.value.id);
        if (index !== -1) {
          usuarios.value[index] = { ...usuarioSeleccionado.value };
        }
        usuarioSeleccionado.value = null;
      } catch (error) {
        console.error('Error guardando cambios del usuario:', error);
      }
    };

    return {
      usuarios,
      loading,
      usuarioSeleccionado,
      seleccionarUsuario,
      guardarCambios
    };
  },
  async mounted() {
    try {
      this.loading = true;
      this.usuarios = await getAllUserProfiles();
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      this.loading = false;
    }
  }
};
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
    <h1 class="text-2xl font-bold mb-6">Gestión de Usuarios</h1>

    <div v-if="loading" class="text-center py-10">
      <span class="text-gray-500">Cargando usuarios...</span>
    </div>

    <div v-else>
      <table class="min-w-full table-auto border border-gray-300">
        <thead class="bg-gray-100 text-sm text-gray-700">
          <tr>
            <th class="px-4 py-2 border">Nombre completo</th>
            <th class="px-4 py-2 border">Email</th>
            <th class="px-4 py-2 border">Rustdesk</th>
            <th class="px-4 py-2 border">Equipo</th>
            <th class="px-4 py-2 border">IP PC</th>
            <th class="px-4 py-2 border">Interno</th>
            <th class="px-4 py-2 border">IP Interno</th>
            <th class="px-4 py-2 border">Sistema Operativo</th>
            <th class="px-4 py-2 border">Microprocesador</th>
            <th class="px-4 py-2 border">Memoria (Tipo/Tamaño)</th>
            <th class="px-4 py-2 border">Disco (Tipo/Tamaño)</th>
            <th class="px-4 py-2 border">Admin</th>
            <th class="px-4 py-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id" class="text-sm text-gray-800">
            <td class="px-4 py-2 border">{{ usuario.display_name || 'Sin nombre' }}</td>
            <td class="px-4 py-2 border">{{ usuario.email }}</td>
            <!-- <td class="px-4 py-2 border">{{ usuario.rustdesk }}</td> -->
            <td class="px-4 py-2 border">
              <a
                v-if="usuario.rustdesk"
                :href="`rustdesk://${usuario.rustdesk}`"
                class="text-blue-600 hover:underline flex items-center gap-1"
                title="Conectar vía Rustdesk"
              >
                <Laptop2Icon class="w-4 h-4 inline" />
                {{ usuario.rustdesk }}
              </a>
              <span v-else>-</span>
            </td>

            <td class="px-4 py-2 border">{{ usuario.equipo }}</td>
            <td class="px-4 py-2 border">{{ usuario.ip_pc || '-' }}</td>
            <td class="px-4 py-2 border">{{ usuario.interno_telefono }}</td>
            <td class="px-4 py-2 border">{{ usuario.ip_telefono }}</td>
            <td class="px-4 py-2 border">{{ usuario.sistema_operativo || '-' }}</td>
            <td class="px-4 py-2 border">{{ usuario.microprocesador || '-' }}</td>
            <td class="px-4 py-2 border">
              {{ usuario.tipo_memoria || '-' }} / {{ usuario.tamano_memoria || '-' }} GB
            </td>
            <td class="px-4 py-2 border">
              {{ usuario.tipo_disco || '-' }} / {{ usuario.tamano_disco || '-' }} GB
            </td>
            <td class="px-4 py-2 border text-center">
              <span :class="usuario.is_admin ? 'text-green-600 font-bold' : 'text-gray-400'">
                {{ usuario.is_admin ? 'Sí' : 'No' }}
              </span>
            </td>
            <td class="px-4 py-2 border">
              <button
                class="text-blue-600 hover:underline"
                @click="seleccionarUsuario(usuario)"
              >
                Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal de edición -->
      <div v-if="usuarioSeleccionado" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl relative">
          <button @click="usuarioSeleccionado = null" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
          <h2 class="text-xl font-semibold mb-4">Editar usuario</h2>
          <form @submit.prevent="guardarCambios">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium">Nombre</label>
                <input v-model="usuarioSeleccionado.display_name" class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium">Rustdesk</label>
                <input v-model="usuarioSeleccionado.rustdesk" class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium">Equipo</label>
                <input v-model="usuarioSeleccionado.equipo" class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium">IP PC</label>
                <input v-model="usuarioSeleccionado.ip_pc" class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium">Interno Telefónico</label>
                <input v-model="usuarioSeleccionado.interno_telefono" class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium">IP Teléfono</label>
                <input v-model="usuarioSeleccionado.ip_telefono" class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium">Sistema Operativo</label>
                <input v-model="usuarioSeleccionado.sistema_operativo" class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium">Microprocesador</label>
                <input v-model="usuarioSeleccionado.microprocesador" class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium">Tipo de Memoria</label>
                <input v-model="usuarioSeleccionado.tipo_memoria" class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium">Tamaño de Memoria</label>
                <input v-model="usuarioSeleccionado.tamano_memoria" class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium">Tipo de Disco</label>
                <input v-model="usuarioSeleccionado.tipo_disco" class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium">Tamaño de Disco</label>
                <input v-model="usuarioSeleccionado.tamano_disco" class="w-full border p-2 rounded" />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium">Notas</label>
                <textarea v-model="usuarioSeleccionado.notas" class="w-full border p-2 rounded"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium">Sector</label>
                <input v-model="usuarioSeleccionado.sector" class="w-full border p-2 rounded" />
              </div>
              <div class="col-span-2">
                <label class="inline-flex items-center">
                  <input type="checkbox" v-model="usuarioSeleccionado.is_admin" class="mr-2" />
                  Administrador
                </label>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-2">
              <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar</button>
              <button type="button" @click="usuarioSeleccionado = null" class="px-4 py-2 border border-gray-400 rounded">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
th, td {
  text-align: left;
}
</style>
