<template>
  <div class="w-full">
    <AlertMessage
      v-if="successMessage"
      :message="successMessage"
      type="success"
      :autoDismiss="true"
      @dismiss="successMessage = ''"
    />
    <!-- Hero -->
    <section
      class="w-full min-h-[75vh] bg-cover bg-no-repeat bg-center flex items-start pt-12 md:pt-16 lg:pt-20
            bg-[url('@/assets/home_mobile.png')] md:bg-[url('@/assets/home_tablet.png')] lg:bg-[url('@/assets/home_desktop.png')]"
    >
      <div class="grid grid-cols-1 pb-5 md:grid-cols-2 w-full px-4 sm:px-8 md:px-12 lg:px-16 gap-6 items-center">
        <!-- Texto y logo -->
        <div class="flex flex-col gap-4 pt-[90px] -mt-[90px] md:mt-0 justify-start items-center md:items-start text-center md:text-left z-10">
          <h1 class="text-2xl sm:text-3xl mr-5 md:text-3xl font-bold text-[#474747] leading-tight">
            ¡Bienvenido a bitguard-main!
          </h1>
          <img
            :src="logo"
            alt="bitguard logo"
            class="w-[11rem] sm:w-[13rem] md:w-[15rem] h-auto ml-2 sm:ml-4 md:pr-5 md:ml-20"
          />
          <p class="text-base sm:text-lg text-gray-700 leading-relaxed max-w-md pt-2 sm:pt-3">
            Tu solución IT integral para PyMEs, ahora con beneficios exclusivos por Nerdearla 2025.
          </p>
          <div class="flex flex-col sm:flex-row items-center gap-4 mt-2 sm:mt-3">
            <div class="text-sm text-gray-600 leading-relaxed text-center sm:text-left">
              <span class="text-base sm:text-lg font-bold text-[#064DA9]">Descuento del 20%.</span><br />
              <span class="text-xs">Pagando tres meses por adelantado.</span>
            </div>
            <!-- <MainButton
              variant="agregar"
              :showIcon="false"
              class="w-40 sm:w-52 text-center"
              @click="scrollToPlanes"
            >
              ADQUIRIR PLAN
            </MainButton> -->
            <MainButton
            :showIcon="false"
              variant="agregar"
              class="hidden sm:block w-40 sm:w-52 text-center"
              @click="scrollToPlanes"
            >
              ADQUIRIR PLAN
            </MainButton>
          </div>
        </div>
      </div>
    </section>

    <div class="w-full h-[45px] md:h-[60px] lg:h-[80px] bg-[#01C38E]"></div>
  <!-- Funcionalidades -->
  <section
    class="relative w-full min-h-screen flex flex-col justify-start items-center text-white"
    :style="{ backgroundImage: `url(${fondo2})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }"
  >
    <div class="pt-32 text-center px-4">
      <h2 class="text-2xl font-bold tracking-wide">
        <span class="normal-case">bitguard</span>,
        <span class="uppercase">TODO LO QUE TU EMPRESA NECESITA,</span><br />
        <span class="uppercase">EN UN MISMO LUGAR.</span>
      </h2>
      <h3 class="text-lg font-semibold mt-4 italic">
        ¿Qué podés hacer con <span class="not-italic">bitguard</span>?
      </h3>
    </div>

    <div class="w-full max-w-screen-xl mt-16 px-4 lg:flex lg:items-start lg:justify-between gap-12">
      <!-- Lado izquierdo -->
      <div class="flex flex-col gap-0 lg:gap-16 w-full lg:w-[20%]">

        <div class="max-w-[280px] mx-auto text-center">
          <h3 class="text-4xl font-bold">1</h3>
          <h4 class="text-xl font-semibold mt-2">Gestión unificada</h4>
          <p class="text-sm mt-1">
            Administrá todos tus usuarios, equipos y configuraciones IT desde un solo lugar.
          </p>
        </div>

        <div class="max-w-[280px] mx-auto text-center">
          <!-- Bajado 5px -->
          <h3 class="text-4xl font-bold pt-20">2</h3>
          <h4 class="text-xl font-semibold mt-2">Soporte remoto</h4>
          <p class="text-sm mt-1">
            Conectate de forma segura a los dispositivos de tu equipo y resolvé problemas en tiempo real.
          </p>
        </div>
      </div>

      <!-- Imagen central -->
      <div class="w-full my-10 lg:my-0 lg:w-[55%] flex justify-center items-center">
        <img :src="notebookImg" alt="notebook" class="w-full max-w-[1100px] h-auto object-contain" />
      </div>

      <!-- Lado derecho -->
      <div class="flex flex-col gap-8 w-full lg:w-[20%]">
        <div class="max-w-[280px] mx-auto text-center">
          <h3 class="text-4xl font-bold">3</h3>
          <h4 class="text-xl font-semibold mt-2">chatbit integrado</h4>
          <p class="text-sm mt-1">
            Comunicate rápido con los usuarios desde el chat interno de la app.
          </p>
          <img src="@/assets/chatbit02.png" alt="Logo Chatbit" class="w-[100px] h-[100px] object-contain mt-4 mx-auto" />
        </div>

        <div class="max-w-[280px] mx-auto text-center">
          <h3 class="text-4xl font-bold">4</h3>
          <h4 class="text-xl font-semibold mt-2">Inventario inteligente</h4>
          <p class="text-sm mt-1">
            Controlá estado, ubicación y uso de cada equipo en tu parque tecnológico.
          </p>
        </div>
      </div>
    </div>

    <div class="pt-10 pb-10">
      <MainButton
        variant="agregar"
        class="w-52 text-center"
        @click="scrollToPlanes"
      >
        VER PLANES
      </MainButton>
    </div>
  </section>


    <div class="w-full h-[45px] md:h-[60px] lg:h-[80px] bg-[#01C38E]"></div>

  <!-- Planes -->
  <section
    ref="planes"
    class="w-full py-28 min-h-[800px] bg-cover bg-center bg-no-repeat flex flex-col justify-start items-center px-4 sm:px-8"
    :style="{ backgroundImage: `url(${fondo3})` }"
  >
    <div class="max-w-screen-xl w-full">
      <div class="mb-16">
        <h2 class="text-4xl text-[#01C38E] font-bold text-center">
          Conocé nuestros planes
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
        <CardPlan
          v-for="plan in planes"
          :key="plan.id"
          :plan="plan"
        />
      </div>
    </div>
  </section>

  </div>
