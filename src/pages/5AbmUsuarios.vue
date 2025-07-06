<template>
  <div class="max-w-screen-xl mx-auto px-4 sm:px-8 pt-4 pb-10">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <MainLoader />
    </div>

    <template v-else>
      <AlertMessage
        v-if="feedback"
        :message="feedback"
        type="success"
        auto-dismiss
        @dismiss="feedback = ''"
      />

      <!-- Encabezado + Filtros -->
      <div
        class="py-4 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 flex-wrap px-4 sm:px-0"
      >
        <h1 class="text-2xl font-bold flex-shrink-0">Gestión de Usuarios</h1>

        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre o email..."
          class="w-full sm:w-[300px] px-4 py-2 border rounded-md shadow-sm"
        />

        <select
          v-model="sectorSeleccionado"
          class="w-full sm:w-[200px] px-4 py-2 border rounded-md shadow-sm"
        >
          <option value="">Todos los sectores</option>
          <option v-for="sector in sectoresDisponibles" :key="sector" :value="sector">
            {{ sector }}
          </option>
        </select>

        <MainButton to="/usuarios/agregar" class="sm:ml-auto">Agregar Usuario</MainButton>
      </div>

      <!-- Lista de usuarios -->
      <div>
        <div
          v-if="usuariosPaginados.length === 0"
          class="text-center text-gray-600 text-lg py-10"
        >
          No se encontraron usuarios que coincidan con la búsqueda.
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6"
        >
          <div
            v-for="usuario in usuariosPaginados"
            :key="usuario.id"
            class="relative bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 flex flex-col justify-between w-full min-w-[300px] overflow-hidden"
          >
            <!-- Badge de rol -->
            <BadgeRol v-if="usuario.is_admin" value="ADMIN" />

            <!-- Foto y nombre -->
            <div class="flex items-center gap-4 mb-4">
              <img
                :src="usuario.photo"
                alt="Foto"
                class="w-14 h-14 rounded-full object-cover ring-2 ring-[#44d6b4] flex-shrink-0"
              />
              <div>
                <h2 class="text-lg font-semibold">{{ usuario.display_name || 'Sin nombre' }}</h2>
                <p class="text-sm text-gray-500">{{ usuario.email }}</p>
                <div class="mt-1">
                  <BadgeSector :value="usuario.sector" />
                </div>
              </div>
            </div>

            <!-- Datos -->
            <div class="text-sm text-gray-700 space-y-1">
              <div class="flex items-center gap-2">
                <strong>Rustdesk:</strong>
                <template v-if="usuario.rustdesk">
                  <a
                    :href="`rustdesk://${usuario.rustdesk}`"
                    class="text-blue-600 hover:underline flex items-center gap-1"
                    title="Conectar vía Rustdesk"
                  >
                    <Laptop2Icon class="w-4 h-4" />
                    {{ usuario.rustdesk }}
                  </a>
                </template>
                <template v-else>-</template>
              </div>
              <p><strong>Equipo:</strong> {{ usuario.equipo || '-' }}</p>
              <p><strong>IP PC:</strong> {{ usuario.ip_pc || '-' }}</p>
              <p><strong>Interno:</strong> {{ usuario.interno_telefono || '-' }}</p>
              <p><strong>IP Interno:</strong> {{ usuario.ip_telefono || '-' }}</p>
              <hr />
              <p><strong>SO:</strong> {{ usuario.sistema_operativo || '-' }}</p>
              <p><strong>Microprocesador:</strong> {{ usuario.microprocesador || '-' }}</p>
              <p><strong>Memoria:</strong> {{ usuario.tipo_memoria || '-' }} / {{ usuario.tamano_memoria || '-' }} GB</p>
              <p><strong>Disco:</strong> {{ usuario.tipo_disco || '-' }} / {{ usuario.tamano_disco || '-' }} GB</p>
            </div>

            <!-- Acciones -->
            <div class="mt-4 flex justify-between items-center">
              <div class="flex gap-4">
                <RouterLink
                  :to="{ name: 'editar-usuario', params: { id: usuario.id } }"
                  class="text-blue-600 hover:underline text-sm flex items-center gap-1"
                >
                  <PencilIcon class="w-4 h-4" />
                  Editar
                </RouterLink>
                <button
                  @click="abrirModal(usuario)"
                  class="text-red-600 hover:underline text-sm flex items-center gap-1"
                >
                  <Trash2Icon class="w-4 h-4" />
                  Borrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Botón flotante de chat -->
    <RouterLink
      to="/chat"
      class="fixed bottom-6 right-6 z-50 bg-[#01C38E] rounded-full shadow-lg hover:bg-[#00a77c] transition-transform w-16 h-16 flex items-center justify-center overflow-hidden transition-opacity duration-[1500ms]"
      :class="{ 'opacity-0 pointer-events-none': !mostrarBoton, 'opacity-100': mostrarBoton }"
      title="Abrir Chat"
    >
      <img
        :src="chatbitLogo"
        alt="Chatbit"
        class="object-contain w-14 h-14 p-0 floating-icon"
        :class="{ 'rotate-on-load': mostrarAnimacion }"
      />
    </RouterLink>
  </div>
