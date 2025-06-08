<script>
import MainH1 from '../components/MainH1.vue';
import MainLoader from '../components/MainLoader.vue';
import { getUserProfileById } from '../services/user-profiles';

export default {
    name: 'UserProfile',
    components: { MainH1, MainLoader},
    data() {
        return {
            user:{
                id: null,
                email: null,
                bio: null,
                display_name: null,
                sector: null,
                equipo: null, 
                rustdesk: null

            },
            loadingUser: false,
        }
    },
    async mounted() {
        try {
            this.loadingUser = true;
            this.user = await getUserProfileById(this.$route.params.id);
            this.loadingUser = false;
        } catch (error) {
            console.error(error)
            //TODO
        }
    },
}
</script>

<template>
    <template v-if="!loadingUser">
      <div class="h-full overflow-auto">
        <div class="mx-auto max-w-[900px] w-full px-4 sm:px-8 py-03 mt-20 bg-white shadow rounded-xl">
          <div class="flex items-center gap-6 mb-6">
            <div class="w-28 h-28 bg-gray-300 rounded-full border-4 border-white shadow-md"></div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h1 class="text-3xl font-bold text-gray-800">
                  {{ user.display_name || 'Perfil de ' + user.email }}
                </h1>
                <!-- Si querés agregar un botón como en myProfile, lo podés dejar así:
                <RouterLink :to="`/usuarios/${user.id}/editar`">
                  <MainButton>Editar</MainButton>
                </RouterLink>
                -->
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

      <hr class="mb-4">

      <RouterLink
      :to="`/usuario/${user.id}/chat`"
      class="text-blue-700 underline"
      >Iniciar chat privado con {{ user.email }}</RouterLink>

    </template>
  
    <MainLoader v-else />
  </template>
  


