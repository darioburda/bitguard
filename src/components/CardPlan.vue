<template>
  <div
    class="relative w-[326px] h-[500px] rounded-[25px] bg-[#474747] overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-2"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- Precio -->
    <div class="absolute top-[30px] left-[25px] z-20 text-white flex flex-col items-start">
      <div class="text-[28px] font-bold leading-none">${{ plan.precio }}</div>
      <div class="text-sm mt-1">por mes.</div>
      <img :src="logoSrc" alt="Logo Plan" class="mt-2 ml-2 w-[35px] h-[35px]" />
    </div>

    <!-- Fondo blanco interior -->
    <div
      class="absolute top-[8px] left-1/2 transform -translate-x-1/2 w-[300px] h-[480px] bg-white rounded-[25px] z-0"
      style="clip-path: polygon(0 35%, 100% 0%, 100% 100%, 0% 100%)"
    ></div>

    <!-- Badge con sombra al hacer hover -->
    <div
      class="absolute top-[90px] left-[-100px] w-[500px] h-[50px] rotate-[-28deg] flex items-center justify-center z-10 transition-all duration-300 ease-in-out"
      :style="{
        backgroundColor: badgeColor,
        boxShadow: hovered ? `0px 0px 20px 3px ${badgeColor}` : 'none'
      }"
    >
      <span class="font-bold text-[35px] leading-none tracking-wide" :style="{ color: '#474747' }">
        {{ plan.nombre }}
      </span>
    </div>

    <!-- Contenido -->
    <div class="absolute top-[225px] left-1/2 transform -translate-x-1/2 w-[260px] text-[#474747] z-10 flex flex-col gap-4 items-start">
      <p class="text-[15px] ml-6 leading-tight">
        <span class="font-bold">✔</span> Soporte técnico remoto
      </p>
      <p class="text-[15px] ml-6 leading-tight">
        <span class="font-bold">
          {{ plan.visitas_incluidas > 0 ? '✔' : '❌' }}
        </span>
        {{ plan.visitas_incluidas > 0
          ? `Hasta ${plan.visitas_incluidas} visitas`
          : 'No incluye visitas' }}
      </p>
      <p class="text-[15px] ml-6 leading-tight">
        <span class="font-bold">✔</span>
        {{ Math.floor(plan.minutos_incluidos / 60) }} horas mensuales
      </p>
      <p class="text-[15px] ml-6 leading-tight">
        <span class="font-bold">✔</span> Acceso a herramientas exclusivas
      </p>

      <!-- Botón contratar -->
      <div class="w-full flex justify-center mt-4">
        <MainButton
          :style="{ backgroundColor: badgeColor, color: '#474747' }"
          class="px-6 py-2 text-sm font-semibold rounded-lg shadow"
        >
          CONTRATAR
        </MainButton>
      </div>
    </div>
  </div>
</template>

<script>
import logoOro from '@/assets/planes/Oro.png'
import logoPlata from '@/assets/planes/Plata.png'
import logoBronce from '@/assets/planes/Bronce.png'
import MainButton from '@/components/MainButton.vue'

export default {
  name: 'CardPlan',
  components: {
    MainButton
  },
  props: {
    plan: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      hovered: false
    }
  },
  computed: {
    logoSrc() {
      const nombre = this.plan.nombre.toLowerCase()
      if (nombre.includes('oro')) return logoOro
      if (nombre.includes('plata')) return logoPlata
      if (nombre.includes('bronce')) return logoBronce
      return ''
    },
    badgeColor() {
      const nombre = this.plan.nombre.toLowerCase()
      if (nombre.includes('oro')) return '#FFD700'   // Oro
      if (nombre.includes('plata')) return '#C0C0C0' // Plata
      if (nombre.includes('bronce')) return '#CD7F32' // Bronce
      return '#FFD700'
    }
  }
}
</script>
