<template>
  <div class="w-[60%] mx-auto py-8">
    <h1 class="text-2xl font-bold mb-6">Comentarios de {{ userEmail }}</h1>

    <div v-if="loading" class="text-center">
      <MainLoader />
    </div>

    <div v-else-if="comments.length === 0" class="text-center text-gray-500">
      Este usuario no ha comentado en ninguna publicación.
    </div>

    <ul v-else class="flex flex-col gap-6">
      <li v-for="comment in comments" :key="comment.id" class="border rounded p-4">
        <p class="text-sm text-gray-500 mb-1">Comentario:</p>
        <p class="mb-2">{{ comment.body }}</p>

        <div class="text-xs text-gray-600 mb-2">
          Publicado el {{ new Date(comment.created_at).toLocaleDateString() }}
          a las {{ new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
        </div>

        <p class="text-sm text-gray-500 mb-1">Post comentado:</p>
        <p class="italic text-blue-700">"{{ comment.global_chat?.body || 'Post eliminado' }}"</p>
      </li>
    </ul>
  </div>
</template>

<script>
import { getCommentsByUserId } from '../services/comments';
import { useRoute } from 'vue-router';
import MainLoader from '../components/MainLoader.vue';
import { supabase } from '../services/supabase';

export default {
  name: 'UserComments',
  components: { MainLoader },

  data() {
    return {
      comments: [],
      loading: true,
      userEmail: '',
    };
  },

  async mounted() {
    const route = useRoute();
    const userId = route.params.id;

    try {
      this.loading = true;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', userId)
        .single();

      this.userEmail = profile?.email || 'Usuario';

      this.comments = await getCommentsByUserId(userId);
    } catch (error) {
      console.error('Error al cargar los comentarios:', error);
    } finally {
      this.loading = false;
    }
  }
};
</script>
