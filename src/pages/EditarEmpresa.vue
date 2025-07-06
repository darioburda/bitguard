<template>
  <div class="max-w-screen-xl mx-auto px-4 sm:px-8 pt-10 pb-20">
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

      <h1 class="text-2xl font-bold mb-6">Editar Empresa</h1>

      <div class="bg-white shadow rounded-xl p-6 space-y-4 max-w-2xl mx-auto">
        <!-- Nombre -->
        <div>
          <label class="block font-semibold mb-1">Nombre</label>
          <input
            v-model="empresa.nombre"
            type="text"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block font-semibold mb-1">Email de contacto</label>
          <input
            v-model="empresa.email_contacto"
            type="email"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- Teléfono -->
        <div>
          <label class="block font-semibold mb-1">Teléfono</label>
          <input
            v-model="empresa.telefono"
            type="text"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- Dirección -->
        <div>
          <label class="block font-semibold mb-1">Dirección</label>
          <input
            v-model="empresa.direccion"
            type="text"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- CUIT -->
        <div>
          <label class="block font-semibold mb-1">CUIT</label>
          <input
            v-model="empresa.cuit"
            type="text"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- Visitas -->
        <div>
          <label class="block font-semibold mb-1">Visitas consumidas</label>
          <input
            v-model.number="empresa.visitas_consumidas"
            type="number"
            min="0"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- Horas -->
        <div>
          <label class="block font-semibold mb-1">Horas consumidas</label>
          <input
            v-model.number="empresa.horas_consumidas"
            type="number"
            min="0"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- Plan -->
        <div>
          <label class="block font-semibold mb-1">Plan asignado</label>
          <select
            v-model="empresa.plan_id"
            class="w-full px-4 py-2 border rounded-md"
          >
            <option disabled value="">Selecciona un plan</option>
            <option
              v-for="plan in planes"
              :key="plan.id"
              :value="plan.id"
            >
              {{ plan.nombre }}
            </option>
          </select>
        </div>

        <!-- Botón Guardar -->
        <div class="pt-4">
          <button
            @click="guardarCambios"
            class="bg-[#01C38E] hover:bg-[#00a97a] text-white px-6 py-2 rounded-md shadow"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getEmpresaById, updateEmpresa } from '@/services/empresas';
import { getAllPlanes } from '@/services/planes';
import MainLoader from '@/components/MainLoader.vue';
import AlertMessage from '@/components/AlertMessage.vue';

export default {
  name: 'EditarEmpresa',
  components: {
    MainLoader,
    AlertMessage,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const empresa = ref(null);
    const loading = ref(true);
    const feedback = ref('');
    const planes = ref([]);

    const cargarEmpresa = async () => {
      try {
        empresa.value = await getEmpresaById(route.params.id);
      } catch (error) {
        console.error('Error al cargar empresa:', error);
      } finally {
        loading.value = false;
      }
    };

    const cargarPlanes = async () => {
    try {
        planes.value = await getAllPlanes(); // ✅ Esto es ahora correcto
    } catch (error) {
        console.error('Error al cargar planes:', error);
    }
    };


    const guardarCambios = async () => {
      try {
        await updateEmpresa(empresa.value.id, empresa.value);
        feedback.value = '✅ Empresa actualizada correctamente';
        setTimeout(() => router.push('/abm-empresas'), 1500);
      } catch (error) {
        feedback.value = '❌ Error al actualizar empresa';
      }
    };

    onMounted(() => {
      cargarEmpresa();
      cargarPlanes();
    });

    return {
      empresa,
      loading,
      feedback,
      planes,
      guardarCambios,
    };
  }
};
</script>
