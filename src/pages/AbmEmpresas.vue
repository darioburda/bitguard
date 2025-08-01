<template>
  <div class="w-full">
    <PageContainer>
      <div v-if="loading" class="flex justify-center items-center py-20">
        <MainLoader />
      </div>

      <template v-else>
        <div :class="[mostrarGraficos ? '' : 'min-h-[860px]']">
          <AlertMessage
            v-if="feedback"
            :message="feedback"
            type="success"
            auto-dismiss
            @dismiss="feedback = ''"
          />

          <!-- Encabezado y acciones -->
          <div class="py-4 mb-6 flex justify-between items-center flex-wrap gap-4">
            <h1 class="text-2xl font-bold">Gestión de Empresas</h1>
            <div class="flex gap-4 items-center">
              <button
                @click="mostrarGraficos = !mostrarGraficos"
                class="flex items-center gap-1 text-sm text-[#01C38E] hover:underline focus:outline-none transition"
              >
                <EyeIcon v-if="!mostrarGraficos" class="w-4 h-4" />
                <EyeOffIcon v-else class="w-4 h-4" />
                <span>
                  {{ mostrarGraficos ? 'Ocultar consumo de planes' : 'Ver consumo de planes' }}
                </span>
              </button>
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

          <!-- Filtros -->
          <FiltrosEntidad
            entidad="empresa"
            :busqueda="busqueda"
            :planSeleccionado="planSeleccionado"
            :empresaSeleccionada="''"
            :sectorSeleccionado="''"
            :empresas="empresas.map(e => e.nombre || '')"
            :sectores="empresas.map(e => e.sector || '').filter((s, i, arr) => s && arr.indexOf(s) === i)"
            :planes="planesDisponibles.map(p => p.nombre)"
            :mostrarGraficos="mostrarGraficos"
            @update:busqueda="busqueda = $event"
            @update:plan="planSeleccionado = $event"
            @toggleGraficos="mostrarGraficos = !mostrarGraficos"
          />


          <!-- Mensaje si no hay resultados -->
          <div v-if="empresasFiltradas.length === 0" class="text-center text-gray-600 text-lg py-10">
            No se encontraron empresas que coincidan con la búsqueda.
          </div>

          <!-- Grilla de tarjetas -->
          <div
            v-else
            :class="[ 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 transition-all duration-500',
                      !mostrarGraficos ? 'min-h-[460px]' : '' ]"
          >
            <EmpresaCard
              v-for="empresa in empresasFiltradas"
              :key="empresa.id"
              :empresa="empresa"
              :seleccionados="empresasSeleccionadas"
              :mostrarGraficos="mostrarGraficos"
              @toggle-seleccion="toggleSeleccion"
            />
          </div>
        </div>
      </template>

      <!-- Modal eliminar -->
      <div v-if="empresaAEliminar" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
        <div class="bg-white border border-red-500 rounded-lg shadow-lg w-full max-w-[500px] p-6">
          <h2 class="text-lg font-bold text-red-600 mb-4">Confirmar Eliminación</h2>
          <p class="mb-6 break-words">
            ¿Estás seguro de que querés eliminar la empresa <strong>{{ empresaAEliminar.nombre }}</strong>?
          </p>
          <div class="flex justify-end gap-4">
            <button @click="eliminarEmpresaConfirmada" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Eliminar
            </button>
            <button @click="cerrarModalEliminar" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllEmpresas, deleteEmpresaById } from '@/services/empresas';
import { getAllPlanes } from '@/services/planes';

import MainLoader from '@/components/MainLoader.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import MainButton from '@/components/MainButton.vue';
import EmpresaCard from '@/components/EmpresaCard.vue';
import FiltrosEntidad from '@/components/FiltrosEntidad.vue';
import PageContainer from '@/components/layouts/PageContainer.vue';

import { EyeIcon, EyeOffIcon } from 'lucide-vue-next';

const router = useRouter();

const empresas = ref([]);
const loading = ref(true);
const feedback = ref('');
const empresaAEliminar = ref(null);
const empresasSeleccionadas = ref(new Set());
const mostrarGraficos = ref(false);

// Filtros
const busqueda = ref('');
const planSeleccionado = ref('');
const planesDisponibles = ref([]);

// Computed con filtros aplicados
const empresasFiltradas = computed(() => {
  return empresas.value.filter(e => {
    const coincideBusqueda = busqueda.value === '' || e.nombre?.toLowerCase().includes(busqueda.value.toLowerCase());
    const coincidePlan = planSeleccionado.value === '' || e.plan_id === planSeleccionado.value;
    return coincideBusqueda && coincidePlan;
  });
});

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

const cargarPlanes = async () => {
  try {
    planesDisponibles.value = await getAllPlanes();

  } catch (error) {
    console.error('Error al cargar planes:', error);
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

onMounted(async () => {
  const storedMsg = sessionStorage.getItem('empresa_feedback');
  if (storedMsg) {
    feedback.value = storedMsg;
    sessionStorage.removeItem('empresa_feedback');
  }
  await cargarEmpresas();
  await cargarPlanes();
});
</script>
