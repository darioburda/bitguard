<template>
  <div class="max-w-screen-xl mx-auto px-4 sm:px-8 py-10">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <MainLoader />
    </div>

    <template v-else>
      <h1 class="text-2xl font-bold mb-6">Contactos de tu Empresa</h1>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div
          v-for="u in companeros"
          :key="u.id"
          :class="['relative border border-[#01C38E] shadow-sm rounded-2xl p-6 flex flex-col justify-between w-full min-w-[300px]', getSectorClasses(u.sector)]"
        >
          <!-- BadgeSector en esquina superior derecha -->
          <!-- <BadgeSector
            v-if="u.sector"
            :value="u.sector"
            class="absolute top-3 right-3"
          /> -->
          <BadgeInterno v-if="u.interno_telefono" :value="u.interno_telefono" class="absolute top-3 right-3" />


          <!-- Foto + nombre + email + sector -->
          <div class="flex items-center gap-4 mb-4 mt-4">
            <img
              :src="u.photo || defaultPhotoUrl"
              alt="Foto de perfil"
              class="w-14 h-14 rounded-full object-cover ring-2 ring-[#44d6b4] flex-shrink-0"
            />
            <div>
              <h2 class="text-lg font-semibold">{{ u.display_name }}</h2>
              <p class="text-sm text-gray-500">{{ u.email }}</p>
              <!-- <p class="text-sm text-gray-500">Interno: {{ u.interno_telefono || '—' }}</p> -->
              <p class="text-sm pt-1 text-[#474747] font-semibold flex items-center gap-1">
                <UsersIcon class="w-4 h-4" />
                {{ u.sector || 'Sin sector' }}
              </p>
            </div>
          </div>

          <!-- Interno -->
          <!-- <div class="text-sm text-gray-700 space-y-1">
            <p><strong>Interno:</strong> {{ u.interno_telefono || '—' }}</p>
          </div> -->
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { supabase } from '@/services/supabase';
import MainLoader from '@/components/MainLoader.vue';
import BadgeSector from '@/components/BadgeSector.vue';
import BadgeInterno from '@/components/BadgeInterno.vue';

import { UsersIcon } from 'lucide-vue-next';

const defaultPhotoUrl =
  'https://yjqstwwltjefqtsxlbsa.supabase.co/storage/v1/object/public/profile-picture//default-avatar-2.png';

export default {
  name: 'ContactosEmpresa',
  components: { MainLoader, BadgeSector, UsersIcon, BadgeInterno },
  data() {
    return {
      loading: true,
      companeros: [],
      defaultPhotoUrl
    };
  },
  methods: {
    getSectorClasses(sector) {
    const s = sector?.toLowerCase();
    switch (s) {
      case 'sistemas':
        return 'bg-gray-200';
      case 'administración':
        return 'bg-green-100';
      case 'rrhh':
        return 'bg-blue-100';
        // return 'bg-rose-50';
      case 'diseño web':
        return 'bg-blue-50';
      case 'fabrica':
        return 'bg-violet-200';
      case 'ventas':
        return 'bg-cyan-50';
      case 'logística':
        return 'bg-amber-50';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  }

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