</template>

<script>
import logo from '../assets/isomago-color-1.png'
import logo3 from '../assets/PlanBasico.png'
import logo4 from '../assets/PlanProfesional.png'
import logo5 from '../assets/PlanCorporativo.png'
import fondo from '../assets/home_desktop.png'
import fondo4 from '../assets/home_mobile.png'
import fondo5 from '../assets/home_tablet.png'
import fondo2 from '../assets/fondo-azul-03.png'
import fondo3 from '../assets/background-Bitguard.png'
import notebookImg from '@/assets/FrameE.png'
import AlertMessage from '@/components/AlertMessage.vue'
import MainButton from '@/components/MainButton.vue'
import { TimerIcon, CheckCircleIcon } from 'lucide-vue-next'
import { getAllPlanes } from '@/services/planes'
import CardPlan from '@/components/CardPlan.vue'

export default {
  name: 'Home',
  components: {
    AlertMessage,
    MainButton,
    TimerIcon,
    CheckCircleIcon,
    CardPlan
  },
  data() {
    return {
      logo,
      logo3,
      logo4,
      logo5,
      fondo,
      fondo2,
      fondo3,
      fondo4,
      fondo5,
      notebookImg,
      planes: [],
      successMessage: ''
    }
  },
  async mounted() {
    await this.cargarPlanes()

    if (this.$route.query.loginSuccess === 'true') {
      this.successMessage = 'Has iniciado sesión con éxito.'
      this.$router.replace({ path: this.$route.path, query: {} })
    } else if (this.$route.query.success === 'true') {
      this.successMessage = 'La cuenta se ha creado con éxito.'
      this.$router.replace({ path: this.$route.path, query: {} })
    }
  },
  methods: {
    scrollToPlanes() {
      const planesSection = this.$refs.planes
      if (planesSection) {
        planesSection.scrollIntoView({ behavior: 'smooth' })
      }
    },
    async cargarPlanes() {
      try {
        const datos = await getAllPlanes()
        const orden = { Bronce: 1, Plata: 2, Oro: 3 }
        this.planes = datos.sort((a, b) => orden[a.nombre] - orden[b.nombre])
      } catch (error) {
        console.error('Error al cargar planes:', error.message)
      }
    },
    getLogoPlan(nombre) {
      if (nombre.includes('Básico')) return this.logo3
      if (nombre.includes('Profesional')) return this.logo4
      if (nombre.includes('Corporativo')) return this.logo5
      return this.logo
    }
  }
}
</script>
