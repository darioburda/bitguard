<script>
import MainButton from '../components/MainButton.vue';
import MainH1 from '../components/MainH1.vue';
import AlertMessage from '../components/AlertMessage.vue';
import { subscribeToAuthState, updateAuthProfile } from '../services/auth';

export default {
  name: 'MyProfileEdit',
  components: {
    MainH1,
    MainButton,
    AlertMessage
  },

  data() {
    return {
      profile: {
        bio: '',
        display_name: '',
        sector: '',
        equipo: '',
        rustdesk: '',
      },
      editing: false,
      successMessage: '',
      errorMessage: '',
    };
  },

  methods: {
    async handleSubmit() {
      try {
        this.editing = true;
        await updateAuthProfile({
          bio: this.profile.bio,
          display_name: this.profile.display_name
        });
        this.editing = false;
        this.$router.push({ 
          path: '/mi-perfil', 
          query: { success: 'true' }
        });
      } catch (error) {
        this.errorMessage = 'Ocurrió un error al actualizar tu perfil';
        this.editing = false;
      }
    },
  },

  mounted() {
    subscribeToAuthState(newUserData => {
      this.profile = {
        bio: newUserData.bio,
        display_name: newUserData.display_name,
        sector: newUserData.sector,
        equipo: newUserData.equipo,
        rustdesk: newUserData.rustdesk,
      };
    });
  },
};
</script>

<template>
  <div class="h-full overflow-auto">
    <div class="mx-auto max-w-[900px] w-full px-4 sm:px-8 py-6 mt-10 bg-white shadow rounded-xl">
      <form @submit.prevent="handleSubmit">
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
          {{ errorMessage }}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div class="mb-3 col-span-full">
            <label for="bio" class="block mb-2 font-semibold">Biografía</label>
            <textarea
              v-model="profile.bio"
              id="bio"
              class="w-full p-2 border border-gray-400 rounded resize-none h-24 text-sm"
            ></textarea>
          </div>

          <div class="mb-3">
            <label for="display_name" class="block mb-2 font-semibold">Nombre completo</label>
            <input
              v-model="profile.display_name"
              type="text"
              id="display_name"
              class="w-full p-2 border border-gray-400 rounded text-sm"
            >
          </div>

          <div class="mb-3">
            <label for="sector" class="block mb-2 font-semibold">Sector</label>
            <input
              v-model="profile.sector"
              type="text"
              id="sector"
              class="w-full p-2 border border-gray-400 rounded text-sm bg-gray-100"
              disabled
            >
          </div>

          <div class="mb-3">
            <label for="equipo" class="block mb-2 font-semibold">Equipo</label>
            <input
              v-model="profile.equipo"
              type="text"
              id="equipo"
              class="w-full p-2 border border-gray-400 rounded text-sm bg-gray-100"
              disabled
            >
          </div>

          <div class="mb-3">
            <label for="rustdesk" class="block mb-2 font-semibold">Rustdesk</label>
            <input
              v-model="profile.rustdesk"
              type="text"
              id="rustdesk"
              class="w-full p-2 border border-gray-400 rounded text-sm bg-gray-100"
              disabled
            >
          </div>
        </div>

        <MainButton type="submit">Actualizar</MainButton>
      </form>
    </div>
  </div>
</template>
