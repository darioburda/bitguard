<script>
import { onMounted, ref, computed } from 'vue';
import { getUserProfilesPaginated, updateUserProfile } from '../services/user-profiles';
import { Laptop2Icon } from 'lucide-vue-next';
import Modal01 from '../components/Modal-01.vue';
import MainButton from '../components/MainButton.vue';

export default {
  name: 'AbmUsuarios',
  components: { Laptop2Icon, Modal01, MainButton },
  setup() {
    const usuarios = ref([]);
    const loading = ref(true);
    const usuarioSeleccionado = ref(null);
    const isModalOpen = ref(false);

    const modalNuevoUsuarioAbierto = ref(false);
    const nuevoUsuario = ref({
      email: '',
      password: '',
      display_name: ''
    });

    const paginaActual = ref(1);
    const usuariosPorPagina = 10;
    const totalUsuarios = ref(0);

    const totalPaginas = computed(() =>
      Math.ceil(totalUsuarios.value / usuariosPorPagina)
    );

    const abrirModalNuevo = () => {
      nuevoUsuario.value = {
        email: '',
        password: '',
        display_name: ''
      };
      modalNuevoUsuarioAbierto.value = true;
    };

    const cerrarModalNuevo = () => {
      modalNuevoUsuarioAbierto.value = false;
    };

    const crearUsuario = async () => {
      try {
        const response = await fetch('https://yjqstwwltjefqtsxlbsa.functions.supabase.co/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoUsuario.value)
        });

        const data = await response.json();

        if (data.success) {
          cerrarModalNuevo();
          alert('✅ Usuario creado con éxito');
          await cargarUsuarios();
        } else {
          alert('❌ Error al crear usuario: ' + data.error);
        }
      } catch (err) {
        alert('❌ Error inesperado: ' + err.message);
      }
    };

    const seleccionarUsuario = (u) => {
      usuarioSeleccionado.value = { ...u };
      isModalOpen.value = true;
    };

    const cerrarModal = () => {
      isModalOpen.value = false;
      usuarioSeleccionado.value = null;
    };

    const guardarCambios = async () => {
      try {
        await updateUserProfile(usuarioSeleccionado.value.id, usuarioSeleccionado.value);
        await cargarUsuarios();
        cerrarModal();
      } catch (error) {
        console.error('Error guardando cambios del usuario:', error);
      }
    };

    const cargarUsuarios = async () => {
      try {
        loading.value = true;
        const { data, count } = await getUserProfilesPaginated(usuariosPorPagina, paginaActual.value);
        usuarios.value = data;
        totalUsuarios.value = count;
      } catch (error) {
        console.error('Error cargando usuarios paginados:', error);
      } finally {
        loading.value = false;
      }
    };

    const paginaAnterior = () => {
      if (paginaActual.value > 1) {
        paginaActual.value--;
        cargarUsuarios();
      }
    };

    const siguientePagina = () => {
      if (paginaActual.value < totalPaginas.value) {
        paginaActual.value++;
        cargarUsuarios();
      }
    };

    const eliminarUsuario = async (usuario) => {
  const confirmado = confirm(`¿Estás seguro de eliminar a ${usuario.display_name || usuario.email}?`);
  if (!confirmado) return;

  try {
    const response = await fetch('https://yjqstwwltjefqtsxlbsa.functions.supabase.co/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: usuario.id })
    });

    const data = await response.json();

    if (data.success) {
      alert('✅ Usuario eliminado correctamente');
      await cargarUsuarios();
    } else {
      alert('❌ Error al eliminar: ' + data.error);
    }
  } catch (err) {
    alert('❌ Error inesperado: ' + err.message);
  }
};


    onMounted(cargarUsuarios);

    return {
      usuarios,
      loading,
      usuarioSeleccionado,
      isModalOpen,
      seleccionarUsuario,
      cerrarModal,
      guardarCambios,
      abrirModalNuevo,
      cerrarModalNuevo,
      modalNuevoUsuarioAbierto,
      nuevoUsuario,
      crearUsuario,
      paginaActual,
      totalPaginas,
      paginaAnterior,
      siguientePagina,
      eliminarUsuario
    };
  }
};
</script>



