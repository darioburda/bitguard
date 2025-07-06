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

      <h1 class="text-2xl font-bold mb-6">Agregar Empresa</h1>

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
            @click="guardarEmpresa"
            class="bg-[#01C38E] hover:bg-[#00a97a] text-white px-6 py-2 rounded-md shadow"
          >
            Guardar Empresa
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllPlanes } from '@/services/planes';
import { crearEmpresa } from '@/services/empresas';
import MainLoader from '@/components/MainLoader.vue';
import AlertMessage from '@/components/AlertMessage.vue';

export default {
  name: 'AgregarEmpresa',
  components: {
    MainLoader,
    AlertMessage,
  },
  setup() {
    const router = useRouter();
    const empresa = ref({
      nombre: '',
      email_contacto: '',
      telefono: '',
      direccion: '',
      cuit: '',
      visitas_consumidas: 0,
      horas_consumidas: 0,
      plan_id: ''
    });

    const planes = ref([]);
    const loading = ref(false);
    const feedback = ref('');

    const cargarPlanes = async () => {
      try {
        planes.value = await getAllPlanes();
      } catch (error) {
        console.error('Error al cargar planes:', error);
      }
    };

    const guardarEmpresa = async () => {
      try {
        loading.value = true;
        await crearEmpresa(empresa.value);
        feedback.value = '✅ Empresa creada correctamente';
        setTimeout(() => router.push('/abm-empresas'), 1500);
      } catch (error) {
        console.error('Error al crear empresa:', error);
        feedback.value = '❌ No se pudo crear la empresa';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      cargarPlanes();
    });

    return {
      empresa,
      planes,
      loading,
      feedback,
      guardarEmpresa,
    };
  }
};
</script>

