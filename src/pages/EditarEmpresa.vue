<template>
  <div class="max-w-screen-xl mx-auto px-4 sm:px-8 pt-10 pb-20">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <MainLoader />
    </div>

    <template v-else>
      <AlertMessage
        v-if="feedback"
        :message="feedback"
        :type="feedbackType"
        @dismiss="feedback = ''"
      />

      <h1 class="text-2xl font-bold mb-6">Editar Empresa</h1>

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
            :value="empresa.plan_id"
            @change="prepararCambioPlan($event)"
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
            @click="guardarCambios"
            class="bg-[#01C38E] hover:bg-[#00a97a] text-white px-6 py-2 rounded-md shadow"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </template>

    <!-- Modal cambio de plan -->
    <div
      v-if="mostrarModalCambioPlan"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
    >
      <div class="bg-white border border-[#01C38E] rounded-lg shadow-lg w-full max-w-[500px] p-6">
        <h2 class="text-lg font-bold text-[#01C38E] mb-4">Confirmar cambio de plan</h2>
        <p class="mb-6 break-words">
          ¿Estás seguro de que querés cambiar el plan de esta empresa?
        </p>
        <div class="flex justify-end gap-4">
          <button @click="confirmarCambioPlan" class="px-4 py-2 bg-[#01C38E] text-white rounded hover:bg-[#00a97a]">
            Confirmar
          </button>
          <button @click="cancelarCambioPlan" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Cancelar
          </button>
        </div>
      </div>
    </div>
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
    const planes = ref([]);
    const feedback = ref('');
    const feedbackType = ref('success');

    const mostrarModalCambioPlan = ref(false);
    const planAnterior = ref('');
    const planNuevoId = ref('');

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

    const prepararCambioPlan = (event) => {
      const nuevoId = event.target.value;
      if (nuevoId === empresa.value.plan_id) return;
      planAnterior.value = empresa.value.plan_id;
      planNuevoId.value = nuevoId;
      mostrarModalCambioPlan.value = true;
    };

    const confirmarCambioPlan = () => {
      empresa.value.plan_id = planNuevoId.value;
      mostrarModalCambioPlan.value = false;
    };

    const cancelarCambioPlan = () => {
      mostrarModalCambioPlan.value = false;
      setTimeout(() => {
        document.getElementById('plan_id').value = planAnterior.value;
      }, 0);
    };

    const guardarCambios = async () => {
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
        await updateEmpresa(empresa.value.id, empresa.value);
        sessionStorage.setItem('empresa_feedback', '✅ Empresa actualizada correctamente');
        router.push('/abm-empresas');
      } catch (error) {
        console.error('Error al actualizar empresa:', error);
        feedback.value = '❌ Error al actualizar empresa';
      }
    };

    onMounted(() => {
      cargarEmpresa();
      cargarPlanes();
    });

    return {
      empresa,
      planes,
      loading,
      feedback,
      feedbackType,
      formatearCUIT,
      guardarCambios,
      mostrarModalCambioPlan,
      prepararCambioPlan,
      confirmarCambioPlan,
      cancelarCambioPlan,
    };
  }
};
</script>
