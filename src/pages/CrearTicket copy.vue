<template>
  <div class="max-w-screen-md mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold mb-6">Crear Ticket</h1>

    <AlertMessage v-if="feedback" :message="feedback" type="success" auto-dismiss @dismiss="feedback = ''" />

    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Empresa -->
      <div>
        <label class="block mb-1 font-semibold">Empresa</label>
        <select v-model="ticket.empresa_id" class="w-full border px-4 py-2 rounded">
          <option disabled value="">Selecciona una empresa</option>
          <option v-for="e in empresas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
        </select>
      </div>

      <!-- Usuario solicitante con búsqueda -->
      <div>
        <label class="block mb-1 font-semibold">Usuario solicitante</label>

        <!-- Barra de búsqueda -->
        <input
          type="text"
          v-model="busquedaUsuario"
          placeholder="Buscar por nombre o email..."
          class="w-full mb-2 border px-4 py-2 rounded"
          :disabled="usuariosFiltrados.length === 0"
        />

        <!-- Select -->
        <select
          v-model="ticket.usuario_id"
          class="w-full border px-4 py-2 rounded"
          :disabled="usuariosFiltrados.length === 0"
        >
          <option disabled value="">Selecciona un usuario</option>
          <option
            v-for="u in usuariosFiltrados"
            :key="u.id"
            :value="u.id"
          >
            {{ u.display_name ? `${u.display_name} - ${u.email}` : u.email }}
          </option>
        </select>
      </div>

      <!-- Tipo de soporte -->
      <div>
        <label class="block mb-1 font-semibold">Tipo</label>
        <select v-model="ticket.tipo" class="w-full border px-4 py-2 rounded">
          <option value="remoto">Remoto</option>
          <option value="presencial">Presencial</option>
        </select>
      </div>

      <!-- Descripción -->
      <div>
        <label class="block mb-1 font-semibold">Descripción <span class="text-red-600">*</span></label>
        <textarea
          v-model="ticket.descripcion"
          class="w-full border px-4 py-2 rounded resize-none"
          rows="4"
          required
        ></textarea>
      </div>

      <!-- Técnico asignado -->
      <div>
        <label class="block mb-1 font-semibold">Asignar técnico (opcional)</label>
        <select v-model="ticket.tecnico_id" class="w-full border px-4 py-2 rounded">
          <option value="">-- Ninguno --</option>
          <option v-for="t in tecnicos" :key="t.id" :value="t.id">{{ t.display_name || t.email }}</option>
        </select>
      </div>

      <!-- Botón -->
      <MainButton type="submit">Crear Ticket</MainButton>
    </form>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAllEmpresas } from '@/services/empresas';
import { getAllUserProfiles } from '@/services/user-profiles';
import { crearTicket } from '@/services/tickets';
import AlertMessage from '@/components/AlertMessage.vue';
import MainButton from '@/components/MainButton.vue';

export default {
  components: {
    AlertMessage,
    MainButton,
  },
  setup() {
    const router = useRouter();
    const empresas = ref([]);
    const usuarios = ref([]);
    const todosLosUsuarios = ref([]);
    const tecnicos = ref([]);
    const feedback = ref('');
    const busquedaUsuario = ref('');

    const ticket = ref({
      empresa_id: '',
      tipo: 'remoto',
      descripcion: '',
      usuario_id: '',
      tecnico_id: '',
    });

    const submitForm = async () => {
      try {
        const payload = {
          ...ticket.value,
          tecnico_id: ticket.value.tecnico_id || null,
        };
        await crearTicket(payload);
        feedback.value = '✅ Ticket creado correctamente';
        router.push({ name: 'AbmTickets' });
      } catch (error) {
        console.error('[crearTicket] Error:', error);
        feedback.value = '❌ Error al crear ticket';
      }
    };

    const cargarDatos = async () => {
      empresas.value = await getAllEmpresas();
      const perfiles = await getAllUserProfiles();
      todosLosUsuarios.value = perfiles;
      usuarios.value = [];
      tecnicos.value = perfiles.filter(u => u.is_admin);
    };

    const filtrarUsuariosPorEmpresa = () => {
      if (!ticket.value.empresa_id) {
        usuarios.value = [];
        ticket.value.usuario_id = '';
        return;
      }
      usuarios.value = todosLosUsuarios.value.filter(
        (u) => u.empresa_id === ticket.value.empresa_id
      );
      ticket.value.usuario_id = '';
      busquedaUsuario.value = '';
    };

    const usuariosFiltrados = computed(() => {
      const texto = busquedaUsuario.value.toLowerCase();
      return usuarios.value.filter(
        (u) =>
          (u.display_name && u.display_name.toLowerCase().includes(texto)) ||
          u.email.toLowerCase().includes(texto)
      );
    });

    watch(() => ticket.value.empresa_id, filtrarUsuariosPorEmpresa);
    onMounted(cargarDatos);

    return {
      empresas,
      usuariosFiltrados,
      tecnicos,
      ticket,
      feedback,
      submitForm,
      busquedaUsuario,
    };
  },
};
</script>

<style scoped>
label {
  color: #333;
}
</style>
