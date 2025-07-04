<script>
import MainH1 from '../components/MainH1.vue';
import MainLoader from '../components/MainLoader.vue';
import { getUserProfileById } from '../services/user-profiles';
import { getPublicacionesPorUsuario } from '../services/publicaciones';
import { getComentarios } from '../services/comentarios';

export default {
  name: 'UserProfile',
  components: { MainH1, MainLoader },

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
      publicaciones: [],
      loadingUser: false,
      loadingPosts: false
    };
  },

  async mounted() {
    try {
      this.loadingUser = true;
      this.user = await getUserProfileById(this.$route.params.id);
      this.loadingUser = false;

      this.loadingPosts = true;
      this.publicaciones = await getPublicacionesPorUsuario(this.$route.params.id);

      for (const pub of this.publicaciones) {
        pub.comentarios = await getComentarios(pub.id);
      }

      this.loadingPosts = false;
    } catch (error) {
      console.error(error);
    }
  }
};
</script>

<template>
  <template v-if="!loadingUser">
    <div class="flex flex-col gap-6 max-w-[900px] w-full mx-auto px-4 sm:px-8 mt-10">
      
      <!-- Perfil del usuario -->
      <div class="bg-white shadow rounded-xl p-6">
        <div class="flex items-center gap-6 mb-6">
          <div class="w-28 h-28 bg-gray-300 rounded-full border-4 border-white shadow-md"></div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-800">
              {{ user.display_name || 'Perfil de ' + user.email }}
            </h1>
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

        <!-- <div class="mt-6">
          <RouterLink :to="`/usuario/${user.id}/chat`" class="text-blue-700 underline">
            Iniciar chat privado con {{ user.email }}
          </RouterLink>
        </div> -->
      </div>

      <!-- Publicaciones -->
      <div class="pb-10">
        <h2 class="text-xl font-semibold mb-4">Publicaciones de {{ user.display_name || user.email }}</h2>

        <ul v-if="!loadingPosts && publicaciones.length > 0" class="space-y-4">
          <li
            v-for="post in publicaciones"
            :key="post.id"
            class="p-4 border border-gray-300 rounded bg-white"
          >
            <div class="font-semibold text-gray-800">{{ post.body }}</div>
            <div class="text-sm text-gray-500 mt-1">
              Publicado el
              {{ new Date(post.created_at).toLocaleDateString() }}
              {{ new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </div>

            <div class="mt-2 text-sm">
              <strong>Comentarios:</strong>
              <ul v-if="post.comentarios?.length">
                <li v-for="coment in post.comentarios" :key="coment.id" class="pl-2 border-l mt-1">
                  <strong>{{ coment.user_profiles?.display_name || coment.user_profiles?.email || 'Anónimo' }}:</strong>
                  {{ coment.comment }}
                  <span class="text-xs text-gray-500">
                    ({{ new Date(coment.created_at).toLocaleDateString() }} {{ new Date(coment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }})
                  </span>
                </li>
              </ul>
              <p v-else class="text-gray-500">Sin comentarios aún.</p>
            </div>
          </li>
        </ul>

        <p v-else-if="!loadingPosts" class="text-sm text-gray-500">Este usuario no tiene publicaciones.</p>

        <!-- CENTRADO DEL LOADER DE PUBLICACIONES -->
        <div v-else class="flex justify-center items-center min-h-[200px]">
          <MainLoader />
        </div>
      </div>
    </div>
  </template>

  <!-- CENTRADO DEL LOADER DE PERFIL -->
  <div class="flex justify-center items-center min-h-screen" v-else>
    <MainLoader />
  </div>
</template>


