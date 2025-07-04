<script>
import { nextTick } from 'vue';
import MainH1 from '../components/MainH1.vue';
import MainLoader from '../components/MainLoader.vue';
import MainButton from '../components/MainButton.vue';
import { getPublicaciones, savePublicacion, receivePublicaciones, eliminarPublicacion } from '../services/publicaciones';
import { getComentarios, agregarComentario, subscribeToComentarios } from '../services/comentarios';
import { subscribeToAuthState } from '../services/auth';
import { RouterLink } from 'vue-router';
import Swal from 'sweetalert2';


export default {
  name: 'Publicaciones',
  components: { MainH1, MainLoader, MainButton, RouterLink },

  data() {
    return {
      user: {
        id: null,
        email: null,
        display_name: null,
      },
      publicaciones: [],
      loading: false,
      nuevaPublicacion: '',
    };
  },

  methods: {
    async publicar() {
      if (!this.nuevaPublicacion.trim()) return;

      try {
        await savePublicacion({
          sender_id: this.user.id,
          email: this.user.email,
          body: this.nuevaPublicacion,
        });

        this.nuevaPublicacion = '';

        Swal.fire({
        position: 'center',
        icon: 'success',
        title: '¡Publicación creada!',
        showConfirmButton: false,
        timer: 1500,
      });


      } catch (error) {
        console.error('Error al publicar:', error);
      }
    },

    async cargarPublicaciones() {
      try {
        this.loading = true;
        const publicaciones = await getPublicaciones();

        for (const pub of publicaciones) {
          pub.comentarios = await getComentarios(pub.id);
          pub.nuevoComentario = '';
        }

        this.publicaciones = publicaciones;
      } catch (error) {
        console.error('Error cargando publicaciones:', error);
      } finally {
        this.loading = false;
        await nextTick();
      }
    },

    async comentar(publicacion) {
      const texto = publicacion.nuevoComentario.trim();
      if (!texto) return;

      try {
        await agregarComentario({
          publicacionId: publicacion.id,
          senderId: this.user.id,
          comment: texto,
        });

        publicacion.comentarios = await getComentarios(publicacion.id);
        publicacion.nuevoComentario = '';
      } catch (error) {
        console.error('Error al comentar:', error);
      }
    },

    async eliminar(postId) {
  // const confirmado = confirm('¿Estás seguro de que querés eliminar esta publicación?');

  // if (!confirmado) return;

  Swal.fire({
  title: '¿Estás seguro?',
  text: 'Esta acción eliminará la publicación de forma permanente.',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#d33',
  cancelButtonColor: '#3085d6',
  confirmButtonText: 'Sí, eliminar',
  cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await eliminarPublicacion(postId);
        this.publicaciones = this.publicaciones.filter(p => p.id !== postId);
        Swal.fire('Eliminado', 'La publicación fue eliminada correctamente.', 'success');
      } catch (error) {
        console.error('Error al eliminar publicación:', error);
        Swal.fire('Error', 'No se pudo eliminar la publicación.', 'error');
      }
    }
  });


  // try {
  //   await eliminarPublicacion(postId);
  //   this.publicaciones = this.publicaciones.filter(p => p.id !== postId);
  // } catch (error) {
  //   console.error('Error al eliminar publicación:', error);
  //   alert('Error al eliminar publicación.');
  // }
}
  },

  async mounted() {
    subscribeToAuthState((userData) => {
      this.user = userData;
    });

    await this.cargarPublicaciones();

  receivePublicaciones(
  async (nueva) => {
    const nuevaConExtras = {
      ...nueva,
      comentarios: await getComentarios(nueva.id),
      nuevoComentario: '',
    };
    this.publicaciones.unshift(nuevaConExtras);
  },
  (borrada) => {
    this.publicaciones = this.publicaciones.filter(p => p.id !== borrada.id);
  }
);


    subscribeToComentarios(async (nuevoComentario) => {
  console.log("Comentario recibido vía realtime:", nuevoComentario);

  const publicacion = this.publicaciones.find(p => p.id === nuevoComentario.publicaciones_id);
  if (publicacion) {
    publicacion.comentarios = await getComentarios(publicacion.id);
  }
});


  },
};
</script>

<template>
  <div class="mx-auto flex flex-col w-[50%]">
    <div class="py-5">
      <h2 class="mb-4 text-xl">¿Qué quieres contarnos?</h2>
      <form @submit.prevent="publicar">
        <label for="body" class="block mb-2">Mensaje</label>
        <textarea
          v-model="nuevaPublicacion"
          id="body"
          placeholder="Escribí una publicación..."
          class="w-full h-30 p-2 border border-gray-300 rounded text-sm resize-none"
          
        ></textarea>
        <div class="mt-2">
          <MainButton type="submit">Publicar</MainButton>
        </div>
      </form>
    </div>

    <div class="pb-20">
      <ul v-if="!loading" class="flex flex-col gap-6 divide-y divide-gray-300">
        <li v-for="post in publicaciones" :key="post.id" class="pt-4">
          <div class="flex justify-between items-center">
            <div>
              Publicado por
              <!-- <RouterLink
                :to="`/usuario/${post.sender_id}`"
                class="text-blue-800 font-bold underline"
              >
                {{ post.user_profiles?.display_name || post.user_profiles?.email || 'Anónimo' }}
              </RouterLink> -->
              <RouterLink
                :to="`/usuario/${post.sender_id}`"
                class="text-blue-800 font-bold underline"
              >
                {{ post.email }}
              </RouterLink>


            </div>

            <button
              v-if="post.sender_id === user.id"
              @click="eliminar(post.id)"
              class="text-sm text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </div>

          <div class="my-1">{{ post.body }}</div>

          <div class="text-sm text-gray-600">
            {{ new Date(post.created_at).toLocaleDateString() }}
            {{ new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
          </div>

          <!-- Comentarios -->
          <div class="mt-4 space-y-2">
            <div class="text-sm font-semibold">Comentarios:</div>
            <ul v-if="post.comentarios.length > 0">
              <li
                v-for="comentario in post.comentarios"
                :key="comentario.id"
                class="text-sm border-l-2 pl-2 border-gray-400"
              >
                <strong>{{ comentario.user_profiles?.display_name || 'Anónimo' }}:</strong>
                {{ comentario.comment }}
                <span class="text-xs text-gray-500">
                  ({{ new Date(comentario.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }})
                </span>
              </li>
            </ul>
            <p v-else class="text-sm text-gray-500">Sin comentarios aún.</p>

            <!-- Formulario comentario -->
            <form @submit.prevent="comentar(post)" class="mt-2 flex gap-2">
              <input
                type="text"
                v-model="post.nuevoComentario"
                placeholder="Agregar un comentario..."
                class="flex-1 p-2 border border-gray-300 rounded text-sm"
              />
              <MainButton type="submit">Comentar</MainButton>
            </form>
          </div>
        </li>
      </ul>

      <div v-else class="flex justify-center items-center w-full mt-4">
        <MainLoader />
      </div>
    </div>
  </div>
</template>
