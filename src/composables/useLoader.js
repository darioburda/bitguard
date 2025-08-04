import { ref } from 'vue'

export function useLoader() {
  const loading = ref(true)

  const finalizarCarga = () => {
    setTimeout(() => {
      loading.value = false
    }, 10) // podés ajustar este delay si querés animación más fluida
  }

  return {
    loading,
    finalizarCarga
  }
}
