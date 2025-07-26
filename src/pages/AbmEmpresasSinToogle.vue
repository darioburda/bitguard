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

      <!-- Encabezado -->
      <div class="py-4 mb-6 flex justify-between items-center flex-wrap gap-4">
        <h1 class="text-2xl font-bold">Gestión de Empresas</h1>
        <div class="flex gap-4">
          <MainButton to="/empresas/agregar">Agregar Empresa</MainButton>
          <MainButton
            v-if="empresasSeleccionadas.size === 1"
            class="bg-blue-500 hover:bg-blue-600"
            @click="irAEditar"
          >
            Editar Empresa
          </MainButton>
          <MainButton
            v-if="empresasSeleccionadas.size > 0"
            class="bg-red-500 hover:bg-red-600"
            @click="eliminarEmpresasSeleccionadas"
          >
            Borrar Empresas
          </MainButton>
        </div>
      </div>

      <!-- Lista de empresas -->
      <div v-if="empresas.length === 0" class="text-center text-gray-600 text-lg py-10">
        No hay empresas registradas.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        <div
          v-for="empresa in empresas"
          :key="empresa.id"
          class="relative overflow-hidden bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 flex flex-col justify-between w-full max-w-[320px] sm:max-w-[440px] md:max-w-[500px] lg:max-w-[540px] xl:max-w-[380px] mx-auto"
        >
          <!-- Checkbox -->
          <input
            type="checkbox"
            class="absolute bottom-3 left-3 w-5 h-5 accent-[#01C38E]"
            :checked="empresasSeleccionadas.has(empresa.id)"
            @change="toggleSeleccion(empresa.id)"
          />

          <!-- Badge del plan -->
          <BadgePlan :value="empresa.plan_nombre || 'Sin plan'" class="top-2 left-2" />

          <!-- Encabezado -->
          <div class="pt-5 flex justify-between items-start mb-2 gap-4">
            <div>
              <h2 class="text-lg font-semibold">{{ empresa.nombre }}</h2>
              <p class="text-sm text-gray-500 pb-1">{{ empresa.email_contacto || 'Sin email' }}</p>
              <p class="text-sm"><strong>CUIT:</strong> {{ empresa.cuit || '-' }}</p>
              <p class="text-sm"><strong>Teléfono:</strong> {{ empresa.telefono || '-' }}</p>
              <p class="text-sm"><strong>Dirección:</strong> {{ empresa.direccion || '-' }}</p>
            </div>
          </div>

          <!-- Gráficos -->
          <div class="flex flex-col sm:flex-row justify-center items-center my-2 gap-y-10 sm:gap-x-6 sm:gap-y-4 lg:gap-x-0 lg:gap-y-0 xl:gap-x-0">
            <div class="flex flex-col items-center justify-center text-center gap-y-8 sm:gap-y-4 lg:gap-y-2">
              <h2 class="text-xs text-gray-500 mb-1">Soporte</h2>
              <SoporteChart
                class="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] lg:w-[160px] lg:h-[160px]"
                :usados="empresa.minutos_consumidos ?? 0"
                :restantes="empresa.minutos_restantes ?? 0"
                :excedidos="empresa.minutos_excedidos ?? 0"
              />
            </div>

            <div class="flex flex-col items-center justify-center text-center gap-y-8 sm:gap-y-4 lg:gap-y-2">
              <h2 class="text-xs text-gray-500 mb-1">Visitas</h2>
              <VisitasChart
                class="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] lg:w-[160px] lg:h-[160px]"
                :visitasConsumidas="empresa.visitas_consumidas ?? 0"
                :visitasTotales="empresa.visitas_incluidas ?? 0"
              />
            </div>
          </div>

          <!-- Acciones individuales -->
          <!-- <div class="mt-5 flex gap-4">
            <RouterLink
              :to="{ name: 'editar-empresa', params: { id: empresa.id } }"
              class="text-blue-600 hover:underline text-sm"
            >
              Editar
            </RouterLink>
            <button
              @click="abrirModalEliminar(empresa)"
              class="text-red-600 hover:underline text-sm"
            >
              Borrar
            </button>
          </div> -->
        </div>
      </div>
    </template>

    <!-- Modal de confirmación de eliminación -->
    <div
      v-if="empresaAEliminar"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
    >
      <div class="bg-white border border-red-500 rounded-lg shadow-lg w-full max-w-[500px] p-6">
        <h2 class="text-lg font-bold text-red-600 mb-4">Confirmar Eliminación</h2>
        <p class="mb-6 break-words">
          ¿Estás seguro de que querés eliminar la empresa
          <strong>{{ empresaAEliminar.nombre }}</strong>?
        </p>
        <div class="flex justify-end gap-4">
          <button
            @click="eliminarEmpresaConfirmada"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Eliminar
          </button>
          <button
            @click="cerrarModalEliminar"
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { getAllEmpresas, deleteEmpresaById } from '@/services/empresas';
import MainLoader from '@/components/MainLoader.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import MainButton from '@/components/MainButton.vue';
import BadgePlan from '@/components/BadgePlan.vue';
import SoporteChart from '@/components/SoporteChart.vue';
import VisitasChart from '@/components/VisitasChart.vue';

