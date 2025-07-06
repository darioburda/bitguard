import { createRouter, createWebHistory } from 'vue-router';
import { subscribeToAuthState } from '../services/auth';
import Home from '../pages/Home.vue';
import GlobalChat from '../pages/GlobalChat.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import MyProfile from '../pages/MyProfile.vue';
import MyProfileEdit from '../pages/MyProfileEdit.vue';
import UserProfile from '../pages/UserProfile.vue';
import PrivateChat from '../pages/PrivateChat.vue';
import Publicaciones from '../pages/Publicaciones.vue';
import MyProfileEditFoto from '../pages/MyProfileEditFoto.vue';

const routes = [
  { path: '/', component: Home, name: 'home' },
  { path: '/ingresar', component: Login, name: 'login' },
  { path: '/crear-cuenta', component: Register, name: 'register' },

  { path: '/publicaciones', component: Publicaciones, meta: { requiresAuth: true }, name: 'publicaciones' },
  { path: '/chat', component: GlobalChat, meta: { requiresAuth: true }, name: 'global-chat' },
  { path: '/mi-perfil', component: MyProfile, meta: { requiresAuth: true }, name: 'my-profile' },
  { path: '/mi-perfil/editar', component: MyProfileEdit, meta: { requiresAuth: true }, name: 'my-profile.edit' },
  { path: '/mi-perfil/editar/imagen', component: MyProfileEditFoto, meta: { requiresAuth: true }, name: 'my-profile.edit.foto' },
  { path: '/usuario/:id', component: UserProfile, meta: { requiresAuth: true }, name: 'user-profile' },
  { path: '/usuario/:id/chat', component: PrivateChat, meta: { requiresAuth: true }, name: 'private-chat' },

  // Rutas solo para admins
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

];

const router = createRouter({
  routes,
  history: createWebHistory(),
});

// Estado del usuario sincronizado
let user = {
  id: null,
  email: null,
  display_name: null,
  is_admin: false,
};

subscribeToAuthState(newUserData => {
  user = newUserData;
});

// Protección de rutas
router.beforeEach((to, from) => {
  const isAuthenticated = user.id !== null;
  const isAdmin = user.is_admin === true;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/ingresar';
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return '/'; // Redirigir a home o donde quieras
  }
});

export default router;
