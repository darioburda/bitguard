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
      class="w-full min-h-screen bg-cover bg-no-repeat bg-center flex items-start pt-24"
      :style="{ backgroundImage: `url(${fondo})` }"
    >
      <div class="grid grid-cols-1 lg:grid-cols-12 w-full px-6 sm:px-10 lg:px-16 gap-6">
        <div class="lg:col-span-5 flex flex-col gap-6 justify-start items-center lg:items-start text-center lg:text-left z-10">
          <div class="flex flex-col items-center lg:items-center text-center lg:text-left">
            <h1 class="text-3xl sm:text-4xl pt-5 font-bold text-[#474747] leading-tight mb-4">
              ¡Bienvenido a bitguard!
            </h1>
            <img :src="logo" alt="bitguard logo" class="w-[28.5rem] pt-7 max-w-full h-auto" />
          </div>
          <p class="text-xl pt-10 text-gray-700 leading-relaxed max-w-md">
            Tu solución IT integral para PyMEs, ahora con beneficios exclusivos por Nerdearla 2025.
          </p>
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <div class="text-sm text-gray-600 leading-relaxed text-center sm:text-left">
              <span class="text-xl">Prueba gratuita 14 días.</span><br />
              <span class="text-xs">Solo por tiempo limitado. Válido por 4 horas.</span>
            </div>
            <MainButton class="w-52 whitespace-nowrap text-center" @click="scrollToPlanes">
              ADQUIRIR PLAN
            </MainButton>
          </div>
        </div>
        <div class="lg:col-span-7 hidden lg:block"></div>
      </div>
    </section>

    <div class="w-full h-[90px] bg-[#01C38E]"></div>

    <!-- Funcionalidades -->
    <section
      class="relative w-full min-h-screen flex flex-col justify-start items-center text-white"
      :style="{ backgroundImage: `url(${fondo2})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }"
    >
      <div class="pt-32 text-center px-4">
        <h2 class="text-2xl font-bold uppercase tracking-wide">
          bitguard, TODO LO QUE TU EMPRESA NECESITA,<br />
          EN UN MISMO LUGAR.
        </h2>
        <h3 class="text-lg font-semibold mt-4">
          ¿Qué podés hacer con bitguard?
        </h3>
      </div>

      <div class="w-full max-w-screen-xl mt-16 px-4 lg:flex lg:items-start lg:justify-between gap-12">
        <div class="flex flex-col gap-16 w-full lg:w-[20%]">
          <div class="max-w-[280px] mx-auto text-center">
            <h3 class="text-4xl font-bold">1</h3>
            <h4 class="text-xl font-semibold mt-2">Gestión unificada</h4>
            <p class="text-sm mt-1">Administrá todos tus usuarios, equipos y configuraciones IT desde un solo lugar.</p>
          </div>
          <div class="max-w-[280px] mx-auto text-center">
            <h3 class="text-4xl font-bold pt-10">2</h3>
            <h4 class="text-xl font-semibold mt-2">Soporte remoto</h4>
            <p class="text-sm mt-1">Conectate de forma segura a los dispositivos de tu equipo y resolvé problemas en tiempo real.</p>
          </div>
        </div>

        <div class="w-full my-10 lg:my-0 lg:w-[55%] flex justify-center items-center">
          <img :src="notebookImg" alt="notebook" class="w-full max-w-[1100px] h-auto object-contain" />
        </div>

        <div class="flex flex-col gap-16 w-full lg:w-[20%]">
          <div class="max-w-[280px] mx-auto text-center">
            <h3 class="text-4xl font-bold">3</h3>
            <h4 class="text-xl font-semibold mt-2">chatbit integrado</h4>
            <p class="text-sm mt-1">Comunicate rápido con los usuarios desde el chat interno de la app.</p>
            <img src="@/assets/chatbit02.png" alt="Logo Chatbit" class="w-[100px] h-[100px] object-contain mt-4 mx-auto" />
          </div>
          <div class="max-w-[280px] mx-auto text-center">
            <h3 class="text-4xl font-bold">4</h3>
            <h4 class="text-xl font-semibold mt-2">Inventario inteligente</h4>
            <p class="text-sm mt-1">Controlá estado, ubicación y uso de cada equipo en tu parque tecnológico.</p>
          </div>
        </div>
      </div>

      <div class="pt-10 pb-10">
        <MainButton class="w-52 text-center" @click="scrollToPlanes">
          VER PLANES
        </MainButton>
      </div>
    </section>

    <div class="w-full h-[90px] bg-[#01C38E]"></div>

    <!-- Planes -->
    <section
      ref="planes"
      class="w-full min-h-[880px] bg-cover bg-center bg-no-repeat flex flex-col justify-start items-center px-4 sm:px-8"
      :style="{ backgroundImage: `url(${fondo3})`, backgroundSize: '100% 100%' }"
    >
      <div class="max-w-screen-xl w-full">
        <div class="mt-[120px] mb-[70px]">
          <h2 class="text-4xl text-[#01C38E] font-bold text-center">
            Conocé nuestros planes
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 pb-10 lg:grid-cols-3 gap-10">
          <div
            v-for="plan in planes"
            :key="plan.id"
            class="bg-white border shadow-sm hover:shadow-xl transition-shadow duration-300 rounded-2xl p-6 flex flex-col items-center text-center text-[#474747] min-h-[410px]"
            :class="{
              'border-[#01C38E] text-[#01C38E]': plan.nombre.includes('Básico'),
              'border-[#1F58A3] text-[#1F58A3]': plan.nombre.includes('Profesional'),
              'border-[#474747] text-[#474747]': plan.nombre.includes('Corporativo')
            }"
          >
            <img :src="getLogoPlan(plan.nombre)" :alt="plan.nombre" class="w-[70px] h-[70px] object-contain mb-3" />
            <h3 class="text-2xl font-bold mb-1">{{ plan.nombre }}</h3>
            <div class="text-xl font-semibold mb-2 text-[#333]">${{ plan.precio }} / mes</div>
            <p class="text-sm text-gray-600 mb-4 px-2 leading-relaxed">{{ plan.descripcion }}</p>

            <div class="flex flex-col items-center gap-1 mt-auto">
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <TimerIcon class="w-4 h-4" />
                {{ plan.minutos_incluidos }} minutos incluidos
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircleIcon class="w-4 h-4" />
                {{ plan.visitas_incluidas }} visitas técnicas
              </div>
            </div>
          </div>
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
import fondo from '../assets/15157.png'
import fondo4 from '../assets/fondo4.png'
import fondo2 from '../assets/FrameD.png'
import fondo3 from '../assets/fondo3.png'
import notebookImg from '@/assets/FrameE.png'
import AlertMessage from '@/components/AlertMessage.vue'
import MainButton from '@/components/MainButton.vue'
import { TimerIcon, CheckCircleIcon } from 'lucide-vue-next'
import { getAllPlanes } from '@/services/planes'

export default {
  name: 'Home',
  components: {
    AlertMessage,
    MainButton,
    TimerIcon,
    CheckCircleIcon
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
      notebookImg,
      planes: [],
      successMessage: ''
    }
  },
  async mounted() {
    this.fondo = window.innerWidth <= 1250 ? fondo4 : fondo
    window.addEventListener('resize', this.actualizarFondo)
    await this.cargarPlanes()

    if (this.$route.query.loginSuccess === 'true') {
      this.successMessage = 'Has iniciado sesión con éxito.'
      this.$router.replace({ path: this.$route.path, query: {} })
    } else if (this.$route.query.success === 'true') {
      this.successMessage = 'La cuenta se ha creado con éxito.'
      this.$router.replace({ path: this.$route.path, query: {} })
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.actualizarFondo)
  },
  methods: {
    actualizarFondo() {
      this.fondo = window.innerWidth <= 1250 ? this.fondo4 : this.fondo
    },
    scrollToPlanes() {
      const planesSection = this.$refs.planes
      if (planesSection) {
        planesSection.scrollIntoView({ behavior: 'smooth' })
      }
    },
    async cargarPlanes() {
      try {
        this.planes = await getAllPlanes()
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
