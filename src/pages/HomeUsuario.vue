<template>
  <div class="max-w-screen-xl mx-auto px-4 sm:px-8 py-10">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <MainLoader />
    </div>

    <template v-else>
      <!-- Resumen de empresa -->
      <div class="mb-8 bg-white shadow rounded-xl p-6">
        <h1 class="text-2xl font-bold mb-2">{{ empresa.nombre }}</h1>
        <p class="text-gray-600">Plan actual: <strong>{{ empresa.plan?.nombre }}</strong></p>
        <p class="text-sm text-gray-500">
          Soporte consumido: {{ empresa.horas_consumidas }}h / {{ empresa.plan?.horas }}h ·
          Visitas: {{ empresa.visitas_consumidas }} / {{ empresa.plan?.visitas }}
        </p>
      </div>

      <!-- Listado de usuarios de la empresa -->
      <div class="mb-10">
        <h2 class="text-xl font-semibold mb-4">Compañeros de tu empresa</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="user in usuariosEmpresa"
            :key="user.id"
            class="bg-white shadow rounded-lg p-4 flex flex-col gap-2"
          >
            <div class="flex items-center gap-4">
              <img
                :src="user.photo || defaultPhotoUrl"
                alt="Foto"
                class="w-14 h-14 rounded-full object-cover border"
              />
              <div>
                <p class="font-semibold">{{ user.display_name }}</p>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
                <p class="text-sm text-gray-500">Interno: {{ user.interno || '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tickets del usuario -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Tus Tickets de Soporte</h2>
        <div v-if="tickets.length === 0" class="text-gray-500">No tenés tickets registrados.</div>
        <ul class="space-y-4">
          <li
            v-for="ticket in tickets"
            :key="ticket.id"
            class="bg-white shadow p-4 rounded-lg"
          >
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium">{{ ticket.descripcion }}</p>
                <p class="text-sm text-gray-500">
                  Estado: {{ ticket.estado }} · Tipo: {{ ticket.tipo_soporte }}
                </p>
              </div>
              <span class="text-xs text-gray-400">{{ formatDate(ticket.created_at) }}</span>
            </div>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script>
import { supabase } from '@/services/supabase'
import MainLoader from '@/components/MainLoader.vue'

const defaultPhotoUrl = 'https://yjqstwwltjefqtsxlbsa.supabase.co/storage/v1/object/public/profile-picture//default-avatar-2.png'

export default {
  name: 'HomeUsuario',
  components: { MainLoader },
  data() {
    return {
      loading: true,
      user: null,
      empresa: {},
      usuariosEmpresa: [],
      tickets: [],
      defaultPhotoUrl
    }
  },
  methods: {
    async fetchDatos() {
      this.loading = true
      const { data: userData } = await supabase.auth.getUser()
      this.user = userData.user

      // Obtener perfil con empresa
      const { data: perfil } = await supabase
        .from('user_profiles')
        .select('id, email, display_name, interno, empresa_id')
        .eq('id', this.user.id)
        .single()

      // Empresa
      const { data: empresaData } = await supabase
        .from('empresas')
        .select('*, plan:planes(nombre, horas, visitas)')
        .eq('id', perfil.empresa_id)
        .single()

      this.empresa = empresaData

      // Compañeros de empresa
      const { data: companeros } = await supabase
        .from('user_profiles')
        .select('id, display_name, email, interno, photo')
        .eq('empresa_id', perfil.empresa_id)

      this.usuariosEmpresa = companeros.filter(u => u.id !== perfil.id)

      // Tickets propios
      const { data: misTickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('usuario_id', perfil.id)
        .order('created_at', { ascending: false })

      this.tickets = misTickets
      this.loading = false
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('es-AR', options)
    }
  },
  mounted() {
    this.fetchDatos()
  }
}
</script>