</template>

<script>
import { onMounted, ref, computed, watch } from 'vue';
import { getUserProfilesPaginated } from '../services/user-profiles';
import { Laptop2Icon, PencilIcon, Trash2Icon } from 'lucide-vue-next';
import MainButton from '../components/MainButton.vue';
import MainLoader from '../components/MainLoader.vue';
import AlertMessage from '../components/AlertMessage.vue';
import BadgeRol from '../components/BadgeRol.vue';
import BadgeSector from '../components/BadgeSector.vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import chatbitLogo from '@/assets/chatbit.png';

export default {
  name: 'AbmUsuarios',
  components: {
    Laptop2Icon,
    PencilIcon,
    Trash2Icon,
    MainButton,
    MainLoader,
    AlertMessage,
    RouterLink,
    BadgeRol,
    BadgeSector
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const usuarios = ref([]);
    const loading = ref(true);
    const feedback = ref('');
    const usuarioAEliminar = ref(null);

    const paginaActual = ref(1);
    const usuariosPorPagina = 1000;

    const busqueda = ref('');
    const sectorSeleccionado = ref('');

    const mostrarBoton = ref(false);
    const mostrarAnimacion = ref(false);

    const sectoresDisponibles = computed(() => {
      const sectores = usuarios.value.map(u => u.sector).filter(Boolean);
      return [...new Set(sectores)];
    });

    const usuariosFiltrados = computed(() => {
      return usuarios.value.filter(u => {
        const coincideBusqueda =
          u.display_name?.toLowerCase().includes(busqueda.value.toLowerCase()) ||
          u.email?.toLowerCase().includes(busqueda.value.toLowerCase());
        const coincideSector =
          !sectorSeleccionado.value || u.sector === sectorSeleccionado.value;
        return coincideBusqueda && coincideSector;
      });
    });

    const totalPaginas = computed(() =>
      Math.ceil(usuariosFiltrados.value.length / 12)
    );

    const usuariosPaginados = computed(() => {
      const inicio = (paginaActual.value - 1) * 12;
      return usuariosFiltrados.value.slice(inicio, inicio + 12);
    });

    const cargarUsuarios = async () => {
      try {
        loading.value = true;
        const { data } = await getUserProfilesPaginated(usuariosPorPagina, 1);
        usuarios.value = data;
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      } finally {
        loading.value = false;
      }
    };

    const paginaAnterior = () => {
      if (paginaActual.value > 1) paginaActual.value--;
    };

    const siguientePagina = () => {
      if (paginaActual.value < totalPaginas.value) paginaActual.value++;
    };

    const abrirModal = (usuario) => {
      usuarioAEliminar.value = usuario;
    };

    const cerrarModal = () => {
      usuarioAEliminar.value = null;
    };

    const eliminarConfirmado = async () => {
      const id = usuarioAEliminar.value?.id;
      cerrarModal();
      try {
        const response = await fetch('https://yjqstwwltjefqtsxlbsa.functions.supabase.co/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: id })
        });
        const data = await response.json();
        if (data.success) {
          feedback.value = '✅ Usuario eliminado correctamente';
          if (usuariosPaginados.value.length === 1 && paginaActual.value > 1) {
            paginaActual.value--;
          }
          await cargarUsuarios();
        } else {
          if (data.error?.includes('foreign key constraint')) {
            feedback.value = '❌ No se pudo eliminar el usuario porque tiene publicaciones activas.';
          } else {
            feedback.value = '❌ Error: ' + data.error;
          }
        }
      } catch (err) {
        feedback.value = '❌ Error inesperado: ' + err.message;
      }
    };

    watch([busqueda, sectorSeleccionado], () => {
      paginaActual.value = 1;
    });

    onMounted(() => {
      const successMsg = route.query.success;
      if (successMsg) {
        feedback.value = decodeURIComponent(successMsg);
        router.replace({ query: {} });
      }

      cargarUsuarios();

      // Animación botón flotante
      setTimeout(() => {
        mostrarAnimacion.value = false;
        void document.querySelector('.floating-icon')?.offsetWidth;
        mostrarAnimacion.value = true;

        setTimeout(() => {
          mostrarAnimacion.value = false;
        }, 1800);
      }, 1800);

      setTimeout(() => {
        mostrarBoton.value = true;
      }, 1500);
    });

    return {
      usuariosPaginados,
      paginaActual,
      totalPaginas,
      paginaAnterior,
      siguientePagina,
      abrirModal,
      cerrarModal,
      eliminarConfirmado,
      usuarioAEliminar,
      loading,
      feedback,
      busqueda,
      sectorSeleccionado,
      sectoresDisponibles,
      mostrarBoton,
      mostrarAnimacion,
      chatbitLogo
    };
  }
};
</script>

