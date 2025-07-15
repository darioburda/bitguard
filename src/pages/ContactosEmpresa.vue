<template>
  <div class="max-w-screen-xl mx-auto px-4 sm:px-8 py-10">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <MainLoader />
    </div>

    <template v-else>
      <h1 class="text-2xl font-bold mb-6">Contactos de tu Empresa</h1>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
  v-for="u in companeros"
  :key="u.id"
  class="bg-white shadow rounded-lg p-4 min-w-[280px] overflow-hidden flex flex-col gap-4"
>
  <!-- Fila superior: badge alineado a la derecha -->
  <div class="flex justify-end">
    <BadgeSector v-if="u.sector" :value="u.sector" />
  </div>

  <!-- Fila inferior: imagen y datos -->
  <div class="flex gap-4 items-start">
    <img
      :src="u.photo || defaultPhotoUrl"
      alt="Foto"
      class="w-20 h-20 rounded-full object-cover border"
    />
    <div class="text-sm">
      <p class="font-semibold text-base">{{ u.display_name }}</p>
      <p class="text-gray-500">{{ u.email }}</p>
      <p class="text-gray-500">Interno: {{ u.interno_telefono || '—' }}</p>
    </div>
  </div>
</div>

      </div>
    </template>
  </div>
</template>

<script>
import { supabase } from '@/services/supabase';
import MainLoader from '@/components/MainLoader.vue';
import BadgeSector from '@/components/BadgeSector.vue';

const defaultPhotoUrl =
  'https://yjqstwwltjefqtsxlbsa.supabase.co/storage/v1/object/public/profile-picture//default-avatar-2.png';

export default {
  name: 'ContactosEmpresa',
  components: { MainLoader, BadgeSector },
  data() {
    return {
      loading: true,
      companeros: [],
      defaultPhotoUrl
    };
  },
  async mounted() {
    this.loading = true;

    try {
      const { data: userSession } = await supabase.auth.getUser();
      const { data: perfil } = await supabase
        .from('user_profiles')
        .select('id, empresa_id')
        .eq('id', userSession.user.id)
        .single();

      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, display_name, email, interno_telefono, sector, photo')
        .eq('empresa_id', perfil.empresa_id);

      this.companeros = (users || []).filter((u) => u.id !== perfil.id);
    } catch (error) {
      console.error('Error al cargar contactos de empresa:', error);
    } finally {
      this.loading = false;
    }
  }
};
</script>
