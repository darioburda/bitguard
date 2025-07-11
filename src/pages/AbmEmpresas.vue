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
      <div class="py-4 mb-6 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Gestión de Empresas</h1>
        <MainButton to="/empresas/agregar">Agregar Empresa</MainButton>
      </div>

      <!-- Lista de empresas -->
      <div v-if="empresas.length === 0" class="text-center text-gray-600 text-lg py-10">
        No hay empresas registradas.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6">
        <div
          v-for="empresa in empresas"
          :key="empresa.id"
          class="relative overflow-hidden bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 flex flex-col justify-between w-full min-w-[300px]"
        >
          <!-- Badge del plan -->
          <div
            class="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full bg-[#F0F2FF] text-[#474747] border border-[#01C38E]"
          >
            {{ empresa.plan_nombre || 'Sin plan' }}
          </div>

          <!-- Nombre + Email -->
          <div class="mb-4">
            <h2 class="text-lg font-semibold">{{ empresa.nombre }}</h2>
            <p class="text-sm text-gray-500">{{ empresa.email_contacto || 'Sin email' }}</p>
          </div>

          <!-- Info completa -->
          <div class="text-sm text-gray-700 space-y-1">
            <p><strong>CUIT:</strong> {{ empresa.cuit || '-' }}</p>
            <p><strong>Teléfono:</strong> {{ empresa.telefono || '-' }}</p>
            <p><strong>Dirección:</strong> {{ empresa.direccion || '-' }}</p>
            <p>
              <strong>Visitas:</strong>
              {{ empresa.visitas_consumidas ?? 0 }} /
              {{ empresa.visitas_incluidas ?? '-' }}
            </p>

            <p v-if="empresa.visitas_restantes !== null">
              <strong>Visitas restantes:</strong>
              {{ empresa.visitas_restantes }}
            </p>
            <p v-if="empresa.minutos_restantes !== null">
              <strong>Soporte restante:</strong>
              {{ Math.floor(empresa.minutos_restantes / 60) }}h
              {{ empresa.minutos_restantes % 60 }}m
            </p>
          </div>

          <!-- Acciones -->
          <div class="mt-4 flex gap-4">
            <RouterLink
              :to="{ name: 'editar-empresa', params: { id: empresa.id } }"
              class="text-blue-600 hover:underline text-sm"
            >
              Editar
            </RouterLink>
            <button
              @click="eliminarEmpresa(empresa)"
              class="text-red-600 hover:underline text-sm"
            >
              Borrar
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getAllEmpresas, deleteEmpresaById } from '@/services/empresas';
import MainLoader from '@/components/MainLoader.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import MainButton from '@/components/MainButton.vue';

export default {
  name: 'AbmEmpresas',
  components: {
    MainLoader,
    AlertMessage,
    MainButton,
    RouterLink,
  },
  setup() {
    const empresas = ref([]);
    const loading = ref(true);
    const feedback = ref('');

    const cargarEmpresas = async () => {
      loading.value = true;
      try {
        const data = await getAllEmpresas();
        empresas.value = data;
      } catch (error) {
        console.error('Error al cargar empresas:', error);
      } finally {
        loading.value = false;
      }
    };

    const eliminarEmpresa = async (empresa) => {
      if (confirm(`¿Estás seguro de eliminar la empresa "${empresa.nombre}"?`)) {
        try {
          await deleteEmpresaById(empresa.id);
          feedback.value = '✅ Empresa eliminada correctamente';
          cargarEmpresas();
        } catch (error) {
          feedback.value = '❌ No se pudo eliminar la empresa';
        }
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
      eliminarEmpresa,
    };
  }
};
</script>
