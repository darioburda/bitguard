<template>
  <div class="grid min-h-screen grid-rows-[auto_1fr_auto] bg-gradient-to-br bg-[#F0F2FF] text-black">
    <!-- NAVBAR -->
    <nav
      class="bg-[#277AE8] text-white fixed top-0 left-0 w-full transition-all duration-500 ease-in-out shadow-md z-50"
      :class="{ '-translate-y-full': !mostrarNav, 'translate-y-0': mostrarNav }"
    >
      <div class="max-w-screen-xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4 h-[100px]">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <RouterLink to="/">
            <img src="@/assets/logo-blanco.png" alt="Logo BitGuard" class="w-24 sm:w-28 h-auto" />
          </RouterLink>
        </div>

        <!-- Botón hamburguesa -->
        <button @click="menuAbierto = !menuAbierto" class="md:hidden text-white focus:outline-none">
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

<!-- Menú principal (desktop) -->
<ul class="hidden md:flex items-center gap-6">
  <li>
    <RouterLink to="/" class="transition-all hover:text-[#00FFC3] hover:scale-110">Home</RouterLink>
  </li>

  <template v-if="user.id !== null">
    <li v-if="user.is_admin">
      <RouterLink to="/abm-empresas" class="transition-all hover:text-[#00FFC3] hover:scale-110">Empresas</RouterLink>
    </li>
    <li v-if="user.is_admin">
      <RouterLink to="/abm-usuarios" class="transition-all hover:text-[#00FFC3] hover:scale-110">Usuarios</RouterLink>
    </li>
    <li v-if="user.is_admin">
      <RouterLink to="/abm-tickets" class="transition-all hover:text-[#00FFC3] hover:scale-110">Tickets</RouterLink>
    </li>

    <li v-if="!user.is_admin">
      <RouterLink to="/mis-tickets" class="transition-all hover:text-[#00FFC3] hover:scale-110">Mis Tickets</RouterLink>
    </li>
    <li v-if="!user.is_admin">
      <RouterLink to="/empresa/contactos" class="transition-all hover:text-[#00FFC3] hover:scale-110">Contactos</RouterLink>
    </li>

    <li>
      <RouterLink to="/mi-perfil" class="transition-all hover:text-[#00FFC3] hover:scale-110">Perfil</RouterLink>
    </li>

    <!-- Usuario (foto + nombre) + logout -->
    <li class="text-sm leading-tight flex items-center gap-3">
      <div class="flex items-center gap-2">
        <!-- Avatar -->
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="Avatar"
          class="w-12 h-12 rounded-full object-cover border border-[#00FFC3]"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center uppercase text-xs font-bold"
        >
          {{ userInitials }}
        </div>
        <!-- Nombre -->
        <p class="text-white font-medium truncate max-w-[180px]" :title="displayName">{{ displayName }}</p>
      </div>

      <form @submit.prevent="handleLogout">
        <button type="submit" class="hover:text-[#00FFC3] ml-1">
          <LogOut class="w-5 h-5" />
        </button>
      </form>
    </li>
  </template>

  <template v-else>
    <li>
      <RouterLink to="/ingresar" class="transition-all hover:text-[#00FFC3] hover:scale-110">Ingresar</RouterLink>
    </li>
  </template>
</ul>
</div>

<!-- Menú hamburguesa -->
<div v-if="menuAbierto" class="md:hidden px-4 pb-4 space-y-3 bg-[#277AE8] text-sm text-right">
  <RouterLink to="/" class="block transition-all hover:text-[#00FFC3] hover:scale-110">Home</RouterLink>

  <template v-if="user.id !== null">
    <RouterLink v-if="user.is_admin" to="/abm-empresas" class="block transition-all hover:text-[#00FFC3] hover:scale-110">Empresas</RouterLink>
    <RouterLink v-if="user.is_admin" to="/abm-usuarios" class="block transition-all hover:text-[#00FFC3] hover:scale-110">Usuarios</RouterLink>
    <RouterLink v-if="user.is_admin" to="/abm-tickets" class="block transition-all hover:text-[#00FFC3] hover:scale-110">Tickets</RouterLink>

    <RouterLink v-if="!user.is_admin" to="/mis-tickets" class="block transition-all hover:text-[#00FFC3] hover:scale-110">Mis Tickets</RouterLink>
    <RouterLink v-if="!user.is_admin" to="/empresa/contactos" class="block transition-all hover:text-[#00FFC3] hover:scale-110">Contactos</RouterLink>

    <RouterLink to="/mi-perfil" class="block transition-all hover:text-[#00FFC3] hover:scale-110">Perfil</RouterLink>

    <!-- Usuario (foto + nombre) + logout en mobile -->
    <div class="text-sm leading-tight text-right flex items-center justify-end gap-3 pt-1">
      <div class="flex items-center gap-2">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="Avatar"
          class="w-8 h-8 rounded-full object-cover border border-white/30"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center uppercase text-xs font-bold"
        >
          {{ userInitials }}
        </div>
        <p class="text-white font-medium truncate max-w-[160px]" :title="displayName">{{ displayName }}</p>
      </div>
      <form @submit.prevent="handleLogout">
        <button type="submit" class="hover:text-[#00FFC3]">
          <LogOut class="w-5 h-5" />
        </button>
      </form>
    </div>
  </template>

  <template v-else>
    <RouterLink to="/ingresar" class="block transition-all hover:text-[#00FFC3] hover:scale-110">Ingresar</RouterLink>
  </template>
