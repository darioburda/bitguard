<template>
  <div
    class="relative bg-white border border-[#01C38E] shadow-sm rounded-2xl p-6 flex flex-col justify-between w-full min-w-[300px] transition hover:shadow-md"
  >
    <!-- BadgeInterno arriba a la derecha -->
    <BadgeInterno v-if="user.interno_telefono" :value="user.interno_telefono" class="absolute top-3 right-3" />

    <!-- Foto + nombre + email + sector -->
    <div class="flex items-center gap-4 mb-4 mt-4">
      <img
        :src="user.photo || defaultPhotoUrl"
        alt="Foto de perfil"
        class="w-14 h-14 rounded-full object-cover ring-2 ring-[#44d6b4] flex-shrink-0"
      />
      <div>
        <!-- ✅ Nombre como link al chat privado -->
      <RouterLink
        :to="{ name: 'global-chat', query: { usuario: user.id } }"
        class="text-lg font-semibold text-[#277AE8] hover:underline"
      >
        {{ user.display_name }}
      </RouterLink>


        <p class="text-sm text-gray-500">{{ user.email }}</p>
        <p class="text-sm pt-1 text-[#474747] font-semibold flex items-center gap-1">
          <UsersIcon class="w-4 h-4" />
          {{ user.sector || 'Sin sector' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UsersIcon } from 'lucide-vue-next'
import BadgeInterno from './BadgeInterno.vue'

const defaultPhotoUrl =
  'https://yjqstwwltjefqtsxlbsa.supabase.co/storage/v1/object/public/profile-picture//default-avatar-2.png'

const props = defineProps({
  user: Object
})
</script>
