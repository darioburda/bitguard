<template>
  <PageContainer :loading="loading">
    <AlertMessage
      v-if="feedback"
      :message="feedback"
      type="success"
      auto-dismiss
      @dismiss="feedback = ''"
    />

    <AbmLayout titulo="Gestión de Empresas">
      <!-- Acciones -->
      <template #acciones>
        <Acciones
          nombreEntidad="Empresa"
          :seleccionados="empresasSeleccionadas"
          @agregar="router.push('/empresas/agregar')"
          @editar="irAEditar"
          @borrar="eliminarEmpresasSeleccionadas"
          @deseleccionarTodos="empresasSeleccionadas.clear()"
        />
      </template>

      <!-- Filtros -->
      <template #filtros>
        <FiltrosEntidad
          entidad="empresa"
          :busqueda="busqueda"
          :planSeleccionado="planSeleccionado"
          :planes="planesDisponibles.map(p => p.nombre)"
          :mostrarGraficos="mostrarGraficos"
          @update:busqueda="busqueda = $event"
          @update:plan="planSeleccionado = $event"
          @toggleGraficos="mostrarGraficos = !mostrarGraficos"
        />
      </template>
    </AbmLayout>

    <!-- Grilla -->
    <GridLayout
      :columnas="3"
      :vacio="empresasVisibles.length === 0"
      entidad="empresa"
    >
      <EmpresaCard
        v-for="empresa in empresasVisibles"
        :key="empresa.id"
        :empresa="empresa"
        :seleccionados="empresasSeleccionadas"
        :mostrarGraficos="mostrarGraficos"
        @toggle-seleccion="toggleSeleccion"
        :class="{ 'tarjeta-animada': animarTarjetas }"
      />
    </GridLayout>

    <!-- Modal eliminar -->
    <div
      v-if="empresaAEliminar"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
    >
      <div class="bg-white border border-red-500 rounded-lg shadow-lg w-full max-w-[500px] p-6">
        <h2 class="text-lg font-bold text-red-600 mb-4">Confirmar Eliminación</h2>
        <p class="mb-6 break-words">
          ¿Estás seguro de que querés eliminar la empresa
          <strong>{{ empresaAEliminar.nombre }}</strong>?
        </p>
        <div class="flex justify-end gap-4">
          <button
            @click="eliminarEmpresaConfirmada"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Eliminar
          </button>
          <button
            @click="cerrarModalEliminar"
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
    <ChatBitButton />

  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAllEmpresas, deleteEmpresaById } from '@/services/empresas'
import { getAllPlanes } from '@/services/planes'
import { useLoader } from '@/composables/useLoader.js'

import Acciones from '@/components/Acciones.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import EmpresaCard from '@/components/EmpresaCard.vue'
import FiltrosEntidad from '@/components/FiltrosEntidad.vue'
import PageContainer from '@/components/layouts/PageContainer.vue'
import AbmLayout from '@/components/layouts/AbmLayout.vue'
import GridLayout from '@/components/layouts/GridLayout.vue'
import ChatBitButton from '@/components/ChatBitButton.vue'


const router = useRouter()

const { loading, finalizarCarga } = useLoader() // ✅ loader reusable

const empresas = ref([])
const empresasVisibles = ref([])
const empresasSeleccionadas = ref(new Set())
const empresaAEliminar = ref(null)
const mostrarGraficos = ref(false)
const feedback = ref('')
const animarTarjetas = ref(true)

const busqueda = ref('')
const planSeleccionado = ref('')
const planesDisponibles = ref([])

const empresasFiltradas = computed(() => {
  return empresas.value.filter(e => {
    const coincideBusqueda =
      busqueda.value === '' ||
      e.nombre?.toLowerCase().includes(busqueda.value.toLowerCase())
    const coincidePlan =
      planSeleccionado.value === '' ||
      e.plan_nombre?.toLowerCase() === planSeleccionado.value.toLowerCase()
    return coincideBusqueda && coincidePlan
  })
})

watch([busqueda, planSeleccionado], async () => {
  animarTarjetas.value = false
  const nuevas = empresasFiltradas.value

  empresasVisibles.value = empresasVisibles.value.filter(e =>
    nuevas.some(n => n.id === e.id)
  )

  await new Promise(resolve => setTimeout(resolve, 300))
  empresasVisibles.value = nuevas
  animarTarjetas.value = true
})

const cargarEmpresas = async () => {
  try {
    empresas.value = await getAllEmpresas()
  } catch (error) {
    console.error('Error al cargar empresas:', error)
  } finally {
    empresasSeleccionadas.value.clear()
    finalizarCarga() // ✅ ocultar loader cuando termina todo
  }
}

const cargarPlanes = async () => {
  try {
    planesDisponibles.value = await getAllPlanes()
  } catch (error) {
    console.error('Error al cargar planes:', error)
  }
}

const toggleSeleccion = (id) => {
  if (empresasSeleccionadas.value.has(id)) {
    empresasSeleccionadas.value.delete(id)
  } else {
    empresasSeleccionadas.value.add(id)
  }
}

const eliminarEmpresasSeleccionadas = async () => {
  if (confirm(`¿Eliminar ${empresasSeleccionadas.value.size} empresa(s)?`)) {
    try {
      for (const id of empresasSeleccionadas.value) {
        await deleteEmpresaById(id)
      }
      feedback.value = '✅ Empresas eliminadas correctamente'
      await cargarEmpresas()
      empresasVisibles.value = empresasFiltradas.value
    } catch (error) {
      console.error('Error al eliminar empresas:', error)
      feedback.value = '❌ No se pudieron eliminar las empresas'
    }
  }
}

const irAEditar = () => {
  const id = [...empresasSeleccionadas.value][0]
  router.push({ name: 'editar-empresa', params: { id } })
}

const abrirModalEliminar = (empresa) => {
  empresaAEliminar.value = empresa
}

const cerrarModalEliminar = () => {
  empresaAEliminar.value = null
}

const eliminarEmpresaConfirmada = async () => {
  const id = empresaAEliminar.value?.id
  cerrarModalEliminar()
  try {
    await deleteEmpresaById(id)
    feedback.value = '✅ Empresa eliminada correctamente'
    await cargarEmpresas()
    empresasVisibles.value = empresasFiltradas.value
  } catch (error) {
    feedback.value = '❌ No se pudo eliminar la empresa'
  }
}

onMounted(async () => {
  const storedMsg = sessionStorage.getItem('empresa_feedback')
  if (storedMsg) {
    feedback.value = storedMsg
    sessionStorage.removeItem('empresa_feedback')
  }

  await cargarEmpresas()
  await cargarPlanes()
  empresasVisibles.value = empresasFiltradas.value
})
</script>

<style scoped>
.tarjeta-animada {
  animation: fadeInUp 0.4s ease;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
