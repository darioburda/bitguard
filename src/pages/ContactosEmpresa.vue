<template>
  <PageContainer :loading="loading">
    <UserLayout titulo="Contactos de tu Empresa">
      <!-- Filtros -->
      <template #filtros>
        <FiltrosEntidad
          entidad="contacto"
          :busqueda="busqueda"
          :sectorSeleccionado="sectorSeleccionado"
          :sectores="sectoresDisponibles"
          :cantidad="companerosFiltrados.length"
          :mostrarToggle="false"
          margen-inferior="mb-[0px]"
          @update:busqueda="busqueda = $event"
          @update:sector="sectorSeleccionado = $event"
        />
      </template>

      <!-- Grilla -->
      <GridLayout :columnas="4" :vacio="companerosFiltrados.length === 0" entidad="contacto">
        <CardUserSmall
          v-for="u in companerosFiltrados"
          :key="u.id"
          :user="u"
          :class="{ 'tarjeta-animada': animarTarjetas }"
        />
      </GridLayout>
    </UserLayout>
    <ChatBitButton />
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useFiltradoEntidad } from '@/composables/useFiltradoEntidad'

import PageContainer from '@/components/layouts/PageContainer.vue'
import GridLayout from '@/components/layouts/GridLayout.vue'
import CardUserSmall from '@/components/CardUserSmall.vue'
import FiltrosEntidad from '@/components/FiltrosEntidad.vue'
import UserLayout from '@/components/layouts/UserLayout.vue'
import ChatBitButton from '@/components/ChatBitButton.vue'

const companeros = ref([])
const busqueda = ref('')
const sectorSeleccionado = ref(null)
const sectoresDisponibles = ref([])
const loading = ref(true)
const animarTarjetas = ref(true)

// ✅ Reutilizamos el composable para el filtrado
const { filtrados: companerosFiltrados } = useFiltradoEntidad(
  companeros,
  { busqueda, sectorSeleccionado },
  ['display_name', 'email', 'interno_telefono'], // Campos a buscar
  'usuario'
)

onMounted(async () => {
  loading.value = true

  try {
    const { data: userSession } = await supabase.auth.getUser()

    const { data: perfil } = await supabase
      .from('user_profiles')
      .select('id, empresa_id')
      .eq('id', userSession.user.id)
      .single()

    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, display_name, email, interno_telefono, sector, photo')
      .eq('empresa_id', perfil.empresa_id)

    companeros.value = (users || []).filter((u) => u.id !== perfil.id)

    const sectoresUnicos = new Set(companeros.value.map((u) => u.sector).filter(Boolean))
    sectoresDisponibles.value = Array.from(sectoresUnicos).sort()
  } catch (error) {
    console.error('Error al cargar contactos de empresa:', error)
  } finally {
    loading.value = false
  }
})
</script>
