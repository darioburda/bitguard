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
        if (!/^\d*$/.test(this.profile.rustdesk)) {
            this.errorMessage = 'El campo Rustdesk solo debe contener números.';
            return;
            }
        try {
            this.editing = true;
            await updateAuthProfile({ ...this.profile });
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
        if (this.$route.query.success === 'true') {
            this.successMessage = 'El perfil fue actualizado con éxito';
        }
    },
};
</script>
<template>
    <div class="h-full overflow-auto flex justify-center">
      <div class="w-[50%] px-4 sm:px-8 py-10">
        <form 
          action="#"
          @submit.prevent="handleSubmit"
        >
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
            {{ errorMessage }}
          </div>
  
          <div class="mb-3">
            <label for="bio" class="block mb-2">Biografía</label>
            <textarea
              v-model="profile.bio"
              id="bio"
              class="w-full p-2 border border-gray-400 rounded">
            </textarea>
          </div>
  
          <div class="mb-3">
            <label for="display_name" class="block mb-2">Nombre de usuario</label>
            <input
              v-model="profile.display_name"
              type="text"
              id="display_name"
              class="w-full p-2 border border-gray-400 rounded">
          </div>
  
          <div class="mb-3">
            <label for="sector" class="block mb-2">Sector</label>
            <input
              v-model="profile.sector"
              type="text"
              id="sector"
              class="w-full p-2 border border-gray-400 rounded">
          </div>
  
          <div class="mb-3">
            <label for="equipo" class="block mb-2">Equipo</label>
            <input
              v-model="profile.equipo"
              type="text"
              id="equipo"
              class="w-full p-2 border border-gray-400 rounded">
          </div>
  
          <div class="mb-3">
            <label for="rustdesk" class="block mb-2">Rustdesk</label>
            <input
              v-model="profile.rustdesk"
              type="text"
              id="rustdesk"
              class="w-full p-2 border border-gray-400 rounded">
          </div>
  
          <MainButton type="submit">Actualizar mi perfil</MainButton>
        </form>
      </div>
    </div>
</template>
  