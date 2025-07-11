<template>
  <div class="max-w-screen-xl mx-auto px-4 sm:px-8 pt-10 pb-20">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <MainLoader />
    </div>

    <template v-else>
      <AlertMessage
        v-if="feedback && feedbackType === 'error'"
        :message="feedback"
        type="error"
        @dismiss="feedback = ''"
      />

      <h1 class="text-2xl font-bold mb-6">Agregar Empresa</h1>

      <div class="bg-white shadow rounded-xl p-6 space-y-4 max-w-2xl mx-auto">
        <!-- Nombre -->
        <div>
          <label for="nombre" class="block font-semibold mb-1">Nombre</label>
          <input
            id="nombre"
            v-model="empresa.nombre"
            type="text"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email_contacto" class="block font-semibold mb-1">Email de contacto</label>
          <input
            id="email_contacto"
            v-model="empresa.email_contacto"
            type="email"
            class="w-full px-4 py-2 border rounded-md"
            placeholder="correo@dominio.com"
          />
        </div>

        <!-- Teléfono -->
        <div>
          <label for="telefono" class="block font-semibold mb-1">Teléfono</label>
          <input
            id="telefono"
            v-model="empresa.telefono"
            type="text"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- Dirección -->
        <div>
          <label for="direccion" class="block font-semibold mb-1">Dirección</label>
          <input
            id="direccion"
            v-model="empresa.direccion"
            type="text"
            class="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <!-- CUIT -->
        <div>
          <label for="cuit" class="block font-semibold mb-1">CUIT</label>
          <input
            id="cuit"
            v-model="empresa.cuit"
            @input="formatearCUIT"
            type="text"
            class="w-full px-4 py-2 border rounded-md"
            placeholder="20-12345678-1"
          />
        </div>

        <!-- Plan -->
        <div>
          <label for="plan_id" class="block font-semibold mb-1">Plan asignado</label>
          <select
            id="plan_id"
            v-model="empresa.plan_id"
            class="w-full px-4 py-2 border rounded-md"
          >
            <option disabled value="">Selecciona un plan</option>
            <option v-for="plan in planes" :key="plan.id" :value="plan.id">
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
      minutos_consumidos: 0,
      plan_id: '',
    });

    const planes = ref([]);
    const loading = ref(false);
    const feedback = ref('');
    const feedbackType = ref('success'); // 'success' o 'error'

    const cargarPlanes = async () => {
      try {
        planes.value = await getAllPlanes();
      } catch (error) {
        console.error('Error al cargar planes:', error);
      }
    };

    const formatearCUIT = () => {
      let digits = empresa.value.cuit.replace(/\D/g, '');
      if (digits.length > 2 && digits.length <= 10) {
        empresa.value.cuit = digits.replace(/^(\d{2})(\d+)/, '$1-$2');
      } else if (digits.length > 10) {
        empresa.value.cuit = digits.replace(/^(\d{2})(\d{8})(\d)/, '$1-$2-$3');
      } else {
        empresa.value.cuit = digits;
      }
    };

    const guardarEmpresa = async () => {
    feedback.value = '';
    feedbackType.value = 'error';

    if (!empresa.value.nombre.trim()) {
      feedback.value = '❌ Debes cargar el nombre de empresa';
      return;
    }

    if (empresa.value.email_contacto.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(empresa.value.email_contacto)) {
        feedback.value = '❌ El email de contacto no tiene un formato válido';
        return;
      }
    }

    if (!empresa.value.plan_id) {
      feedback.value = '❌ Debes elegir un plan para la empresa';
      return;
    }

    if (empresa.value.cuit.trim()) {
      const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
      if (!cuitRegex.test(empresa.value.cuit)) {
        feedback.value = '❌ El CUIT debe tener el formato XX-XXXXXXXX-X';
        return;
      }
    }

    try {
      loading.value = true;
      await crearEmpresa(empresa.value);
      feedbackType.value = 'success';
      sessionStorage.setItem('empresa_feedback', '✅ Empresa creada correctamente');
      router.push('/abm-empresas');
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
      feedbackType,
      guardarEmpresa,
      formatearCUIT,
    };
  },
};
</script>
