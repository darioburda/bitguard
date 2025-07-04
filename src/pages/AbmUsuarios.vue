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

      <!-- Lista de usuarios o mensaje vacío -->
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
            class="relative bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 flex flex-col justify-between w-full min-w-[300px]"
          >
            <div
              class="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full bg-[#F0F2FF] text-[#474747] border border-[#01C38E]"
            >
              {{ usuario.sector || 'Sin sector' }}
            </div>

            <div>
              <h2 class="text-lg font-semibold mb-1">{{ usuario.display_name || 'Sin nombre' }}</h2>
              <p class="text-sm text-gray-500 mb-2">{{ usuario.email }}</p>
              <hr class="pb-2" />

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
                <p>
                  <strong>Memoria:</strong>
                  {{ usuario.tipo_memoria || '-' }} / {{ usuario.tamano_memoria || '-' }} GB
                </p>
                <p>
                  <strong>Disco:</strong>
                  {{ usuario.tipo_disco || '-' }} / {{ usuario.tamano_disco || '-' }} GB
                </p>
              </div>
            </div>

            <div class="mt-4 flex justify-between items-center">
              <div
                class="text-xs font-bold px-2 py-1 rounded-full"
                :class="usuario.is_admin ? 'bg-[#474747] text-white' : 'bg-[#01C38E] text-white'"
              >
                {{ usuario.is_admin ? 'ADMIN' : 'USER' }}
              </div>

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

      <!-- Modal de Confirmación -->
      <div
        v-if="usuarioAEliminar"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
      >
        <div class="bg-white border border-red-500 rounded-lg shadow-lg w-full max-w-[500px] p-6">
          <h2 class="text-lg font-bold text-red-600 mb-4">Confirmar Eliminación</h2>
          <p class="mb-6 break-words">
            ¿Estás seguro de que querés eliminar al usuario
            <strong>{{ usuarioAEliminar.display_name || usuarioAEliminar.email }}</strong>?
          </p>
          <div class="flex justify-end gap-4">
            <button @click="eliminarConfirmado" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Eliminar
            </button>
            <button @click="cerrarModal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div class="mt-8 flex justify-between items-center text-sm">
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
    </template>
  </div>

  <!-- Botón flotante de chat con logo -->
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

</template>

<script>
import { onMounted, ref, computed, watch } from 'vue';
import { getUserProfilesPaginated } from '../services/user-profiles';
import { Laptop2Icon, PencilIcon, Trash2Icon } from 'lucide-vue-next';
import MainButton from '../components/MainButton.vue';
import MainLoader from '../components/MainLoader.vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import AlertMessage from '../components/AlertMessage.vue';
import chatbitLogo from '@/assets/chatbit.png';

export default {
  name: 'AbmUsuarios',
  components: {
    Laptop2Icon,
    PencilIcon,
    Trash2Icon,
    MainButton,
    MainLoader,
    RouterLink,
    AlertMessage
    
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

    // --- Animación y visibilidad del logo flotante ---
    const mostrarAnimacion = ref(false);
    const mostrarBoton = ref(false);

    // Correciones Gallino
    // const { loading, usuarios, usuariosFiltrados } = useUsuarioPaginados();

    // function useUsuarioPaginados() {
    //   return {
    //     loading,
    //     usuarios,
    //     usuariosFiltrados,
    //   }
    // }

    // --- Sectores únicos para el filtro ---
    const sectoresDisponibles = computed(() => {
      const sectores = usuarios.value.map(u => u.sector).filter(Boolean);
      return [...new Set(sectores)];
    });

    // --- Filtros y paginado ---
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

    // --- Cargar usuarios ---
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

    // --- Paginación ---
    const paginaAnterior = () => {
      if (paginaActual.value > 1) paginaActual.value--;
    };

    const siguientePagina = () => {
      if (paginaActual.value < totalPaginas.value) paginaActual.value++;
    };

    // --- Modal ---
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

    // --- Reiniciar página al filtrar ---
    watch([busqueda, sectorSeleccionado], () => {
      paginaActual.value = 1;
    });

    // --- Animaciones diferidas al montar ---
    onMounted(() => {
      const successMsg = route.query.success;
      if (successMsg) {
        feedback.value = decodeURIComponent(successMsg);
        router.replace({ query: {} });
      }

      cargarUsuarios();

      // Iniciar animación luego de 4s
      setTimeout(() => {
        mostrarAnimacion.value = false;
        void document.querySelector('.floating-icon')?.offsetWidth; // forzar reflow
        mostrarAnimacion.value = true;

        setTimeout(() => {
          mostrarAnimacion.value = false;
        }, 1800); // duración de la animación
      }, 1800);

      // Mostrar el botón flotante justo después de la animación (5.8s total)
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
      chatbitLogo,
      mostrarAnimacion,
      mostrarBoton
    };
  }
};
</script>



