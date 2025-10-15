import { computed } from 'vue'

export function useFiltradoEntidad(entidad, filtros = {}, camposBusqueda = [], nombreEntidad = 'ítem') {
  const filtrados = computed(() => {
    return entidad.value.filter(item => {
      const texto = filtros.busqueda?.value?.toLowerCase?.() || ''

      const coincideBusqueda =
        !texto ||
        camposBusqueda.some(campo =>
          String(item[campo] ?? '').toLowerCase().includes(texto)
        )

      const coincideEmpresa =
        !filtros.empresaSeleccionada?.value ||
        String(item.empresa_id) === String(filtros.empresaSeleccionada.value?.id || filtros.empresaSeleccionada.value)


      const coincideSector =
        !filtros.sectorSeleccionado?.value ||
        item.sector === filtros.sectorSeleccionado.value

      const coincidePlan =
        !filtros.planSeleccionado?.value ||
        String(item.plan_id) === String(filtros.planSeleccionado.value) ||
        item.plan_nombre === filtros.planSeleccionado.value

      const coincideEstado =
        !filtros.estadoSeleccionado?.value ||
        item.estado === filtros.estadoSeleccionado.value

      const coincideTipo =
        !filtros.tipoSeleccionado?.value ||
        item.tipo === filtros.tipoSeleccionado.value

      return (
        coincideBusqueda &&
        coincideEmpresa &&
        coincideSector &&
        coincidePlan &&
        coincideEstado &&
        coincideTipo
      )
    })
  })

  const textoCantidad = computed(() => {
    const cant = filtrados.value.length
    return `${cant} ${nombreEntidad}${cant === 1 ? '' : 's'}`
  })

  return { filtrados, textoCantidad }
}