</div>
    </nav>

    <!-- MAIN -->
    <main class="pt-[75px] mt-0 md:mt-10">
      <RouterView />
    </main>

<!-- FOOTER -->
<footer
  v-if="isHome"
  class="bg-gradient-to-b from-[#474747] to-[#000000] text-white py-6 px-6"
>
  <div class="max-w-screen-xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-center md:text-left">
      
      <!-- Columna 1: Empresa -->
      <div class="md:text-left">
        <h3 class="font-bold text-lg mb-2">BitGuard S.A.</h3>
        <ul class="space-y-2 text-sm opacity-90">
          <li class="flex items-center gap-2 justify-center md:justify-start">
            <i class="fas fa-location-dot text-white w-4"></i>
            Av. Juan Manuel de Rosas 1061, Buenos Aires.
          </li>
          <li class="flex items-center gap-2 justify-center md:justify-start">
            <i class="fab fa-whatsapp text-[#25D366] w-4"></i>
            +54 11 4444-5555
          </li>
          <li class="flex items-center gap-2 justify-center md:justify-start">
            <i class="fas fa-envelope text-white w-4"></i>
            contacto@bitguard.com
          </li>
        </ul>

        <!-- Formulario de suscripción en el footer -->
        <div class="mt-4 w-full max-w-md">
          <p class="text-sm mb-4 text-white">Contáctese con nuestros asesores.</p>
          <form @submit.prevent="enviarEmail" class="flex gap-2 items-start">
            <input
              type="email"
              v-model.trim="email"
              placeholder="tuemail@ejemplo.com"
              class="w-[75%] h-10 p-2 text-black rounded text-sm"
              :class="{ 'border border-red-500': error }"
            />
            <MainButton
              variant="agregar"
              size="sm"
              :showIcon="false"
              type="submit"
              :disabled="loading"
              class="w-[25%] h-10 text-sm"
            >
              <span v-if="loading">Enviando...</span>
              <span v-else>Enviar</span>
            </MainButton>
          </form>

          <!-- Feedback visual -->
          <transition name="fade">
            <div
              v-if="error"
              class="mt-2 bg-red-600 text-white text-sm rounded px-4 py-2"
            >
              {{ error }}
            </div>
          </transition>

          <transition name="fade">
            <div
              v-if="mensaje"
              class="mt-2 bg-green-600 text-white text-sm rounded px-4 py-2"
            >
              {{ mensaje }}
            </div>
          </transition>
        </div>
      </div>

      <!-- Columna 2: Logos -->
      <div class="flex flex-col items-center justify-center text-center">
        <!-- Logo BitGuard -->
        <img
          src="@/assets/logo-blanco.png"
          alt="Logo BitGuard"
          class="w-42 max-h-20 object-contain mb-2"
        />
        <!-- Logo ChatBit -->
        <img
          src="@/assets/chatbitLogo.png"
          alt="Logo ChatBit"
          class="w-36 mt-10 max-h-16 object-contain mb-4"
        />
      </div>

      <!-- Columna 3: Enlaces rápidos + Redes -->
      <div class="text-sm text-center md:text-right md:justify-self-end flex flex-col items-center md:items-end">
        <div>
          <h4 class="font-bold mb-3">Enlaces rápidos</h4>
          <div class="space-y-2 mb-4">
            <RouterLink
              to="/"
              class="block opacity-80 hover:opacity-100 hover:text-[#00FFC3] transition-all"
            >
              Inicio
            </RouterLink>

            <template v-if="user.id !== null">
              <RouterLink
                v-if="user.is_admin"
                to="/abm-empresas"
                class="block opacity-80 hover:opacity-100 hover:text-[#00FFC3] transition-all"
              >
                Empresas
              </RouterLink>
              <RouterLink
                v-if="user.is_admin"
                to="/abm-usuarios"
                class="block opacity-80 hover:opacity-100 hover:text-[#00FFC3] transition-all"
              >
                Usuarios
              </RouterLink>
              <RouterLink
                v-if="user.is_admin"
                to="/abm-tickets"
                class="block opacity-80 hover:opacity-100 hover:text-[#00FFC3] transition-all"
              >
                Tickets
              </RouterLink>

              <RouterLink
                v-if="!user.is_admin"
                to="/mis-tickets"
                class="block opacity-80 hover:opacity-100 hover:text-[#00FFC3] transition-all"
              >
                Mis Tickets
              </RouterLink>
              <RouterLink
                v-if="!user.is_admin"
                to="/empresa/contactos"
                class="block opacity-80 hover:opacity-100 hover:text-[#00FFC3] transition-all"
              >
                Contactos
              </RouterLink>

              <RouterLink
                to="/mi-perfil"
                class="block opacity-80 hover:opacity-100 hover:text-[#00FFC3] transition-all"
              >
                Mi perfil
              </RouterLink>
            </template>

            <template v-else>
              <RouterLink
                to="/ingresar"
                class="block opacity-80 hover:opacity-100 hover:text-[#00FFC3] transition-all"
              >
                Ingresar
              </RouterLink>
            </template>
          </div>
        </div>

        <!-- Redes sociales en esquina inferior derecha -->
        <div class="flex gap-4 pt-4 justify-center md:justify-end">
          <a href="#" target="_blank" aria-label="X">
            <i class="fab fa-x-twitter text-white text-xl hover:text-[#01C38E]"></i>
          </a>
          <a href="#" target="_blank" aria-label="Instagram">
            <i class="fab fa-instagram text-white text-xl hover:text-[#01C38E]"></i>
          </a>
          <a href="#" target="_blank" aria-label="LinkedIn">
            <i class="fab fa-linkedin text-white text-xl hover:text-[#01C38E]"></i>
          </a>
          <a href="#" target="_blank" aria-label="TikTok">
            <i class="fab fa-tiktok text-white text-xl hover:text-[#01C38E]"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="border-t border-white/20 mt-4 pt-2 text-center text-xs opacity-44">
      <p>Desarrollado con Vue.js, Tailwind CSS y Supabase - Burda´s &copy; 2025</p>
    </div>
  </div>
