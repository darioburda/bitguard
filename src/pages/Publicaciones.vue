<template>
  <div class="mx-auto flex flex-col w-full max-w-[700px] px-4 py-8">
    <div class="mb-6">
      <h2 class="mb-4 font-bold text-xl">¿Qué querés contarnos?</h2>
      <form @submit.prevent="publicar">
        <label for="body" class="block mb-2">Publicación</label>
        <textarea
          v-model="nuevaPublicacion"
          id="body"
          placeholder="Escribí en este espacio..."
          class="w-full h-24 p-2 border border-gray-300 rounded text-sm resize-none"
        ></textarea>

        <input
          type="file"
          accept="image/*"
          @change="handleFileChange"
          class="mt-2"
        />

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
              <RouterLink
                :to="`/usuario/${post.sender_id}`"
                class="text-blue-800 font-bold underline"
              >
                {{ post.email }}
              </RouterLink>
            </div>

            <div class="flex gap-3 items-center">
              <button
                v-if="post.sender_id === user.id"
                @click="editar(post)"
                class="text-sm text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                v-if="post.sender_id === user.id"
                @click="eliminar(post.id)"
                class="text-sm text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>

          <!-- Imagen -->
          <div v-if="post.image" class="my-3">
            <img :src="post.image" alt="Imagen" class="max-w-full rounded shadow" />
          </div>

          <div v-if="editandoId === post.id" class="space-y-2 mt-2">
            <textarea
              v-model="post.edicion"
              class="w-full p-2 border border-gray-300 rounded text-sm resize-none"
            ></textarea>
            <input
              type="file"
              accept="image/*"
              @change="handleFileEditImageChange"
            />
            <div class="flex gap-2 mt-1">
              <MainButton @click="guardarEdicion(post)">Guardar</MainButton>
              <MainButton @click="cancelarEdicion" class="bg-gray-400">Cancelar</MainButton>
            </div>
          </div>

          <div v-else class="my-2 font-bold">{{ post.body }}</div>

          <div class="text-sm text-gray-600">
            ({{ new Date(post.created_at).toLocaleDateString() }} -
            {{ new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }})
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
                  - ({{ new Date(comentario.created_at).toLocaleDateString() }} -
                  {{ new Date(comentario.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }})
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

<script>
import { nextTick } from 'vue';
import MainLoader from '../components/MainLoader.vue';
import MainButton from '../components/MainButton.vue';
import {
  getPublicaciones,
  savePublicacion,
  eliminarPublicacion,
  editarPublicacion,
  receivePublicaciones,
  unsubscribeFromPublicaciones
} from '../services/publicaciones';
import {
  getComentarios,
  agregarComentario,
  subscribeToComentarios,
  unsubscribeFromComentarios
} from '../services/comentarios';
import { uploadFile, getFileURL, BUCKETS } from '../services/storage';
import { subscribeToAuthState } from '../services/auth';
import { RouterLink } from 'vue-router';
import Swal from 'sweetalert2';

export default {
  name: 'Publicaciones',
  components: { MainLoader, MainButton, RouterLink },

  data() {
    return {
      user: {
        id: null,
        email: null,
      },
      publicaciones: [],
      nuevaPublicacion: '',
      nuevaImagen: null,
      comentariosSuscritos: false,
      loading: false,
      editandoId: null,
      imagenEditada: null,
    };
  },

  methods: {
    async publicar() {
      if (!this.nuevaPublicacion.trim()) return;
      try {
        let file = this.nuevaImagen;

        await savePublicacion({
          sender_id: this.user.id,
          email: this.user.email,
          body: this.nuevaPublicacion,
          file,
        });

        this.nuevaPublicacion = '';
        this.nuevaImagen = null;

        Swal.fire({
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
      this.loading = true;
      try {
        const publicaciones = await getPublicaciones();

        for (const pub of publicaciones) {
          pub.comentarios = await getComentarios(pub.id);
          pub.nuevoComentario = '';
          pub.edicion = pub.body;
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

    editar(post) {
      this.editandoId = post.id;
      this.imagenEditada = null;
    },

    cancelarEdicion() {
      this.editandoId = null;
      this.imagenEditada = null;
    },

    async guardarEdicion(post) {
      try {
        const updated = await editarPublicacion(post.id, {
          body: post.edicion,
          file: this.imagenEditada,
          sender_id: this.user.id,
        });

        const index = this.publicaciones.findIndex(p => p.id === post.id);
        if (index !== -1) {
          this.publicaciones[index] = {
            ...this.publicaciones[index],
            body: updated.body,
            image: updated.image,
          };
        }

        this.editandoId = null;

        Swal.fire('Actualizado', 'Tu publicación fue actualizada.', 'success');
      } catch (error) {
        console.error('Error al guardar edición:', error);
        Swal.fire('Error', 'No se pudo guardar la edición.', 'error');
      }
    },

    handleFileChange(e) {
      this.nuevaImagen = e.target.files[0];
    },

    handleFileEditImageChange(e) {
      this.imagenEditada = e.target.files[0];
    },

    async eliminar(postId) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará la publicación.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        try {
          await eliminarPublicacion(postId);
          Swal.fire('Eliminado', 'La publicación fue eliminada.', 'success');
        } catch (error) {
          console.error('Error al eliminar publicación:', error);
          Swal.fire('Error', 'No se pudo eliminar la publicación.', 'error');
        }
      }
    },
  },

  async mounted() {
    subscribeToAuthState(async (userData) => {
      this.user = userData;
      await this.cargarPublicaciones();
    });

    receivePublicaciones(
      async (nueva) => {
        const comentarios = await getComentarios(nueva.id);
        this.publicaciones.unshift({
          ...nueva,
          comentarios,
          nuevoComentario: '',
          edicion: nueva.body,
        });
      },
      (borrada) => {
        this.publicaciones = this.publicaciones.filter(p => p.id !== borrada.id);
      }
    );

    if (!this.comentariosSuscritos) {
      subscribeToComentarios(async (nuevoComentario) => {
        const publicacion = this.publicaciones.find(p => p.id === nuevoComentario.publicaciones_id);
        if (publicacion) {
          publicacion.comentarios = await getComentarios(publicacion.id);
        }
      });
      this.comentariosSuscritos = true;
    }
  },

  unmounted() {
    unsubscribeFromPublicaciones();
    unsubscribeFromComentarios();
  },
};
</script>

