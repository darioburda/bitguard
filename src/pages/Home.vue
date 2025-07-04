<template>
    <div class="w-full">
    <AlertMessage
      v-if="successMessage"
      :message="successMessage"
      type="success"
      :autoDismiss="true"
      @dismiss="successMessage = ''"
    />
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
          <div class="flex flex-col sm:flex-row items-center sm:items-center gap-4">
            <div class="text-sm text-gray-600 leading-relaxed text-center sm:text-left">
              <span class="text-xl">Prueba gratuita 14 días.</span><br />
              <span class="text-xs">Solo por tiempo limitado. Válido por 4 horas.</span>
            </div>
            <MainButton class="w-52 whitespace-nowrap text-center"  @click="scrollToPlanes">
              ADQUIRIR PLAN
            </MainButton>
          </div>
        </div>

        <div class="lg:col-span-7 hidden lg:block"></div>
      </div>
    </section>
    <div class="w-full h-[90px] bg-[#01C38E]"></div>
      <section
        class="relative w-full min-h-screen flex flex-col justify-start items-center text-white"
        :style="{
          backgroundImage: `url(${fondo2})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }"
      >
        <!-- Títulos -->
        <div class="pt-32 text-center px-4">
          <h2 class="text-2xl sm:text-2xl font-bold uppercase tracking-wide">
            bitguard, TODO LO QUE TU EMPRESA NECESITA,<br />
            EN UN MISMO LUGAR.
          </h2>
          <h3 class="text-lg sm:text-xl font-semibold mt-4">
            ¿Qué podés hacer con bitguard?
          </h3>
        </div>

        <!-- Responsive Layout -->
        <div class="w-full max-w-screen-xl mt-16 px-4 lg:flex lg:items-start lg:justify-between gap-12">
          <!-- Columna izquierda: 1 y 3 -->
          <div class="flex flex-col gap-16 w-full lg:w-[20%]">
            <div class="w-full max-w-[280px] mx-auto">
              <h3 class="text-4xl font-bold text-center">1</h3>
              <h4 class="text-xl font-semibold text-center mt-2">Gestión unificada</h4>
              <p class="text-sm text-center mt-1">
                Administrá todos tus usuarios, equipos y configuraciones IT desde un solo lugar.
              </p>
            </div>
            <div class="w-full max-w-[280px] mx-auto">
              <h3 class="text-4xl font-bold pt-10 text-center">2</h3>
              <h4 class="text-xl font-semibold text-center mt-2">Soporte remoto</h4>
              <p class="text-sm text-center mt-1">
                Conectate de forma segura a los dispositivos de tu equipo y resolvé problemas en tiempo real.
              </p>
            </div>
          </div>

          <!-- Imagen en el centro -->
          <div class="w-full my-10 lg:my-0 lg:w-[55%] flex justify-center items-center order-last md:order-none">
          <img
            :src="notebookImg"
            alt="notebook"
            class="w-full max-w-[1100px] h-auto object-contain"
          />
          </div>

          <!-- Columna derecha: 2 y 4 -->
          <div class="flex flex-col gap-16 w-full lg:w-[20%]">
            <div class="w-full max-w-[280px] mx-auto">
              <h3 class="text-4xl font-bold text-center">3</h3>
              <h4 class="text-xl font-semibold text-center mt-2">chatbit integrado</h4>
              <p class="text-sm text-center mt-1">
                Comunicate de forma rápida y directa con los usuarios desde el chat interno de la app.
              </p>
              <img
                src="@/assets/chatbit02.png"
                alt="Logo Chatbit"
                class="w-[100px] h-[100px] object-contain mt-4 mx-auto"
              />
            </div>
            <div class="w-full max-w-[280px] mx-auto">
              <h3 class="text-4xl font-bold text-center">4</h3>
              <h4 class="text-xl font-semibold text-center mt-2">Inventario inteligente</h4>
              <p class="text-sm text-center mt-1">
                Controlá el estado, ubicación y uso de cada equipo en tu parque tecnológico.
              </p>
            </div>
          </div>
        </div>

        <!-- Botón -->
        <div class="mt-23  pt-10 pb-10">
          <MainButton class="w-52 text-center"  @click="scrollToPlanes">
            VER PLANES
          </MainButton>
        </div>
      </section>
    <div class="w-full h-[90px] bg-[#01C38E]"></div>
      <section
        ref="planes"
        class="w-full min-h-[880px] bg-cover bg-center bg-no-repeat flex flex-col justify-start items-center px-4 sm:px-8"
        :style="{ backgroundImage: `url(${fondo3})`, backgroundSize: '100% 100%' }"
      >
        <div class="max-w-screen-xl w-full">
          <!-- Título más arriba -->
          <div class="mt-[120px] mb-[70px]">
            <h2 class="text-4xl text-[#01C38E] font-bold text-center">
              Conocé nuestros planes
            </h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 pb-10 lg:grid-cols-3 gap-10">
            <!-- Plan Básico -->
            <div
              class="bg-white border border-[#01C38E] shadow-sm pb-8 hover:shadow-xl transition-shadow duration-300 rounded-2xl p-6 flex flex-col items-center text-center text-[#474747] min-h-[410px]"
            >
              <img src="@/assets/PlanBasico.png" alt="Plan Básico" class="w-[100px] h-[100px] object-contain mb-4" />
              <h3 class="text-3xl pt-3 font-bold text-[#01C38E] mb-2">Plan Básico</h3>
              <p class="text-3sm pt-3 mb-4">
                Ideal para para profesionales o microempresas. Tiempo de respuesta: hasta 24 hs hábiles,
                hasta 10 equipos.
              </p>
              <div class="text-lg font-semibold mt-auto">$9.900 / mes</div>
            </div>
            <!-- Plan Profesional -->
            <div
              class="bg-white border border-[#1F58A3] shadow-sm pb-8 hover:shadow-xl transition-shadow duration-300 rounded-2xl p-6 flex flex-col items-center text-center text-[#474747] min-h-[410px]"
            >
              <img src="@/assets/PlanProfesional.png" alt="Plan Profesional" class="w-[100px] h-[100px] object-contain mb-4" />
              <h3 class="text-3xl pt-3 font-bold text-[#1F58A3] mb-2">Plan Profesional</h3>
              <p class="text-3sm pt-3  mb-4">
                pensado para PyMEs con más movimiento. Tiempo de respuesta: hasta 6 hs,
                hasta 20 equipos.
              </p>
              <div class="text-lg font-semibold mt-auto">$19.900 / mes</div>
            </div>
            <!-- Plan Corporativo -->
            <div
              class="bg-white border border-[#474747] shadow-sm hover:shadow-xl pb-8 transition-shadow duration-300 rounded-2xl p-6 flex flex-col items-center text-center text-[#474747] min-h-[410px]"
            >
              <img src="@/assets/PlanCorporativo.png" alt="Plan Corporativo" class="w-[100px] h-[100px] object-contain mb-4" />
              <h3 class="text-3xl pt-3 font-bold text-[#474747] mb-2">Plan Corporativo</h3>
              <p class="text-3sm pt-3  mb-4">
                Soporte ampliado y atención prioritaria. Tiempo de respuesta garantizado: menos de 1 hora, más de 20 equipos.
              </p>
              <div class="text-lg font-semibold mt-auto">$29.900 / mes</div>
            </div>
          </div>
        </div>
      </section>
    </div>

</template>

<script>
import logo from '../assets/isomago-color-1.png';
import logo2 from '../assets/chatbit02.png';
import logo3 from '../assets/PlanBasico.png';
import logo4 from '../assets/PlanProfesional.png';
import logo5 from '../assets/PlanCorporativo.png';
import fondo from '../assets/15157.png';
import fondo4 from '../assets/fondo4.png';
import fondo2 from '../assets/FrameD.png';
import fondo3 from '../assets/fondo3.png';
import notebookImg from '@/assets/FrameE.png';
import AlertMessage from '../components/AlertMessage.vue';
import MainH1 from '../components/MainH1.vue';
import MainButton from '../components/MainButton.vue';


export default {
  name: 'Home',
  components: { AlertMessage, MainH1, MainButton },
  data() {
    return {
      logo,
      logo2,
      logo3,
      logo4,
      logo5,
      fondo,
      fondo2,
      fondo3,
      fondo4,
      notebookImg,
      planes: [
        {
          img: logo2,
          titulo: 'Plan Básico',
          descripcion: 'Ideal para pequeños equipos. Incluye gestión IT básica y soporte remoto limitado.',
          precio: '$4.990 / mes'
        },
        {
          img: logo3,
          titulo: 'Plan Profesional',
          descripcion: 'Todo lo del básico + inventario inteligente y chatbit integrado.',
          precio: '$9.990 / mes'
        },
        {
          img: logo4,
          titulo: 'Plan Corporativo',
          descripcion: 'Pensado para empresas. Control total, soporte prioritario y personalización avanzada.',
          precio: '$14.990 / mes'
        }
      ],
      successMessage: ''
    };
  },
  mounted() {

    this.fondo = window.innerWidth <= 1250 ? fondo4 : fondo;

    window.addEventListener('resize', this.actualizarFondo);
    if (this.$route.query.loginSuccess === 'true') {
      this.successMessage = 'Has iniciado sesión con éxito.';
      this.$router.replace({ path: this.$route.path, query: {} });
    } else if (this.$route.query.success === 'true') {
      this.successMessage = 'La cuenta se ha creado con éxito.';
      this.$router.replace({ path: this.$route.path, query: {} });
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.actualizarFondo);
  },
  methods: {
  actualizarFondo() {
    this.fondo = window.innerWidth <= 1250 ? this.fondo4 : this.fondo;
  },
  scrollToPlanes() {
    const planesSection = this.$refs.planes;
    if (planesSection) {
      planesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

};
</script>