<template>
  <div class="max-w-screen-xl mx-auto px-4 sm:px-8 py-10">
    <h1 class="text-2xl font-bold mb-6">Gestión de Usuarios</h1>
    <MainButton @click="abrirModalNuevo">Agregar Usuario</MainButton>

    <div v-if="loading" class="text-center py-10">
      <span class="text-gray-500">Cargando usuarios...</span>
    </div>

    <div v-else>
      <table class="min-w-full table-auto border border-gray-300 mt-5">
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
            <td class="px-4 py-2 border">
              <a v-if="usuario.rustdesk"
                 :href="`rustdesk://${usuario.rustdesk}`"
                 class="text-blue-600 hover:underline flex items-center gap-1"
                 title="Conectar vía Rustdesk">
                <Laptop2Icon class="w-4 h-4 inline" />
                {{ usuario.rustdesk }}
              </a>
              <span v-else>-</span>
            </td>
            <td class="px-4 py-2 border">{{ usuario.equipo }}</td>
            <td class="px-4 py-2 border">{{ usuario.ip_pc || '-' }}</td>
            <td class="px-4 py-2 border">{{ usuario.interno_telefono || '-' }}</td>
            <td class="px-4 py-2 border">{{ usuario.ip_telefono || '-' }}</td>
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
              <div class="flex gap-2">
                <button @click="seleccionarUsuario(usuario)" class="text-blue-600 hover:underline">Editar</button>
                <button @click="eliminarUsuario(usuario)" class="text-red-600 hover:underline">Borrar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Controles de paginación -->
<div class="mt-6 flex justify-between items-center text-sm">
  <button
    @click="paginaAnterior"
    :disabled="paginaActual === 1"
    class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
  >
    ← Anterior
  </button>

  <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>

  <button
    @click="siguientePagina"
    :disabled="paginaActual === totalPaginas"
    class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
  >
    Siguiente →
  </button>
</div>

      <!-- Modal Edición Usuario -->
      <Modal01 :modelValue="isModalOpen" @close="cerrarModal">
        <form @submit.prevent="guardarCambios" class="space-y-4">
          <!-- <div class="absolute top-2 right-2">
            <button @click.prevent="cerrarModal" class="text-gray-500 hover:text-gray-700">✕</button>
            
          </div> -->
          <h2 class="text-xl font-semibold mb-4">Editar Usuario</h2>
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
            <button type="button" @click="cerrarModal" class="px-4 py-2 border border-gray-400 rounded">Cancelar</button>
          </div>
        </form>
      </Modal01>

      <!-- Modal Agregar Usuario -->
<Modal01 :modelValue="modalNuevoUsuarioAbierto" @close="cerrarModalNuevo">
  <form @submit.prevent="crearUsuario" class="space-y-4" autocomplete="off">
    <!-- Campos trampa para prevenir autofill -->
    <input type="text" name="fake-user" class="hidden" autocomplete="username" />
    <input type="password" name="fake-pass" class="hidden" autocomplete="new-password" />

    
    <h2 class="text-xl font-semibold mb-4">Agregar Usuario</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium">Email</label>
        <input
          name="usuario_nuevo_email"
          v-model="nuevoUsuario.email"
          type="email"
          class="w-full border p-2 rounded"
          required
          autocomplete="off"
        />
      </div>
      <div>
        <label class="block text-sm font-medium">Contraseña</label>
        <input
          name="usuario_nuevo_password"
          v-model="nuevoUsuario.password"
          type="password"
          class="w-full border p-2 rounded"
          required
          autocomplete="new-password"
        />
      </div>
      <div class="sm:col-span-2">
        <label class="block text-sm font-medium">Nombre para mostrar</label>
        <input
          name="usuario_nuevo_nombre"
          v-model="nuevoUsuario.display_name"
          type="text"
          class="w-full border p-2 rounded"
          required
          autocomplete="off"
        />
      </div>
    </div>
    <div class="mt-6 flex justify-end gap-2">
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Crear</button>
      <button type="button" @click="cerrarModalNuevo" class="px-4 py-2 border border-gray-400 rounded">Cancelar</button>
    </div>
  </form>
</Modal01>

    </div>
  </div>
</template>


<style scoped>
th, td { text-align: left; }
</style>
