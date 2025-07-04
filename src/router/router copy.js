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


const routes = [
    { path: '/',                            component: Home,name:'home', },
    { path: '/ingresar',                    component: Login,name:'login', },
    { path: '/crear-cuenta',                component: Register,name:'register', },
    { path: '/publicaciones',               component: Publicaciones, meta:{requiresAuth:true},name:'publicaciones',},
    { path: '/chat',                        component: GlobalChat, meta:{requiresAuth:true},name:'global-chat',},
    { path: '/mi-perfil',                   component: MyProfile, meta:{requiresAuth:true},name:'my-profile',},
    { path: '/mi-perfil/editar',            component: MyProfileEdit, meta:{requiresAuth:true},name:'my-profile.edit',},
    { path: '/usuario/:id',                 component: UserProfile, meta:{requiresAuth:true},name:'user-profile',},
    { path: '/usuario/:id/chat',            component: PrivateChat, meta:{requiresAuth:true},name:'private-chat',},
    { path: '/abm-usuarios',                name: 'AbmUsuarios', component: () => import('@/pages/AbmUsuarios.vue')},
    { path: '/abm-usuarios/:id/editar',     name: 'editar-usuario', component: () => import('@/pages/EditarUsuario.vue'), meta: { requiresAuth: true } },
    { path: '/usuarios/agregar',            name: 'AgregarUsuario', component: () => import('@/pages/AgregarUsuario.vue'), meta: { requiresAuth: true } }



    // { path: '/usuario/:id/comentarios',     component: UserComments, meta: { requiresAuth: true },name: 'user-comments',},

];

const router = createRouter({
    routes, // routes: routes,
    history: createWebHistory(),
});

let user= {
    id: null,
    email: null,
    bio: null,
    display_name: null,
    career: null,
}
subscribeToAuthState(newUserData => user = newUserData);
router.beforeEach((to,from) => {
    if(to.meta.requiresAuth && user.id === null) {
        return '/ingresar';
    }
});

export default router;