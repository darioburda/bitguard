import { createRouter, createWebHistory } from 'vue-router';
import { subscribeToAuthState } from '../services/auth';

import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';

const routes = [
  { path: '/', component: Home, name: 'home' },
  { path: '/ingresar', component: Login, name: 'login' },
  { path: '/crear-cuenta', component: Register, name: 'register' },

  { path: '/publicaciones', component: () => import('@/pages/Publicaciones.vue'), meta: { requiresAuth: true }, name: 'publicaciones' },
  { path: '/chat', component: () => import('@/pages/GlobalChat.vue'), meta: { requiresAuth: true }, name: 'global-chat' },
  { path: '/mi-perfil', component: () => import('@/pages/MyProfile.vue'), meta: { requiresAuth: true }, name: 'my-profile' },
  { path: '/mi-perfil/editar', component: () => import('@/pages/MyProfileEdit.vue'), meta: { requiresAuth: true }, name: 'my-profile.edit' },
  { path: '/mi-perfil/editar/imagen', component: () => import('@/pages/MyProfileEditFoto.vue'), meta: { requiresAuth: true }, name: 'my-profile.edit.foto' },
  { path: '/usuario/:id', component: () => import('@/pages/UserProfile.vue'), meta: { requiresAuth: true }, name: 'user-profile' },
  { path: '/usuario/:id/chat', component: () => import('@/pages/PrivateChat.vue'), meta: { requiresAuth: true }, name: 'private-chat' },

  {
    path: '/mis-tickets',
    name: 'MisTickets',
    component: () => import('@/pages/MisTickets.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/mis-tickets/:id/editar',
    name: 'editar-ticket-user',
    component: () => import('@/pages/EditarTicketUser.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/empresa/contactos',
    name: 'ContactosEmpresa',
    component: () => import('@/pages/ContactosEmpresa.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/abm-usuarios',
    name: 'AbmUsuarios',
    component: () => import('@/pages/AbmUsuarios.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/abm-usuarios/:id/editar',
    name: 'editar-usuario',
    component: () => import('@/pages/EditarUsuario.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/usuarios/agregar',
    name: 'AgregarUsuario',
    component: () => import('@/pages/AgregarUsuario.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/abm-empresas',
    name: 'AbmEmpresas',
    component: () => import('@/pages/AbmEmpresas.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/empresas/agregar',
    name: 'AgregarEmpresa',
    component: () => import('@/pages/AgregarEmpresa.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/empresas/:id/editar',
    name: 'editar-empresa',
    component: () => import('@/pages/EditarEmpresa.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/abm-tickets',
    name: 'AbmTickets',
    component: () => import('@/pages/AbmTickets.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/tickets/crear',
    name: 'CrearTicket',
    component: () => import('@/pages/CrearTicket.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tickets/:id/editar',
    name: 'editar-ticket',
    component: () => import('@/pages/EditarTicket.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔐 Control de acceso sincronizado con auth
let user = {
  id: null,
  is_admin: false
};

subscribeToAuthState(newUser => {
  user = newUser;
});

router.beforeEach((to, from) => {
  const isAuthenticated = user.id !== null;
  const isAdmin = user.is_admin === true;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' };
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return { name: 'home' };
  }

  return true;
});

export default router;