export default {
  name: 'AbmEmpresas',
  components: {
    MainLoader,
    AlertMessage,
    MainButton,
    RouterLink,
    BadgePlan,
    SoporteChart,
    VisitasChart,
  },
  setup() {
    const empresas = ref([]);
    const loading = ref(true);
    const feedback = ref('');
    const empresaAEliminar = ref(null);
    const empresasSeleccionadas = ref(new Set());
    const router = useRouter();

    const cargarEmpresas = async () => {
      loading.value = true;
      try {
        empresas.value = await getAllEmpresas();
      } catch (error) {
        console.error('Error al cargar empresas:', error);
      } finally {
        loading.value = false;
        empresasSeleccionadas.value.clear();
      }
    };

    const toggleSeleccion = (id) => {
      if (empresasSeleccionadas.value.has(id)) {
        empresasSeleccionadas.value.delete(id);
      } else {
        empresasSeleccionadas.value.add(id);
      }
    };

    const eliminarEmpresasSeleccionadas = async () => {
      if (confirm(`¿Eliminar ${empresasSeleccionadas.value.size} empresa(s)?`)) {
        try {
          for (const id of empresasSeleccionadas.value) {
            await deleteEmpresaById(id);
          }
          feedback.value = '✅ Empresas eliminadas correctamente';
          await cargarEmpresas();
        } catch (error) {
          console.error('Error al eliminar empresas:', error);
          feedback.value = '❌ No se pudieron eliminar las empresas';
        }
      }
    };

    const irAEditar = () => {
      const id = [...empresasSeleccionadas.value][0];
      router.push({ name: 'editar-empresa', params: { id } });
    };

    const abrirModalEliminar = (empresa) => {
      empresaAEliminar.value = empresa;
    };

    const cerrarModalEliminar = () => {
      empresaAEliminar.value = null;
    };

    const eliminarEmpresaConfirmada = async () => {
      const id = empresaAEliminar.value?.id;
      cerrarModalEliminar();
      try {
        await deleteEmpresaById(id);
        feedback.value = '✅ Empresa eliminada correctamente';
        await cargarEmpresas();
      } catch (error) {
        feedback.value = '❌ No se pudo eliminar la empresa';
      }
    };

    onMounted(() => {
      const storedMsg = sessionStorage.getItem('empresa_feedback');
      if (storedMsg) {
        feedback.value = storedMsg;
        sessionStorage.removeItem('empresa_feedback');
      }
      cargarEmpresas();
    });

    return {
      empresas,
      loading,
      feedback,
      empresaAEliminar,
      abrirModalEliminar,
      cerrarModalEliminar,
      eliminarEmpresaConfirmada,
      empresasSeleccionadas,
      toggleSeleccion,
      eliminarEmpresasSeleccionadas,
      irAEditar,
    };
  }
};
</script>
