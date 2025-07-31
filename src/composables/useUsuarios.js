import { ref, computed, watch } from 'vue'
import { getUserProfilesPaginated } from '@/services/user-profiles'

export function useUsuarios() {
  const usuarios = ref([])
  const loading = ref(true)
  const feedback = ref('')

  const usuariosSeleccionados = ref(new Set())
  const paginaActual = ref(1)
  const usuariosPorPagina = 1000

  const busqueda = ref('')
  const sectorSeleccionado = ref('')
  const empresaSeleccionada = ref('')

  const cargarUsuarios = async () => {
    loading.value = true
    try {
      const { data } = await getUserProfilesPaginated(usuariosPorPagina, 1)
      usuarios.value = data
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    } finally {
      loading.value = false
      usuariosSeleccionados.value.clear()
    }
  }

  const sectoresDisponibles = computed(() => {
    return [...new Set(usuarios.value.map(u => u.sector).filter(Boolean))]
  })

  const empresasDisponibles = computed(() => {
    return [...new Set(usuarios.value.map(u => u.empresa_nombre).filter(Boolean))]
  })

  const usuariosFiltrados = computed(() =>
    usuarios.value.filter(u => {
      const coincideBusqueda =
        u.display_name?.toLowerCase().includes(busqueda.value.toLowerCase()) ||
        u.email?.toLowerCase().includes(busqueda.value.toLowerCase())
      const coincideSector =
        !sectorSeleccionado.value || u.sector === sectorSeleccionado.value
      const coincideEmpresa =
        !empresaSeleccionada.value || u.empresa_nombre === empresaSeleccionada.value
      return coincideBusqueda && coincideSector && coincideEmpresa
    })
  )

  const totalPaginas = computed(() =>
    Math.ceil(usuariosFiltrados.value.length / 12)
  )

  const usuariosPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * 12
    return usuariosFiltrados.value.slice(inicio, inicio + 12)
  })

  const nombreSeleccionado = computed(() => {
    if (usuariosSeleccionados.value.size === 1) {
      const id = [...usuariosSeleccionados.value][0]
      const user = usuarios.value.find(u => u.id === id)
      return user?.display_name || user?.email || ''
    }
    return ''
  })

  const toggleSeleccion = (id) => {
    if (usuariosSeleccionados.value.has(id)) {
      usuariosSeleccionados.value.delete(id)
    } else {
      usuariosSeleccionados.value.add(id)
    }
  }

  const paginaAnterior = () => {
    if (paginaActual.value > 1) paginaActual.value--
  }

  const siguientePagina = () => {
    if (paginaActual.value < totalPaginas.value) paginaActual.value++
  }

  watch([busqueda, sectorSeleccionado, empresaSeleccionada], () => {
    paginaActual.value = 1
  })

  return {
    usuarios,
    loading,
    feedback,
    usuariosSeleccionados,
    paginaActual,
    busqueda,
    sectorSeleccionado,
    empresaSeleccionada,
    cargarUsuarios,
    sectoresDisponibles,
    empresasDisponibles,
    usuariosFiltrados,
    usuariosPaginados,
    totalPaginas,
    nombreSeleccionado,
    toggleSeleccion,
    paginaAnterior,
    siguientePagina,
  }
}
