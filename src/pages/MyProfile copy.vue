<script>
import MainH1 from '../components/MainH1.vue';
import AlertMessage from '../components/AlertMessage.vue';
import MainButton from '../components/MainButton.vue';
import { subscribeToAuthState } from '../services/auth';
import Swal from 'sweetalert2';

export default {
  name: 'MyProfile',
  components: { MainH1, AlertMessage, MainButton },
  data() {
    return {
      user: {
        id: null,
        email: null,
        bio: null,
        display_name: null,
        sector: null,
        equipo: null,
        rustdesk: null
      },
      successMessage: ''
    };
  },

mounted() {
  subscribeToAuthState(newUserData => this.user = newUserData);

  let message = '';
  if (this.$route.query.success === 'true') {
    message = 'El perfil fue actualizado con éxito';
  } else if (this.$route.query.loginSuccess === 'true') {
    message = 'Has iniciado sesión con éxito.';
  } else if (this.$route.query.accountCreated === 'true') {
    message = 'La cuenta se ha creado con éxito. Por favor actualice los datos del perfil.';
  }

  if (message) {
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 2500,
    });

    this.$router.replace({ path: this.$route.path });
  }
}

};
</script>

<template>
  <AlertMessage 
    v-if="successMessage"
    :message="successMessage"
    type="success"
    :autoDismiss="true"
    @dismiss="successMessage = ''"
  />

  <div class="h-full overflow-auto">
    <div class="mx-auto max-w-[900px] w-full px-4 sm:px-8 py-6 mt-10 bg-white shadow rounded-xl">
      <div class="flex items-center gap-6 mb-6">
        <div class="w-28 h-28 bg-gray-300 rounded-full border-4 border-white shadow-md"></div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-800">
              {{ user.display_name || 'Mi perfil' }}
            </h1>
            <RouterLink to="mi-perfil/editar">
              <MainButton>Editar</MainButton>
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <div>
          <dt class="font-semibold">Biografía</dt>
          <dd class="mb-2">{{ user.bio || 'Acá va mi biografi...' }}</dd>
        </div>
        <div>
          <dt class="font-semibold">Email</dt>
          <dd class="mb-2">{{ user.email }}</dd>
        </div>
        <div>
          <dt class="font-semibold">Sector</dt>
          <dd class="mb-2">{{ user.sector || 'Sin especificar' }}</dd>
        </div>
        <div>
          <dt class="font-semibold">Equipo</dt>
          <dd class="mb-2">{{ user.equipo || 'Sin especificar' }}</dd>
        </div>
        <div>
          <dt class="font-semibold">Rustdesk</dt>
          <dd class="mb-2">{{ user.rustdesk || 'Sin especificar' }}</dd>
        </div>
      </div>
    </div>
  </div>
</template>