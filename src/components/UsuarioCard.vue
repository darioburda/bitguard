<template>
  <div
    class="relative overflow-hidden bg-white border border-[#01C38E] shadow-sm rounded-2xl pt-6 px-6 flex flex-col w-full min-w-[300px]"
  >
    <!-- Badge plan -->
    <BadgePlan
      :value="usuario.is_admin ? 'ADMIN' : (usuario.empresa_plan_nombre || 'Default')"
      class="top-2 left-2"
    />

    <!-- Datos básicos -->
    <div class="flex items-center gap-4 mb-4 mt-4">
      <img
        :src="usuario.photo"
        alt="Foto de perfil"
        class="w-14 h-14 rounded-full object-cover ring-2 ring-[#44d6b4] flex-shrink-0"
      />
      <div>
        <h2 class="text-lg font-semibold">{{ usuario.display_name || 'Sin nombre' }}</h2>
        <p class="text-sm text-gray-500">{{ usuario.email }}</p>
        <p class="text-sm pt-1 text-[#474747] font-semibold flex items-center gap-1">
          <UsersIcon class="w-4 h-4" />
          {{ usuario.sector || 'Sin sector' }}
        </p>
      </div>
    </div>

    <hr class="pb-2" />

    <!-- Datos comunes -->
    <div
      class="text-sm text-gray-700 space-y-1 transition-all duration-300"
      :class="mostrarTecnicos ? 'mb-4' : 'mb-10'"
    >
      <div class="flex items-center gap-2">
        <strong>Rustdesk:</strong>
        <template v-if="usuario.rustdesk">
          <a
            :href="`rustdesk://${usuario.rustdesk}`"
            class="text-blue-600 hover:underline flex items-center gap-1"
            title="Conectar vía Rustdesk"
          >
            <Laptop2Icon class="w-4 h-4" />
            {{ usuario.rustdesk }}
          </a>
        </template>
        <template v-else>-</template>
      </div>
      <p><strong>Equipo:</strong> {{ usuario.equipo || '-' }}</p>
      <p><strong>IP PC:</strong> {{ usuario.ip_pc || '-' }}</p>
      <p><strong>Interno:</strong> {{ usuario.interno_telefono || '-' }}</p>
      <p><strong>IP Interno:</strong> {{ usuario.ip_telefono || '-' }}</p>
    </div>

    <!-- Parte inferior -->
    <div class="relative grow mt-auto">
      <!-- Detalle técnico -->
      <TransitionExpand :show="mostrarTecnicos">
        <div
          class="-mx-6 px-6 pt-4 pb-[45px] bg-[#e7fdef] border-t border-[#01C38E] rounded-b-2xl space-y-1"
        >
          <p class="text-sm"><strong>SO:</strong> {{ usuario.sistema_operativo || '-' }}</p>
          <p class="text-sm"><strong>Microprocesador:</strong> {{ usuario.microprocesador || '-' }}</p>
          <p class="text-sm"><strong>Memoria:</strong> {{ usuario.tipo_memoria || '-' }} / {{ usuario.tamano_memoria || '-' }} GB</p>
          <p class="text-sm"><strong>Disco:</strong> {{ usuario.tipo_disco || '-' }} / {{ usuario.tamano_disco || '-' }} GB</p>
        </div>
      </TransitionExpand>

      <!-- Checkbox reutilizable -->
      <div class="absolute bottom-3 left-0">
        <CheckboxSeleccion
          :checked="seleccionados.has(usuario.id)"
          @update:checked="$emit('toggle-seleccion', usuario.id)"
        />
      </div>
    </div>

    <!-- Badge empresa -->
    <BadgeEmpresa
      v-if="usuario.empresa_nombre"
      :value="usuario.empresa_nombre"
      class="absolute top-3 right-3"
    />
  </div>
</template>

<script setup>
import { Laptop2Icon, UsersIcon } from 'lucide-vue-next'
import BadgeEmpresa from '@/components/BadgeEmpresa.vue'
import BadgePlan from '@/components/BadgePlan.vue'
import TransitionExpand from '@/components/TransitionExpand.vue'
import CheckboxSeleccion from '@/components/CheckboxSeleccion.vue'

defineProps({
  usuario: Object,
  mostrarTecnicos: Boolean,
  seleccionados: Object
})

defineEmits(['toggle-seleccion'])
</script>