</footer>

  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { logout, subscribeToAuthState } from './services/auth'
import { LogOut } from 'lucide-vue-next'
import MainButton from '@/components/MainButton.vue'

export default {
  name: 'App',
  components: {
    LogOut,
    MainButton
  },
  data() {
    return {
      user: {
        id: null,
        email: null,
        display_name: null,
        // si tu auth ya setea alguna de estas, se usarán automáticamente
        avatar_url: null,
        profile_picture_url: null,
        photo_url: null
      },
      menuAbierto: false,
      mostrarNav: true,
      ultimaPosScroll: 0,
      email: '',
      mensaje: '',
      error: '',
      loading: false
    }
  },
  computed: {
    isHome() {
      return this.$route.path === '/'
    },
    // Nombre a mostrar
    displayName() {
      if (this.user?.display_name && this.user.display_name.trim()) return this.user.display_name
      if (this.user?.email) return this.user.email.split('@')[0]
      return 'Usuario'
    },
    // Iniciales para fallback
    userInitials() {
      const base = this.displayName.trim()
      const parts = base.split(' ').filter(Boolean)
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return base.slice(0, 2).toUpperCase()
    },
    // URL de avatar con múltiples posibles campos
    avatarUrl() {
      return (
        this.user?.avatar_url ||
        this.user?.profile_picture_url ||
        this.user?.photo_url ||
        this.user?.photo ||        // ✅ tu campo real
        null
      )
    }
  },
  methods: {
    handleLogout() {
      logout()
      this.$router.push({ path: '/ingresar', query: { loggedOut: 'true' } })
    },
    manejarScroll() {
      const scrollActual = window.scrollY
      if (scrollActual < this.ultimaPosScroll) {
        this.mostrarNav = true
      } else if (scrollActual > this.ultimaPosScroll + 10) {
        this.mostrarNav = false
      }
      this.ultimaPosScroll = scrollActual
    },
    async enviarEmail() {
      this.mensaje = ''
      this.error = ''

      const dominiosPermitidos = ['@gmail.com', '@hotmail.com', '@hotmail.com.ar', '@yahoo.com']
      const emailLower = this.email.toLowerCase()

      const esValido = dominiosPermitidos.some((dominio) => emailLower.endsWith(dominio))
      if (!esValido) {
        this.error = 'Dominio de correo no permitido.'
        return
      }

      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!regex.test(this.email)) {
        this.error = 'Por favor ingresá un correo válido.'
        return
      }

      const lastSent = localStorage.getItem('ultimaSuscripcion')
      const ahora = Date.now()
      if (lastSent && ahora - parseInt(lastSent) < 5 * 60 * 1000) {
        this.error = 'Esperá 5 minutos antes de enviar otro correo.'
        return
      }

      this.loading = true
      try {
        const { existe } = await this.$options.appContext.config.globalProperties.$suscripciones.existe(this.email)
        if (existe) {
          this.error = 'Este correo ya está suscrito.'
          this.loading = false
          return
        }

        const { error: errorGuardar } = await this.$options.appContext.config.globalProperties.$suscripciones.guardar(this.email)
        if (errorGuardar) {
          this.error = 'Ocurrió un error al guardar. Intentá de nuevo.'
        } else {
          this.mensaje = '¡Gracias por suscribirte!'
          this.email = ''
          localStorage.setItem('ultimaSuscripcion', ahora.toString())
        }
      } catch (e) {
        // Si no tenés inyectado el servicio global, dejá tu implementación anterior:
        // (lo mantengo para que no se rompa tu flujo)
        // const { existe } = await existeSuscripcion(this.email)
        // ...
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    subscribeToAuthState((newUserData) => (this.user = newUserData || {}))
    this.ultimaPosScroll = window.scrollY
    window.addEventListener('scroll', this.manejarScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.manejarScroll)
  }
}
</script>
